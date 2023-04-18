<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on }">
      <v-btn color="blue" v-on="on">
        <v-icon left>
          mdi-camera
        </v-icon>Camera Record
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="headline grey lighten-2 text-center" primary-title>
        Camera Record
      </v-card-title>

      <v-card-text class="pa-3" style="text-align: center">
        <v-col>
          <v-btn v-if="!isRunningCamera" color="green" @click="start">
            <v-icon> mdi-camera </v-icon>
          </v-btn>
          <v-btn v-if="isRunningCamera" color="blue" @click="stop">
            <v-icon> mdi-camera-off </v-icon>
          </v-btn>
          <!-- <v-btn color="red" @click="reset">
            Reset
          </v-btn> -->
        </v-col>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="dialog = false">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
      default: function() {
        return {
          taskName: "",
          taskTip: ""
        }
      }
    }
  },
  data: () => ({
    dialog: false,
    isRunningCamera: false,
  }),
  methods: {
    async start() {
      this.isRunningCamera=true
    },
    stop() {
      this.isRunningCamera=false

    },

    }
}
</script>
