<template>
  <v-container>
    <v-row justify="center">
      <v-text-field
        v-if="type === 'textField'"
        v-model="internalValue"
        outlined
        color="orange"
        class="mx-3"
        :label="label"
        @change="$emit('change', internalValue)"
      />

      <v-textarea
        v-else
