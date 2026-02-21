<template>
  <v-dialog
    :model-value="show"
    max-width="500"
    @update:model-value="$emit('update:show', $event)"
  >
    <v-card class="rounded-lg">
      <v-card-title style="color: white" class="bg-primary rounded-top-lg">
        <v-icon color="white" class="mr-2"> mdi-account-plus </v-icon>
        {{ title || t('inviteDialog.title') }}
      </v-card-title>
      <v-card-text class="pt-4">
        <!-- Invitation Type Toggle -->
        <div class="d-flex mb-4">
          <v-btn 
            :color="invitationType === 'existing' ? 'primary' : 'outlined'"
            variant="outlined"
            type="button"
            class="flex-grow-1"
            @click="invitationType = 'existing'"
          >
            <v-icon start>mdi-account</v-icon>
            {{ t('inviteDialog.existingUser') }}
          </v-btn>
          <v-btn 
            :color="invitationType === 'email' ? 'primary' : 'outlined'"
            variant="outlined"
            type="button"
            class="flex-grow-1 ml-2"
            @click="invitationType = 'email'"
          >
            <v-icon start>mdi-email</v-icon>
            {{ t('inviteDialog.emailInvite') }}
          </v-btn>
        </div>

        <!-- Existing User Selection -->
        <template v-if="invitationType === 'existing'">
          <v-combobox
            :key="comboboxKey"
            ref="combobox"
            v-model="comboboxModel"
            :items="users.filter((user) => user?.email != null)"
            item-title="email"
            :label="selectLabel || t('inviteDialog.selectCooperator')"
            multiple
            variant="outlined"
            density="comfortable"
            @update:model-value="validateEmail"
          >
            <template #no-data>
              {{
                noDataText ||
                t('inviteDialog.noDataText')
              }}
            </template>
          </v-combobox>
        </template>

        <!-- Email Invite for Non-Registered Users -->
        <template v-else>
          <v-text-field
            v-model="emailInput"
            :label="t('inviteDialog.emailAddresses')"
            variant="outlined"
            density="comfortable"
            :placeholder="t('inviteDialog.emailPlaceholder')"
            :hint="t('inviteDialog.emailHint')"
            persistent-hint
            @keyup.enter="handleEmailInput"
            @blur="handleEmailInput"
          />
          <v-alert type="info" variant="tonal" density="compact" class="mt-2">
            <small>{{ t('inviteDialog.emailInvitationMessage') }}</small>
          </v-alert>
        </template>

        <!-- Selected Cooperators Display -->
        <v-chip-group class="mt-4">
          <v-chip
            v-for="(coop, i) in selectedCoops"
            :key="i"
            closable
            class="ml-2 mt-2"
            :color="coop.isUnregistered ? 'orange' : 'primary'"
            variant="flat"
            :prepend-icon="coop.isUnregistered ? 'mdi-email' : 'mdi-account'"
            @click:close="removeSelectedCoop(i)"
          >
            {{ typeof coop === 'object' ? coop.email : coop }}
            <v-tooltip v-if="coop.isUnregistered" activator="parent" location="top">
              {{ t('inviteDialog.unregisteredUserMessage') }}
            </v-tooltip>
          </v-chip>
        </v-chip-group>

        <v-select
          v-model="selectedRole"
          :items="roleOptions"
          :label="roleLabel || t('inviteDialog.role')"
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
                  :label="t('inviteDialog.date')"
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
                  :label="t('inviteDialog.time')"
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
          :label="messageLabel || t('inviteDialog.invitationMessage')"
          :placeholder="messagePlaceholder || t('inviteDialog.messagePlaceholder')"
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
          {{ cancelText || t('inviteDialog.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          class="rounded-lg"
          :disabled="selectedCoops.length === 0"
          @click="onSend"
        >
          {{ sendText || t('inviteDialog.send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
import { showError, showWarning } from '@/shared/utils/toast'
import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator()
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
const { roleOptions, validateEmail: isValidEmail } = useCooperatorUtils()

// Local state
const invitationType = ref('existing')
const emailInput = ref('')
const selectedCoops = ref([])
const comboboxModel = ref([])
const comboboxKey = ref(0)
const selectedRole = ref(1)
const inviteMessage = ref('')
const combobox = ref(null)

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

// handle email input for non registered users
const handleEmailInput = () => {
  if (!emailInput.value.trim()) return

  const emails = emailInput.value
    .split(',')
    .map(email => email.trim())
    .filter(email => email && isValidEmail(email))
  
  emails.forEach(email => {
    if (isCoopAlreadySelected(email)) return
    
    const existingUser = props.users.find(user => user.email === email)
    
    if (existingUser) {
      // Registered user
      selectedCoops.value.push(existingUser)
    } else {
      // Non-registered user
      selectedCoops.value.push({
        email: email,
        isUnregistered: true,
        invitationToken: uidgen.generateSync()
      })
    }
  })
  
  emailInput.value = ''
}

// Methods
const removeSelectedCoop = (index) => {
  selectedCoops.value.splice(index, 1)
}

const isStringEmail = (email) => {
  return typeof email !== 'object' && email !== undefined && email.length > 0
}

const isUserEmailValid = (email) => {
  return props.users.find((user) => user.email === email)
}

const isCoopAlreadySelected = (emailToCheck) => {
  return selectedCoops.value.find(
    (coop) => (typeof coop === 'object' ? coop.email : coop) === emailToCheck,
  )
}

const validateEmail = () => {
  const email = comboboxModel.value.pop()
  comboboxKey.value++

  if (!email) return

  // Handle string email input
  if (isStringEmail(email)) {
    if (!isValidEmail(email)) {
      showError(t('inviteDialog.errors.invalidEmailFormat'))
      return
    }

    if (!isUserEmailValid(email)) {
      showError(t('inviteDialog.errors.emailNotExist', { email }))
      return
    }

    if (!selectedCoops.value.includes(email)) {
      selectedCoops.value.push(email)
    }
    return
  }

  // Handle object email input
  if (selectedCoops.value.includes(email)) return

  if (isCoopAlreadySelected(email.email)) {
    showWarning(t('inviteDialog.errors.emailAlreadySelected', { email: email.email }))
    return
  }

  selectedCoops.value.push(email)
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
    invitationType: invitationType.value
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
  comboboxModel.value = []
  emailInput.value = ''
  invitationType.value = 'existing'
  inviteMessage.value = ''
  selectedRole.value = 1
  combobox.value?.blur()
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
</style>
