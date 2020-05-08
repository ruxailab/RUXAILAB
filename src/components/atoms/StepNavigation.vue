<template>
  <v-row>
    <v-btn large fab fixed bottom left elevation="24" outlined @click="$emit('backStep')">
      <v-icon>mdi-arrow-left-drop-circle</v-icon>
    </v-btn>
    <v-btn large dark fab fixed bottom right elevation="24" color="success" @click="$emit('nextStep')">
      <v-icon>mdi-arrow-right-drop-circle</v-icon>
    </v-btn>
    <v-btn
      v-if="step === size"
      large
      dark
      fab
      fixed
      bottom
      right
      elevation="24"
      color="success"
      @click="$emit('submit'),$router.push('/')"
    >
      <v-icon>mdi-content-save-outline</v-icon>
    </v-btn>
  </v-row>
</template>

<script>
export default {
  props: ['step','size'],
};
</script>

<style>
</style>