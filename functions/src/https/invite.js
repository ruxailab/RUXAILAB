import { admin, functions } from '../f.firebase.js'

export const resolveInvite = functions.onCall({
  handler: async (data, context) => {
    const uid = context.auth?.uid

    if (!uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be logged in',
      )
    }

    const { token } = data

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

    if (invite.acceptedAt) {
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

    /**
     * OPTIONAL SAFETY CHECK (recommended)
     */
    const user = await admin.auth().getUser(uid)

    if (user.email !== invite.email) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Email mismatch',
      )
    }

    /**
     * Atomic accept
     */
    await ref.update({
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedBy: uid,
    })

    return {
      success: true,
      invite: {
        id: ref.id,
        studyId: invite.studyId,
        email: invite.email,
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

      if (dataInvite.acceptedAt) {
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
          email: dataInvite.email,
        },
      }
    } catch (err) {
      throw err
    }
  },
})
