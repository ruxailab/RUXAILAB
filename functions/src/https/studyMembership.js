import { admin, functions } from '../f.firebase.js'
import { writeAuditEvent } from '../utils/auditTrail.js'
import InviteUtils from '../utils/inviteUtils.js'

const ROLE = Object.freeze({
  ADMIN: 0,
  EVALUATOR: 1,
  GUEST: 2,
  OBSERVATOR: 3,
  MANAGER: 4,
  USER: 5,
})

const SUPPORTED_ROLES = Object.freeze({
  USER: [ROLE.ADMIN, ROLE.MANAGER, ROLE.USER, ROLE.OBSERVATOR],
  HEURISTIC: [ROLE.ADMIN, ROLE.MANAGER, ROLE.EVALUATOR, ROLE.GUEST],
})

const MANAGER_ROLES = Object.freeze({
  USER: [ROLE.USER, ROLE.OBSERVATOR],
  HEURISTIC: [ROLE.EVALUATOR, ROLE.GUEST],
})

const normalizeStudyType = (type) => {
  const normalized = String(type || '').toUpperCase()
  return normalized === 'HEURISTICS' ? 'HEURISTIC' : normalized
}

const error = (code, message) => new functions.https.HttpsError(code, message)

const getData = (request) => request?.data || request || {}

const sameEmail = (left, right) =>
  Boolean(
    left &&
    right &&
    String(left).trim().toLowerCase() === String(right).trim().toLowerCase(),
  )

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export async function resolveInviteTargetUserId({
  auth,
  targetUserId,
  targetEmail,
}) {
  const normalizedEmail = String(targetEmail || '')
    .trim()
    .toLowerCase()

  try {
    const user = await auth.getUserByEmail(normalizedEmail)
    if (targetUserId && targetUserId !== user.uid) {
      throw error('invalid-argument', 'targetUserId does not match targetEmail')
    }
    return user.uid
  } catch (lookupError) {
    if (lookupError?.code === 'auth/user-not-found' && !targetUserId) {
      return null
    }
    throw lookupError
  }
}

export const findMatchingPendingInvitation = (study, { uid, email, token }) =>
  study?.cooperators?.find((cooperator) => {
    if (cooperator?.accepted === true) return false
    const accountMatches =
      cooperator?.userDocId === uid || sameEmail(cooperator?.email, email)
    const tokenMatches =
      token && (token === cooperator?.token || token === cooperator?.userDocId)
    return accountMatches && tokenMatches
  }) ?? null

const findTargetIndex = (cooperators, { targetUserId, targetEmail }) =>
  cooperators.findIndex(
    (cooperator) =>
      (targetUserId && cooperator?.userDocId === targetUserId) ||
      sameEmail(cooperator?.email, targetEmail),
  )

const getActorRole = (study, actorId, isSuperAdmin) => {
  if (isSuperAdmin || study?.testAdmin?.userDocId === actorId) return ROLE.ADMIN
  return (
    study?.cooperators?.find(
      (cooperator) =>
        cooperator?.userDocId === actorId && cooperator?.accepted === true,
    )?.accessLevel ?? null
  )
}

const getAssignableRoles = (study, actorRole) => {
  const studyType = normalizeStudyType(study?.testType)
  if (actorRole === ROLE.ADMIN) return SUPPORTED_ROLES[studyType] || []
  if (actorRole === ROLE.MANAGER) return MANAGER_ROLES[studyType] || []
  return []
}

