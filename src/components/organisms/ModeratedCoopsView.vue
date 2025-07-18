<template>
  <div>
    <v-overlay v-if="loading" v-model="loading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Loading Cooperators
      </div>
    </v-overlay>
    <Intro v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops" @close-intro="intro = false" />

    <v-row justify="center">
      <v-container class="pa-0">
        <Snackbar />
        <!-- Leave alert dialog -->
        <v-dialog v-model="dialog" width="600" persistent>
          <LeaveAlert />
        </v-dialog>

        <ShowInfo title="Cooperators">
          <template #content>
            <div class="ma-0 pa-0" style="background: #f5f7ff">
              <v-row class="ma-0 pa-0 pt-3" align="center">
                <v-col class="mt-1 mx-4 pa-0">
                  <v-combobox :key="comboboxKey" ref="combobox" v-model="comboboxModel" :menu-props="{
                    rounded: 'xl',
                  }" :hide-no-data="false" :autofocus="comboboxKey == 0 ? false : true" style="background: #f5f7ff;"
                    :items="users" :item-title="item => item?.email || 'Select an Email'" label="Select cooperator"
                    variant="outlined" rounded density="compact" color="#fca326" class="mx-2"
                    @update:model-value="verifyEmail()">
                    <template #no-data>
                      There are no users registered with that email, press enter
                      to select anyways.
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
              <v-card class="mx-6" border>
                <v-data-table style="background: #f5f7ff" :items="cooperatorsEdit" :headers="headers" height="450px"
                  :items-per-page="10">
                  <!-- Email -->
                  <template #item.email="{ item }">
                    <v-row class="ml-3" align="center">
                      <div>{{ item?.email }}</div>
                    </v-row>
                  </template>

                  <!-- Test Date -->
                  <template #item.testDate="{ item }">
                    <div>{{ formatDate(item.testDate) }}</div>
                  </template>

                  <!-- Starts at -->
                  <template #item.testHour="{ item }">
                    <div>{{ formatTime(item.testDate) }}</div>
                  </template>

                  <!-- Invited -->
                  <template #item.invited="{ item }">
                    <v-icon v-if="item.invited" color="#8EB995">
                      mdi-checkbox-marked-circle-outline
                    </v-icon>
                    <v-icon v-else color="#F47C7C">
                      mdi-close-circle-outline
                    </v-icon>
                  </template>

                  <!-- Accepted -->
                  <template #item.accepted="{ item }">
                    <v-icon v-if="item.accepted == null" color="#F9A826">
                      mdi-checkbox-blank-circle-outline
                    </v-icon>
                    <v-icon v-else-if="item.accepted" color="#8EB995">
                      mdi-checkbox-marked-circle-outline
                    </v-icon>
                    <v-icon v-else color="#F47C7C">
                      mdi-close-circle-outline
                    </v-icon>
                  </template>

                  <!-- Session -->
                  <template #item.session="{ item }">
                    <v-tooltip location="bottom">
                      <template #activator="{ props }">
                        <v-btn v-if="item" v-bind="props" class="ml-1" icon @click="goToSession(item.userDocId)">
                          <v-icon>mdi-file-document-arrow-right</v-icon>
                        </v-btn>
                      </template>
                      <span>Go to session</span>
                    </v-tooltip>
                  </template>

                  <!-- More -->
                  <template #item.more="{ item }">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn icon v-bind="props">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
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
            </div>
          </template>
        </ShowInfo>
      </v-container>
      <v-tooltip location="left">
        <template #activator="{ props }">
          <v-btn size="large" icon class="mr-5 mb-5" position="fixed" location="bottom right" color="#F9A826"
            :disabled="!comboboxModel?.email" v-bind="props" @click="openInvitationModal()">
            <v-icon size="large">
              mdi-email
            </v-icon>
          </v-btn>
        </template>
        <span>Send invitations</span>
      </v-tooltip>
    </v-row>
    <AccessNotAllowed v-if="!loading && verified" />
    <div class="text-center">
      <v-dialog v-model="messageModel" max-width="500">
        <v-card class="rounded-lg">
          <v-card-title style="background-color: #F9A826; color: white;" class="rounded-top-lg">
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
            <v-btn color="orange" class="rounded-lg" @click="sendMessage(selectedUser, messageTitle, messageContent)">
              Send
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="inviteModal" class="rounded-lg" max-width="950"
        @click:outside="$refs.inviteForm.resetValidation()">
        <v-card class="rounded-xxl">
          <v-card-title style="color: #626E76;" class="rounded-top-lg">
            {{ $t('UsabilityCooperators.inviteEvaluator') }}
          </v-card-title>
          <v-divider class="mb-4" />
          <v-card-text>
            <v-form ref="inviteForm" v-model="valid" validate-on="lazy">
              <v-row>
                <v-col cols="5" class="ml-4 mt-2">
                  <span class="modalInternTitles">{{ $t('UsabilityCooperators.email') }}</span>
                  <v-col cols="7" class="pa-0">
                    <v-text-field :model-value="comboboxModel?.email" density="compact" disabled variant="outlined"
                      bg-color="#D7D7D7" class="rounded-lg" />
                  </v-col>
                  <span class="modalInternTitles">{{ $t('UsabilityCooperators.scheduledAt') }}</span>
                  <v-row justify="center" style="margin-top: -9px;">
                    <v-col cols="5" class="pr-0">
                      <v-menu ref="menu" offset="26" :close-on-content-click="false" transition="scale-transition"
                        min-width="auto">
                        <template #activator="{ props }">
                          <v-text-field v-model="date" readonly color="orange" bg-color="grey lighten-3" v-bind="props"
                            variant="outlined" density="compact" class="rounded-lg"
                            :rules="[(v) => !!v || 'Required Date']" required />
                        </template>
                        <v-date-picker v-model="date" :min="new Date(
                          Date.now() - new Date().getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .substring(0, 10)
                          " show-adjacent-months color="orange" />
                      </v-menu>
                    </v-col>
                    <v-col cols="4" class="mr-auto">
                      <v-menu ref="menu" :close-on-content-click="false" offset="40" transition="scale-transition"
                        min-width="auto">
                        <template #activator="{ props }">
                          <v-text-field v-model="hour" prepend-icon="mdi-clock-time-four-outline" density="compact"
                            bg-color="grey lighten-3" color="orange" variant="outlined" class="rounded-lg" readonly
                            v-bind="props" :rules="[(v) => !!v || 'Required Time']" required />
                        </template>
                        <v-time-picker v-model="hour" :min="minTime" format="24hr" color="orange" scrollable />
                      </v-menu>
                    </v-col>
                  </v-row>
                  <span class="modalInternTitles">{{ $t('UsabilityCooperators.inviteMessage') }} </span>
                  <v-row>
                    <v-col cols="9">
                      <v-textarea v-model="inviteMessage" color="orange" bg-color="grey lighten-3" required
                        :placeholder="$t('UsabilityCooperators.placeholderMessage')" variant="outlined"
                        class="rounded-lg mt-1" />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col>
                  <img class="ml-5" src="../../../public/Schedule.svg" alt="Schedule" height="330">
                  <v-row>
                    <v-col cols="9" style="text-align: center">
                      <span class="modalInternTitles">{{ $t('UsabilityCooperators.inviteInfo') }}</span>
                    </v-col>
                    <v-col cols="2">
                      <v-btn color="orange"
                        style="border-radius: 10px; text-transform: unset !important;font-weight: 600" size="large"
                        @click="saveInvitation()">
                        {{ $t('UsabilityCooperators.send') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider />
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import Snackbar from '@/components/atoms/Snackbar.vue';
import Intro from '@/components/molecules/IntroCoops.vue';
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue';
import LeaveAlert from '@/components/atoms/LeaveAlert.vue';
import { roleOptionsItems } from '@/utils/items';
import Notification from '@/models/Notification';


const props = defineProps({
  id: { type: String, default: '' },
});

const store = useStore();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

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
const headers = ref([
  { title: 'Email', value: 'email' },
  { title: 'Test Date', value: 'testDate' },
  { title: 'Starts at', value: 'testHour' },
  { title: 'Invited', value: 'invited', justify: 'center' },
  { title: 'Accepted', value: 'accepted', justify: 'center' },
  { title: 'Session', value: 'session', justify: 'center' },
  { title: 'More', value: 'more', sortable: false },
]);
const roleOptions = ref(roleOptionsItems);
const intro = ref(null);
const comboboxModel = ref(null);
const comboboxKey = ref(0);
const selectedRole = ref(1);
const showCoops = ref(false);
const verified = ref(false);
const messageModel = ref(false);
const selectedUser = ref({});
const messageTitle = ref('');
const inviteMessage = ref('');
const messageContent = ref('');
const inviteModal = ref(false);
const valid = ref(false);
const combobox = ref(null);
const inviteForm = ref(null);

const dialog = computed(() => store.state.dialog);
const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);
const users = computed(() => store.state.Users.users || []);
const cooperatorsEdit = computed(() =>
  test.value.cooperators ? [...test.value.cooperators] : []
);
const loading = computed(() => store.getters.loading);
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

const saveInvitation = async () => {
  const isValid = await inviteForm.value.validate();
  if (!isValid) return;

  const cooperator = comboboxModel.value;
  const dateTimeString = `${date.value}T${hour.value}:00`;
  const dateTime = new Date(dateTimeString);
  const timestamp = dateTime.toISOString();

  cooperatorsEdit.value.push({
    userDocId: cooperator.id || null,
    email: cooperator?.email,
    invited: true,
    accepted: false,
    accessLevel: 1,
    testDate: timestamp,
    inviteMessage: inviteMessage.value,
    updateDate: test.value.updateDate,
    testAuthorEmail: test.value.testAdmin.email,
  });

  await submit();
};

const verifyEmail = () => {
  if (!comboboxModel.value || !comboboxModel.value?.email) return;
  const alreadyInvited = cooperatorsEdit.value.find(
    (cooperator) => cooperator?.email === comboboxModel.value?.email
  );
  if (alreadyInvited) {
    toast.warning(`${comboboxModel.value?.email} has already been invited`);
    comboboxModel.value = null;
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
  inviteModal.value = false;
  inviteForm.value.resetValidation();
  hour.value = null;
  inviteMessage.value = '';
  comboboxModel.value = null;
  combobox.value.blur();
};

const goToSession = (coopId) => {
  router.push(`/testview/${test.value.id}/${coopId}`);
};

const notifyCooperator = (guest) => {
  if (guest.userDocId) {
    const path = 'testview';
    store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        accessLevel: 1,
        title: `You have been invited to test ${test.value.testTitle}!`,
        description: inviteMessage.value,
        redirectsTo: `${path}/${test.value.id}/${guest.userDocId}`,
        author: test.value.testAdmin?.email,
        read: false,
        testId: test.value.id,
      }),
    });
  }
  sendInvitationMail(guest);
};

