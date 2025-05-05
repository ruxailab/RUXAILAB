<template>
  <v-dialog v-model="internalDialog" width="500">
    <template v-slot:activator="{ on }">
      <v-btn
        color="green"
        class="ml-4 my-2 mr-auto white--text"
        variant="tonal"
        depressed
        icon
        v-on="on"
      >
        <v-icon>mdi-chat-question</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline orange lighten-1 text-center"
        style="color: white;"
        primary-title
      >
        {{ task.taskName }} - TIP
      </v-card-title>

      <v-card-text class="pa-3" style="text-align: center; color: black;">
        {{ task.taskTip }}
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="orange" text @click="closeDialog">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'TipButton',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object,
      default: () => ({
        taskName: 'Task',
        taskTip: 'No tip available',
      }),
      validator: (task) => {
        return typeof task.taskName === 'string' && 
               typeof task.taskTip === 'string'
      }
    },
  },

  data() {
    return {
      internalDialog: this.value,
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.internalDialog = val
      }
    },
    internalDialog(val) {
      this.$emit('input', val)
    }
  },

  methods: {
    closeDialog() {
      this.internalDialog = false
    }
  }
}
</script>
