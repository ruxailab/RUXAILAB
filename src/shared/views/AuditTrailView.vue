<template>
  <PageWrapper :title="t('auditTrail.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ t('auditTrail.subtitle') }}
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
          {{ formatAction(item.action) }}
        </v-chip>
      </template>
    </v-data-table>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { normalizeAuditEvent } from '@/shared/utils/auditTrailDisplay'

const route = useRoute()
const { t, te } = useI18n()
const events = ref([])
const loading = ref(true)
const error = ref('')

const headers = computed(() => [
  { title: t('auditTrail.headers.time'), key: 'timestamp' },
  { title: t('auditTrail.headers.action'), key: 'action' },
  { title: t('auditTrail.headers.actor'), key: 'actorDisplay' },
  { title: t('auditTrail.headers.description'), key: 'descriptionDisplay' },
])

const formatTimestamp = (timestamp) => {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null)
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '-'
}

const formatAction = (action) => {
  const actionKey = `auditTrail.actions.${action}`
  return te(actionKey) ? t(actionKey) : action
}

onMounted(async () => {
  try {
    const auditQuery = query(
      collection(db, 'tests', route.params.id, 'auditTrail'),
      orderBy('timestamp', 'desc'),
    )
    const snapshot = await getDocs(auditQuery)
    events.value = snapshot.docs.map((document) =>
      normalizeAuditEvent(
        {
          id: document.id,
          ...document.data(),
        },
        {
          t,
          te,
        },
      ),
    )
  } catch {
    error.value = t('auditTrail.loadError')
  } finally {
    loading.value = false
  }
})
</script>
