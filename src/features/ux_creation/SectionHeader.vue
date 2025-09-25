<template>
  <v-row class="mb">
    <v-col
      cols="12"
      class="text-center"
    >
      <h2 class="text-h4 font-weight-medium text-grey-darken-4 mb-0">
        {{ title }}
      </h2>
      <p class="text-h6 text-grey-darken-1">
        {{ subtitle }}
      </p>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
})
</script>