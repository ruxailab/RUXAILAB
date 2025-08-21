<template>
  <PageWrapper
    :title="$t('HeuristicsCooperators.title.cooperators')"
    :loading="loading"
    :loading-text="$t('HeuristicsCooperators.messages.cooperators_loading')"
    :side-gap="true"
  >
    <!-- Actions Slot -->
    <template #actions>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-account-plus"
        variant="flat"
        class="px-6"
        @click="showInviteDialog = true"
      >
        {{ $t('HeuristicsCooperators.actions.send_invitation') }}
      </v-btn>
    </template>

    <!-- Filters Slot -->
    <template #filters>
      <v-row align="center">
        <v-col
          cols="12"
          md="5"
        >
          <v-text-field
            v-model="filters.search"
            label="Search cooperators"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="filters.role"
            :items="roleOptions"
            item-title="title"
            item-value="title"
            label="Filter by Role"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-select
            v-model="filters.status"
            :items="statusFilterOptions"
            item-title="title"
            item-value="value"
            label="Filter by Status"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
      </v-row>
    </template>

    <!-- Main Content -->
    <Intro
      v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops"
      @close-intro="intro = false"
    />

    <v-card
      elevation="2"
      height="100%"
    >
      <v-data-table
        v-model="selectedCooperators"
        :headers="headers"
        :items="filteredCooperators"
        :items-per-page="itemsPerPage"
        class="cooperators-table"
        item-key="email"
        item-value="email"
        show-select
        height="50vh"
      >
        <!-- Email Column -->
        <template #item.email="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar
              :color="item.avatar ? 'transparent' : 'primary'"
              size="40"
              class="me-3"
            >
              <v-img
                v-if="item.avatar"
                :src="item.avatar"
                :alt="item.email"
              />
              <span
                v-else
                class="text-white font-weight-medium"
              >
                {{ getInitials(item.email) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium text-body-1">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Role Column -->
        <template #item.accessLevel="{ item }">
          <v-select
            :ref="'select' + cooperatorsEdit.indexOf(item)"
            :key="dataTableKey"
            :model-value="item.accessLevel"
            :items="roleOptions"
            item-title="title"
            return-object
            density="comfortable"
            :disabled="!item.invited || item.accepted ? false : true"
            variant="plain"
            @update:model-value="changeRole(item, $event)"
          >
            <template #selection="{ item: selectedItem }">
              <v-chip
                :color="getRoleColor(selectedItem.title)"
                size="small"
                variant="flat"
              >
                <v-icon
                  start
                  size="16"
                >
                  {{ getRoleIcon(selectedItem.title) }}
                </v-icon>
                {{ selectedItem.title }}
              </v-chip>
            </template>
          </v-select>
        </template>

        <!-- Invited Column -->
        <template #item.invited="{ item }">
          <v-chip
            :color="item.invited ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <v-icon>mdi-check</v-icon>
          </v-chip>
        </template>

        <!-- Accepted Column -->
        <template #item.accepted="{ item }">
          <v-chip
            :color="getStatusColor(item.accepted)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.accepted) }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-icon
                icon="mdi-dots-vertical"
                v-bind="props"
              />
            </template>
            <v-list>
              <v-list-item
                link
                @click="messageModel = true; selectedUser = item"
              >
                <v-list-item-title>
                  {{ $t('HeuristicsCooperators.actions.send_message') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.accepted == false"
                link
                @click="reinvite(item)"
              >
                <v-list-item-title>
                  {{ $t('HeuristicsCooperators.actions.reinvite') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.accepted"
                @click="removeCoop(item)"
              >
                <v-list-item-title>
                  {{ $t('HeuristicsCooperators.actions.remove_cooperator') }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.invited && !item.accepted"
                @click="cancelInvitation(item)"
              >
                <v-list-item-title>
                  {{ $t('HeuristicsCooperators.actions.cancel_invitation') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Leave Alert Dialog -->
    <v-dialog
      v-model="dialog"
      width="600"
      persistent
    >
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <v-dialog
      v-model="messageModel"
      max-width="500"
    >
      <v-card class="rounded-lg">
        <v-card-title
          style="color: white;"
          class="bg-primary rounded-top-lg"
        >
          <v-icon
            color="white"
            class="mr-2"
          >
            mdi-email
          </v-icon>
          {{ $t('HeuristicsCooperators.actions.send_message') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="messageTitle"
            required
            :label="$t('HeuristicsCooperators.headers.title')"
            :hint="$t('HeuristicsCooperators.messages.message_title_hint')"
            variant="outlined"
            class="rounded-lg mt-4"
          />
          <v-textarea
            v-model="messageContent"
            required
            :label="$t('HeuristicsCooperators.headers.content')"
            :hint="$t('HeuristicsCooperators.messages.message_content_hint')"
            variant="outlined"
            class="rounded-lg"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            variant="outlined"
            class="rounded-lg"
            @click="messageModel = false"
          >
            {{ $t('HeuristicsCooperators.actions.cancel') }}
          </v-btn>
          <v-btn
            color="orange"
            class="rounded-lg"
            :disabled="!messageTitle.trim() || !messageContent.trim()"
            @click="sendMessage(selectedUser, messageTitle, messageContent)"
          >
            {{ $t('HeuristicsCooperators.actions.send') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Invite Dialog -->
    <v-dialog
      v-model="showInviteDialog"
      max-width="500"
    >
      <v-card class="rounded-lg">
        <v-card-title
          style="color: white;"
          class="bg-primary rounded-top-lg"
        >
          <v-icon
            color="white"
            class="mr-2"
          >
            mdi-account-plus
          </v-icon>
          {{ $t('HeuristicsCooperators.actions.send_invitation') }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-combobox
            :key="comboboxKey"
            ref="combobox"
            v-model="comboboxModel"
            :items="users"
            item-title="email"
            :label="$t('HeuristicsCooperators.actions.select_cooperator')"
            multiple
            variant="outlined"
            density="comfortable"
            @update:model-value="validateEmail"
          >
            <template #no-data>
              {{ $t('HeuristicsCooperators.messages.no_users') }}
            </template>
          </v-combobox>
          <v-chip-group>
            <v-chip
              v-for="(coop, i) in selectedCoops"
              :key="i"
              closable
              class="ml-2 mt-2"
              @click:close="removeSelectedCoops(i)"
            >
              {{ typeof coop == 'object' ? coop.email : coop }}
            </v-chip>
          </v-chip-group>
          <v-select
            v-model="selectedRole"
            :items="roleOptions"
            :label="$t('HeuristicsCooperators.headers.role')"
            variant="outlined"
            density="comfortable"
            class="mt-4"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            variant="outlined"
            class="rounded-lg"
            @click="showInviteDialog = false"
          >
            {{ $t('HeuristicsCooperators.actions.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="rounded-lg"
            :disabled="selectedCoops.length === 0"
            @click="saveInvitations"
          >
            {{ $t('HeuristicsCooperators.actions.send') }}
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
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import Intro from '@/components/molecules/IntroCoops.vue';
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue';
import LeaveAlert from '@/components/atoms/LeaveAlert.vue';
import Notification from '@/models/Notification';
import UIDGenerator from 'uid-generator';
import PageWrapper from '@/components/template/PageWrapper.vue';

const uidgen = new UIDGenerator();

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

const store = useStore();
const { t } = useI18n();
const toast = useToast();

const intro = ref(null);
const email = ref('');
const selectedCoops = ref([]);
const comboboxModel = ref([]);
const comboboxKey = ref(0);
const selectedRole = ref(1);
const showCoops = ref(false);
const verified = ref(false);
const dataTableKey = ref(0);
const messageModel = ref(false);
const selectedUser = ref([]);
const messageTitle = ref('');
const messageContent = ref('');
const combobox = ref(null);
const showInviteDialog = ref(false);
const itemsPerPage = ref(10);
const selectedCooperators = ref([]);

const filters = ref({
  search: '',
  role: null,
  status: null
});

const dialog = computed(() => store.state.dialog);
const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);
const users = computed(() => store.state.Users?.users || []);
const cooperatorsEdit = computed(() => test.value?.cooperators ? [...test.value.cooperators] : []);
const loading = computed(() => store.getters.loading);

const headers = computed(() => [
  { title: 'Email', key: 'email', sortable: true, width: '40%' },
  { title: 'Role', key: 'accessLevel', sortable: true, width: '30%' },
  { title: 'Invited', key: 'invited', sortable: true, width: '15%' },
  { title: 'Status', key: 'accepted', sortable: true, width: '15%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '10%' }
]);

const roleOptions = computed(() => [
  { title: 'Administrator', value: 0 },
  { title: 'Evaluator', value: 1 },
  { title: 'Guest', value: 2 }
]);

const statusFilterOptions = computed(() => [
  { title: 'Invited', value: 'invited' },
  { title: 'Accepted', value: 'accepted' },
  { title: 'Pending', value: 'pending' }
]);

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

const getInitials = (email) => {
  return email.split('@')[0].slice(0, 2).toUpperCase();
};

const getRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'administrator': return 'primary';
    case 'evaluator': return 'success';
    case 'guest': return 'warning';
    default: return 'grey';
  }
};

const getRoleIcon = (role) => {
  switch (role.toLowerCase()) {
    case 'administrator': return 'mdi-crown';
    case 'evaluator': return 'mdi-account-check';
    case 'guest': return 'mdi-account';
    default: return 'mdi-account';
  }
};

const getStatusColor = (status) => {
  if (status === true) return 'success';
  if (status === false) return 'error';
  return 'warning';
};

const getStatusText = (status) => {
  if (status === true) return 'accepted';
  return 'pending';
};

const removeSelectedCoops = (index) => {
  selectedCoops.value.splice(index, 1);
};

const changeRole = async (item, newValue) => {
  const index = cooperatorsEdit.value.indexOf(item);
  const newCoop = { ...item, accessLevel: newValue.value };
  const currentAccessLevelText = roleOptions.value.find(r => r.value === item.accessLevel)?.title;
  const newAccessLevelText = newValue.title;

  if (item.accessLevel !== newValue.value) {
    const ok = confirm(
      t('HeuristicsCooperators.messages.change_role', {
        email: item.email,
        old: currentAccessLevelText,
        new: newAccessLevelText
      })
    );
    if (ok) {
      test.value.cooperators[index] = newCoop;
      await store.dispatch('updateTest', test.value);
      await store.dispatch('updateUserAnswer', {
        testDocId: test.value.id,
        cooperatorId: newCoop.userDocId,
        data: { accessLevel: newCoop.accessLevel }
      });
    } else {
      dataTableKey.value++;
    }
  }
};

const submit = async () => {
  test.value.cooperators = [...cooperatorsEdit.value];
  await store.dispatch('updateTest', test.value);
  cooperatorsEdit.value.forEach((guest) => {
    if (!guest.accepted) {
      notifyCooperator(guest);
    }
  });
  selectedCoops.value = [];
  combobox.value?.blur();
  showInviteDialog.value = false;
};

const notifyCooperator = (guest) => {
  if (guest.userDocId) {
    const path = guest.accessLevel.value >= 2 ? 'testview' : 'managerview';
    store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        title: 'Cooperation Invite!',
        description: `You have been invited to test ${test.value.testTitle}!`,
        redirectsTo: `${path}/${test.value.id}/${guest.token}`,
        author: test.value.testAdmin.email,
        read: false,
        testId: test.value.id,
        accessLevel: roleOptions.value[selectedRole.value].value
      })
    });
  }
};

const sendMessage = (user, title, content) => {
  if (user.userDocId) {
    const path = user.accessLevel.value >= 2 ? 'testview' : 'managerview';
    store.dispatch('addNotification', {
      userId: user.userDocId,
      notification: new Notification({
        title: title,
        description: content,
        redirectsTo: '/',
        read: false,
        author: test.value.testAdmin.email,
        testId: test.value.id
      })
    });
  }
  messageModel.value = false;
  messageTitle.value = '';
  messageContent.value = '';
};

const reinvite = (guest) => {
  notifyCooperator(guest);
};

const saveInvitations = () => {
  const tokens = {};
  selectedCoops.value.forEach((coop) => {
    const token = uidgen.generateSync();
    if (!coop.id) {
      cooperatorsEdit.value.push({
        userDocId: null,
        email: coop,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole.value].value,
        token,
        progress: 0,
        updateDate: test.value.updateDate,
        testAuthorEmail: test.value.testAdmin.email
      });
    } else {
      cooperatorsEdit.value.push({
        userDocId: coop.id,
        email: coop.email,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole.value].value,
        token,
        progress: 0,
        updateDate: test.value.updateDate,
        testAuthorEmail: test.value.testAdmin.email
      });
    }
    tokens[coop.id || coop] = token;
  });
  submit();
};

const validateEmail = () => {
  email.value = comboboxModel.value.pop();
  comboboxKey.value++;
  if (typeof email.value !== 'object' && email.value !== undefined) {
    if (email.value.length) {
      if (!email.value.includes('@') || !email.value.includes('.')) {
        toast.error(t('errors.globalError'));
        return;
      }
      if (!users.value.find(user => user.email === email.value)) {
        toast.error(`${email.value} is not a valid email or does not exist`);
        return;
      } else if (!selectedCoops.value.includes(email.value)) {
        selectedCoops.value.push(email.value);
      }
    }
  } else if (!selectedCoops.value.includes(email.value)) {
    const alreadyInvited = cooperatorsEdit.value.find(
      cooperator => cooperator.email === email.value.email
    );
    if (alreadyInvited) {
      toast.warning(`${email.value.email} has already been invited`);
      return;
    } else {
      selectedCoops.value.push(email.value);
    }
  }
};

const removeCoop = async (coop) => {
  const ok = confirm(
    t('HeuristicsCooperators.messages.remove_cooperator', { email: coop.email })
  );
  if (ok) {
    const index = cooperatorsEdit.value.indexOf(coop);
    cooperatorsEdit.value.splice(index, 1);
    test.value.cooperators = cooperatorsEdit.value;
    test.value.numberColaborators = test.value.numberColaborators - 1;
    await store.dispatch('updateTest', test.value);
    await store.dispatch('removeTestFromCooperator', {
      test: test.value,
      cooperator: coop
    });
  }
};

const sendInvitationMail = async (guest) => {
  let domain = window.location.href;
  domain = domain.replace(window.location.pathname, '');
  let email = {
    testId: test.value.id,
    from: user.value.email,
    testTitle: test.value.testTitle,
    guest,
    domain
  };
  if (guest.accessLevel === 1) {
    email = { ...email, path: 'testview', token: guest.token };
  } else {
    email = { ...email, path: 'managerview', token: guest.token };
  }
  await store.dispatch('sendEmailInvitation', email);
};

const cancelInvitation = async (guest) => {
  const ok = confirm(
    t('HeuristicsCooperators.messages.cancel_invitation', { email: guest.email })
  );
  if (ok) {
    const index = cooperatorsEdit.value.indexOf(guest);
    cooperatorsEdit.value.splice(index, 1);
    test.value.cooperators = cooperatorsEdit.value;
    await store.dispatch('updateTest', test.value);
  }
};

watch(loading, (newVal) => {
  if (!newVal) {
    intro.value = cooperatorsEdit.value.length === 0;
  }
});

onMounted(() => {
  store.dispatch('getAllUsers');
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
</style>