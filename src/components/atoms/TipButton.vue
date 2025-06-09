<template>
  <v-dialog
    v-model="dialog"
    width="500"
  >
    <template #activator="{ props }">
      <v-btn
        color="white"
        class="bg-green ml-4 my-2 mr-auto"
        variant="tonal"
        v-bind="props"
      >
        <v-icon>mdi-chat-question</v-icon>
        Tip
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="text-h5 bg-orange-lighten-1 text-center"
        style="color: white;"
        primary-title
      >
        {{ task.taskName }} - TIP
      </v-card-title>

      <v-card-text
        class="pa-3"
        style="text-align: center; color: black;"
      >
        {{ task.taskTip }}
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="orange"
          variant="text"
          @click="dialog = false"
        >
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    default: () => ({
      taskName: '',
      taskTip: '',
    }),
  },
})

const dialog = ref(false)
</script>
