<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-textarea
          v-model="consent"
          rows="3"
          variant="outlined"
          color="orange"
          class="mx-6 mt-3"
          placeholder="Consent Form..."
          @change="saveState"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const consent = ref('');

const consentStore = computed(() => store.getters.consent);
const test = computed(() => store.getters.test);

const saveState = () => {
  store.dispatch('setConsent', consent.value);
  test.value.testStructure.consent = consent.value;
};

const getConsent = () => {
  if (test.value.testStructure.consent) {
    consent.value = test.value.testStructure.consent;
  }
};

onMounted(() => {
  getConsent();
});
</script>

<style scoped>
.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>