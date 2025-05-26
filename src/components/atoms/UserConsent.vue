<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <quill-editor 
          v-model:value="consent"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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

watch( consent, () => saveState())

onMounted(() => {
  getConsent();
});
</script>

<style scoped>
.ql-container {
  height: 150px;
  padding: 10px;
}
</style>