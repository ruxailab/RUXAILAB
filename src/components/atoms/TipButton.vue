<template>
  <v-dialog :value="value" @input="$emit('input', $event)" width="500">
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
        <v-btn color="orange" text @click="$emit('input', false)">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'TipDialog',

  props: {
    task: {
      type: Object,
      default: () => ({
        taskName: '',
        taskTip: '',
      }),
    },
    value: {  // this replaces internal `dialog`
      type: Boolean,
      default: false,
    },
  },
}
</script>
