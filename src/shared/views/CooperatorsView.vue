<template>
  <PageWrapper
    :title="$t('HeuristicsCooperators.title.cooperators')"
    :loading="loading"
    :loading-text="$t('HeuristicsCooperators.messages.cooperators_loading')"
    :side-gap="true"
    class="mr-10"
  >
    <!-- Actions Slot -->
    <template #actions>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-account-plus"
        variant="flat"
        class="px-6"
        @click="openDialog()"
      >
        {{ $t('HeuristicsCooperators.actions.send_invitation') }}
      </v-btn>
    </template>

    <!-- Main Content -->
    <Intro
      v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops"
      @close-intro="intro = false"
    />

    <CooperatorTable
      :hasRoleColumn="hasRoleColumn"
      :cooperators="cooperatorsEdit"
      :loading="loading"
      :show-date-columns="true"
      :message-text="$t('HeuristicsCooperators.actions.send_message')"
      :reinvite-text="$t('HeuristicsCooperators.actions.reinvite')"
      :remove-text="$t('HeuristicsCooperators.actions.remove_cooperator')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel_invitation')" @role-change="changeRole"
      @send-message="openMessageDialog" @reinvite="reinvite" @remove-cooperator="removeCoop"
      @cancel-invitation="cancelInvitation" />

    <!-- Leave Alert Dialog -->
    <v-dialog
      v-model="dialog"
      width="600"
      persistent
    >
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <MessageDialog
      v-model:show="messageModel"
      :selected-user="selectedUser"
      :title="$t('HeuristicsCooperators.actions.send_message')"
      :title-label="$t('HeuristicsCooperators.headers.title')"
      :title-hint="$t('HeuristicsCooperators.messages.message_title_hint')"
      :content-label="$t('HeuristicsCooperators.headers.content')"
      :content-hint="$t('HeuristicsCooperators.messages.message_content_hint')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel')"
      :send-text="$t('HeuristicsCooperators.actions.send')"
      @send-message="handleSendMessage"
    />

    <!-- Invite Dialog -->
    <InviteDialog
      v-model:show="showInviteDialog"
      :users="users"
      :show-date-time-selection="false"
      :title="$t('HeuristicsCooperators.actions.send_invitation')"
      :select-label="$t('HeuristicsCooperators.actions.select_cooperator')"
      :no-data-text="$t('HeuristicsCooperators.messages.no_users')"
      :role-label="$t('HeuristicsCooperators.headers.role')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel')"
      :send-text="$t('HeuristicsCooperators.actions.send')"
      @send-invitations="handleSendInvitations"
    />

    <AccessNotAllowed v-if="!loading && verified" />

    <slot
      name="dialog"
      :is-drawer-open="drawerOpen"
      :set-drawer-open="(val) => drawerOpen = val"
    />
  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted, useSlots } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import Intro from '@/shared/components/IntroCoops.vue';
import AccessNotAllowed from '@/shared/views/AccessNotAllowed.vue';
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert.vue';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import CooperatorTable from '@/shared/components/CooperatorTable.vue';
import MessageDialog from '@/shared/components/dialogs/MessageDialog.vue';
import InviteDialog from '@/shared/components/dialogs/InviteDialog.vue';
import UIDGenerator from 'uid-generator';
import { useCooperatorUtils } from '@/composables/useCooperatorUtils';
import { useNotificationManager } from '@/composables/useNotificationManager';
import { useCooperatorActions } from '@/composables/useCooperatorActions';

const uidgen = new UIDGenerator();

// Props
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  hasRoleColumn: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['open-invite-dialog'])

// Stores
const store = useStore();
const slots = useSlots();

// Use composables
const {
  roleOptions
} = useCooperatorUtils();

const {
  sendNotification
} = useNotificationManager();

const {
  handleRoleChange,
  handleCooperatorRemoval,
  handleInvitationCancellation,
} = useCooperatorActions();

