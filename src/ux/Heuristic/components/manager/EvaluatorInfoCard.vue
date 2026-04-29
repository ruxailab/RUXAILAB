<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header -->
    <div
      class="d-flex align-center justify-space-between mb-4 clickable-header"
      @click="navigateToEvaluatorInfo"
    >
      <div class="d-flex align-center">
        <v-icon size="24" color="primary" class="header-icon">
          mdi-book-information-variant
        </v-icon>
        <v-card-title class="text-h6 text-primary clickable-title">
          {{ $t('Dashboard.cards.evaluatorInfo') }}
        </v-card-title>
      </div>
      <v-chip
        v-if="sections.length > 0"
        color="primary"
        variant="tonal"
        size="small"
        class="flex-shrink-0"
      >
        {{ sections.length }}
      </v-chip>
    </div>

    <!-- Empty state -->
    <div v-if="sections.length === 0" class="empty-state text-center py-4">
      <v-icon size="36" color="grey-lighten-1" class="mb-2">
        mdi-text-box-plus-outline
      </v-icon>
      <p class="text-caption text-grey-darken-1 mb-0">
        {{ $t('Dashboard.cards.evaluatorInfoEmpty') }}
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="timeline">
      <div
        v-for="(section, idx) in visibleSections"
        :key="section.id"
        class="timeline-item"
      >
        <!-- Spine -->
        <div class="timeline-spine">
          <div class="timeline-dot" :class="`dot-${section.type}`">
            <v-icon size="11" color="white">{{
              sectionIcon(section.type)
            }}</v-icon>
          </div>
          <div v-if="idx < visibleSections.length - 1" class="timeline-line" />
        </div>

        <!-- Content -->
        <div class="timeline-content mb-3">
          <div class="d-flex align-center mb-1">
            <span class="timeline-date text-caption">
              <v-icon size="11" class="mr-1">mdi-clock-outline</v-icon>
              {{ formatDate(section.id) }}
            </span>
          </div>
          <p class="text-body-2 font-weight-medium mb-1">
            {{ section.title || $t('EvaluatorInfoEditor.untitledSection') }}
          </p>
          <div
            class="text-caption text-grey-darken-1 content-preview ql-content"
            v-html="stripHtml(section.content)"
          />
        </div>
      </div>
    </div>

    <!-- See all -->
    <div v-if="sections.length > MAX_VISIBLE" class="text-center mt-2">
      <v-btn
        variant="text"
        size="small"
        color="primary"
        @click="navigateToEvaluatorInfo"
      >
        {{
          $t('Dashboard.cards.evaluatorInfoSeeAll', { count: sections.length })
        }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const MAX_VISIBLE = 3

const props = defineProps({
  test: { type: Object, default: null },
})

const router = useRouter()

const sections = computed(() => {
  const raw = props.test?.evaluatorInfo?.sections
  if (!Array.isArray(raw) || raw.length === 0) return []
  return [...raw].sort((a, b) => Number(b.id) - Number(a.id))
})

const visibleSections = computed(() => sections.value.slice(0, MAX_VISIBLE))

const sectionIcon = (type) => {
  const icons = {
    info: 'mdi-information-outline',
    warning: 'mdi-alert-outline',
    tip: 'mdi-lightbulb-outline',
  }
  return icons[type] ?? icons.info
}

const formatDate = (id) => {
  const ts = Number(id)
  if (!ts) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

// Strip HTML tags for the preview snippet
const stripHtml = (html) => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

const navigateToEvaluatorInfo = () => {
  if (props.test?.id) {
    router.push(`/heuristic/evaluatorinfo/${props.test.id}`)
  }
}
</script>

<style scoped>
.clickable-header {
  cursor: pointer;
}

.clickable-title {
  transition: color 0.2s;
}

.clickable-header:hover .clickable-title {
  text-decoration: underline;
}

.empty-state {
  color: #9e9e9e;
}

/* Timeline */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.timeline-spine {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
  padding-top: 2px;
}

.timeline-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.dot-info {
  background-color: rgb(var(--v-theme-primary));
}
.dot-warning {
  background-color: rgb(var(--v-theme-warning));
}
.dot-tip {
  background-color: rgb(var(--v-theme-success));
}

.timeline-line {
  width: 2px;
  flex-grow: 1;
  min-height: 16px;
  background-color: #e0e0e0;
  margin-top: 4px;
}

.timeline-content {
  flex-grow: 1;
  min-width: 0;
}

.timeline-date {
  display: inline-flex;
  align-items: center;
  color: #9e9e9e;
}

.content-preview {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
