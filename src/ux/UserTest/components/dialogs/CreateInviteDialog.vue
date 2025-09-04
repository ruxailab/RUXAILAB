<template>
  <v-dialog
    :model-value="dialog"
    class="rounded-lg"
    max-width="950"
    @click:outside="$emit('update:dialog', false)"
  @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="rounded-xxl">
      <v-card-title
        style="color: #626E76;"
        class="rounded-top-lg"
      >
        {{ $t('UsabilityCooperators.inviteEvaluator') }}
      </v-card-title>

      <v-divider class="mb-4" />

      <v-card-text>
        <v-form
          ref="inviteForm"
          v-model="valid"
          validate-on="lazy"
        >
          <v-row>
            <v-col
              cols="5"
              class="ml-4 mt-2"
            >
              <span class="modelInternTitles">{{ $t('UsabilityCooperators.email') }}</span>
              <v-col
                cols="7"
                class="pa-0"
              >
                <v-select
                  v-model="comboboxModel.userId"
                  :items="users"
                  item-title="email"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <span class="modalInternTitles">{{ $t('UsabilityCooperators.scheduledAt') }}</span>
              <v-row
                justify="center"
                style="margin-top: -9px;"
              >
                <v-col
                  cols="5"
                  class="pr-0"
                >
                  <v-menu
                    ref="menu"
                    offset="26"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="date"
                        readonly
                        color="orange"
                        bg-color="grey lighten-3"
                        v-bind="props"
                        variant="outlined"
                        density="compact"
                        class="rounded-lg"
                        :rules="[(v) => !!v || 'Required Date']"
                        required
                      />
                    </template>
                    <v-date-picker
                      v-model="date"
                      :min="new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .substring(0, 10)
                      "
                      show-adjacent-months
                      color="orange"
                    />
                  </v-menu>
                </v-col>
                <v-col
                  cols="4"
                  class="mr-auto"
                >
                  <v-menu
                    ref="menu"
                    :close-on-content-click="false"
                    offset="40"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="hour"
                        prepend-icon="mdi-clock-time-four-outline"
                        density="compact"
                        bg-color="grey lighten-3"
                        color="orange"
                        variant="outlined"
                        class="rounded-lg"
                        readonly
                        v-bind="props"
                        :rules="[(v) => !!v || 'Required Time']"
                        required
                      />
                    </template>
                    <v-time-picker
                      v-model="hour"
                      :min="minTime"
                      format="24hr"
                      color="orange"
                      scrollable
                    />
                  </v-menu>
                </v-col>
              </v-row>

              <span class="modalInternTitles">{{ $t('UsabilityCooperators.inviteMessage') }} </span>
              <v-row>
                <v-col cols="9">
                  <v-textarea
                    v-model="inviteMessage"
                    color="orange"
                    bg-color="grey lighten-3"
                    required
                    :placeholder="$t('UsabilityCooperators.placeholderMessage')"
                    variant="outlined"
                    class="rounded-lg mt-1"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col>
              <img
                class="ml-5"
                src="../../../../../public/Schedule.svg"
                alt="Schedule"
                height="330"
              >
              <v-row>
                <v-col
                  cols="9"
                  style="text-align: center"
                >
                  <span class="modalInternTitles">{{ $t('UsabilityCooperators.inviteInfo') }}</span>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    color="orange"
                    style="border-radius: 10px; text-transform: unset !important;font-weight: 600"
                    size="large"
                    @click="saveInvitation()"
                  >
                    {{ $t('UsabilityCooperators.send') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Cooperators from '@/shared/models/Cooperators';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

// Props
const props = defineProps({
  dialog: Boolean,
});

// Emits
const emit = defineEmits(['update:dialog']);

// Store
const store = useStore();

// Variables
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

const inviteForm = ref(null);
const valid = ref(false);
const comboboxModel = ref({});
const inviteMessage = ref('');

// Computed
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

const cooperatorsEdit = computed(() =>
  test.value.cooperators ? [...test.value.cooperators] : []
);

const test = computed(() => store.getters.test);
const users = computed(() => store.state.Users?.users || []);

// Methods
const saveInvitation = async () => {
  const isValid = await inviteForm.value.validate();
  if (!isValid) return;

  const cooperator = users.value.find(user => user.id === comboboxModel.value.userId);

  const dateTimeString = `${date.value}T${hour.value}:00`;
  const dateTime = new Date(dateTimeString);
  const timestamp = dateTime.toISOString();

  console.log('cooperator', cooperator);

  cooperatorsEdit.value.push(new Cooperators( {
    userDocId: cooperator.id,
    email: cooperator.email,
    invited: true,
    accepted: false,
    accessLevel: 1,
    testDate: timestamp,
    inviteMessage: inviteMessage.value,
    updateDate: test.value.updateDate,
    testAuthorEmail: test.value.testAdmin.email,
  }));

  await submit();
};

const submit = async () => {
  test.value.cooperators = [...cooperatorsEdit.value];
  await store.dispatch('updateStudy', test.value);
  cooperatorsEdit.value.forEach((guest) => {
    if (!guest.accepted) {
      notifyCooperator(guest);
    }
  });
  inviteForm.value.resetValidation();
  hour.value = null;
  inviteMessage.value = '';
  comboboxModel.value = {};

  emit('update:dialog', false);
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
};
</script>

<style scoped>
.modalInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.v-dialog {
  border-radius: 20px !important;
}
</style>