// Variables
const intro = ref(null);
const showCoops = ref(false);
const verified = ref(false);
const messageModel = ref(false);
const selectedUser = ref([]);
const showInviteDialog = ref(false);
const drawerOpen = ref(false);

// Computeds
const dialog = computed(() => store.state.dialog);
const test = computed(() => store.getters.test);
const users = computed(() => store.state.Users?.users || []);
const cooperatorsEdit = computed(() => test.value?.cooperators ? [...test.value.cooperators] : []);
const loading = computed(() => store.getters.loading);

// Methods
const openMessageDialog = (item) => {
  selectedUser.value = item;
  messageModel.value = true;
};

const handleSendMessage = async ({ user, title, content }) => {
  messageModel.value = false;
  if (user.userDocId) {
    sendNotification({
      userId: user.userDocId,
      title: title,
      description: content,
      redirectsTo: null,
      author: test.value.testAdmin.email,
      testId: test.value.id
    });
  }
};

const handleSendInvitations = async (invitationData) => {
  const { selectedCoops, selectedRole } = invitationData;
  const tokens = {};

  selectedCoops.forEach((coop) => {
    const token = uidgen.generateSync();
    if (!coop.id) {
      cooperatorsEdit.value.push({
        userDocId: null,
        email: coop,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole].value,
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
        accessLevel: roleOptions.value[selectedRole].value,
        token,
        progress: 0,
        updateDate: test.value.updateDate,
        testAuthorEmail: test.value.testAdmin.email
      });
    }
    tokens[coop.id || coop] = token;
  });

  await submit();
  showInviteDialog.value = false;
};

const changeRole = async (item, newValue) => {
  await handleRoleChange(item, newValue, roleOptions.value, async (item, newValue) => {
    const index = cooperatorsEdit.value.indexOf(item);
    const newCoop = { ...item, accessLevel: newValue.value };
    test.value.cooperators[index] = newCoop;
    await store.dispatch('updateTest', test.value);
    await store.dispatch('updateUserAnswer', {
      testDocId: test.value.id,
      cooperatorId: newCoop.userDocId,
      data: { accessLevel: newCoop.accessLevel }
    });
  });
};

const submit = async () => {
  test.value.cooperators = [...cooperatorsEdit.value];
  await store.dispatch('updateTest', test.value);
  cooperatorsEdit.value.forEach((guest) => {
    if (!guest.accepted) {
      notifyCooperator(guest);
    }
  });
};

const notifyCooperator = (guest) => {
  if (guest.userDocId) {
    const path = guest.accessLevel >= 2 ? 'testview' : 'managerview';
    sendNotification({
      userId: guest.userDocId,
      title: 'Cooperation Invite!',
      description: `You have been invited to test ${test.value.testTitle}!`,
      redirectsTo: `${path}/${test.value.id}/${guest.token}`,
      author: test.value.testAdmin.email,
      testId: test.value.id,
      accessLevel: roleOptions.value.find(r => r.value === guest.accessLevel)?.value
    });
  }
};

const reinvite = (guest) => {
  notifyCooperator(guest);
};

const removeCoop = async (coop) => {
  await handleCooperatorRemoval(coop, async (coop) => {
    const index = cooperatorsEdit.value.indexOf(coop);
    cooperatorsEdit.value.splice(index, 1);
    test.value.cooperators = cooperatorsEdit.value;
    test.value.numberColaborators = test.value.numberColaborators - 1;
    await store.dispatch('updateTest', test.value);
    await store.dispatch('removeTestFromCooperator', {
      test: test.value,
      cooperator: coop
    });
  });
};

const cancelInvitation = async (guest) => {
  await handleInvitationCancellation(guest, async (guest) => {
    const index = cooperatorsEdit.value.indexOf(guest);
    cooperatorsEdit.value.splice(index, 1);
    test.value.cooperators = cooperatorsEdit.value;
    await store.dispatch('updateTest', test.value);
  });
};

const openDialog = async () => {
  if (slots.dialog) drawerOpen.value = true;
  else showInviteDialog.value = true;
}

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
