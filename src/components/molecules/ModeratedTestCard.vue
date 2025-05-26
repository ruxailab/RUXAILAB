<template>
  <v-card class="d-flex align-center pa-2 my-2">
    <!-- Moderator -->
    <v-avatar
      size="48"
      color="#FEF4E5"
      class="text-orange"
    >
      <span class="text-h5">{{ moderator.name[0] }}</span>
    </v-avatar>
    <v-card-text class="ml-3">
      <div class="font-weight-bold">
        {{ moderator.name }}
      </div>
      <div class="text-caption text-grey">
        Moderator
      </div>
    </v-card-text>
    <v-spacer />

    <!-- Evaluator -->
    <v-avatar
      size="48"
      color="#FEF4E5"
      class="text-orange"
    >
      <span class="text-h5">{{ evaluator.name[0] }}</span>
    </v-avatar>
    <v-card-text class="ml-3">
      <div class="font-weight-bold">
        {{ evaluator.name }}
      </div>
      <div class="text-caption text-grey">
        Evaluator
      </div>
    </v-card-text>
  </v-card>
</template>
  
<script setup>
const props = defineProps({
  moderator: {
    type: Object,
    required: true,
  },
  evaluator: {
    type: Object,
    required: true,
  }
})
</script>
  
<style scoped>

</style>
