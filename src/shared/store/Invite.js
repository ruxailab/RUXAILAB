/**
 * Cooperator Invite Store Module
 * @module CooperatorInvite
 */
import Notification from '@/shared/models/Notification'
import EmailController from '@/shared/controllers/EmailController'
import InviteController from '@/shared/controllers/InviteController.js'
import StudyController from '@/controllers/StudyController'
import {
  getCooperatorInviteValidationError,
  normalizeCooperatorInviteEntry,
  enrichCooperatorInviteEntry,
} from '@/shared/composables/useCooperatorUtils'
import { getMethodManagerView } from '@/shared/constants/methodDefinitions'
import { getAcceptedInvitationDestination } from '@/shared/utils/studyNavigation'
import { manageStudyMembership } from '@/shared/services/studyMembershipService'
import i18n from '@/app/plugins/i18n'

const t = i18n.global.t

const createInvitation = async ({ study, guest, membershipType }) => {
  return InviteController.generateInvitationLink({
    studyId: study.id,
    studyTitle: study.testTitle,
    accessLevel: guest.accessLevel,
    requiredLogin: true,
    toEmail: guest.email,
    isPublic: false,
    membershipType,
  })
}

const buildInvitationNotification = ({ study, guest, inviteToken, router }) => {
  const managerViewByMethod = getMethodManagerView(
    study.testType,
    study.subType,
  )

  const managerRoute = router.resolve({
    name: managerViewByMethod,
    params: { id: study.id },
  })

  const invitationStudy = {
    ...study,
    cooperators: [
      ...(study.cooperators || []).filter(
        (cooperator) => cooperator.userDocId !== guest.userDocId,
      ),
      {
        ...guest,
        accepted: true,
      },
    ],
  }

  const destination = getAcceptedInvitationDestination({
    study: invitationStudy,
    user: {
      id: guest.userDocId,
    },
  })

  const path = destination
    ? router.resolve(destination).href
    : managerRoute.href

  return new Notification({
    author: study.testAdmin.email,
    testId: study.id,
    redirectsTo: path,
    type: 'Collaboration',
    accessLevel: guest.accessLevel,
    title: t('invite.pendingSubtitle'),
    description: `${t('HeuristicsCooperators.messages.invite_message')} ${study.testTitle}`,
    inviteToken,
    read: false,
  })
}

const sendInvitationEmail = async ({ study, user, guest, inviteLink }) => {
  const emailController = new EmailController()

  return emailController.send({
    to: guest.email,
    subject: t('invite.pendingSubtitle'),
    attachments: [],
    template: 'invite',
    data: {
      message: guest.inviteMessage || '',
      testTitle: study.testTitle,
      testDescription: study.testDescription,
      adminEmail: study.testAdmin.email,
      adminName: user.name || user.email,
      studyId: study.id,
      invitationLink: inviteLink,
    },
  })
}

const prepareInvite = async ({ coop, users, resolveUserByEmail }) => {
  const normalizedEntry = normalizeCooperatorInviteEntry(coop, users)

  const enrichedEntry = normalizedEntry.userDocId
    ? normalizedEntry
    : await enrichCooperatorInviteEntry(normalizedEntry, {
        resolveUserByEmail,
      })

  return {
    ...normalizedEntry,
    ...enrichedEntry,
    email: enrichedEntry.email?.trim() || normalizedEntry.email?.trim() || '',
  }
}

const sendParticipantInvitation = async ({
  dispatch,
  study,
  user,
  participant,
  router,
  inviteMessage,
  resolveUserByEmail,
  action = 'invite',
}) => {
  const resolvedParticipant = await enrichCooperatorInviteEntry(participant, {
    resolveUserByEmail,
  })

  const inviteResult = await createInvitation({
    study,
    guest: {
      ...resolvedParticipant,
      accessLevel: resolvedParticipant.accessLevel,
    },
    membershipType: 'participant',
  })

  const result = await manageStudyMembership({
    studyId: study.id,
    action: action,
    membershipType: 'participant',
    targetUserId: resolvedParticipant.userDocId || null,
    targetEmail: resolvedParticipant.email,
    role: resolvedParticipant.accessLevel,
    inviteMessage: inviteMessage ?? resolvedParticipant.inviteMessage,
    token: inviteResult.inviteToken,
  })

  const participantMembership = {
    ...result.participant,
    inviteMessage: inviteMessage ?? resolvedParticipant.inviteMessage,
    email: resolvedParticipant.email,
  }

  if (participantMembership.userDocId) {
    const notification = buildInvitationNotification({
      study,
      guest: participantMembership,
      inviteToken: inviteResult.inviteToken,
      router,
      membershipType: 'participant',
    })

    await dispatch('addNotification', {
      userId: participantMembership.userDocId,
      notification,
    })
  }

  await sendInvitationEmail({
    study,
    user,
    guest: participantMembership,
    inviteLink: inviteResult.inviteLink,
  })

  return {
    ...participantMembership,
    inviteToken: inviteResult.inviteToken,
    inviteLink: inviteResult.inviteLink,
  }
}

