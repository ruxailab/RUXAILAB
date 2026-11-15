<template>
  <ShowInfo :title="testTitle + ' - ' + $t('UserTestView.stepper.consent')">
    <template #content>
      <div class="test-content pa-md-4 rounded-xl">
        <div v-safe-html="consentText" class="rich-text mb-6 pa-md-4" />
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-text-field
:model-value="localFullName" :label="$t('UserTestView.ConsentStep.fullName')" variant="outlined" density="comfortable"
              :rules="[v => !!v || $t('UserTestView.ConsentStep.nameRequired')]" @update:model-value="onFullNameInput" />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-radio-group :model-value="localConsentCompleted" inline @update:model-value="onConsentInput">
              <v-radio :label="$t('UserTestView.ConsentStep.acceptTerms')" :value="true" :disabled="!localFullName" />
              <v-radio :label="$t('UserTestView.ConsentStep.declineTerms')" :value="false" :disabled="!localFullName" />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row justify="center" class="mt-4">
          <v-col cols="12" md="6" class="text-center">
            <v-btn
color="primary" variant="flat" block :disabled="localConsentCompleted === null || !localFullName"
              @click="handleContinue">
              {{ $t('UserTestView.ConsentStep.continue') }}
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
        {{ $t('UserTestView.ConsentStep.declinedTitle') }}
      </v-card-title>
      <v-card-text class="pt-4">
        <p class="text-body-1 mb-3">
          {{ $t('UserTestView.ConsentStep.declinedMessage1') }}
        </p>
        <p class="text-body-2 text-grey-darken-1 mb-3">
          {{ $t('UserTestView.ConsentStep.declinedMessage2') }}
        </p>
        <p class="text-body-2 font-weight-medium">
          {{ $t('UserTestView.ConsentStep.declinedConfirm') }}
        </p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn variant="outlined" @click="showDeclineModal = false">
          {{ $t('UserTestView.ConsentStep.goBack') }}
        </v-btn>
        <v-spacer />
        <v-btn color="error" variant="flat" @click="confirmDecline">
          {{ $t('UserTestView.ConsentStep.endTest') }}
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
