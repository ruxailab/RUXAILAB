<template>
  <div>
    <v-btn
      icon
      color="red"
      fixed
      location="right"
      class="mt-6 mr-2"
      @click="$emit('click')"
    >
      <v-icon size="x-large">
        mdi-arrow-u-left-bottom
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
</script>