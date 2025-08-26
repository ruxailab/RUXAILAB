<template>
  <v-row :justify="adjust">
    <v-col cols="auto">
      <v-btn
        variant="outlined"
        :prepend-icon="icon"
        @click="onBack"
      >
        {{ label }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>

defineProps({
  label: String,
  icon: {
    type: String,
    default: 'mdi-arrow-left'
  },
  adjust: {
    type: String,
    default: "center"
  }
})

const emit = defineEmits(['back'])

const onBack = () => emit('back')
</script>
