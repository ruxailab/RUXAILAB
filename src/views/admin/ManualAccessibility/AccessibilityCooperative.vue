<template>
  <PageWrapper title="Accessibility Test Cooperators" :loading="loading" loading-text="Loading Cooperators"
    :side-gap="true">

    <!-- Actions Slot -->
    <template #actions>
      <v-btn color="primary" size="large" @click="showInviteDialog = true" prepend-icon="mdi-account-plus"
        variant="flat" class="px-6">
        Send Invitation
      </v-btn>
    </template>

    <!-- Main Content -->
    <Intro v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops" @close-intro="intro = false" />

    <CooperatorTable :cooperators="cooperatorsEdit" :loading="loading" :show-date-columns="true"
      @role-change="changeRole" @send-message="openMessageDialog" @reinvite="reinvite" @remove-cooperator="removeCoop"
      @cancel-invitation="cancelInvitation" />

    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <MessageDialog v-model:show="messageModel" :selected-user="selectedUser" @send-message="handleSendMessage" />

    <!-- Invite Dialog -->
    <InviteDialog v-model:show="showInviteDialog" :users="users" :show-date-time-selection="true"
      @send-invitations="handleSendInvitations" />

    <AccessNotAllowed v-if="!loading && verified" />
  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Intro from '@/components/molecules/IntroCoops.vue';
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue';
import LeaveAlert from '@/components/atoms/LeaveAlert.vue';
import PageWrapper from '@/components/template/PageWrapper.vue';
import CooperatorTable from '@/components/molecules/CooperatorTable.vue';
import MessageDialog from '@/components/molecules/MessageDialog.vue';
import InviteDialog from '@/components/molecules/InviteDialog.vue';
import UIDGenerator from 'uid-generator';
import { useCooperatorUtils } from '@/composables/useCooperatorUtils';
import { useNotificationManager } from '@/composables/useNotificationManager';
import { useCooperatorActions } from '@/composables/useCooperatorActions';

const uidgen = new UIDGenerator();

const toast = useToast();
const store = useStore();
const route = useRoute();
const router = useRouter();

// Use composables
const {
  roleOptions
} = useCooperatorUtils();

const {
  sendInvitationNotification,
  sendReminderNotification,
  sendMessageNotification
} = useNotificationManager();

const {
  updateTestData,
  fetchTestData,
  handleRoleChange,
  handleCooperatorRemoval,
  handleInvitationCancellation,
  showSuccess,
  showError,
  showWarning
} = useCooperatorActions();

// Reactive variables for enhanced functionality
const loading = ref(false);
const users = ref([]);
const invitedUsers = ref([]);
const messageModel = ref(false);
const selectedUser = ref({});
const showInviteDialog = ref(false);
const intro = ref(null);
const showCoops = ref(false);
const verified = ref(false);

const dialog = computed(() => store.state.dialog);

// Computed properties
const cooperatorsEdit = computed(() => {
  // Convert the invited users to the format expected by CooperatorTable
  return invitedUsers.value.map(user => ({
    userDocId: user.id,
    email: user.email,
    invited: user.invited,
    accepted: user.accepted || null,
    testDate: user.testDate || new Date().toISOString(),
    inviteMessage: user.inviteMessage || '',
    accessLevel: user.accessLevel || 1
  }));
});

const openMessageDialog = (item) => {
  selectedUser.value = item;
  messageModel.value = true;
};

const handleSendMessage = async ({ user, title, content }) => {
  messageModel.value = false;
  if (user.userDocId) {
    try {
      await sendMessageNotification(user.userDocId, title, content, route.params.testId);
      showSuccess('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message.');
    }
  }
};

