import { admin, functions } from '../f.firebase.js'
import InviteUtils from '../utils/inviteUtils.js'

export const resolveInvite = functions.onCall({
  handler: async (data) => {
    const { token, uid } = data.data || data

    console.log(token, uid)

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

    // private invites should be used only once, so if they have been accepted, they are not valid anymore
    if (!invite.isPublic && invite.acceptedAt) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Invite already used',
      )
    }

    if (expired) {
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
    if (!invite.isPublic) {
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

      // private invites should be used only once, so if they have been accepted, they are not valid anymore
      if (!dataInvite.isPublic && dataInvite.acceptedAt) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Invite already used',
        )
      }

      if (expired) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Invite expired',
        )
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
  handler: async (data) => {
    const content = data.data || data

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

    const { inviteLink, inviteToken } = await InviteUtils.generateInviteLink(
      studyId,
      isPublic ? null : toEmail,
      studyTitle,
      isPublic,
      accessLevel,
      requiredLogin,
      membershipType,
    )

    return { inviteLink, inviteToken }
  },
})
