<template>
  <v-dialog v-model="isVisible" max-width="500" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-start ga-4 pa-6 pb-0">
        <div class="dialog-icon bg-red-lighten-5 rounded-lg d-flex align-center justify-center">
          <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
        </div>
        <div>
          <h3 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">Confirm Deletion</h3>
          <p class="text-subtitle-2 text-grey-darken-1">This action cannot be undone</p>
        </div>
      </v-card-title>
      <v-card-text class="py-4 px-6">
        <p class="text-body-2 text-grey-darken-1">
          {{ dialogText }} All associated data, results, and configurations will be lost forever.
        </p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-end ga-3">
        <v-btn variant="outlined" color="grey-darken-2" @click="cancel" :disabled="loading"
          class="text-none rounded-lg px-6" height="44">
          Cancel
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirm" :loading="loading"
          class="text-none rounded-lg px-6" height="44">
          <v-icon start size="16">mdi-delete</v-icon>
          Delete Forever
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    default: 'test'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogText = computed(() => {
  return `Are you sure you want to delete the ${props.itemType} "${props.itemName}"?`
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
  isVisible.value = false
}
</script>

<style scoped>
.dialog-icon {
  width: 48px;
  height: 48px;
}
</style>
