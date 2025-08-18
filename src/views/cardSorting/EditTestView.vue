<template>
  <PageWrapper title="Edit Test" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Customize the settings and preferences of your test
      </p>
    </template>

    <v-container>
      <Snackbar />
      <ButtonSave :visible="change" @click="save" />

      <div>
        <VTabs bg-color="transparent" color="#FCA326" class="pb-0 mb-0">
          <VTab @click="index = 0">{{ $t('ModeratedTest.consentForm')}}</VTab>
          <VTab @click="index = 1">{{ $t('ModeratedTest.preTest')}}</VTab>
          <VTab @click="index = 2">{{ $t('ModeratedTest.tasks')}}</VTab>
          <VTab @click="index = 3">{{ $t('ModeratedTest.postTest')}}</VTab>
        </VTabs>

        <VCol cols="12">
          <!-- CONSENT FORM -->
          <v-card v-if="index === 0" rounded="xxl">
            <TextareaForm :title="$t('ModeratedTest.consentForm')"
              subtitle="Edit the consent text for the test. Changes are saved when you click the Save button."
              @update:value="saveState('consent', $event)" />
          </v-card>

          <!-- PRE-TEST -->
          <v-card v-if="index === 1" rounded="xxl">
            <UserVariables />
          </v-card>

          <!-- TASKS -->
          <!-- <v-card v-if="index === 2" rounded="xxl">
            <ModeratedTask />
          </v-card> -->

          <!-- POS-TEST -->
          <v-card v-if="index === 3" rounded="xxl">
            <FormPostTest />
          </v-card>
        </VCol>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/components/atoms/ButtonSave.vue';
import FormPostTest from '@/components/atoms/FormPostTest.vue';
import Snackbar from '@/components/atoms/Snackbar.vue';
import TextareaForm from '@/components/atoms/TextareaForm.vue';
import UserVariables from '@/components/atoms/UserVariables.vue';
import PageWrapper from '@/components/template/PageWrapper.vue';
import { ref } from 'vue';
import { useStore } from 'vuex';

// Variables
const index = ref(0);
const change = ref(false);

// Stores
const store = useStore();

// Methods
const save = () => {
  change.value = false;
};

const saveState = async (type, value) => {
  const states = {
    'consent': 'setConsent',
    'finalMessage': 'setFinalMessage',
    'participantCamera': 'setParticipantCamera',
    'welcome': 'setWelcomeMessage',
  }

  if (states[type]) {
    store.dispatch(states[type], value)
    change.value = true;a
  }
}
</script>
