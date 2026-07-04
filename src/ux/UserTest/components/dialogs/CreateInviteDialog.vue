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
        <v-icon class="mr-3" size="28">mdi-account-plus-outline</v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">
            {{ $t('UsabilityCooperators.inviteEvaluator') }}
          </h2>
          <p class="text-body-2 mb-0 opacity-90">
            Send evaluation invitations to participants
          </p>
        </div>
      </v-card-title>

      <v-card-text class="pa-8">
        <v-form ref="inviteForm" v-model="valid" validate-on="input">
          <v-row>
            <v-col cols="12" md="6" class="pr-md-8">
              <div class="form-section">
                <!-- Role Selection -->
                <div class="field-group mb-6">
                  <label class="field-label">
                    <v-icon class="mr-2" size="20"
                      >mdi-account-cowboy-hat</v-icon
                    >
                    Role
                  </label>
                  <p class="field-description mb-3">
                    Select the role for this participant.
                  </p>
                  <v-radio-group
                    v-model="selectedRole"
                    color="primary"
                    hide-details
                  >
                    <v-radio
                      v-for="role in roleOptions"
                      :key="role.value"
                      :value="role.value"
                    >
                      <template #label>
                        <div>
                          <div class="font-weight-medium">{{ role.label }}</div>
                          <div class="text-caption text-grey">
                            {{ role.description }}
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>

                <!-- Participant Selection -->
                <div class="field-group mb-6">
                  <label class="field-label">
                    <v-icon class="mr-2" size="20">mdi-account-outline</v-icon>
                    {{ $t('UsabilityCooperators.email') }}
                  </label>
                  <p class="field-description mb-3">
                    Select the participant you want to invite to this evaluation
                    session.
                  </p>
                  <v-combobox
                    ref="comboboxRef"
                    v-model="comboboxModel"
                    :items="filteredUsers"
                    item-title="email"
                    item-value="id"
                    multiple
                    chips
                    variant="outlined"
                    density="comfortable"
                    placeholder="Type email address or select from list..."
                    prepend-inner-icon="mdi-account-multiple-plus"
                    color="primary"
                    clearable
                    :menu-props="{ maxHeight: 300 }"
                    @update:model-value="validateEmailInput"
                  >
                    <template #chip="{ props, item }">
                      <v-chip
                        v-bind="props"
                        closable
                        color="primary"
                        variant="tonal"
                        size="small"
                      >
                        <v-avatar start>
                          <span class="text-caption">
                            {{
                              (typeof item.raw === 'object'
                                ? item.raw.email
                                : item.raw
                              )
                                .charAt(0)
                                .toUpperCase()
                            }}
                          </span>
                        </v-avatar>
                        {{
                          typeof item.raw === 'object'
                            ? item.raw.email
                            : item.raw
                        }}
                      </v-chip>
                    </template>
                    <template #item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :title="item.raw.email"
                        :subtitle="item.raw.name || 'Registered user'"
                        class="participant-item"
                      >
                        <template #prepend>
                          <v-avatar size="40" color="primary" class="mr-3">
                            <span class="text-white font-weight-bold">
                              {{ item.raw.email.charAt(0).toUpperCase() }}
                            </span>
                          </v-avatar>
                        </template>
                        <template #append>
                          <v-chip
                            v-if="isEmailAlreadySelected(item.raw.email)"
                            size="small"
                            color="success"
                            variant="tonal"
                          >
                            Selected
                          </v-chip>
                          <v-chip
                            v-else-if="isParticipantAlreadyInvited(item.raw.id)"
                            size="small"
                            color="warning"
                            variant="tonal"
                          >
                            Already Invited
                          </v-chip>
                        </template>
                      </v-list-item>
                    </template>
                    <template #no-data>
                      <div class="pa-4 text-center">
                        <v-icon size="48" color="primary" class="mb-2">
                          mdi-email-plus-outline
                        </v-icon>
                        <p class="text-body-2 text-grey-darken-1 mb-1">
                          Type any email address and press Enter
                        </p>
                        <p class="text-caption text-grey">
                          You can invite anyone, not just registered users
                        </p>
                      </div>
                    </template>
                  </v-combobox>
                </div>

                <!-- Schedule Section -->
                <div class="field-group mb-6">
                  <div class="field-label">
                    <v-icon class="mr-2" size="20">mdi-calendar-clock</v-icon>
                    {{ $t('UsabilityCooperators.scheduledAt') }}
                  </div>
                  <p class="field-description mb-3">
                    Choose the date and time for the evaluation session.
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
                            v-model="date"
                            readonly
                            color="primary"
                            v-bind="props"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-calendar"
                            placeholder="Select date"
                            :rules="[(v) => !!v || 'Date is required']"
                            required
                          />
                        </template>
                        <v-date-picker
                          v-model="date"
                          :min="
                            new Date(
                              Date.now() -
                                new Date().getTimezoneOffset() * 60000,
                            )
                              .toISOString()
                              .substring(0, 10)
                          "
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
                            prepend-inner-icon="mdi-clock-outline"
                            density="comfortable"
                            color="primary"
                            variant="outlined"
                            placeholder="Select time"
                            readonly
                            v-bind="props"
                            :rules="[(v) => !!v || 'Time is required']"
                            required
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

                <!-- Invitation Message -->
                <div class="field-group mb-6">
                  <div class="field-label">
                    <v-icon class="mr-2" size="20"
                      >mdi-message-text-outline</v-icon
                    >
                    {{ $t('UsabilityCooperators.inviteMessage') }}
                  </div>
                  <p class="field-description mb-3">
                    Write a personalized message to include with the invitation.
                  </p>
                  <v-textarea
                    v-model="inviteMessage"
                    color="primary"
                    variant="outlined"
                    density="comfortable"
                    :placeholder="$t('UsabilityCooperators.placeholderMessage')"
                    rows="4"
                    auto-grow
                    counter
                    maxlength="500"
                    :rules="[
                      (v) => !!v || 'Message is required',
                      (v) =>
                        (v && v.length <= 500) ||
                        'Message must be less than 500 characters',
                    ]"
                    required
                  />
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="pl-md-8">
              <!-- Preview Section -->
              <div class="preview-section">
                <div class="preview-header mb-4">
                  <v-icon class="mr-2" size="24" color="primary"
                    >mdi-eye-outline</v-icon
                  >
                  <h3 class="text-h6 font-weight-bold">Invitation Preview</h3>
                </div>

                <v-card class="invitation-preview elevation-2" border>
                  <v-card-title class="bg-grey-lighten-4 py-3">
                    <v-icon class="mr-2" color="primary"
                      >mdi-email-outline</v-icon
                    >
                    <span class="text-subtitle-1">Evaluation Invitation</span>
                  </v-card-title>

                  <v-card-text class="pa-4">
                    <div class="preview-content">
                      <p class="text-body-2 mb-3">
                        <strong>To:</strong>
                        <v-chip-group>
                          <v-chip
                            v-for="(item, i) in comboboxModel"
                            :key="i"
                            color="primary"
                            size="small"
                            class="ma-1"
                          >
                            {{ typeof item === 'object' ? item.email : item }}
                          </v-chip>
                          <span v-if="!comboboxModel.length"
                            >No participant selected</span
                          >
                        </v-chip-group>
                      </p>
                      <p class="text-body-2 mb-3">
                        <strong>Scheduled:</strong>
                        {{ formattedDateTime || 'No date/time selected' }}
                      </p>
                      <div class="mb-3">
                        <strong class="text-body-2">Message:</strong>
                        <div class="mt-1 pa-3 bg-grey-lighten-5 rounded">
                          {{ inviteMessage || 'No message entered yet...' }}
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
                    <v-alert-title>{{
                      $t('UsabilityCooperators.inviteInfo')
                    }}</v-alert-title>
                    <div class="text-body-2 mt-2">
                      The participant will receive an email notification and can
                      accept or decline the invitation.
                    </div>
                  </v-alert>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>

        <!-- Action Buttons -->
        <v-divider class="my-6" />
        <div class="d-flex justify-end gap-3">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            size="large"
            @click="$emit('update:dialog', false)"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            :loading="loading"
            :disabled="!valid"
            prepend-icon="mdi-send"
            @click="saveInvitation()"
          >
            {{ $t('UsabilityCooperators.send') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Notification from '@/shared/models/Notification'
import EmailController from '@/shared/controllers/EmailController'
import UIDGenerator from 'uid-generator'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
import { showError, showSuccess } from '@/shared/utils/toast'
import { getAssignableRoleOptions } from '@/shared/utils/studyAccessPolicy'
import { manageStudyMembership } from '@/shared/services/studyMembershipService'

// Props
const props = defineProps({
  dialog: Boolean,
})

// Emits
const emit = defineEmits(['update:dialog'])

// Store
const store = useStore()
const uidgen = new UIDGenerator()

// Composables
const { validateEmail } = useCooperatorUtils()

// Helper functions
const getDefaultTime = () => {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const getDefaultDate = () => {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10)
}

// Variables
const date = ref(getDefaultDate())
const hour = ref(getDefaultTime())

const inviteForm = ref(null)
const valid = ref(false)
const comboboxModel = ref([])
const inviteMessage = ref('')
const loading = ref(false)
const selectedRole = ref(null)

// Computed
const minTime = computed(() => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)
  const selectedDate = new Date(date.value)

  if (
    selectedDate.toLocaleDateString() === currentDate.toLocaleDateString() &&
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear()
  ) {
    return `${currentDate.getHours()}:${currentDate.getMinutes()}`
  } else {
    return '00:00'
  }
})

