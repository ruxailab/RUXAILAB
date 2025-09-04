<template>
  <v-snackbar
    v-model="snackbar"
    :color="snackColor"
    :timeout="5000"
    location="top"
  >
    <div>{{ snackMessage }}</div>
    <template #actions="{ attrs }">
      <v-btn
        v-bind="attrs"
        variant="text"
        @click="snackbar = false"
      >
        {{ $t('buttons.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();

const snackbar = ref(false);

const snackMessage = computed(() => store.getters.getToastMessage);
const snackColor = computed(() => store.getters.getToastType);

watch(snackMessage, (newVal) => {
  if (newVal) {
    snackbar.value = true;
  }
});

watch(snackbar, (newVal) => {
  if (!newVal) {
    store.commit('resetSnack');
  }
});
</script>