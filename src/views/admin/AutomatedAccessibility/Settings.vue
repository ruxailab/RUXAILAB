<template>
  <v-container>
    <!-- Loading state -->
    <v-card v-if="!test" class="mx-auto" max-width="600" elevation="4">
      <v-card-text class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <div class="mt-4">Loading test details...</div>
      </v-card-text>
    </v-card>

    <!-- Test details -->
    <v-card v-else class="mx-auto" max-width="600" elevation="4">
      <!-- Header with status chip -->
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="primary">
            mdi-test-tube
          </v-icon>
          <span class="text-h5">{{ test.title }}</span>
        </div>
        <v-chip :color="getStatusColor(test.status)" variant="flat" size="small">
          <v-icon start>{{ getStatusIcon(test.status) }}</v-icon>
          {{ test.status.toUpperCase() }}
        </v-chip>
      </v-card-title>

      <!-- Description -->
      <v-card-subtitle class="pb-2">
        <v-icon class="mr-1" size="small">mdi-text</v-icon>
        {{ test.description }}
      </v-card-subtitle>

      <v-divider></v-divider>

      <!-- Main content -->
      <v-card-text>
        <v-row>
          <!-- Test Details Column -->
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="blue">mdi-identifier</v-icon>
                </template>
                <v-list-item-title>Test ID</v-list-item-title>
                <v-list-item-subtitle class="text-wrap">{{ test.id }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="green">mdi-web</v-icon>
                </template>
                <v-list-item-title>Website URL</v-list-item-title>
                <v-list-item-subtitle>
                  {{ test.websiteUrl || 'Not specified' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="purple">mdi-tag</v-icon>
                </template>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>{{ test.version }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="orange">mdi-cog</v-icon>
                </template>
                <v-list-item-title>Test Type</v-list-item-title>
                <v-list-item-subtitle>{{ test.testType }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- Admin & Settings Column -->
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="red">mdi-account-circle</v-icon>
                </template>
                <v-list-item-title>Test Admin</v-list-item-title>
                <v-list-item-subtitle>{{ test.testAdmin?.email || 'Unknown' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="test.isPublic ? 'green' : 'orange'">
                    {{ test.isPublic ? 'mdi-earth' : 'mdi-lock' }}
                  </v-icon>
                </template>
                <v-list-item-title>Visibility</v-list-item-title>
                <v-list-item-subtitle>
                  {{ test.isPublic ? 'Public' : 'Private' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="blue">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Collaborators</v-list-item-title>
                <v-list-item-subtitle>
                  {{ test.collaborators ? Object.keys(test.collaborators).length : 0 }} member(s)
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Created</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(test.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- Collaborators Section -->
        <v-divider class="my-4"></v-divider>
        <div class="mb-3">
          <h4 class="text-subtitle-1 mb-2">
            <v-icon class="mr-1">mdi-account-multiple</v-icon>
            Collaborators
          </h4>
          <v-chip-group v-if="test.collaborators && Object.keys(test.collaborators).length > 0">
            <v-chip v-for="(role, userId) in test.collaborators" :key="userId"
              :color="role === 'admin' ? 'primary' : 'secondary'" variant="outlined" size="small">
              <v-icon start>
                {{ role === 'admin' ? 'mdi-crown' : 'mdi-account' }}
              </v-icon>
              {{ role.toUpperCase() }}
            </v-chip>
          </v-chip-group>
          <div v-else class="text-body-2 text-disabled">
            No collaborators assigned
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions>
        <v-btn color="secondary" variant="text" prepend-icon="mdi-pencil">
          Edit
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" prepend-icon="mdi-delete">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()
const testId = computed(() => route.params.testId)

// Reactive test data from store
const test = ref(null)

onMounted(async () => {
  if (testId.value) {
    // Fetch tests if not already loaded
    if (!store.getters['automaticAccessibility/allTests']?.length) {
      await store.dispatch('automaticAccessibility/fetchTests')
    }

    // Get the test from store
    const fetchedTest = store.getters['automaticAccessibility/getTestById'](testId.value)
    test.value = fetchedTest

    const r = JSON.stringify(fetchedTest, null, 2)
    console.log('Fetched test from store:', r)
  } else {
    console.warn('No testId found in route params')
  }
})

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'orange',
    'active': 'green',
    'completed': 'blue',
    'failed': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    'draft': 'mdi-file-document-edit',
    'active': 'mdi-play-circle',
    'completed': 'mdi-check-circle',
    'failed': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'Unknown'
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-list-item-subtitle {
  opacity: 0.7;
}

.text-wrap {
  word-break: break-all;
}
</style>