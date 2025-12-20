<template>
  <v-dialog
    :model-value="dialog"
    class="rounded-lg"
    max-width="950"
    @click:outside="$emit('update:dialog', false)"
  @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="rounded-xxl elevation-8">
      <v-card-title class="bg-gradient-primary text-white pa-6 rounded-top-lg d-flex align-center">
        <v-icon class="mr-3" size="28">mdi-account-plus-outline</v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">{{ $t('UsabilityCooperators.inviteEvaluator') }}</h2>
          <p class="text-body-2 mb-0 opacity-90">Send evaluation invitations to participants</p>
        </div>
      </v-card-title>

      <v-card-text class="pa-8">
        <v-form
          ref="inviteForm"
          v-model="valid"
          validate-on="input"
        >
          <v-row>
            <v-col cols="12" md="6" class="pr-md-8">
              <div class="form-section">
                <!-- Participant Selection -->
                <div class="field-group mb-6">
                  <label class="field-label">
                    <v-icon class="mr-2" size="20">mdi-account-outline</v-icon>
                    {{ $t('UsabilityCooperators.email') }}
                  </label>
                  <p class="field-description mb-3">Select the participant you want to invite to this evaluation session.</p>
                  <v-autocomplete
                    v-model="comboboxModel.userId"
                    :items="filteredUsers"
                    item-title="displayText"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Type to search participants..."
                    prepend-inner-icon="mdi-account-search"
                    color="primary"
                    :rules="[(v) => !!v || 'Please select a participant']"
                    required
                    clearable
                    :no-data-text="'No participants found'"
                    :menu-props="{ maxHeight: 300 }"
                  >
                    <template #selection="{ item }">
                      <div class="d-flex align-center">
                        <v-avatar size="24" color="primary" class="mr-2">
                          <span class="text-white text-caption">{{ item.raw.email.charAt(0).toUpperCase() }}</span>
                        </v-avatar>
                        <div class="text-truncate">
                          <span class="text-body-2 font-weight-medium">{{ item.raw.email }}</span>
                          <span v-if="item.raw.name" class="text-caption text-grey-darken-1 ml-1">({{ item.raw.name }})</span>
                        </div>
                      </div>
                    </template>
                    
                    <template #item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :title="item.raw.email"
                        :subtitle="item.raw.name || 'No name provided'"
                        class="participant-item"
                      >
                        <template #prepend>
                          <v-avatar size="40" color="primary" class="mr-3">
                            <span class="text-white font-weight-bold">{{ item.raw.email.charAt(0).toUpperCase() }}</span>
                          </v-avatar>
                        </template>
                        
                        <template #append>
                          <v-chip
                            v-if="isParticipantAlreadyInvited(item.raw.id)"
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
                        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-search</v-icon>
                        <p class="text-body-2 text-grey-darken-1">No participants found</p>
                        <p class="text-caption text-grey-darken-2">Try adjusting your search terms</p>
                      </div>
                    </template>
                  </v-autocomplete>
                </div>

                <!-- Schedule Section -->
                <div class="field-group mb-6">
                  <div class="field-label">
                    <v-icon class="mr-2" size="20">mdi-calendar-clock</v-icon>
                    {{ $t('UsabilityCooperators.scheduledAt') }}
                  </div>
                  <p class="field-description mb-3">Choose the date and time for the evaluation session.</p>
                  
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
                          :min="new Date(
                            Date.now() - new Date().getTimezoneOffset() * 60000,
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
                    <v-icon class="mr-2" size="20">mdi-message-text-outline</v-icon>
                    {{ $t('UsabilityCooperators.inviteMessage') }}
                  </div>
                  <p class="field-description mb-3">Write a personalized message to include with the invitation.</p>
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
                      (v) => (v && v.length <= 500) || 'Message must be less than 500 characters'
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
                  <v-icon class="mr-2" size="24" color="primary">mdi-eye-outline</v-icon>
                  <h3 class="text-h6 font-weight-bold">Invitation Preview</h3>
                </div>
                
                <v-card class="invitation-preview elevation-2" outlined>
                  <v-card-title class="bg-grey-lighten-4 py-3">
                    <v-icon class="mr-2" color="primary">mdi-email-outline</v-icon>
                    <span class="text-subtitle-1">Evaluation Invitation</span>
                  </v-card-title>
                  
                  <v-card-text class="pa-4">
                    <div class="preview-content">
                      <p class="text-body-2 mb-3">
                        <strong>To:</strong> {{ selectedUserEmail || 'No participant selected' }}
                      </p>
                      <p class="text-body-2 mb-3">
                        <strong>Scheduled:</strong> {{ formattedDateTime || 'No date/time selected' }}
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
                    <v-alert-title>{{ $t('UsabilityCooperators.inviteInfo') }}</v-alert-title>
                    <div class="text-body-2 mt-2">
                      The participant will receive an email notification and can accept or decline the invitation.
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
import Cooperators from '@/shared/models/Cooperators';
import Notification from '@/shared/models/Notification';
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