/**
 * Sends the notification and email for a cooperator invitation.
 *
 * This function is shared by:
 * - New invitations
 * - Re-invitations
 */
const sendCooperatorInvitation = async ({
  dispatch,
  study,
  user,
  guest,
  router,
  resolveUserByEmail,
}) => {
  const resolvedGuest = await enrichCooperatorInviteEntry(guest, {
    resolveUserByEmail,
  })

  const inviteResult = await createInvitation({
    study,
    guest: resolvedGuest,
    membershipType: 'cooperator',
  })

  if (resolvedGuest.userDocId) {
    const notification = buildInvitationNotification({
      study,
      guest: resolvedGuest,
      inviteToken: inviteResult.inviteToken,
      router,
    })

    await dispatch('addNotification', {
      userId: resolvedGuest.userDocId,
      notification,
    })
  }

  await sendInvitationEmail({
    study,
    user,
    guest: resolvedGuest,
    inviteLink: inviteResult.inviteLink,
  })

  return {
    ...resolvedGuest,
    inviteToken: inviteResult.inviteToken,
    inviteLink: inviteResult.inviteLink,
  }
}

export default {
  state: {
    module: 'cooperatorInvite',
  },

  getters: {},

  mutations: {},

  actions: {
    async sendInvitations(
      { commit, dispatch },
      {
        study,
        user,
        selectedCoops,
        selectedRole,
        inviteMessage,
        users,
        router,
        resolveUserByEmail,
      },
    ) {
      commit('setLoading', true)

      try {
        const newInvites = []

        for (const coop of selectedCoops) {
          const invite = await prepareInvite({
            coop,
            users,
            resolveUserByEmail,
          })

          const validationError = getCooperatorInviteValidationError({
            email: invite.email,
            currentUserEmail: user?.email,
            studyOwnerEmail: study?.testAdmin?.email,
            existingCooperators: study?.cooperators || [],
            t,
          })

          if (validationError) {
            throw new Error(validationError)
          }

          const result = await manageStudyMembership({
            studyId: study.id,
            action: 'invite',
            targetUserId: invite.userDocId || null,
            targetEmail: invite.email,
            role: selectedRole,
            inviteMessage,
            token: invite.inviteToken,
            membershipType: 'cooperator',
          })

          const guest = {
            ...result.cooperator,
            inviteMessage,
          }

          const sentInvitation = await sendCooperatorInvitation({
            dispatch,
            study,
            user,
            guest,
            router,
            resolveUserByEmail,
          })

          newInvites.push(sentInvitation)
        }

        return newInvites
      } catch (err) {
        commit('setError', {
          errorCode: 'inviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async reinviteCooperator(
      { commit, dispatch },
      { study, user, guest, router, resolveUserByEmail },
    ) {
      commit('setLoading', true)

      try {
        return await sendCooperatorInvitation({
          dispatch,
          study,
          user,
          guest,
          router,
          resolveUserByEmail,
        })
      } catch (err) {
        commit('setError', {
          errorCode: 'inviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async acceptInvite(
      { commit, dispatch },
      { token, user, studyId, notification, membershipType = 'cooperator' },
    ) {
      commit('setLoading', true)

      try {
        const result = await InviteController.resolveInvite(token, user?.id)

        const resolvedStudyId = studyId || result.invite.studyId

        const study = await new StudyController().getStudy({
          id: resolvedStudyId,
        })

        await dispatch('acceptStudyCollaboration', {
          test: study,
          cooperator: user,
          membershipType: membershipType,
        })

        localStorage.removeItem('pendingInviteToken')

        if (notification) {
          await dispatch('markNotificationAsRead', {
            notification,
            user,
          })
        }

        return {
          ...result,
          study,
        }
      } catch (err) {
        commit('setError', {
          errorCode: 'acceptInviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async rejectInvite({ commit, dispatch }, { notification, user }) {
      commit('setLoading', true)

      try {
        if (notification) {
          await dispatch('markNotificationAsRead', {
            notification,
            user,
          })
        }

        localStorage.removeItem('pendingInviteToken')
      } catch (err) {
        commit('setError', {
          errorCode: 'rejectInviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async dismissInvite({ commit, dispatch }, { invite, user, router }) {
      commit('setLoading', true)

      try {
        const study = await new StudyController().getStudy({
          id: invite.studyId,
        })

        const managerViewByMethod = getMethodManagerView(
          study.testType,
          study.subType,
        )

        const managerRoute = router.resolve({
          name: managerViewByMethod,
          params: { id: study.id },
        })

        const redirectsTo =
          invite.accessLevel === 0
            ? managerRoute.href
            : `/testview/${study.id}/${user.id}`

        const notifications = user?.notifications || []

        const alreadyExists = notifications.some(
          (notification) =>
            !notification.read &&
            notification.type === 'Collaboration' &&
            notification.testId === study.id &&
            notification.redirectsTo === redirectsTo,
        )

        if (alreadyExists) {
          localStorage.removeItem('pendingInviteToken')
          return
        }

        const notification = new Notification({
          author: study.testAdmin.email,
          read: false,
          testId: study.id,
          redirectsTo,
          type: 'Collaboration',
          accessLevel: invite.accessLevel,
          title: t('invite.pendingSubtitle'),
          description: `${t('HeuristicsCooperators.messages.invite_message')} ${study.testTitle}`,
          inviteToken: invite.token,
        })

        await dispatch('addNotification', {
          userId: user.id,
          notification,
        })

        localStorage.removeItem('pendingInviteToken')
      } catch (err) {
        commit('setError', {
          errorCode: 'dismissInviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async loadInvite({ dispatch, rootGetters }, { token }) {
      const result = await InviteController.validateInvite(token)

      if (!result.valid) {
        throw new Error(result.message || 'Invalid invitation')
      }

      let user = rootGetters.user

      if (!user) {
        await dispatch('autoSignIn', null, { root: true })
        user = rootGetters.user
      }

      const unauthorized =
        !result.invite.isPublic &&
        user &&
        result.invite.email &&
        user.email &&
        result.invite.email.toLowerCase() !== user.email.toLowerCase()

      return {
        invite: result.invite,
        unauthorized: Boolean(unauthorized),
      }
    },

    async loadPendingInvite({ dispatch }, { token }) {
      if (!token) {
        return null
      }

      try {
        const result = await dispatch('loadInvite', {
          token,
        })

        if (result.unauthorized) {
          return null
        }

        return result.invite
      } catch {
        localStorage.removeItem('pendingInviteToken')
        return null
      }
    },

    async sendParticipantInvitations(
      { commit, dispatch },
      {
        study,
        user,
        selectedParticipants,
        selectedRole,
        inviteMessage,
        users,
        router,
        resolveUserByEmail,
        studyParticipants,
      },
    ) {
      commit('setLoading', true)

      try {
        const newInvites = []

        for (const participant of selectedParticipants) {
          const invite = await prepareInvite({
            coop: participant,
            users,
            resolveUserByEmail,
          })

          const validationError = getCooperatorInviteValidationError({
            email: invite.email,
            currentUserEmail: user?.email,
            studyOwnerEmail: study?.testAdmin?.email,
            existingCooperators: studyParticipants || [],
            t,
          })

          if (validationError) {
            throw new Error(validationError)
          }
          const result = await sendParticipantInvitation({
            dispatch,
            study,
            user,
            participant: {
              ...invite,
              accessLevel: selectedRole,
              inviteMessage,
            },
            router,
            inviteMessage,
            resolveUserByEmail,
            action: 'invite',
          })

          newInvites.push(result)
        }

        await dispatch('getStudyParticipants', {
          studyId: study.id,
        })

        return newInvites
      } catch (err) {
        commit('setError', {
          errorCode: 'participantInviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async reinviteParticipant(
      { commit, dispatch },
      { study, user, participant, router, resolveUserByEmail },
    ) {
      commit('setLoading', true)

      try {
        await sendParticipantInvitation({
          dispatch,
          study,
          user,
          participant,
          router,
          resolveUserByEmail,
          action: 'reinvite',
        })

        await dispatch('getStudyParticipants', {
          studyId: study.id,
        })
      } catch (err) {
        commit('setError', {
          errorCode: 'participantInviteError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async cancelParticipantInvitation(
      { commit, dispatch },
      { study, participant },
    ) {
      commit('setLoading', true)

      try {
        await manageStudyMembership({
          studyId: study.id,
          action: 'cancelInvitation',
          targetUserId: participant.userDocId || null,
          targetEmail: participant.email || null,
          membershipType: 'participant',
        })

        await dispatch('getStudyParticipants', {
          studyId: study.id,
        })
      } catch (err) {
        commit('setError', {
          errorCode: 'participantInvitationCancellationError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async removeParticipant({ commit, dispatch }, { study, participant }) {
      commit('setLoading', true)

      try {
        await manageStudyMembership({
          studyId: study.id,
          action: 'remove',
          targetUserId: participant.userDocId || null,
          targetEmail: participant.email || null,
          membershipType: 'participant',
        })

        await dispatch('getStudyParticipants', {
          studyId: study.id,
        })
      } catch (err) {
        commit('setError', {
          errorCode: 'participantRemovalError',
          message: err,
        })

        throw err
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
