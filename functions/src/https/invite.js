import { admin, functions } from '../core/firebase/f.firebase.js'
import InviteUtils from '../utils/inviteUtils.js'
import {
  ROLE,
  resolveStudyRole,
  getAssignableRoles,
} from '../shared/auth/studyAccess.js'

export const isAcceptedInviteRetry = (invite, uid, authenticatedUid) =>
  !invite.isPublic &&
  Boolean(invite.acceptedAt) &&
  Boolean(uid) &&
  invite.acceptedBy === uid &&
  authenticatedUid === uid

export const resolveInvite = functions.onCall({
  handler: async (data) => {
    const { token, uid } = data.data || data

    if (!token) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing token')
    }

    const snap = await admin
      .firestore()
      .collection('invites')
      .where('token', '==', token)
      .limit(1)
      .get()

    if (snap.empty) {
      throw new functions.https.HttpsError('not-found', 'Invite not found')
    }

    const doc = snap.docs[0]
    const ref = doc.ref
    const invite = doc.data()

    const now = Date.now()

    const expired = invite.expiresAt?.toMillis?.() < now

    // The same account may retry if resolving the token succeeded but the
    // subsequent study-membership update failed. Other accounts cannot reuse it.
    const acceptedRetry = isAcceptedInviteRetry(invite, uid, data.auth?.uid)
    if (!invite.isPublic && invite.acceptedAt && !acceptedRetry) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invite already used',
      )
    }

    if (expired && !acceptedRetry) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invite expired',
      )
    }

    if (!invite.isPublic && invite.requiredLogin) {
      const userSnap = await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .get()

      if (!userSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found')
      }

      const user = userSnap.data()

      const inviteEmail = invite.email?.toLowerCase().trim()
      const userEmail = user.email?.toLowerCase().trim()

      if (!userEmail || inviteEmail !== userEmail) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'This invitation is not assigned to this user',
        )
      }
    }

    // if the invite is private save person who accepted it
    if (!invite.isPublic && !acceptedRetry) {
      await ref.update({
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        acceptedBy: uid,
      })
    }

    // if the invite is public, save all users that accepted it, and increment usage count
    if (invite.isPublic && uid) {
      await ref.update({
        acceptedUsers: admin.firestore.FieldValue.arrayUnion(uid),
        usageCount: admin.firestore.FieldValue.increment(1),
        lastAcceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    return {
      success: true,
      invite: {
        id: ref.id,
        studyId: invite.studyId,
        studyTitle: invite.studyTitle,
        email: invite.email ?? null,
        isPublic: !!invite.isPublic,
        requiredLogin: !!invite.requiredLogin,
        accessLevel: invite.accessLevel,
        membershipType: invite.membershipType,
      },
    }
  },
})

export const validateInvite = functions.onCall({
  handler: async (data) => {
    try {
      const content = data.data || data
      const { token } = content

      if (!token) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Missing token',
        )
      }

      const snap = await admin
        .firestore()
        .collection('invites')
        .where('token', '==', token)
        .limit(1)
        .get()

      if (snap.empty) {
        throw new functions.https.HttpsError('not-found', 'Invite not found')
      }

      const doc = snap.docs[0]
      const dataInvite = doc.data()

      const now = Date.now()
      const expired = dataInvite.expiresAt?.toMillis?.() < now
      const authenticatedUid = data.auth?.uid
      const acceptedRetry = isAcceptedInviteRetry(
        dataInvite,
        authenticatedUid,
        authenticatedUid,
      )

      // Keep the dialog available to the same account if invite resolution
      // succeeded but completing study membership failed on the first attempt.
      if (!dataInvite.isPublic && dataInvite.acceptedAt && !acceptedRetry) {
        return {
          valid: false,
          invite: {
            id: doc.id,
            studyId: dataInvite.studyId,
            studyTitle: dataInvite.studyTitle,
            email: dataInvite.email ?? null,
            isPublic: !!dataInvite.isPublic,
            requiredLogin: !!dataInvite.requiredLogin,
            membershipType: dataInvite.membershipType,
          },
        }
      }

      if (expired && !acceptedRetry) {
        return {
          valid: false,
          invite: {
            id: doc.id,
            studyId: dataInvite.studyId,
            studyTitle: dataInvite.studyTitle,
            email: dataInvite.email ?? null,
            isPublic: !!dataInvite.isPublic,
            requiredLogin: !!dataInvite.requiredLogin,
            membershipType: dataInvite.membershipType,
          },
        }
      }

      return {
        valid: true,
        invite: {
          id: doc.id,
          studyId: dataInvite.studyId,
          studyTitle: dataInvite.studyTitle,
          email: dataInvite.email ?? null,
          isPublic: !!dataInvite.isPublic,
          requiredLogin: !!dataInvite.requiredLogin,
          membershipType: dataInvite.membershipType,
        },
      }
    } catch (err) {
      throw err
    }
  },
})

export const generateInvitationLink = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid

    if (!uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication is required',
      )
    }

    const content = request?.data || request || {}

    const {
      studyId,
      accessLevel,
      studyTitle,
      requiredLogin,
      toEmail,
      isPublic,
      membershipType,
    } = content

    if (!studyId || accessLevel === undefined || accessLevel === null) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields',
      )
    }

    if (!isPublic && !toEmail) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing recipient email',
      )
    }

    const db = admin.firestore()
    const studyRef = db.collection('tests').doc(studyId)
    const userRef = db.collection('users').doc(uid)

    const [studySnap, userSnap] = await Promise.all([
      studyRef.get(),
      userRef.get(),
    ])

    if (!studySnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Study not found')
    }

    const study = { id: studySnap.id, ...studySnap.data() }
    const isSuperAdmin = userSnap.data()?.accessLevel === 0

    const actorRole = resolveStudyRole(study, uid, isSuperAdmin)
    if (actorRole !== ROLE.ADMIN && actorRole !== ROLE.MANAGER) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Study invitation is not permitted',
      )
    }

    const targetRole =
      typeof accessLevel === 'number' && Number.isInteger(accessLevel)
        ? accessLevel
        : typeof accessLevel === 'string' && /^-?\d+$/.test(accessLevel.trim())
          ? parseInt(accessLevel.trim(), 10)
          : null

    const assignableRoles = getAssignableRoles(study, actorRole)

    if (targetRole === null || !assignableRoles.includes(targetRole)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'The assigned role is not permitted',
      )
    }

    const { inviteLink, inviteToken, expirationDate } =
      await InviteUtils.generateInviteLink(
        studyId,
        isPublic ? null : toEmail,
        studyTitle || study.testTitle || null,
        isPublic,
        targetRole,
        requiredLogin,
        membershipType,
      )

    return { inviteLink, inviteToken, expirationDate }
  },
})