const handleSendInvitations = async (invitationData) => {
  const testId = route.params.testId;
  const { selectedCoops, selectedRole, inviteMessage, date, hour } = invitationData;

  try {
    const currentTest = await fetchTestData(testId);
    if (!currentTest) {
      showError('Test not found.');
      return;
    }
    if (!currentTest.collaborators) currentTest.collaborators = {};

    // Process each selected cooperator
    for (const coop of selectedCoops) {
      const dateTimeString = `${date}T${hour}:00`;
      const dateTime = new Date(dateTimeString);
      const timestamp = dateTime.toISOString();
      const token = uidgen.generateSync();

      let selectedUser;
      if (typeof coop === 'object') {
        selectedUser = coop;
      } else {
        selectedUser = users.value.find(user => user.email === coop);
      }

      if (selectedUser) {
        // Add the user as collaborator with extended info
        currentTest.collaborators[selectedUser.id] = {
          role: 'invited',
          email: selectedUser.email,
          invited: true,
          accepted: null,
          testDate: timestamp,
          inviteMessage: inviteMessage,
          accessLevel: roleOptions.value[selectedRole].value,
          token,
          progress: 0
        };

        // Send notification using composable
        try {
          await sendInvitationNotification(
            selectedUser.id,
            testId,
            inviteMessage || 'You have been invited to participate in an accessibility test.'
          );
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    }

    await updateTestData(testId, { collaborators: { ...currentTest.collaborators } });
    await fetchTestAndPopulateTable();
    showSuccess('Invitations sent successfully!');
    showInviteDialog.value = false;
  } catch (error) {
    console.error('[AccessibilityCooperative] updateTest failed:', error);
    showError('Failed to send invitations.');
  }
};

const changeRole = async (item, newValue) => {
  await handleRoleChange(item, newValue, roleOptions.value, async (item, newValue) => {
    const testId = route.params.testId;
    const currentTest = await fetchTestData(testId);
    if (currentTest?.collaborators?.[item.userDocId]) {
      currentTest.collaborators[item.userDocId].accessLevel = newValue.value;
      await updateTestData(testId, { collaborators: { ...currentTest.collaborators } });
      await fetchTestAndPopulateTable();
    }
  });
};

const reinvite = async (guest) => {
  try {
    await sendReminderNotification(guest.userDocId, route.params.testId);
    showSuccess('Re-invitation sent successfully!');
  } catch (error) {
    console.error('Error sending re-invitation:', error);
    showError('Failed to send re-invitation.');
  }
};

const removeCoop = async (coop) => {
  await handleCooperatorRemoval(coop, async (coop) => {
    const testId = route.params.testId;
    const currentTest = await fetchTestData(testId);
    if (currentTest?.collaborators?.[coop.userDocId]) {
      delete currentTest.collaborators[coop.userDocId];
      await updateTestData(testId, { collaborators: { ...currentTest.collaborators } });
      await fetchTestAndPopulateTable();
    }
  });
};

const cancelInvitation = async (guest) => {
  await handleInvitationCancellation(guest, removeCoop);
};

const goToSession = (coopId) => {
  const testId = route.params.testId;
  router.push(`/preview/${testId}`);
};

// Original functions adapted
const fetchUsers = async () => {
  await store.dispatch('getAllUsers');
  users.value = store.state.Users.users;
};

const fetchTestAndPopulateTable = async () => {
  const testId = route.params.testId;
  try {
    const test = await fetchTestData(testId);
    if (test?.collaborators) {
      invitedUsers.value = Object.entries(test.collaborators).map(([userId, collaboratorInfo]) => {
        const userObj = users.value.find(u => u.id === userId);

        // Handle both old format (string) and new format (object)
        if (typeof collaboratorInfo === 'string') {
          return {
            id: userId,
            email: userObj ? userObj.email : userId,
            invited: collaboratorInfo === 'invited',
            accepted: null,
            testDate: null,
            inviteMessage: '',
            accessLevel: 1
          };
        } else {
          return {
            id: userId,
            email: collaboratorInfo.email || (userObj ? userObj.email : userId),
            invited: collaboratorInfo.invited || false,
            accepted: collaboratorInfo.accepted || null,
            testDate: collaboratorInfo.testDate || null,
            inviteMessage: collaboratorInfo.inviteMessage || '',
            accessLevel: collaboratorInfo.accessLevel || 1
          };
        }
      });
    } else {
      invitedUsers.value = [];
    }
  } catch (err) {
    console.error('[AccessibilityCooperative] Failed to fetch test for table:', err);
    invitedUsers.value = [];
  }
};

watch(loading, (newVal) => {
  if (!newVal) {
    intro.value = cooperatorsEdit.value.length === 0;
  }
});

onMounted(async () => {
  loading.value = true;
  await fetchUsers();
  await fetchTestAndPopulateTable();
  loading.value = false;
});
</script>
<style scoped>
.cooperators-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.cooperators-table :deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-grey-50));
}

.cooperators-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 2px solid rgb(var(--v-theme-grey-200));
}

.cooperators-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.cooperators-table :deep(.v-selection-control) {
  justify-content: center;
}

.v-card {
  border-radius: 20px !important;
}

.v-combobox {
  border-radius: 10px !important;
}

.v-btn {
  font-weight: 600;
  text-transform: unset !important;
}

.modalInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.v-application .v-autocomplete__content.menuable__content__active {
  border-radius: 20px !important;
}

.v-dialog {
  border-radius: 20px !important;
}

.white-text {
  color: white;
}
</style>
