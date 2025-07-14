<template>
  <v-card class="test-info-card" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-information" class="me-2"></v-icon>
      Test Information
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text v-if="loading">
      <v-progress-linear indeterminate color="primary"></v-progress-linear>
    </v-card-text>

    <v-card-text v-else-if="test">
      <v-row>
        <v-col cols="12" md="6">
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-format-title" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Title</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">{{ test.title }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-text" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Description</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ test.description || 'No description provided' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-web" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Website URL</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                <a :href="test.websiteUrl" target="_blank" v-if="test.websiteUrl">
                  {{ test.websiteUrl }}
                </a>
                <span v-else>Not specified</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>


        <v-col cols="12" md="6">
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-account" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Created By</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ test.testAdmin?.email || 'Unknown' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Created At</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(test.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-update" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Last Updated</v-list-item-title>
              <v-list-item-subtitle class="text-body-1">
                {{ formatDate(test.updatedAt) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-shield-account" class="me-4"></v-icon>
              </template>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle class="d-flex align-center">
                <v-chip :color="getStatusColor(test.status)" size="small" class="text-capitalize">
                  {{ test.status }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <div class="d-flex justify-space-between align-center">
        <div class="text-caption text-grey">
          Test ID: {{ testId }}
        </div>
        <v-btn 
          v-if="showEditButton"
          color="primary" 
          variant="tonal"
          :to="{ name: 'EditAccessibilityTest', params: { testId: testId } }"
          prepend-icon="mdi-pencil">
          Edit Test
        </v-btn>
      </div>
    </v-card-text>

    <v-card-text v-else>
      <v-alert type="error" variant="tonal">
        Failed to load test information. Please try again.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  test: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  testId: {
    type: String,
    required: true
  },
  showEditButton: {
    type: Boolean,
    default: true
  }
});

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

// Get color based on status
const getStatusColor = (status) => {
  const statusColors = {
    draft: 'grey',
    active: 'success',
    completed: 'primary',
    archived: 'warning',
    deleted: 'error'
  };
  return statusColors[status?.toLowerCase()] || 'secondary';
};
</script>

<style scoped>
.test-info-card {
  margin-bottom: 20px;
}
</style>
