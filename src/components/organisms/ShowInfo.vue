<template>
  <v-container>
    <v-row class="ma-0">
      <v-col cols="12" :hidden="hideCol">
        <!-- <h1>{{ $t('titles.drawer.' + title) }}</h1> -->
        <h1>{{ title }}</h1>
        <v-divider v-if="title" />
      </v-col>
      <slot name="top" />
    </v-row>
    <slot name="warning" />
    <v-row>
      <v-col>
        <slot name="content" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  hideCol: {
    type: Boolean,
    default: false
  }
})
</script>