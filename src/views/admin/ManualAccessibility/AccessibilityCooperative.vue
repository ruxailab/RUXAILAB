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

    <!-- Filters Slot -->
    <template #filters>
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field v-model="filters.search" label="Search cooperators" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="comfortable" hide-details clearable />
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="filters.role" :items="roleOptions" item-title="title" item-value="title"
            label="Filter by Role" variant="outlined" density="comfortable" hide-details clearable />
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filters.status" :items="statusFilterOptions" item-title="title" item-value="value"
            label="Filter by Status" variant="outlined" density="comfortable" hide-details clearable />
        </v-col>
      </v-row>
    </template>

    <!-- Main Content -->
    <Intro v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops" @close-intro="intro = false" />

    <v-card elevation="2" height="100%">
      <v-data-table v-model="selectedCooperators" :headers="headers" :items="filteredCooperators"
        :items-per-page="itemsPerPage" class="cooperators-table" item-key="email" item-value="email" show-select
        height="50vh">

        <!-- Email Column -->
        <template v-slot:item.email="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar :color="item.avatar ? 'transparent' : 'primary'" size="40" class="me-3">
              <v-img v-if="item.avatar" :src="item.avatar" :alt="item.email" />
              <span v-else class="text-white font-weight-medium">
                {{ getInitials(item.email) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-body-1">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Role Column -->
        <template v-slot:item.accessLevel="{ item }">
          <v-select :ref="'select' + cooperatorsEdit.indexOf(item)" :key="dataTableKey" :model-value="item.accessLevel"
            :items="roleOptions" item-title="title" return-object density="comfortable"
            :disabled="!item.invited || item.accepted ? false : true" @update:model-value="changeRole(item, $event)"
            variant="plain">
            <template v-slot:selection="{ item: selectedItem }">
              <v-chip :color="getRoleColor(selectedItem.title)" size="small" variant="flat">
                <v-icon start size="16">{{ getRoleIcon(selectedItem.title) }}</v-icon>
                {{ selectedItem.title }}
              </v-chip>
            </template>
          </v-select>
        </template>

        <!-- Test Date -->
        <template #item.testDate="{ item }">
          <div>{{ formatDate(item.testDate) }}</div>
        </template>

        <!-- Starts at -->
        <template #item.testHour="{ item }">
          <div>{{ formatTime(item.testDate) }}</div>
        </template>

        <!-- Invited Column -->
        <template v-slot:item.invited="{ item }">
          <v-chip :color="item.invited ? 'success' : 'error'" size="small" variant="tonal">
            <v-icon>mdi-check</v-icon>
          </v-chip>
        </template>

        <!-- Accepted Column -->
        <template v-slot:item.accepted="{ item }">
          <v-chip :color="getStatusColor(item.accepted)" size="small" variant="tonal">
            {{ getStatusText(item.accepted) }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-icon icon="mdi-dots-vertical" v-bind="props" />
            </template>
            <v-list>
              <v-list-item link @click="messageModel = true; selectedUser = item">
                <v-list-item-title>Send a message</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="item.accepted == false" link @click="reinvite(item)">
                <v-list-item-title>Re-invite</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="item.accepted" @click="removeCoop(item)">
                <v-list-item-title>Remove cooperator</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="item.invited && !item.accepted" @click="cancelInvitation(item)">
                <v-list-item-title>Cancel invitation</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <v-dialog v-model="messageModel" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title style="color: white;" class="bg-primary rounded-top-lg">
          <v-icon color="white" class="mr-2">
            mdi-email
          </v-icon>
          Send a Message
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="messageTitle" required label="Title" hint="Type a title for your message"
            variant="outlined" class="rounded-lg mt-4" />
          <v-textarea v-model="messageContent" required label="Content" hint="Type the content of your message"
            variant="outlined" class="rounded-lg" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" variant="outlined" class="rounded-lg" @click="messageModel = false">
            Cancel
          </v-btn>
          <v-btn color="orange" class="rounded-lg" :disabled="!messageTitle.trim() || !messageContent.trim()"
            @click="sendMessage(selectedUser, messageTitle, messageContent)">
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Invite Dialog -->
    <v-dialog v-model="showInviteDialog" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title style="color: white;" class="bg-primary rounded-top-lg">
          <v-icon color="white" class="mr-2">
            mdi-account-plus
          </v-icon>
          Send Invitation
        </v-card-title>
        <v-card-text class="pt-4">
          <v-combobox :key="comboboxKey" ref="combobox" v-model="comboboxModel" :items="users" item-title="email"
            label="Select cooperator" multiple variant="outlined" density="comfortable"
            @update:model-value="validateEmail">
            <template #no-data>
              There are no users registered with that email, press enter to select anyways.
            </template>
          </v-combobox>
          <v-chip-group>
            <v-chip v-for="(coop, i) in selectedCoops" :key="i" closable @click:close="removeSelectedCoops(i)"
              class="ml-2 mt-2">
              {{ typeof coop == 'object' ? coop.email : coop }}
            </v-chip>
          </v-chip-group>
          <v-select v-model="selectedRole" :items="roleOptions" label="Role" variant="outlined" density="comfortable"
            class="mt-4" />

          <!-- Date/Time Selection -->
          <v-row class="mt-4">
            <v-col cols="6">
              <v-menu offset="26" :close-on-content-click="false" transition="scale-transition" min-width="auto">
                <template #activator="{ props }">
                  <v-text-field v-model="date" readonly color="primary" v-bind="props" variant="outlined"
                    density="compact" label="Date" prepend-inner-icon="mdi-calendar" />
                </template>
                <v-date-picker v-model="date"
                  :min="new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10)"
                  show-adjacent-months color="primary" />
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu :close-on-content-click="false" offset="40" transition="scale-transition" min-width="auto">
                <template #activator="{ props }">
                  <v-text-field v-model="hour" prepend-inner-icon="mdi-clock-time-four-outline" density="compact"
                    color="primary" variant="outlined" label="Time" readonly v-bind="props" />
                </template>
                <v-time-picker v-model="hour" :min="minTime" format="24hr" color="primary" scrollable />
              </v-menu>
            </v-col>
          </v-row>

          <v-textarea v-model="inviteMessage" color="primary" label="Invitation Message"
            placeholder="Enter your invitation message" variant="outlined" class="mt-4" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" variant="outlined" class="rounded-lg" @click="showInviteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" class="rounded-lg" :disabled="selectedCoops.length === 0" @click="saveInvitations">
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  roleOptions,
  statusFilterOptions,
  getInitials,
  getRoleColor,
  getRoleIcon,
  getStatusColor,
  getStatusText,
  formatDate,
  formatTime,
  validateEmail: isValidEmail
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
const selectedUserEmail = ref('');
const comboboxModel = ref([]);
const comboboxKey = ref(0);
const messageModel = ref(false);
const selectedUser = ref({});
const messageTitle = ref('');
const messageContent = ref('');
const showInviteDialog = ref(false);
const inviteMessage = ref('');
const valid = ref(false);
const combobox = ref(null);
const inviteForm = ref(null);
const intro = ref(null);
const showCoops = ref(false);
const verified = ref(false);
const dataTableKey = ref(0);
const itemsPerPage = ref(10);
const selectedCooperators = ref([]);
const selectedCoops = ref([]);
const selectedRole = ref(1);

// Date and time for scheduling
const date = ref(
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10)
);
const hour = ref(
  new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
);

const filters = ref({
  search: '',
  role: null,
  status: null
});

const dialog = computed(() => store.state.dialog);

const headers = computed(() => [
  { title: 'Email', key: 'email', sortable: true, width: '30%' },
  { title: 'Role', key: 'accessLevel', sortable: true, width: '15%' },
  { title: 'Test Date', key: 'testDate', sortable: true, width: '15%' },
  { title: 'Starts at', key: 'testHour', sortable: true, width: '10%' },
  { title: 'Invited', key: 'invited', sortable: true, width: '10%' },
  { title: 'Status', key: 'accepted', sortable: true, width: '10%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '10%' }
]);

// Computed properties
const cooperatorsEdit = computed(() => {
  // Convert the invited users to the format expected by ModeratedCoopsView
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

const filteredCooperators = computed(() => {
  let result = [...cooperatorsEdit.value];
  if (filters.value.role) {
    result = result
      .filter(coop => roleOptions.value
        .find(r => r.value === coop.accessLevel)?.title === filters.value.role);
  }
  if (filters.value.status) {
    if (filters.value.status === 'invited') {
      result = result.filter(coop => coop.invited && !coop.accepted);
    } else if (filters.value.status === 'accepted') {
      result = result.filter(coop => coop.accepted);
    } else if (filters.value.status === 'pending') {
      result = result.filter(coop => coop.invited && !coop.accepted);
    }
  }
  if (filters.value.search) {
    result = result.filter(coop => coop.email.toLowerCase().includes(filters.value.search.toLowerCase()));
  }
  return result;
});

const minTime = computed(() => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const selectedDate = new Date(date.value);

  if (
    selectedDate.toLocaleDateString() === currentDate.toLocaleDateString() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear()
  ) {
    return `${currentDate.getHours()}:${currentDate.getMinutes()}`;
  } else {
    return '00:00';
  }
});

const removeSelectedCoops = (index) => {
  selectedCoops.value.splice(index, 1);
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
  dataTableKey.value++;
};

const validateEmail = () => {
  const email = comboboxModel.value.pop();
  comboboxKey.value++;
  if (typeof email !== 'object' && email !== undefined) {
    if (email.length) {
      if (!isValidEmail(email)) {
        showError('Invalid email format');
        return;
      }
      if (!users.value.find(user => user.email === email)) {
        showError(`${email} is not a valid email or does not exist`);
        return;
      } else if (!selectedCoops.value.includes(email)) {
        selectedCoops.value.push(email);
      }
    }
  } else if (!selectedCoops.value.includes(email)) {
    const alreadyInvited = cooperatorsEdit.value.find(
      cooperator => cooperator.email === email.email
    );
    if (alreadyInvited) {
      showWarning(`${email.email} has already been invited`);
      return;
    } else {
      selectedCoops.value.push(email);
    }
  }
};

const saveInvitations = async () => {
  const testId = route.params.testId;

  try {
    const currentTest = await fetchTestData(testId);
    if (!currentTest) {
      showError('Test not found.');
      return;
    }
    if (!currentTest.collaborators) currentTest.collaborators = {};

    // Process each selected cooperator
    for (const coop of selectedCoops.value) {
      const dateTimeString = `${date.value}T${hour.value}:00`;
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
          inviteMessage: inviteMessage.value,
          accessLevel: roleOptions.value[selectedRole.value].value,
          token,
          progress: 0
        };

        // Send notification using composable
        try {
          await sendInvitationNotification(
            selectedUser.id,
            testId,
            inviteMessage.value || 'You have been invited to participate in an accessibility test.'
          );
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    }

    await updateTestData(testId, { collaborators: { ...currentTest.collaborators } });
    await fetchTestAndPopulateTable();
    showSuccess('Invitations sent successfully!');

    // Reset form
    showInviteDialog.value = false;
    selectedCoops.value = [];
    comboboxModel.value = [];
    inviteMessage.value = '';
    combobox.value?.blur();
  } catch (error) {
    console.error('[AccessibilityCooperative] updateTest failed:', error);
    showError('Failed to send invitations.');
  }
};

const sendMessage = async (guest, title, content) => {
  messageModel.value = false;
  if (guest.userDocId) {
    try {
      await sendMessageNotification(guest.userDocId, title, content, route.params.testId);
      showSuccess('Message sent successfully!');
      messageTitle.value = '';
      messageContent.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message.');
    }
  }
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