const cooperatorsEdit = computed(() =>
  test.value?.cooperators ? [...test.value.cooperators] : [],
)

const test = computed(() => store.getters.test)
const currentUser = computed(() => store.getters.user)
const users = computed(() => store.state.Users?.users || [])
const roleOptions = computed(() =>
  getAssignableRoleOptions(test.value, currentUser.value).map((role) => ({
    ...role,
    label: role.title,
    description:
      role.title === 'Observator'
        ? 'Watches the session and reviews its answers.'
        : `Collaborates as ${role.title}.`,
  })),
)

watch(
  roleOptions,
  (options) => {
    if (!options.some((option) => option.value === selectedRole.value)) {
      selectedRole.value = options[0]?.value ?? null
    }
  },
  { immediate: true },
)

const filteredUsers = computed(() => {
  if (!users.value || users.value.length === 0) return []

  return users.value
    .filter((user) => user && user.email) // Filter out invalid users
    .map((user) => ({
      ...user,
      displayText: user.name ? `${user.email} (${user.name})` : user.email,
    }))
    .sort((a, b) => {
      // Sort by email alphabetically with null checks
      const emailA = a.email || ''
      const emailB = b.email || ''
      return emailA.localeCompare(emailB)
    })
})

const formattedDateTime = computed(() => {
  if (!date.value || !hour.value) return ''

  // Handle date conversion properly
  let dateValue = date.value
  if (dateValue instanceof Date) {
    dateValue = dateValue.toISOString().split('T')[0] // Convert to YYYY-MM-DD
  }

  const dateTime = new Date(`${dateValue}T${hour.value}`)

  // Check if the date is valid before formatting
  if (isNaN(dateTime.getTime())) return 'Invalid date/time'

  return dateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Methods
const isParticipantAlreadyInvited = (userId) => {
  if (!userId || !cooperatorsEdit.value) return false
  return cooperatorsEdit.value.some(
    (cooperator) => cooperator && cooperator.userDocId === userId,
  )
}

const isEmailAlreadySelected = (email) =>
  comboboxModel.value.some(
    (item) => (typeof item === 'object' ? item.email : item) === email,
  )

const validateEmailInput = () => {
  comboboxModel.value = comboboxModel.value.filter((item) => {
    const email = typeof item === 'object' ? item.email : item
    if (!validateEmail(email)) {
      showError('Invalid email: ' + email)
      return false
    }
    return true
  })
}

const saveInvitation = async () => {
  try {
    loading.value = true
    const isValid = await inviteForm.value.validate()
    if (!isValid) return

    // Validate date and time values
    if (!date.value || !hour.value) {
      throw new Error('Date and time are required')
    }

    // Ensure proper time format (HH:MM)
    let timeValue = hour.value
    if (timeValue && !timeValue.includes(':')) {
      // If time doesn't include colon, it might be in wrong format
      throw new Error('Invalid time format')
    }

    // Convert date to proper string format if it's a Date object
    let dateValue = date.value
    if (dateValue instanceof Date) {
      dateValue = dateValue.toISOString().split('T')[0] // Convert to YYYY-MM-DD
    }

    // Construct datetime string with proper validation
    const dateTimeString = `${dateValue}T${timeValue}:00`
    console.log('Constructing datetime from:', {
      originalDate: date.value,
      formattedDate: dateValue,
      hour: hour.value,
      dateTimeString,
    })

    const dateTime = new Date(dateTimeString)

    // Check if the constructed date is valid
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date/time combination: ${dateTimeString}`)
    }

    const timestamp = dateTime.toISOString()
    const invited = []
    for (const item of comboboxModel.value) {
      const email = typeof item === 'object' ? item.email : item
      const userDocId = typeof item === 'object' ? item.id : null

      const result = await manageStudyMembership({
        studyId: test.value.id,
        action: 'invite',
        targetUserId: userDocId,
        targetEmail: email,
        role: selectedRole.value,
        inviteMessage: inviteMessage.value,
        testDate: timestamp,
        token: uidgen.generateSync(),
      })
      invited.push(result.cooperator)
    }
    await submit(invited)
  } catch (error) {
    console.error('Error saving invitation:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const submit = async (invited) => {
  // Ensure notifications / external emails are sent one by one
  for (const guest of invited) {
    try {
      await notifyCooperator(guest)
    } catch (err) {
      console.error('notfyCooperator error:', err)
    }
  }

  await store.dispatch('getStudy', { id: test.value.id })

  inviteForm.value.resetValidation()

  // Reset to default values instead of null
  hour.value = getDefaultTime()
  date.value = getDefaultDate()

  inviteMessage.value = ''
  comboboxModel.value = []
  selectedRole.value = roleOptions.value[0]?.value ?? null

  emit('update:dialog', false)
}

const notifyCooperator = async (guest) => {
  if (!guest) return

  // For registered users with userDocId
  if (guest.userDocId) {
    const path = '/testview'
    try {
      await store.dispatch('addNotification', {
        userId: guest.userDocId,
        notification: new Notification({
          accessLevel: guest.accessLevel || 2,
          title: `You have been invited to test ${test.value.testTitle}!`,
          description: inviteMessage.value,
          redirectsTo: `${path}/${test.value.id}/${guest.userDocId}`,
          author: test.value.testAdmin?.email,
          type: 'Collaboration',
          read: false,
          testId: test.value.id,
          testDate: guest.testDate,
        }),
      })
      showSuccess('Notification sent successfully')
    } catch (err) {
      console.error('addNotification failed:', err)
      showError('Failed to send notification')
    }
    return
  }

  // For external (typed) emails, send via EmailController
  try {
    const emailController = new EmailController()
    await emailController.send({
      to: guest.email,
      subject: `You have been invited to test ${test.value.testTitle}!`,
      template: 'invite',
      attachments: [],
      data: {
        message: inviteMessage.value,
        testTitle: test.value.testTitle,
        testDescription: test.value.testDescription,
        adminEmail: test.value.testAdmin?.email,
        adminName: store.getters.user?.name || test.value.testAdmin?.email,
        testId: test.value.id,
        scheduledAt: guest.testDate,
        accessLevel: guest.accessLevel,
        token: guest.token || null,
      },
    })
    showSuccess('Email invitation sent')
  } catch (err) {
    console.error('External email send failed:', err)
    showError('Failed to send email invitation')
  }
}
</script>

<style scoped>
.v-dialog {
  border-radius: 20px !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
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

.invitation-preview {
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .preview-section {
    margin-top: 32px;
  }

  .field-group {
    margin-bottom: 20px;
  }
}

/* Enhanced form styling */
:deep(.v-text-field .v-field) {
  border-radius: 12px;
}

:deep(.v-textarea .v-field) {
  border-radius: 12px;
}

:deep(.v-select .v-field) {
  border-radius: 12px;
}

:deep(.v-btn) {
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Card enhancements */
.v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.invitation-preview {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.invitation-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Participant selector enhancements */
.participant-item {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9;
}

.participant-item:hover {
  background-color: #f8fafc !important;
}

.participant-item:last-child {
  border-bottom: none;
}

/* Autocomplete improvements */
:deep(.v-autocomplete .v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
}

:deep(.v-autocomplete .v-selection-control__wrapper) {
  margin-right: 8px;
}

/* Better spacing for selection display */
:deep(.v-autocomplete .v-field__selection) {
  max-width: 100%;
}

/* Menu improvements */
:deep(.v-menu .v-list) {
  padding: 8px 0;
}

:deep(.v-menu .v-list-item) {
  min-height: 56px;
}

/* Loading and empty states */
:deep(.v-autocomplete .v-progress-linear) {
  margin-top: 2px;
}
</style>
