import crypto from 'crypto'
import { admin } from '../f.firebase.js'

export default class InviteUtils {
  static async generateInviteLink(
    studyId,
    email,
    studyTitle,
    isPublic,
    accessLevel,
    requiredLogin,
    membershipType = 'cooperator',
  ) {
    const token = crypto.randomBytes(32).toString('hex')

    await admin
      .firestore()
      .collection('invites')
      .add({
        studyId,
        email: email?.toLowerCase() || null,
        token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
        studyTitle: studyTitle || null,
        isPublic: isPublic || false,
        accessLevel: accessLevel || null,
        requiredLogin: requiredLogin ?? true,
        membershipType,
      })

    return {
      inviteLink: `${process.env.SITE_URL}/invite?token=${encodeURIComponent(token)}`,
      inviteToken: token,
    }
  }

  static getMembershipCollection(studyRef, membershipType) {
    return membershipType === 'participant'
      ? studyRef.collection('participants')
      : null
  }

  static async findMembership({
    transaction,
    studyRef,
    membershipType,
    targetUserId,
    targetEmail,
  }) {
    if (membershipType === 'participant') {
      const participantsRef = studyRef.collection('participants')

      const snapshot = await transaction.get(participantsRef)

      return (
        snapshot.docs.find((doc) => {
          const participant = doc.data()

          return (
            (targetUserId && participant.userDocId === targetUserId) ||
            (targetEmail &&
              participant.email?.toLowerCase() === targetEmail.toLowerCase())
          )
        }) || null
      )
    }

    return null
  }

  static createMembership({
    targetUserId,
    targetEmail,
    role,
    inviteMessage,
    token,
    testDate,
    study,
    membershipType = 'cooperator',
  }) {
    const baseMembership = {
      userDocId: targetUserId,
      email: targetEmail,
      accessLevel: role,
      inviteMessage: inviteMessage || null,
      token: token || null,
      updateDate: Date.now(),
      testAuthorEmail: study.testAdmin?.email || '',
      acceptedDate: null,
      membershipType,
    }

    if (membershipType === 'participant') {
      return baseMembership
    }

    return {
      ...baseMembership,
      invited: true,
      accepted: false,
      testDate: testDate || null,
      progress: 0,
    }
  }
}
