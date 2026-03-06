<template>
  <v-card class="pa-5" elevation="2">
    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-sheet class="pa-4 rounded-lg metric-card" color="primary" dark>
          <div class="text-caption">Template ID</div>
          <div class="text-body-2 mt-1 text-truncate">{{ template?.id }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-sheet class="pa-4 rounded-lg metric-card" color="info" dark>
          <div class="text-caption">Type</div>
          <div class="text-h6 mt-1">{{ templateType }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-sheet class="pa-4 rounded-lg metric-card" color="secondary" dark>
          <div class="text-caption">Study Type</div>
          <div class="text-h6 mt-1">{{ studyType }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <v-sheet
          class="pa-4 rounded-lg metric-card"
          :color="isPublic ? 'success' : 'warning'"
          dark
        >
          <div class="text-caption">Visibility</div>
          <div class="text-h6 mt-1">{{ isPublic ? 'Public' : 'Private' }}</div>
        </v-sheet>
      </v-col>
    </v-row>

    <v-divider class="my-5" />

    <v-row>
      <v-col cols="12" md="8">
        <h3 class="text-h6 mb-2">{{ template?.header?.templateTitle }}</h3>
        <p class="text-body-2 text-medium-emphasis">
          {{ template?.header?.templateDescription || 'No description' }}
        </p>
      </v-col>
      <v-col cols="12" md="4">
        <v-list density="compact" class="bg-transparent">
          <v-list-item>
            <v-list-item-title class="text-body-2">
              Created: {{ formatDate(template?.header?.creationDate) }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-2">
              Updated: {{ formatDate(template?.header?.updateDate) }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-2">
              Author:
              {{ template?.header?.templateAuthor?.userEmail || 'Unknown' }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
})

const templateType = computed(
  () =>
    props.template?.header?.templateType ||
    props.template?.body?.testType ||
    'UNKNOWN',
)
const studyType = computed(
  () =>
    props.template?.header?.templateSubType ||
    props.template?.body?.subType ||
    templateType.value,
)
const isPublic = computed(() =>
  Boolean(props.template?.header?.isTemplatePublic),
)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}
</script>

<style scoped>
.metric-card {
  min-height: 90px;
}
</style>