export function assertMembershipMutationAllowed({
  study,
  actorId,
  isSuperAdmin = false,
  action,
  target = null,
  role = null,
}) {
  const actorRole = getActorRole(study, actorId, isSuperAdmin)
  const assignableRoles = getAssignableRoles(study, actorRole)

  if (target?.userDocId && target.userDocId === actorId) {
    throw error('permission-denied', 'A member cannot manage their own role')
  }

  if (action === 'invite') {
    if (!assignableRoles.includes(role)) {
      throw error('permission-denied', 'The assigned role is not permitted')
    }
    return
  }

  if (![ROLE.ADMIN, ROLE.MANAGER].includes(actorRole)) {
    throw error('permission-denied', 'Cooperator management is not permitted')
  }

  if (action === 'assignRole') {
    if (!assignableRoles.includes(role)) {
      throw error('permission-denied', 'The assigned role is not permitted')
    }
    if (
      actorRole === ROLE.MANAGER &&
      !assignableRoles.includes(target?.accessLevel)
    ) {
      throw error('permission-denied', 'Managers cannot modify this member')
    }
    return
  }

  if (
    action === 'remove' ||
    action === 'cancelInvitation' ||
    action === 'reinvite'
  ) {
    if (
      actorRole === ROLE.MANAGER &&
      !assignableRoles.includes(target?.accessLevel)
    ) {
      throw error('permission-denied', 'Managers cannot remove this member')
    }
    return
  }

  throw error('invalid-argument', 'Unsupported membership action')
}

export function assertValidInviteTarget({
  study,
  actorId,
  actorEmail,
  targetUserId,
  targetEmail,
}) {
  if (!isValidEmail(targetEmail)) {
    throw error('invalid-argument', 'A valid targetEmail is required')
  }

  if (targetUserId && targetUserId === actorId) {
    throw error('permission-denied', 'A member cannot invite themselves')
  }

  if (sameEmail(targetEmail, actorEmail)) {
    throw error('permission-denied', 'A member cannot invite themselves')
  }

  if (targetUserId && targetUserId === study?.testAdmin?.userDocId) {
    throw error('permission-denied', 'The study owner cannot be invited')
  }

  if (sameEmail(targetEmail, study?.testAdmin?.email)) {
    throw error('permission-denied', 'The study owner cannot be invited')
  }
}

