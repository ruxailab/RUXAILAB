<template>
  <v-dialog
    :model-value="dialog"
    class="rounded-lg"
    max-width="950"
    @click:outside="$emit('update:dialog', false)"
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="rounded-xxl elevation-8">
      <v-card-title
        class="bg-gradient-primary text-white pa-6 rounded-top-lg d-flex align-center"
      >
        <v-icon class="mr-3" size="28"> mdi-calendar-account </v-icon>

        <div>
          {{
            isEditMode
              ? $t('Sessions.title.editSession')
              : $t('Sessions.title.createSession')
          }}

          <p class="text-body-2 mb-0 opacity-90">
            {{
              isEditMode
                ? $t('Sessions.description.editSession')
                : $t('Sessions.description.createSession')
            }}
          </p>
        </div>
      </v-card-title>

      <v-card-text class="pa-8">
        <v-form ref="sessionForm" v-model="valid" validate-on="input">
          <label class="field-label">
            <v-icon class="mr-2" size="20"> mdi-text </v-icon>

            {{ $t('Sessions.title.title') }}
          </label>
          <v-text-field
            v-model="sessionTitle"
            color="primary"
            variant="outlined"
            density="comfortable"
            :placeholder="$t('Sessions.title.placeholder')"
            prepend-inner-icon="mdi-format-title"
            clearable
          />
          <v-row>
            <v-col cols="12" md="6" class="pr-md-8">
              <div class="form-section">
                <!-- STAFF -->
                <div class="field-group mb-6">
                  <label class="field-label">
                    <v-icon class="mr-2" size="20">
                      mdi-account-tie-outline
                    </v-icon>

                    {{ $t('Sessions.staff.title') }}
                  </label>

                  <p class="field-description mb-3">
                    {{ $t('Sessions.staff.description') }}
                  </p>

                  <v-autocomplete
                    v-model="selectedStaffMember"
                    :items="availableStaff"
                    item-title="email"
                    item-value="userDocId"
                    return-object
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-search"
                    :placeholder="$t('Sessions.staff.selectPlaceholder')"
                    color="primary"
                    hide-details
                  />

                  <v-row class="ma-0 mt-3 align-center">
                    <v-select
                      v-model="selectedStaffRole"
                      :items="staffRoleOptions"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />

                    <v-btn
                      class="ml-2"
                      icon
                      variant="outlined"
                      color="primary"
                      :disabled="!selectedStaffMember"
                      @click="addStaff"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-row>

                  <div v-if="sessionStaff.length" class="mt-4">
                    <div class="text-caption text-grey-darken-1 mb-2">
                      {{ $t('Sessions.staff.added') }}
                    </div>

                    <v-chip-group column>
                      <v-chip
                        v-for="(staff, index) in sessionStaff"
                        :key="staff.userDocId"
                        closable
                        color="primary"
                        variant="tonal"
                        size="small"
                        @click:close="removeStaff(index)"
                      >
                        {{ staff.email }}
                        -
                        {{ getStaffRoleLabel(staff.role) }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </div>

                <!-- PARTICIPANTS -->
                <div class="field-group mb-6">
                  <label class="field-label">
                    <v-icon class="mr-2" size="20">
                      mdi-account-group-outline
                    </v-icon>

                    {{ $t('Sessions.participants.title') }}
                  </label>

                  <p class="field-description mb-3">
                    {{ $t('Sessions.participants.description') }}
                  </p>

                  <v-autocomplete
                    v-model="selectedParticipant"
                    :items="availableParticipants"
                    item-title="email"
                    item-value="email"
                    return-object
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-search"
                    :placeholder="$t('Sessions.participants.selectPlaceholder')"
                    color="primary"
                    clearable
                    hide-details
                    @update:model-value="addExistingParticipant"
                  />

                  <v-row class="ma-0 mt-3">
                    <v-text-field
                      v-model="participantEmailInput"
                      variant="outlined"
                      density="comfortable"
                      :placeholder="
                        $t('Sessions.participants.emailPlaceholder')
                      "
                      prepend-inner-icon="mdi-email-outline"
                      color="primary"
                      clearable
                      @keydown.enter.prevent="addParticipantEmail"
                    />

                    <v-btn
                      class="ml-2"
                      icon
                      variant="outlined"
                      color="primary"
                      :disabled="!participantEmailInput.trim()"
                      @click="addParticipantEmail"
                    >
                      <v-icon> mdi-plus </v-icon>
                    </v-btn>
                  </v-row>

                  <div v-if="selectedParticipants.length" class="mt-3">
                    <div class="text-caption text-grey-darken-1 mb-2">
                      {{ $t('Sessions.participants.added') }}
                    </div>

                    <v-chip-group column>
                      <v-chip
                        v-for="(participant, index) in selectedParticipants"
                        :key="participant.email"
                        closable
                        color="primary"
                        variant="tonal"
                        size="small"
                        @click:close="removeParticipant(index)"
                      >
                        {{ participant.email }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </div>

                <!-- SCHEDULE -->
                <div class="field-group mb-6">
                  <div class="field-label">
                    <v-icon class="mr-2" size="20"> mdi-calendar-clock </v-icon>

                    {{ $t('Sessions.schedule.title') }}
                  </div>

                  <p class="field-description mb-3">
                    {{ $t('Sessions.schedule.description') }}
                  </p>

                  <v-row class="mt-2">
                    <v-col cols="7">
                      <v-menu
                        ref="dateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="auto"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            :model-value="formattedDate"
                            readonly
                            color="primary"
                            v-bind="props"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-calendar"
                            :placeholder="
                              $t('Sessions.schedule.datePlaceholder')
                            "
                            :rules="[
                              (v) =>
                                !!v || $t('Sessions.schedule.dateRequired'),
                            ]"
                            required
                          />
                        </template>

                        <v-date-picker
                          v-model="date"
                          :min="getDefaultDate()"
                          show-adjacent-months
                          color="primary"
                        />
                      </v-menu>
                    </v-col>

                    <v-col cols="5">
                      <v-menu
                        ref="timeMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        min-width="auto"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            v-model="hour"
                            readonly
                            v-bind="props"
                            prepend-inner-icon="mdi-clock-outline"
                            density="comfortable"
                            color="primary"
                            variant="outlined"
                            :placeholder="
                              $t('Sessions.schedule.timePlaceholder')
                            "
                            :rules="[
                              (v) =>
                                !!v || $t('Sessions.schedule.timeRequired'),
                            ]"
                          />
                        </template>

                        <v-time-picker
                          v-model="hour"
                          :min="minTime"
                          format="24hr"
                          color="primary"
                          scrollable
                        />
                      </v-menu>
                    </v-col>
                  </v-row>
                </div>
                <!-- MESSAGE -->
                <div class="field-group">
                  <div class="field-label">
                    <v-icon class="mr-2" size="20">
                      mdi-message-text-outline
                    </v-icon>

                    {{ $t('Sessions.message.title') }}
                  </div>

                  <p class="field-description mb-3">
                    {{ $t('Sessions.message.description') }}
                  </p>

                  <v-textarea
                    v-model="sessionMessage"
                    color="primary"
                    variant="outlined"
                    density="comfortable"
                    :placeholder="$t('Sessions.message.placeholder')"
                    rows="4"
                    auto-grow
                    counter
                    maxlength="500"
                    :rules="[
                      (v) => !!v || $t('Sessions.message.required'),
                      (v) =>
                        !v ||
                        v.length <= 500 ||
                        $t('Sessions.message.maxLength'),
                    ]"
                  />
                </div>
              </div>
            </v-col>

            <!-- PREVIEW -->
            <v-col cols="12" md="6" class="pl-md-8">
              <div class="preview-section">
                <div class="preview-header mb-4">
                  <v-icon class="mr-2" size="24" color="primary">
                    mdi-eye-outline
                  </v-icon>

                  <h3 class="text-h6 font-weight-bold">
                    {{ $t('Sessions.preview.title') }}
                  </h3>
                </div>

                <v-card class="invitation-preview elevation-2" border>
                  <v-card-title class="bg-grey-lighten-4 py-3">
                    <v-icon class="mr-2" color="primary">
                      mdi-calendar-account
                    </v-icon>

                    <span class="text-subtitle-1">
                      {{ $t('Sessions.preview.details') }}
                    </span>
                  </v-card-title>

                  <v-card-text class="pa-4">
                    <div class="preview-content">
                      <div v-if="sessionTitle" class="pb-3">
                        <strong>
                          {{ $t('Sessions.title.title') + ':' }}
                        </strong>
                        {{ sessionTitle }}
                      </div>
                      <!-- STAFF -->

                      <div class="mb-4">
                        <strong class="text-body-2">
                          {{ $t('Sessions.preview.staff') }}
                        </strong>

                        <div class="mt-2">
                          <v-chip
                            v-for="staff in sessionStaff"
                            :key="staff.userDocId"
                            size="small"
                            color="primary"
                            variant="tonal"
                            class="ma-1"
                          >
                            {{ staff.email }}
                            -
                            {{ getStaffRoleLabel(staff.role) }}
                          </v-chip>

                          <span v-if="!sessionStaff.length" class="text-grey">
                            {{ $t('Sessions.staff.noSelected') }}
                          </span>
                        </div>
                      </div>

                      <!-- PARTICIPANTS -->

                      <div class="mb-4">
                        <strong class="text-body-2">
                          {{ $t('Sessions.preview.participants') }}
                        </strong>

                        <div class="mt-2">
                          <v-chip
                            v-for="participant in selectedParticipants"
                            :key="participant.email"
                            size="small"
                            color="primary"
                            variant="tonal"
                            class="ma-1"
                          >
                            {{ participant.email }}
                          </v-chip>

                          <span
                            v-if="!selectedParticipants.length"
                            class="text-grey"
                          >
                            {{ $t('Sessions.participants.noSelected') }}
                          </span>
                        </div>
                      </div>

                      <!-- DATE -->

                      <p class="text-body-2 mb-3">
                        <strong>
                          {{ $t('Sessions.preview.schedule') }}
                        </strong>

                        {{
                          formattedDateTime ||
                          $t('Sessions.schedule.noDateSelected')
                        }}
                      </p>

                      <!-- MESSAGE -->

                      <div>
                        <strong class="text-body-2">
                          {{ $t('Sessions.preview.message') }}
                        </strong>

                        <div class="mt-1 pa-3 bg-grey-lighten-5 rounded">
                          {{
                            sessionMessage || $t('Sessions.preview.noMessage')
                          }}
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <div class="info-section mt-6">
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                    icon="mdi-information-outline"
                  >
                    <v-alert-title>
                      {{ $t('Sessions.info.title') }}
                    </v-alert-title>

                    <div class="text-body-2 mt-2">
                      {{ $t('Sessions.info.description') }}
                    </div>
                  </v-alert>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>

        <!-- ACTIONS -->

        <v-divider class="my-4" />

        <div class="d-flex justify-end gap-3">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            size="large"
            class="mr-2"
            @click="$emit('update:dialog', false)"
          >
            {{ $t('Sessions.actions.cancel') }}
          </v-btn>

          <v-btn
            color="primary"
            size="large"
            :loading="loading"
            :disabled="!valid"
            prepend-icon="mdi-calendar-plus"
            @click="saveSession"
          >
            {{
              isEditMode
                ? $t('Sessions.actions.updateSession')
                : $t('Sessions.actions.createSession')
            }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { showError, showSuccess } from '@/shared/utils/toast'
import { getPredefinedParticipantUserRole } from '../../composables/useCooperatorUtils'

const { t } = useI18n()

// Props
const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },

  session: {
    type: Object,
    default: null,
  },

  participants: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['update:dialog'])