const sendMessage = (guest, title, content) => {
  messageModel.value = false;
  if (guest.userDocId) {
    const path = guest.accessLevel >= 2 ? 'managerview' : 'testview';
    store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        title,
        description: content,
        redirectsTo: '/',
        read: false,
        author: test.value.testAdmin?.email,
        testId: test.value.id,
      }),
    });
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

const reinvite = (guest) => {
  notifyCooperator(guest);
};

const openInvitationModal = () => {
  inviteModal.value = true;
};

const removeCoop = async (coop) => {
  const ok = confirm(`Are you sure you want to remove ${coop.email} from your cooperators?`);
  if (ok) {
    const index = cooperatorsEdit.value.indexOf(coop);
    cooperatorsEdit.value.splice(index, 1);
    test.value.cooperators = cooperatorsEdit.value;
    test.value.numberColaborators -= 1;
    await store.dispatch('updateTest', test.value);
    await store.dispatch('removeTestFromCooperator', {
      test: test.value,
      cooperator: coop,
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
    domain,
  };
  if (guest.accessLevel === 1) {
    email = Object.assign(email, {
      path: 'testview',
      token: guest.userDocId,
    });
  } else {
    email = Object.assign(email, {
      path: 'managerview',
      token: guest.userDocId,
    });
  }
  await store.dispatch('sendModeratedEmailInvitation', email);
};

const cancelInvitation = async (guest) => {
  const ok = confirm(`Are you sure you want to cancel ${guest.email} from your cooperators?`);
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
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
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
</style>