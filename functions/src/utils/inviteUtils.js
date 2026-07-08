import crypto from 'crypto'
import { admin } from '../f.firebase.js'

export default class InviteUtils {
  static async generateInviteLink(studyId, email, studyTitle, isPublic) {
    const token = crypto.randomBytes(32).toString('hex')

    await admin
      .firestore()
      .collection('invites')
      .add({
        studyId,
        email: email.toLowerCase(),
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        acceptedAt: null,
        studyTitle: studyTitle || null,
        isPublic: isPublic || false,
      })

    return `${process.env.SITE_URL}/invite?token=${encodeURIComponent(token)}`
  }
}
