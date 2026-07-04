<template>
  <PageWrapper title="Audit Trail" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Sensitive changes made to this study.
      </p>
    </template>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="events"
      :loading="loading"
      item-value="id"
    >
      <template #item.timestamp="{ item }">
        {{ formatTimestamp(item.timestamp) }}
      </template>
      <template #item.action="{ item }">
        <v-chip color="primary" size="small" variant="tonal">
          {{ item.action }}
        </v-chip>
      </template>
    </v-data-table>
  </PageWrapper>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const route = useRoute()
const events = ref([])
const loading = ref(true)
const error = ref('')

const headers = [
  { title: 'Time', key: 'timestamp' },
  { title: 'Action', key: 'action' },
  { title: 'Actor', key: 'actorId' },
  { title: 'Target', key: 'target' },
]

const formatTimestamp = (timestamp) => {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null)
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '-'
}

onMounted(async () => {
  try {
    const auditQuery = query(
      collection(db, 'tests', route.params.id, 'auditTrail'),
      orderBy('timestamp', 'desc'),
    )
    const snapshot = await getDocs(auditQuery)
    events.value = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))
  } catch {
    error.value = 'Unable to load the audit trail.'
  } finally {
    loading.value = false
  }
})
</script>
