<template>
  <div>
    <v-btn
      icon
      dark
      fab
      color="red"
      fixed
      right
      class="mt-6 mr-2"
      @click="$emit('click')"
    >
      <v-icon x-large>
        mdi-arrow-u-left-bottom
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
</script>