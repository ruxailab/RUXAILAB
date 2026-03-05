<template>
  <v-row :justify="adjust">
    <v-col cols="12" sm="auto">
      <v-btn
        variant="outlined"
        :prepend-icon="icon"
        class="w-100 w-sm-auto"
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