export const manageStudyMembership = functions.onCall({
  handler: async (request) => {
    const actorId = request?.auth?.uid

    if (!actorId) {
      throw error('unauthenticated', 'Authentication is required')
    }

    const data = getData(request)

    const {
      studyId,
      action,
      targetUserId = null,
      targetEmail = null,
      membershipType = 'cooperator',
    } = data

    if (!studyId || !action) {
      throw error('invalid-argument', 'studyId and action are required')
    }

    if (!['cooperator', 'participant'].includes(membershipType)) {
      throw error(
        'invalid-argument',
        'membershipType must be cooperator or participant',
      )
    }

    const isParticipant = membershipType === 'participant'
    const role = Number.isInteger(data.role) ? data.role : null

    const db = admin.firestore()

    const studyRef = db.collection('tests').doc(studyId)
    const actorRef = db.collection('users').doc(actorId)

    return db.runTransaction(async (transaction) => {
      const [studySnap, actorSnap] = await Promise.all([
        transaction.get(studyRef),
        transaction.get(actorRef),
      ])

      if (!studySnap.exists) {
        throw error('not-found', 'Study not found')
      }

      const study = studySnap.data()
      const actor = actorSnap.exists ? actorSnap.data() : {}

      const actorEmail = actor?.email || request?.auth?.token?.email || ''

      const isSuperAdmin = actor?.accessLevel === 0

      /*
       |--------------------------------------------------------------------------
       | PARTICIPANTS
       |--------------------------------------------------------------------------
       |
       | tests/{studyId}/participants/{participantId}
       |
       */

      if (isParticipant) {
        const participantsRef = studyRef.collection('participants')

        const participantsSnapshot = await transaction.get(participantsRef)

        const targetDoc = participantsSnapshot.docs.find((doc) => {
          const participant = doc.data()

          return (
            (targetUserId && participant.userDocId === targetUserId) ||
            (targetEmail &&
              participant.email?.toLowerCase() === targetEmail.toLowerCase())
          )
        })

        const target = targetDoc?.data() || null

        assertMembershipMutationAllowed({
          study,
          actorId,
          isSuperAdmin,
          action,
          target,
          role,
        })

        /*
         |--------------------------------------------------------------------------
         | REINVITE PARTICIPANT
         |--------------------------------------------------------------------------
         |
         | A reinvite must update the existing membership instead of trying
         | to create a new one.
         |
         */

        if (action === 'reinvite') {
          if (!target || !targetDoc) {
            throw error('not-found', 'Participant not found')
          }

          if (target.accepted === true) {
            throw error(
              'failed-precondition',
              'Accepted participants cannot be reinvited',
            )
          }
          const now = Date.now()

          const participant = {
            ...target,

            // New invitation token generated by the caller
            token: data.token || null,

            // Keep the new message when provided
            inviteMessage:
              data.inviteMessage !== undefined
                ? data.inviteMessage
                : target.inviteMessage || null,

            updateDate: now,
            acceptedDate: now,
          }

          transaction.update(targetDoc.ref, participant)

          writeAuditEvent(transaction, studyRef, {
            action: 'participant.reinvited',
            actorId,
            target: participant.userDocId || participant.email,
            actorEmail,
            targetLabel: participant.email || participant.userDocId,
            targetType: 'participant',
            details: {
              role: participant.accessLevel,
            },
          })

          return {
            status: 'reinvited',
            participant: {
              id: targetDoc.id,
              ...participant,
            },
          }
        }

        /*
         |--------------------------------------------------------------------------
         | INVITE PARTICIPANT
         |--------------------------------------------------------------------------
         */

        if (action === 'invite') {
          if (target) {
            throw error(
              'already-exists',
              'An invitation or membership already exists',
            )
          }

          const resolvedTargetUserId = await resolveInviteTargetUserId({
            auth: admin.auth(),
            targetUserId,
            targetEmail,
          })

          assertValidInviteTarget({
            study,
            actorId,
            actorEmail,
            targetUserId: resolvedTargetUserId,
            targetEmail,
          })

          const participant = InviteUtils.createMembership({
            targetUserId: resolvedTargetUserId,
            targetEmail,
            role,
            inviteMessage: data.inviteMessage,
            token: data.token,
            study,
            membershipType: 'participant',
          })

          const participantRef = participantsRef.doc()

          transaction.set(participantRef, participant)

          writeAuditEvent(transaction, studyRef, {
            action: 'participant.invited',
            actorId,
            target: resolvedTargetUserId || targetEmail,
            actorEmail,
            targetLabel: targetEmail,
            targetType: 'participant',
            details: {
              role,
            },
          })

          return {
            status: 'invited',
            participant: {
              id: participantRef.id,
              ...participant,
            },
          }
        }

        /*
         |--------------------------------------------------------------------------
         | OTHER PARTICIPANT ACTIONS
         |--------------------------------------------------------------------------
         */

        if (!target || !targetDoc) {
          throw error('not-found', 'Participant not found')
        }

        if (action === 'assignRole') {
          const participant = {
            ...target,
            accessLevel: role,
            updateDate: Date.now(),
          }

          transaction.update(targetDoc.ref, participant)

          writeAuditEvent(transaction, studyRef, {
            action: 'participant.roleChanged',
            actorId,
            target: participant.userDocId || participant.email,
            actorEmail,
            targetLabel: participant.email || participant.userDocId,
            targetType: 'participant',
            details: {
              previousRole: target.accessLevel,
              role,
            },
          })

          return {
            status: 'role-assigned',
            participant,
          }
        }

        if (action === 'remove' && target.accepted !== true) {
          throw error(
            'failed-precondition',
            'Only accepted participants can be removed',
          )
        }

        if (action === 'cancelInvitation' && target.accepted === true) {
          throw error(
            'failed-precondition',
            'Accepted participants cannot be cancelled',
          )
        }

        if (!['remove', 'cancelInvitation'].includes(action)) {
          throw error(
            'invalid-argument',
            `Unsupported participant action: ${action}`,
          )
        }

        transaction.delete(targetDoc.ref)

        writeAuditEvent(transaction, studyRef, {
          action:
            action === 'remove'
              ? 'participant.removed'
              : 'participant.invitationCancelled',
          actorId,
          target: target.userDocId || target.email,
          actorEmail,
          targetLabel: target.email || target.userDocId,
          targetType: 'participant',
          details: {
            previousRole: target.accessLevel,
          },
        })

        return {
          status: action === 'remove' ? 'removed' : 'invitation-cancelled',
        }
      }

      /*
       |--------------------------------------------------------------------------
       | COOPERATORS
       |--------------------------------------------------------------------------
       |
       | Cooperators continue to live in:
       | tests/{studyId}.cooperators
       |
       */

      const cooperators = [...(study.cooperators || [])]

      const studyRoleMap = {
        ...(study.studyRoleMap || {}),
      }

      /*
       |--------------------------------------------------------------------------
       | ACCEPT INVITATION
       |--------------------------------------------------------------------------
       */

      if (action === 'accept') {
        const index = cooperators.findIndex(
          (cooperator) =>
            cooperator?.accepted !== true &&
            (cooperator?.userDocId === actorId ||
              sameEmail(cooperator?.email, actorEmail)),
        )

        if (index < 0) {
          throw error('permission-denied', 'No invitation matches this account')
        }

        const now = Date.now()

        const membership = {
          ...cooperators[index],
          userDocId: actorId,
          accepted: true,
          updateDate: now,
          acceptedDate: now,
        }

        cooperators[index] = membership

        studyRoleMap[actorId] = membership.accessLevel

        transaction.update(studyRef, {
          cooperators,
          studyRoleMap,
        })

        transaction.update(actorRef, {
          [`myAnswers.${studyId}`]: {
            answersDocId: study.answersDocId,
            accessLevel: membership.accessLevel,
            progress: 0,
            testAuthorEmail: study.testAdmin?.email || '',
            testDocId: studyId,
            testType: study.testType,
            subType: study.subType || null,
            testTitle: study.testTitle || '',
            total: 0,
            updateDate: Date.now(),
          },
        })

        writeAuditEvent(transaction, studyRef, {
          action: 'cooperator.invitationAccepted',
          actorId,
          target: actorId,
          actorEmail,
          targetLabel: membership.email || actorEmail || actorId,
          targetType: 'cooperator',
          details: {
            role: membership.accessLevel,
          },
        })

        return {
          status: 'accepted',
          cooperator: membership,
        }
      }

      const targetIndex = findTargetIndex(cooperators, {
        targetUserId,
        targetEmail,
      })

      const target = targetIndex >= 0 ? cooperators[targetIndex] : null

      assertMembershipMutationAllowed({
        study,
        actorId,
        isSuperAdmin,
        action,
        target,
        role,
      })

      /*
       |--------------------------------------------------------------------------
       | INVITE COOPERATOR
       |--------------------------------------------------------------------------
       */

      if (action === 'invite') {
        if (target) {
          throw error(
            'already-exists',
            'An invitation or membership already exists',
          )
        }

        const resolvedTargetUserId = await resolveInviteTargetUserId({
          auth: admin.auth(),
          targetUserId,
          targetEmail,
        })

        assertValidInviteTarget({
          study,
          actorId,
          actorEmail,
          targetUserId: resolvedTargetUserId,
          targetEmail,
        })

        const membership = InviteUtils.createMembership({
          targetUserId: resolvedTargetUserId,
          targetEmail,
          role,
          inviteMessage: data.inviteMessage,
          token: data.token,
          testDate: data.testDate,
          study,
          membershipType: 'cooperator',
        })

        cooperators.push(membership)

        transaction.update(studyRef, {
          cooperators,
        })

        writeAuditEvent(transaction, studyRef, {
          action: 'cooperator.invited',
          actorId,
          target: resolvedTargetUserId || targetEmail,
          actorEmail,
          targetLabel: targetEmail,
          targetType: 'cooperator',
          details: {
            role,
          },
        })

        return {
          status: 'invited',
          cooperator: membership,
        }
      }

      /*
       |--------------------------------------------------------------------------
       | OTHER COOPERATOR ACTIONS
       |--------------------------------------------------------------------------
       */

      if (!target) {
        throw error('not-found', 'Cooperator not found')
      }

      if (action === 'assignRole') {
        const membership = {
          ...target,
          accessLevel: role,
          updateDate: Date.now(),
        }

        cooperators[targetIndex] = membership

        if (membership.accepted && membership.userDocId) {
          studyRoleMap[membership.userDocId] = role

          const targetRef = db.collection('users').doc(membership.userDocId)

          transaction.update(targetRef, {
            [`myAnswers.${studyId}.accessLevel`]: role,
          })
        }

        transaction.update(studyRef, {
          cooperators,
          studyRoleMap,
        })

        writeAuditEvent(transaction, studyRef, {
          action: 'cooperator.roleChanged',
          actorId,
          target: membership.userDocId || membership.email,
          actorEmail,
          targetLabel: membership.email || membership.userDocId,
          targetType: 'cooperator',
          details: {
            previousRole: target.accessLevel,
            role,
          },
        })

        return {
          status: 'role-assigned',
          cooperator: membership,
        }
      }

      if (action === 'remove' && target.accepted !== true) {
        throw error(
          'failed-precondition',
          'Only accepted memberships can be removed',
        )
      }

      if (action === 'cancelInvitation' && target.accepted === true) {
        throw error(
          'failed-precondition',
          'Accepted memberships cannot be cancelled',
        )
      }

      if (!['remove', 'cancelInvitation'].includes(action)) {
        throw error(
          'invalid-argument',
          `Unsupported cooperator action: ${action}`,
        )
      }

      cooperators.splice(targetIndex, 1)

      if (target.userDocId) {
        delete studyRoleMap[target.userDocId]
      }

      transaction.update(studyRef, {
        cooperators,
        studyRoleMap,
      })

      if (action === 'remove' && target.userDocId) {
        const targetRef = db.collection('users').doc(target.userDocId)

        transaction.update(targetRef, {
          [`myAnswers.${studyId}`]: admin.firestore.FieldValue.delete(),
        })
      }

      writeAuditEvent(transaction, studyRef, {
        action:
          action === 'remove'
            ? 'cooperator.removed'
            : 'cooperator.invitationCancelled',
        actorId,
        target: target.userDocId || target.email,
        actorEmail,
        targetLabel: target.email || target.userDocId,
        targetType: 'cooperator',
        details: {
          previousRole: target.accessLevel,
        },
      })

      return {
        status: action === 'remove' ? 'removed' : 'invitation-cancelled',
      }
    })
  },
})

export const getStudyInvitation = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const { studyId, token } = getData(request)
    if (!studyId || !token) {
      throw error('invalid-argument', 'studyId and token are required')
    }

    const db = admin.firestore()
    const [studySnap, userSnap] = await Promise.all([
      db.collection('tests').doc(studyId).get(),
      db.collection('users').doc(uid).get(),
    ])
    if (!studySnap.exists) throw error('not-found', 'Study not found')

    const study = studySnap.data()
    const invitation = findMatchingPendingInvitation(study, {
      uid,
      email: userSnap.data()?.email || request?.auth?.token?.email,
      token,
    })
    if (!invitation) {
      throw error('permission-denied', 'No invitation matches this account')
    }

    return {
      study: {
        id: studyId,
        testType: study.testType,
        subType: study.subType || null,
        testTitle: study.testTitle || '',
        testDescription: study.testDescription || '',
        testAdminEmail: study.testAdmin?.email || '',
      },
      invitation: {
        accessLevel: invitation.accessLevel,
        testDate: invitation.testDate || null,
      },
    }
  },
})
