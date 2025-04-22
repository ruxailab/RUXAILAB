<template>
  <div>
    <v-btn
      v-if="!isHelp"
      size="small"
      icon
      class="mr-1"
      @click="$router.push('/help')"
    >
      <v-icon size="20">
        mdi-help-circle-outline
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  computed: {
    isHelp() {
      return this.$route.name === 'Help'; // Use strict equality
    },
  },
}
</script>

<style></style>