// Store
const store = useStore()

// Form
const sessionForm = ref(null)
const valid = ref(false)
const loading = ref(false)

// Session data
const sessionDateTime = ref(new Date())
const sessionMessage = ref('')
const sessionTitle = ref('')

// Staff
const sessionStaff = ref([])

const selectedStaffMember = ref(null)

const selectedStaffRole = ref('FACILITATOR')

// Participants
const selectedParticipants = ref([])

const selectedParticipant = ref(null)

const participantEmailInput = ref('')

// Computed

const test = computed(() => store.getters.test)

const participants = computed(() => props.participants || [])

const cooperators = computed(() => test.value?.cooperators || [])

const isEditMode = computed(() => !!props.session)

const date = computed({
  get() {
    return sessionDateTime.value
  },

  set(value) {
    const newDate = new Date(value)

    sessionDateTime.value.setFullYear(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
    )

    sessionDateTime.value = new Date(sessionDateTime.value)
  },
})

const hour = computed({
  get() {
    return sessionDateTime.value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  },

  set(value) {
    const [hours, minutes] = value.split(':').map(Number)

    sessionDateTime.value.setHours(hours, minutes, 0, 0)

    sessionDateTime.value = new Date(sessionDateTime.value)
  },
})

const formattedDate = computed(() => {
  if (!date.value) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date.value)
})

