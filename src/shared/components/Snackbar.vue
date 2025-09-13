<template>
  <v-snackbar
    v-model="snackbar"
    :color="snackColor"
    :timeout="5000"
    location="top"
    @update:model-value="onClose"
  >
    <div>{{ snackMessage }}</div>
    <template #actions="{ attrs }">
      <v-btn
        v-bind="attrs"
        variant="text"
        @click="onClose(false)"
      >
        {{ $t('buttons.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const snackbar = ref(false)

const snackMessage = computed(() => store.getters.getToastMessage)
const snackColor = computed(() => store.getters.getToastType)

const onClose = (value) => {
  if (!value) {
    snackbar.value = false
    store.commit('RESET_TOAST')
  }
}

watch(snackMessage, (newVal) => {
  if (newVal) snackbar.value = true
})
</script>
