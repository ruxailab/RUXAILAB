<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <TestInformationCard
          :test="test"
          :loading="loading"
          :test-id="$route.params.testId"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter ,onBeforeRouteUpdate} from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import TestInformationCard from '@/components/molecules/TestInformationCard.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const test = ref(null)
const error = ref(null)

// Fetch test data when component mounts or testId changes
const fetchTest = async () => {
  if (!route.params.testId) return

  loading.value = true
  error.value = null

  try {
    const testData = await store.dispatch('manualAccessibility/fetchTest', route.params.testId)
    test.value = testData
  } catch (err) {
    console.error('Error fetching test:', err)
    error.value = 'Failed to load test information'
    toast.error('Failed to load test information')
  } finally {
    loading.value = false
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Invalid date'
  }
}

// Get color based on status
const getStatusColor = (status) => {
  const statusColors = {
    draft: 'grey',
    active: 'primary',
    completed: 'success',
    archived: 'error'
  }
  return statusColors[status?.toLowerCase()] || 'secondary'
}

// Fetch test data when component mounts
onMounted(() => {
  if (route.params.testId) {
    fetchTest()
  }
})

// Watch for route changes to fetch new test data
onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.testId !== from.params.testId) {
    await fetchTest()
  }
  next()
})
</script>

<style scoped>
.test-info-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.test-info-card .v-card-title {
  background-color: #f5f5f5;
  padding: 16px 24px;
  font-weight: 600;
}

.test-info-card .v-card-text {
  padding: 24px;
}

.test-info-card .v-list-item {
  padding-left: 0;
  padding-right: 0;
}
</style>
