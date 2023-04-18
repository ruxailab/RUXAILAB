<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on }">
      <v-btn color="purple" v-on="on">
        <v-icon left>
          mdi-eye
        </v-icon>Eye Record
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="headline grey lighten-2 text-center" primary-title>
        Eye Record
      </v-card-title>

      <v-card-text class="pa-3" style="text-align: center">
        <v-col>
          <v-btn v-if="!isRunningEye" color="green" @click="start">
            <v-icon>  mdi-eye </v-icon>
          </v-btn>
          <v-btn v-if="isRunningEye" color="blue" @click="stop">
            <v-icon> mdi-eye-off </v-icon>
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
    isRunningEye: false,
  }),
  methods: {
    async start() {
      this.isRunningEye=true
    },
    stop() {
      this.isRunningEye=false

    },

    }
}
</script>
