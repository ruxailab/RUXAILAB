<template>
  <ShowInfo :title="testTitle + ' - ' + preTestTitle">
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <div
          class="rich-text mb-6 pa-4"
          v-html="consentText"
        />
        <v-row justify="center">
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              :model-value="localFullName"
              label="Full Name"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Name is required']"
              @update:model-value="onFullNameInput"
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col
            cols="12"
            md="6"
          >
            <v-radio-group
              :model-value="localConsentCompleted"
              inline
              @update:model-value="onConsentInput"
            >
              <v-radio
                label="I accept the consent terms"
                :value="true"
                :disabled="!localFullName"
              />
              <v-radio
                label="I do not accept the consent terms"
                :value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          class="mt-4"
        >
          <v-col
            cols="12"
            md="6"
            class="text-center"
          >
            <v-btn
              color="primary"
              variant="flat"
              block
              :disabled="!localConsentCompleted || !localFullName"
              @click="$emit('continue')"
            >
              Continue
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import { ref, watch } from 'vue';
const props = defineProps({
    testTitle: String,
    preTestTitle: String,
    consentText: String,
    fullNameModel: String,
    consentCompletedModel: Boolean
});
const emit = defineEmits(['update:fullNameModel', 'update:consentCompletedModel', 'continue']);

const localFullName = ref(props.fullNameModel);
const localConsentCompleted = ref(props.consentCompletedModel);

watch(() => props.fullNameModel, val => { localFullName.value = val; });
watch(() => props.consentCompletedModel, val => { localConsentCompleted.value = val; });

function onFullNameInput(val) {
    localFullName.value = val;
    emit('update:fullNameModel', val);
}
function onConsentInput(val) {
    localConsentCompleted.value = val;
    emit('update:consentCompletedModel', val);
}
</script>
