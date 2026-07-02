<template>
  <v-dialog
    :model-value="show"
    max-width="500"
    @update:model-value="$emit('update:show', $event)"
  >
    <v-card class="rounded-lg">
      <v-card-title style="color: white" class="bg-primary rounded-top-lg">
        <v-icon color="white" class="mr-2"> mdi-account-plus </v-icon>
        {{ title || t('cooperators.invite.title') }}
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row class="ma-0">
          <v-text-field
            v-model="emailInput"
            :label="selectLabel || t('cooperators.invite.emailPlaceholder')"
            variant="outlined"
            density="comfortable"
            placeholder="Type an email address"
            prepend-inner-icon="mdi-email-outline"
            clearable
            @keydown.enter.prevent="addEmailToSelection"
          />
          <v-btn
            class="ml-2"
            icon
            variant="outlined"
            :disabled="!emailInput.trim()"
            @click="addEmailToSelection"
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-row>

        <div class="d-flex flex-wrap mt-1">
          <v-chip
            v-for="(coop, i) in selectedCoops"
            :key="i"
            closable
            class="mb-2 mr-2 email-chip"
            @click:close="removeSelectedCoop(i)"
          >
            {{ typeof coop == 'object' ? coop.email : coop }}
          </v-chip>
        </div>

        <v-select
          v-model="selectedRole"
          :items="roleOptions"
          :label="roleLabel || t('cooperators.invite.role')"
          variant="outlined"
          density="comfortable"
          class="mt-4"
        />

        <!-- Date/Time Selection (only for accessibility tests) -->
        <v-row v-if="showDateTimeSelection" class="mt-4">
          <v-col cols="6">
            <v-menu
              offset="26"
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
                  density="compact"
                  :label="t('cooperators.invite.date')"
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-date-picker
                v-model="date"
                :min="
                  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .substring(0, 10)
                "
                show-adjacent-months
                color="primary"
              />
            </v-menu>
          </v-col>
          <v-col cols="6">
            <v-menu
              :close-on-content-click="false"
              offset="40"
              transition="scale-transition"
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-model="hour"
                  prepend-inner-icon="mdi-clock-time-four-outline"
                  density="compact"
                  color="primary"
                  variant="outlined"
                  :label="t('cooperators.invite.time')"
                  readonly
                  v-bind="props"
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

        <v-textarea
          v-if="showInviteMessage"
          v-model="inviteMessage"
          color="primary"
          :label="messageLabel || t('cooperators.invite.message')"
          :placeholder="
            messagePlaceholder || t('cooperators.invite.messagePlaceholder')
          "
          variant="outlined"
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
          @click="onCancel"
        >
          {{ cancelText || t('cooperators.invite.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          class="rounded-lg"
          :disabled="selectedCoops.length === 0"
          @click="onSend"
        >
          {{ sendText || t('cooperators.invite.send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  useCooperatorUtils,
  getCooperatorInviteValidationError,
  normalizeCooperatorInviteEntry,
} from '@/shared/composables/useCooperatorUtils'
import { showError, showWarning } from '@/shared/utils/toast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  users: {
    type: Array,
    default: () => [],
  },
  existingCooperators: {
    type: Array,
    default: () => [],
  },
  currentUserEmail: {
    type: String,
    default: '',
  },
  studyOwnerEmail: {
    type: String,
    default: '',
  },
  showDateTimeSelection: {
    type: Boolean,
    default: false,
  },
  showInviteMessage: {
    type: Boolean,
    default: true,
  },
  // Text customization props
  title: String,
  selectLabel: String,
  noDataText: String,
  roleLabel: String,
  messageLabel: String,
  messagePlaceholder: String,
  cancelText: String,
  sendText: String,
})

const emit = defineEmits(['update:show', 'send-invitations'])

// Use composables
const { roleOptions } = useCooperatorUtils()

// Local state
const selectedCoops = ref([])
const selectedRole = ref(1)
const inviteMessage = ref('')
const emailInput = ref('')

// Date and time for scheduling (accessibility tests)
const date = ref(
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10),
)
const hour = ref(
  new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }),
)

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

// Methods
const removeSelectedCoop = (index) => {
  selectedCoops.value.splice(index, 1)
}

const isCoopAlreadySelected = (emailToCheck) => {
  return selectedCoops.value.find(
    (coop) => (typeof coop === 'object' ? coop.email : coop) === emailToCheck,
  )
}

const addEmailToSelection = () => {
  const rawValue = emailInput.value.trim()
  if (!rawValue) return

  const validationError = getCooperatorInviteValidationError({
    email: rawValue,
    currentUserEmail: props.currentUserEmail,
    studyOwnerEmail: props.studyOwnerEmail,
    existingCooperators: props.existingCooperators,
    t,
  })

  if (validationError) {
    showError(validationError)
    emailInput.value = ''
    return
  }

  if (isCoopAlreadySelected(rawValue)) {
    showWarning(t('cooperators.invite.alreadySelected', { email: rawValue }))
    emailInput.value = ''
    return
  }

  selectedCoops.value.push(
    normalizeCooperatorInviteEntry(rawValue, props.users),
  )
  emailInput.value = ''
}

const onCancel = () => {
  emit('update:show', false)
  resetForm()
}

const onSend = () => {
  const invitationData = {
    selectedCoops: selectedCoops.value,
    selectedRole: selectedRole.value,
    inviteMessage: inviteMessage.value,
  }

  if (props.showDateTimeSelection) {
    invitationData.date = date.value
    invitationData.hour = hour.value
  }

  emit('send-invitations', invitationData)
  resetForm()
}

const resetForm = () => {
  selectedCoops.value = []
  inviteMessage.value = ''
  selectedRole.value = 1
  emailInput.value = ''
}

// Watch for dialog visibility to reset form
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  },
)
</script>

<style scoped>
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

.email-chip {
  max-width: 100%;
}
</style>
