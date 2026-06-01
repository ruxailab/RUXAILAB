<template>
  <v-card elevation="2" class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-on-surface">
          {{ $t('EvaluatorInfoEditor.title') }}
        </h1>
        <p class="text-body-2 text-ternary mt-1">
          {{ $t('EvaluatorInfoEditor.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Sections list -->
    <div>
      <!-- Empty state -->
      <v-card
        v-if="localInfo.sections.length === 0"
        variant="outlined"
        class="pa-8 text-center mb-4"
      >
        <v-icon size="48" color="grey-lighten-1" class="mb-3"
          >mdi-text-box-plus-outline</v-icon
        >
        <p class="text-body-1 text-grey-darken-1 mb-0">
          {{ $t('EvaluatorInfoEditor.noSections') }}
        </p>
      </v-card>

      <!-- Timeline -->
      <div class="timeline">
        <div
          v-for="(section, idx) in localInfo.sections"
          :key="section.id"
          class="timeline-item"
        >
          <!-- Spine -->
          <div class="timeline-spine">
            <div class="timeline-dot" :class="`dot-${section.type}`">
              <v-icon size="14" color="white">{{
                sectionIcon(section.type)
              }}</v-icon>
            </div>
            <div
              v-if="idx < localInfo.sections.length - 1"
              class="timeline-line"
            />
          </div>

          <!-- Content -->
          <div class="timeline-content mb-6">
            <!-- Timestamp pill -->
            <div class="d-flex align-center mb-2">
              <span class="timeline-date text-caption text-ternary">
                <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
                {{ formatDate(section.id) }}
              </span>
            </div>

            <!-- View mode -->
            <v-card
              v-if="editingIndex !== idx"
              variant="outlined"
              class="rounded-lg pa-4"
            >
              <div class="d-flex align-start justify-space-between">
                <div class="flex-grow-1 mr-2">
                  <p class="text-body-1 font-weight-semibold mb-2">
                    {{
                      section.title || $t('EvaluatorInfoEditor.untitledSection')
                    }}
                  </p>
                  <div
                    class="text-body-2 text-ternary ql-content"
                    v-html="section.content"
                  />
                </div>
                <div class="d-flex gap-1 flex-shrink-0">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="startEdit(idx)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click="deleteSection(idx)"
                  />
                </div>
              </div>
            </v-card>

            <!-- Edit mode -->
            <v-card v-else variant="outlined" class="pa-4 rounded-lg">
              <v-row dense>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="editDraft.title"
                    :label="$t('EvaluatorInfoEditor.sectionTitle')"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="editDraft.type"
                    :label="$t('EvaluatorInfoEditor.sectionType')"
                    :items="typeOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    class="mb-3"
                  >
                    <template #prepend-inner>
                      <v-icon
                        size="18"
                        :color="sectionIconColor(editDraft.type)"
                      >
                        {{ sectionIcon(editDraft.type) }}
                      </v-icon>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editDraft.content"
                    :label="$t('EvaluatorInfoEditor.sectionContent')"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    auto-grow
                    hide-details="auto"
                    class="mb-3"
                  />
                </v-col>
              </v-row>
              <div class="d-flex gap-2 justify-end">
                <v-btn variant="text" @click="cancelEdit">
                  {{ $t('EvaluatorInfoEditor.cancel') }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  :disabled="
                    !editDraft.title.trim() || !editDraft.content.trim()
                  "
                  @click="saveEdit(idx)"
                >
                  {{ $t('EvaluatorInfoEditor.save') }}
                </v-btn>
              </div>
            </v-card>
          </div>
        </div>
      </div>

      <!-- Add section dialog -->
      <v-dialog v-model="dialogOpen" width="700" persistent>
        <v-card class="pa-2">
          <v-card-title class="text-h6 font-weight-bold pa-4 pb-2">
            {{ $t('EvaluatorInfoEditor.addSection') }}
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-row dense>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newSection.title"
                  :label="$t('EvaluatorInfoEditor.sectionTitle')"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  autofocus
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newSection.type"
                  :label="$t('EvaluatorInfoEditor.sectionType')"
                  :items="typeOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                >
                  <template #prepend-inner>
                    <v-icon
                      size="18"
                      :color="sectionIconColor(newSection.type)"
                    >
                      {{ sectionIcon(newSection.type) }}
                    </v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12">
                <TextareaForm
                  v-model="newSection.content"
                  :title="$t('EvaluatorInfoEditor.sectionContent')"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" color="error" @click="cancelAdd">
              {{ $t('EvaluatorInfoEditor.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :disabled="!newSection.title.trim() || !newSection.content.trim()"
              @click="confirmAdd"
            >
              {{ $t('EvaluatorInfoEditor.addSection') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-plus"
        class="mt-4"
        @click="startAdd"
      >
        {{ $t('EvaluatorInfoEditor.addSection') }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import TextareaForm from '@/shared/components/TextareaForm.vue'

const emit = defineEmits(['autosave'])

const store = useStore()
const { t } = useI18n()

const test = computed(() => store.getters.test)

// Local copy of evaluatorInfo to avoid direct mutation
const localInfo = reactive({
  sections: [],
})

// Skip re-sync when the commit originates from this component
let skipNextSync = false

// Sync with store on mount / external changes — sorted newest → oldest
watch(
  () => test.value?.evaluatorInfo,
  (val) => {
    if (skipNextSync) {
      skipNextSync = false
      return
    }
    localInfo.sections = val?.sections
      ? [...val.sections].sort((a, b) => Number(b.id) - Number(a.id))
      : []
  },
  { immediate: true, deep: true },
)

const editingIndex = ref(null)
const editDraft = reactive({ title: '', content: '', type: 'info' })
const dialogOpen = ref(false)
const newSection = reactive({ title: '', content: '', type: 'info' })

const typeOptions = computed(() => [
  { label: t('EvaluatorInfoEditor.types.info'), value: 'info' },
  { label: t('EvaluatorInfoEditor.types.warning'), value: 'warning' },
  { label: t('EvaluatorInfoEditor.types.tip'), value: 'tip' },
])

const sectionIcon = (type) => {
  const icons = {
    info: 'mdi-information-outline',
    warning: 'mdi-alert-outline',
    tip: 'mdi-lightbulb-outline',
  }
  return icons[type] ?? icons.info
}

const sectionIconColor = (type) => {
  const colors = { info: 'primary', warning: 'warning', tip: 'success' }
  return colors[type] ?? 'primary'
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

const commit = () => {
  skipNextSync = true
  store.commit('SET_TEST_EVALUATOR_INFO', {
    sections: localInfo.sections.map((s) => ({ ...s })),
  })
  emit('autosave')
}

const startEdit = (idx) => {
  editingIndex.value = idx
  const s = localInfo.sections[idx]
  editDraft.title = s.title
  editDraft.content = s.content
  editDraft.type = s.type
}

const cancelEdit = () => {
  editingIndex.value = null
}

const saveEdit = (idx) => {
  localInfo.sections[idx] = {
    ...localInfo.sections[idx],
    title: editDraft.title.trim(),
    content: editDraft.content.trim(),
    type: editDraft.type,
  }
  editingIndex.value = null
  commit()
}

const deleteSection = (idx) => {
  localInfo.sections.splice(idx, 1)
  commit()
}

const startAdd = () => {
  dialogOpen.value = true
  newSection.title = ''
  newSection.content = ''
  newSection.type = 'info'
}

const cancelAdd = () => {
  dialogOpen.value = false
}

const confirmAdd = () => {
  localInfo.sections.unshift({
    id: Date.now().toString(),
    title: newSection.title.trim(),
    content: newSection.content.trim(),
    type: newSection.type,
  })
  dialogOpen.value = false
  commit()
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.timeline-spine {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
  padding-top: 2px;
}

.timeline-dot {
  width: 32px;
  height: 32px;
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
  min-height: 24px;
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
  background: #f5f5f5;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.72rem;
  color: #757575;
}
</style>
