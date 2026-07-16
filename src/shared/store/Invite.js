/**
 * Cooperator Invite Store Module
 * @module CooperatorInvite
 */
import Notification from '@/shared/models/Notification'
import EmailController from '@/shared/controllers/EmailController'
import InviteController from '@/shared/controllers/InviteController.js'
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

const createInvitation = async ({ study, guest }) => {
  return InviteController.generateInvitationLink({
    studyId: study.id,
    studyTitle: study.testTitle,
    accessLevel: guest.accessLevel,
    requiredLogin: true,
    toEmail: guest.email,
    isPublic: false,
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
    titleTemplate: t('HeuristicsCooperators.actions.send_invitation'),
    descriptionTemplate: t('HeuristicsCooperators.messages.invite_message'),
    descriptionParams: {
      testTitle: study.testTitle || 'Test',
    },
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
  },
}
