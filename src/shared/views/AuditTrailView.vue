<template>
  <PageWrapper :title="t('auditTrail.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ t('auditTrail.subtitle') }}
      </p>
    </template>

    <template #filters>
      <div class="d-flex align-center flex-wrap ga-3 mb-5 audit-filters">
        <v-select
          v-model="filters.activity"
          :items="activityOptions"
          :label="t('auditTrail.filters.activity')"
          data-test="audit-filter"
          density="compact"
          hide-details
          style="min-width: 190px"
          variant="outlined"
        />
        <v-select
          v-model="filters.when"
          :items="timeOptions"
          :label="t('auditTrail.filters.when')"
          data-test="audit-filter"
          density="compact"
          hide-details
          style="min-width: 170px"
          variant="outlined"
        />
        <v-select
          v-model="filters.person"
          :items="personOptions"
          :label="t('auditTrail.filters.person')"
          data-test="audit-filter"
          density="compact"
          hide-details
          style="min-width: 220px"
          variant="outlined"
        />
        <v-btn
          v-if="hasActiveFilters"
          color="primary"
          variant="text"
          @click="clearFilters"
        >
          {{ t('auditTrail.filters.clear') }}
        </v-btn>
      </div>
    </template>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="filteredEvents"
      :loading="loading"
      :no-data-text="noDataText"
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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { normalizeAuditEvent } from '@/shared/utils/auditTrailDisplay'
import {
  auditPeopleOptions,
  filterAuditEvents,
} from '@/shared/utils/auditTrailFilters'

const route = useRoute()
const { t, te } = useI18n()
const events = ref([])
const people = ref([])
const loading = ref(true)
const error = ref('')
const filters = ref({ activity: '', when: '', person: '' })

const headers = computed(() => [
  { title: t('auditTrail.headers.time'), key: 'timestamp' },
  { title: t('auditTrail.headers.action'), key: 'action' },
  { title: t('auditTrail.headers.actor'), key: 'actorDisplay' },
  { title: t('auditTrail.headers.description'), key: 'descriptionDisplay' },
])

const activityOptions = computed(() => [
  { title: t('auditTrail.filters.allActivity'), value: '' },
  { title: t('auditTrail.filters.study'), value: 'study' },
  { title: t('auditTrail.filters.settings'), value: 'settings' },
  { title: t('auditTrail.filters.team'), value: 'team' },
  { title: t('auditTrail.filters.files'), value: 'files' },
])

const timeOptions = computed(() => [
  { title: t('auditTrail.filters.anyTime'), value: '' },
  { title: t('auditTrail.filters.last7Days'), value: 'last7Days' },
  { title: t('auditTrail.filters.last30Days'), value: 'last30Days' },
])

const personOptions = computed(() => [
  { title: t('auditTrail.filters.anyone'), value: '' },
  ...people.value,
])

const filteredEvents = computed(() =>
  filterAuditEvents(events.value, filters.value),
)

const hasActiveFilters = computed(() =>
  Object.values(filters.value).some(Boolean),
)

const noDataText = computed(() =>
  t(
    hasActiveFilters.value
      ? 'auditTrail.noMatchingEvents'
      : 'auditTrail.noEvents',
  ),
)

const formatTimestamp = (timestamp) => {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null)
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '-'
}

const formatAction = (action) => {
  const actionKey = `auditTrail.actions.${action}`
  return te(actionKey) ? t(actionKey) : action
}

const clearFilters = () => {
  filters.value = { activity: '', when: '', person: '' }
}

onMounted(async () => {
  try {
    const auditQuery = query(
      collection(db, 'tests', route.params.id, 'auditTrail'),
      orderBy('timestamp', 'desc'),
    )
    const studyRef = doc(db, 'tests', route.params.id)
    const [snapshot, studySnapshot] = await Promise.all([
      getDocs(auditQuery),
      getDoc(studyRef).catch(() => null),
    ])
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
    people.value = auditPeopleOptions(studySnapshot?.data(), events.value)
  } catch {
    error.value = t('auditTrail.loadError')
  } finally {
    loading.value = false
  }
})
</script>
