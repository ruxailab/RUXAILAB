<template>
  <v-dialog v-model="dialog" width="600" persistent>
    <v-card>
      <slot name="title" />

      <v-card-text>{{ text }}</v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["text", "dialog"],
};
</script>