// Helper functions
const getDefaultTime = () => {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getDefaultDate = () => {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10);
};

// Variables
const date = ref(getDefaultDate());
const hour = ref(getDefaultTime());

const inviteForm = ref(null);
const valid = ref(false);
const comboboxModel = ref({});
const inviteMessage = ref('');
const loading = ref(false);

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
  test.value?.cooperators ? [...test.value.cooperators] : []
);

const test = computed(() => store.getters.test);
const users = computed(() => store.state.Users?.users || []);

const filteredUsers = computed(() => {
  if (!users.value || users.value.length === 0) return [];
  
  return users.value
    .filter(user => user && user.email) // Filter out invalid users
    .map(user => ({
      ...user,
      displayText: user.name ? `${user.email} (${user.name})` : user.email
    }))
    .sort((a, b) => {
      // Sort by email alphabetically with null checks
      const emailA = a.email || '';
      const emailB = b.email || '';
      return emailA.localeCompare(emailB);
    });
});

const selectedUserEmail = computed(() => {
  if (!comboboxModel.value?.userId || !users.value) return '';
  const user = users.value.find(u => u && u.id === comboboxModel.value.userId);
  return user?.email || '';
});

const formattedDateTime = computed(() => {
  if (!date.value || !hour.value) return '';
  
  // Handle date conversion properly
  let dateValue = date.value;
  if (dateValue instanceof Date) {
    dateValue = dateValue.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  }
  
  const dateTime = new Date(`${dateValue}T${hour.value}`);
  
  // Check if the date is valid before formatting
  if (isNaN(dateTime.getTime())) return 'Invalid date/time';
  
  return dateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Methods
const isParticipantAlreadyInvited = (userId) => {
  if (!userId || !cooperatorsEdit.value) return false;
  return cooperatorsEdit.value.some(cooperator => cooperator && cooperator.userDocId === userId);
};

const saveInvitation = async () => {
  try {
    loading.value = true;
    const isValid = await inviteForm.value.validate();
    if (!isValid) return;

    const cooperator = users.value.find(user => user.id === comboboxModel.value.userId);
    if (!cooperator) {
      throw new Error('Selected user not found');
    }

    // Validate date and time values
    if (!date.value || !hour.value) {
      throw new Error('Date and time are required');
    }

    // Ensure proper time format (HH:MM)
    let timeValue = hour.value;
    if (timeValue && !timeValue.includes(':')) {
      // If time doesn't include colon, it might be in wrong format
      throw new Error('Invalid time format');
    }

    // Convert date to proper string format if it's a Date object
    let dateValue = date.value;
    if (dateValue instanceof Date) {
      dateValue = dateValue.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    }

    // Construct datetime string with proper validation
    const dateTimeString = `${dateValue}T${timeValue}:00`;
    console.log('Constructing datetime from:', { 
      originalDate: date.value, 
      formattedDate: dateValue, 
      hour: hour.value, 
      dateTimeString 
    });
    
    const dateTime = new Date(dateTimeString);
    
    // Check if the constructed date is valid
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date/time combination: ${dateTimeString}`);
    }
    
    const timestamp = dateTime.toISOString();

    cooperatorsEdit.value.push(new Cooperators({
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
  } catch (error) {
    console.error('Error saving invitation:', error);
    // You might want to show a toast notification here
  } finally {
    loading.value = false;
  }
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
  
  // Reset to default values instead of null
  hour.value = getDefaultTime();
  date.value = getDefaultDate();
  
  inviteMessage.value = '';
  comboboxModel.value = {};

  emit('update:dialog', false);
};

const notifyCooperator = (guest) => {
  console.log('Notifying cooperator', guest);
  if (guest.userDocId) {
    const path = 'testview';
    store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        accessLevel: 2,
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
