<template>
  <v-dialog
    v-model="dialogUser"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card color="#f9f5f0">
      <v-btn
        icon
        dark
        fab
        color="red"
        fixed
        right
        class="mt-6 mr-2"
        @click="handleClose"
      >
        <v-icon x-large>mdi-arrow-u-left-bottom</v-icon>
      </v-btn>
      <v-col cols="12">
        <v-row justify="center">
          <span class="Titles mt-16 mb-8"
            >What kind of test are you looking to start?</span
          >
        </v-row>
      </v-col>
      <v-col cols="12" class="mt-6">
        <v-row justify="center">
          <v-col cols="1"></v-col>
          <v-col cols="4">
            <!-- User test options -->
          </v-col>
          <v-col cols="1"></v-col>
          <v-col class="" cols="4">
            <!-- User test options -->
          </v-col>
          <v-col cols="1"></v-col>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialogUser: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
  },
}
</script>