const availableStaff = computed(() =>
  cooperators.value.filter(
    (cooperator) =>
      !sessionStaff.value.some(
        (staff) => staff.userDocId === cooperator.userDocId,
      ),
  ),
)

const availableParticipants = computed(() =>
  participants.value.filter(
    (user) =>
      !selectedParticipants.value.some(
        (participant) => participant.email === user.email,
      ),
  ),
)

const staffRoleOptions = computed(() => [
  {
    label: t('Sessions.staff.roles.facilitator'),
    value: 'FACILITATOR',
  },
  {
    label: t('Sessions.staff.roles.observer'),
    value: 'OBSERVER',
  },
])

const minTime = computed(() => {
  const currentDate = new Date()

  currentDate.setDate(currentDate.getDate() - 1)

  const selectedDate = new Date(date.value)

  if (selectedDate.toLocaleDateString() === currentDate.toLocaleDateString()) {
    return `${currentDate.getHours()}:${currentDate.getMinutes()}`
  }

  return '00:00'
})

const formattedDateTime = computed(() => {
  if (isNaN(sessionDateTime.value.getTime())) {
    return ''
  }

  return sessionDateTime.value.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Helpers
function getSessionTitle() {
  return sessionTitle.value?.trim() || `${date.value}_Session`
}

function getDefaultDate() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substring(0, 10)
}

function getStaffRoleLabel(role) {
  return (
    staffRoleOptions.value.find((item) => item.value === role)?.label || role
  )
}

// Staff actions
function addStaff() {
  if (!selectedStaffMember.value) {
    return
  }

  const alreadyExists = sessionStaff.value.some(
    (staff) => staff.userDocId === selectedStaffMember.value.userDocId,
  )

  if (alreadyExists) {
    return
  }

  sessionStaff.value.push({
    userDocId: selectedStaffMember.value.userDocId,
    email: selectedStaffMember.value.email,
    role: selectedStaffRole.value,
  })

  selectedStaffMember.value = null
}

function removeStaff(index) {
  sessionStaff.value.splice(index, 1)
}

// Participants actions

function addExistingParticipant(user) {
  if (!user) {
    return
  }

  addParticipant({
    userDocId: user.userDocId,
    email: user.email,
  })

  selectedParticipant.value = null
}

function addParticipantEmail() {
  const email = participantEmailInput.value.trim()

  if (!email) {
    return
  }

  addParticipant({
    email,
  })

  participantEmailInput.value = ''
}

function addParticipant(participant) {
  const exists = selectedParticipants.value.some(
    (item) => item.email.toLowerCase() === participant.email.toLowerCase(),
  )

  if (exists) {
    showError(t('Sessions.error.participantAlreadyAdded'))

    return
  }

  selectedParticipants.value.push({
    userDocId: participant.userDocId || null,
    email: participant.email,
    role: 'USER',
  })
}

function removeParticipant(index) {
  selectedParticipants.value.splice(index, 1)
}

async function saveSession() {
  try {
    loading.value = true

    const validation = await sessionForm.value.validate()

    if (!validation.valid) {
      return
    }

    const sessionPayload = {
      title: getSessionTitle(),
      scheduledAt: sessionDateTime.value.toISOString(),
      message: sessionMessage.value,

      staff: sessionStaff.value.map((staff) => ({
        userDocId: staff.userDocId,
        email: staff.email,
        role: staff.role,
      })),

      participants: selectedParticipants.value.map((participant) => ({
        userDocId: participant.userDocId || null,
        email: participant.email,
        role: getPredefinedParticipantUserRole(test.value),
      })),
    }

    if (isEditMode.value) {
      await store.dispatch('updateSession', {
        studyId: test.value.id,
        sessionId: props.session.id,
        session: sessionPayload,
        study: test.value,
      })

      showSuccess(t('Sessions.success.updated'))
    } else {
      await store.dispatch('createSession', {
        studyId: test.value.id,
        session: sessionPayload,
        study: test.value,
      })

      showSuccess(t('Sessions.success.created'))
    }

    resetForm()

    await store.dispatch('fetchSessions', test.value.id)

    emit('update:dialog', false)
  } catch (error) {
    showError(error.message || t('Sessions.error.createFailed'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  sessionDateTime.value = new Date()

  sessionMessage.value = ''

  sessionStaff.value = []

  selectedParticipants.value = []

  selectedStaffMember.value = null

  selectedParticipant.value = null

  participantEmailInput.value = ''

  sessionForm.value?.resetValidation()
}

watch(
  () => test.value,
  () => {
    sessionStaff.value = []

    selectedParticipants.value = []
  },
)

watch(
  () => props.session,
  (session) => {
    if (!session) {
      resetForm()
      return
    }

    sessionTitle.value = session.title || ''

    const scheduledDate = session.scheduledAt?.toDate
      ? session.scheduledAt.toDate()
      : new Date(session.scheduledAt)

    sessionDateTime.value = new Date(scheduledDate)

    sessionMessage.value = session.message || ''

    sessionStaff.value = (session.staff || []).map((item) => ({ ...item }))
    selectedParticipants.value = (session.participants || []).map((item) => ({
      ...item,
    }))
  },
  {
    immediate: true,
  },
)
</script>

<style scoped>
.v-dialog {
  border-radius: 20px !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #00213f 0%, #074082 100%);
}

.form-section {
  height: 100%;
}

.field-group {
  margin-bottom: 24px;
}

.field-label {
  display: flex;
  align-items: center;

  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;

  margin-bottom: 8px;
}

.field-description {
  color: #64748b;

  font-size: 14px;
  line-height: 1.4;

  margin-bottom: 12px;
}

.preview-section {
  height: 100%;

  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;

  padding-bottom: 16px;

  border-bottom: 2px solid #f1f5f9;
}

.invitation-preview,
.session-preview {
  border-radius: 12px;

  border: 1px solid #e2e8f0;

  overflow: hidden;
}

.preview-content {
  font-size: 14px;
  line-height: 1.6;
}

.info-section {
  margin-top: auto;
}

/* Responsive */

@media (max-width: 960px) {
  .preview-section {
    margin-top: 32px;
  }

  .field-group {
    margin-bottom: 20px;
  }
}

/* Inputs */

:deep(.v-text-field .v-field) {
  border-radius: 12px;
}

:deep(.v-textarea .v-field) {
  border-radius: 12px;
}

:deep(.v-select .v-field) {
  border-radius: 12px;
}

:deep(.v-autocomplete .v-field) {
  border-radius: 12px;
}

/* Buttons */

:deep(.v-btn) {
  border-radius: 12px;

  text-transform: none;

  font-weight: 600;

  letter-spacing: 0.02em;
}

/* Card */

.v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.invitation-preview,
.session-preview {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.invitation-preview:hover,
.session-preview:hover {
  transform: translateY(-2px);

  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Participant / staff list */

.participant-item,
.staff-item {
  padding: 12px 16px !important;

  border-bottom: 1px solid #f1f5f9;
}

.participant-item:hover,
.staff-item:hover {
  background-color: #f8fafc !important;
}

.participant-item:last-child,
.staff-item:last-child {
  border-bottom: none;
}

/* Autocomplete */

:deep(.v-autocomplete .v-field__input) {
  padding-top: 8px;

  padding-bottom: 8px;
}

:deep(.v-autocomplete .v-selection-control__wrapper) {
  margin-right: 8px;
}

:deep(.v-autocomplete .v-field__selection) {
  max-width: 100%;
}

/* Menu */

:deep(.v-menu .v-list) {
  padding: 8px 0;
}

:deep(.v-menu .v-list-item) {
  min-height: 56px;
}

/* Loading */

:deep(.v-autocomplete .v-progress-linear) {
  margin-top: 2px;
}
</style>
