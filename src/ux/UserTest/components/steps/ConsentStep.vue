<template>
  <ShowInfo :title="testTitle + ' - ' + 'Consent'">
    <template #content>
      <div class="test-content pa-md-4 rounded-xl">
        <div class="rich-text mb-6 pa-md-4" v-html="consentText" />
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-text-field
:model-value="localFullName" label="Full Name" variant="outlined" density="comfortable"
              :rules="[v => !!v || 'Name is required']" @update:model-value="onFullNameInput" />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-radio-group :model-value="localConsentCompleted" inline @update:model-value="onConsentInput">
              <v-radio label="I accept the consent terms" :value="true" :disabled="!localFullName" />
              <v-radio label="I do not accept the consent terms" :value="false" :disabled="!localFullName" />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row justify="center" class="mt-4">
          <v-col cols="12" md="6" class="text-center">
            <v-btn
color="primary" variant="flat" block :disabled="localConsentCompleted === null || !localFullName"
              @click="handleContinue">
              Continue
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </template>
  </ShowInfo>

  <!-- Confirmation Modal for declining consent -->
  <v-dialog v-model="showDeclineModal" max-width="500" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="text-h6 font-weight-bold text-error d-flex align-center">
        <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
        Consent Declined
      </v-card-title>
      <v-card-text class="pt-4">
        <p class="text-body-1 mb-3">
          You have chosen not to accept the consent terms for this study.
        </p>
        <p class="text-body-2 text-grey-darken-1 mb-3">
          If you confirm this action, the test will be terminated immediately as your participation
          requires explicit consent to proceed. Your data will not be collected or stored.
        </p>
        <p class="text-body-2 font-weight-medium">
          Are you sure you want to end the test without participating?
        </p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn variant="outlined" @click="showDeclineModal = false">
          Go Back
        </v-btn>
        <v-spacer />
        <v-btn color="error" variant="flat" @click="confirmDecline">
          Yes, End Test
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
import { ref, watch } from 'vue';
const props = defineProps({
  testTitle: String,
  consentText: String,
  fullNameModel: String,
  consentCompletedModel: Boolean
});
const emit = defineEmits(['update:fullNameModel', 'update:consentCompletedModel', 'continue', 'declineConsent']);

const localFullName = ref(props.fullNameModel);
const localConsentCompleted = ref(null); // Always start with no selection
const showDeclineModal = ref(false);

watch(() => props.fullNameModel, val => { localFullName.value = val; });
// Removed watcher for consentCompletedModel to prevent pre-selection

function onFullNameInput(val) {
  localFullName.value = val;
  emit('update:fullNameModel', val);
}

function onConsentInput(val) {
  localConsentCompleted.value = val;
  emit('update:consentCompletedModel', val);
}

function handleContinue() {
  if (localConsentCompleted.value === false) {
    // User declined consent, show confirmation modal
    showDeclineModal.value = true;
  } else {
    // User accepted consent, proceed normally
    emit('continue');
  }
}

function confirmDecline() {
  showDeclineModal.value = false;
  emit('declineConsent');
}
</script>
