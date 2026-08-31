<template>
  <PageWrapper :title="pageTitle" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ pageSubtitle }}
      </p>
    </template>

    <AutoSaveStatusBanner
      v-if="!isTemplate"
      :message="saveStatusMessage"
      :status-type="saveStatusType"
      :is-saving="autoSaveInProgress"
      :last-save-text="
        lastSaveTime && saveStatusType === 'success' ? formatLastSaveTime() : ''
      "
      :show-action="hasPendingChanges || saveStatusType === 'error'"
      helper-message="Changes are saved automatically while you edit."
      @action="save({ showToast: true })"
    />

    <v-container v-if="isCurrentStudy">
      <div>
        <v-tabs
          v-if="!isMobile"
          v-model="index"
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
        >
          <v-tab>{{ $t('HeuristicsEditTest.titles.heuristics') }}</v-tab>
          <v-tab v-if="showOptionsTab">{{ optionsTabTitle }}</v-tab>
          <v-tab v-if="showWeightsTab">{{
            $t('HeuristicsEditTest.titles.weights')
          }}</v-tab>
          <v-tab v-if="showSettingsTab">{{
            $t('HeuristicsEditTest.titles.settings')
          }}</v-tab>
        </v-tabs>

        <v-select
          v-else
          v-model="index"
          :items="tabItems"
          variant="outlined"
          density="compact"
          class="mobile-tab-select"
          prepend-inner-icon="mdi-menu"
          hide-details
        >
          <template #selection="{ item }">
            <div class="d-flex align-center justify-space-between w-100">
              <span class="font-weight-medium">{{ item.title }}</span>
            </div>
          </template>
        </v-select>

        <div class="mt-4">
          <HeuristicsTable
            v-if="index == 0"
            :is-template="isTemplate"
            @change="handleEditorChange"
          />
          <OptionsTable
            v-if="showOptionsTab && index == optionsTabIndex"
            :is-template="isTemplate"
            @change="handleEditorChange"
          />
          <WeightTable
            v-if="showWeightsTab && index == weightsTabIndex"
            :is-template="isTemplate"
            @change="handleEditorChange"
          />
          <HeuristicsSettings
            v-if="showSettingsTab && index == settingsTabIndex"
            :is-template="isTemplate"
          />
        </div>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import AutoSaveStatusBanner from '@/shared/components/AutoSaveStatusBanner.vue'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import { showError, showSuccess } from '@/shared/utils/toast'
import StudyController from '@/controllers/StudyController'
import HeuristicsTable from '../components/HeuristicsTable.vue'
import OptionsTable from '../components/OptionsTable.vue'
import WeightTable from '../components/weights_evaluation/WeightTable.vue'
import HeuristicsSettings from '../components/HeuristicsSettings.vue'

const props = defineProps({
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateTest: {
    type: Object,
    default: null,
  },
})

const store = useStore()
const route = useRoute()
const { t } = useI18n()
const studyController = new StudyController()

const index = ref(0)
const windowWidth = ref(window.innerWidth)
const hasPendingChanges = ref(false)
const autoSaveInProgress = ref(false)
const lastSaveTime = ref(null)
const saveStatusMessage = ref('All changes saved')
const saveStatusType = ref('default')
const pendingChangeVersion = ref(0)
let currentSavePromise = null

const showSettingsTab = computed(() => !props.isTemplate)
const test = computed(() => store.getters.test)
const isCurrentStudy = computed(() => test.value?.id === route.params.id)
const showWeightsTab = computed(() => test.value?.useWeights ?? false)
const showOptionsTab = computed(
  () =>
    !showWeightsTab.value &&
    !(test.value?.useFrequency !== false && test.value?.useSeverity !== false),
)
const optionsTabIndex = computed(() => 1)
const weightsTabIndex = computed(() => (showOptionsTab.value ? 2 : 1))
const settingsTabIndex = computed(() =>
  showWeightsTab.value
    ? weightsTabIndex.value + 1
    : showOptionsTab.value
      ? 2
      : 1,
)
const optionsTabTitle = computed(() =>
  showOptionsTab.value
    ? t('HeuristicsEditTest.titles.heuristicAnswers')
    : t('HeuristicsEditTest.titles.options'),
)
const pageTitle = computed(() =>
  props.isTemplate
    ? t('HeuristicsEditTest.previewPageTitle')
    : t('HeuristicsEditTest.pageTitle'),
)
const pageSubtitle = computed(() =>
  props.isTemplate
    ? t('HeuristicsEditTest.previewPageSubtitle')
    : t('HeuristicsEditTest.pageSubtitle'),
)

const tabItems = computed(() => {
  const items = [{ title: t('HeuristicsEditTest.titles.heuristics'), value: 0 }]

  if (showOptionsTab.value) {
    items.push({ title: optionsTabTitle.value, value: optionsTabIndex.value })
  }

  if (showWeightsTab.value) {
    items.push({
      title: t('HeuristicsEditTest.titles.weights'),
      value: weightsTabIndex.value,
    })
  }

  if (showSettingsTab.value) {
    items.push({
      title: t('HeuristicsEditTest.titles.settings'),
      value: settingsTabIndex.value,
    })
  }

  return items
})

watch(
  [showOptionsTab, showWeightsTab],
  (
    [newShowOptionsTab, newShowWeightsTab],
    [oldShowOptionsTab, oldShowWeightsTab],
  ) => {
    const oldWeightsTabIndex = oldShowOptionsTab ? 2 : 1
    const oldSettingsTabIndex = oldShowWeightsTab
      ? oldWeightsTabIndex + 1
      : oldShowOptionsTab
        ? 2
        : 1

    if (index.value !== oldSettingsTabIndex) return

    index.value = newShowWeightsTab
      ? (newShowOptionsTab ? 2 : 1) + 1
      : newShowOptionsTab
        ? 2
        : 1
  },
)

const isMobile = computed(() => windowWidth.value < 960)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const updateSaveStatus = (message, type = 'default') => {
  saveStatusMessage.value = message
  saveStatusType.value = type
}

const formatLastSaveTime = () => {
  if (!lastSaveTime.value) return ''

  const now = new Date()
  const savedAt = new Date(lastSaveTime.value)
  const diffMs = now - savedAt
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const diffMins = Math.floor(diffMs / 60000)

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) {
    return `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  }

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
}

const buildStudy = () => {
  if (!store.getters.test) return null

  const rawData = {
    ...store.getters.test,
    testStructure: structuredClone(store.getters.heuristics || []),
    testOptions: structuredClone(store.state.Tests.Test?.testOptions || []),
    testWeights: structuredClone(store.getters.testWeights || {}),
    updateDate: Date.now(),
  }

  return instantiateStudyByType(rawData.testType, rawData)
}

const waitForCurrentSave = async () => {
  if (!currentSavePromise) return false

  try {
    await currentSavePromise
  } catch {
    // Continue with the latest pending state after a failed save.
  }

  return !hasPendingChanges.value
}

const beginSave = (study) => {
  const savePromise = studyController.updateStudy(study)

  autoSaveInProgress.value = true
  updateSaveStatus('Saving changes...', 'saving')
  currentSavePromise = savePromise

  return savePromise
}

const handleSuccessfulSave = (study, saveVersion, showToast) => {
  store.commit('SET_TEST', study)

  if (saveVersion !== pendingChangeVersion.value) {
    updateSaveStatus('Saving changes...', 'saving')
    debouncedAutoSave()
    return
  }

  hasPendingChanges.value = false
  lastSaveTime.value = new Date()
  updateSaveStatus('All changes saved', 'success')

  if (showToast) {
    showSuccess('alerts.savedChanges')
  }
}

const handleFailedSave = (showToast) => {
  hasPendingChanges.value = true
  updateSaveStatus('Failed to save', 'error')

  if (showToast) {
    showError('alerts.errorSavingProgress')
  }
}

const finalizeSave = (savePromise) => {
  autoSaveInProgress.value = false

  if (currentSavePromise === savePromise) {
    currentSavePromise = null
  }

  if (
    hasPendingChanges.value &&
    !currentSavePromise &&
    saveStatusType.value !== 'error'
  ) {
    debouncedAutoSave()
  }
}

const save = async ({ showToast = false } = {}) => {
  if (props.isTemplate) return true

  if (await waitForCurrentSave()) return true

  const study = buildStudy()
  if (!study) return false

  const saveVersion = pendingChangeVersion.value
  const savePromise = beginSave(study)

  try {
    await savePromise
    handleSuccessfulSave(study, saveVersion, showToast)
    return true
  } catch {
    handleFailedSave(showToast)
    return false
  } finally {
    finalizeSave(savePromise)
  }
}

const debouncedAutoSave = debounce(() => save(), 1500)

const flushPendingSave = async () => {
  if (currentSavePromise) {
    try {
      await currentSavePromise
    } catch {
      // Save status is handled by save(); navigation remains blocked below.
    }
  }

  if (hasPendingChanges.value) {
    const flushResult = debouncedAutoSave.flush()
    if (flushResult?.then) {
      await flushResult
    }
  }

  if (currentSavePromise) {
    try {
      await currentSavePromise
    } catch {
      // Save status is handled by save(); navigation remains blocked below.
    }
  }

  return !hasPendingChanges.value
}

const handleEditorChange = () => {
  if (props.isTemplate) return

  pendingChangeVersion.value += 1
  hasPendingChanges.value = true
  updateSaveStatus('Saving changes...', 'saving')
  debouncedAutoSave()
}

const preventUnload = (event) => {
  if (!hasPendingChanges.value && !autoSaveInProgress.value) return

  debouncedAutoSave.flush()
  if (hasPendingChanges.value && !currentSavePromise) {
    void save()
  }
  event.preventDefault()
  event.returnValue = ''
}

watch(
  test,
  (newTest) => {
    if (
      !hasPendingChanges.value &&
      newTest?.updateDate &&
      !autoSaveInProgress.value
    ) {
      lastSaveTime.value = new Date(newTest.updateDate)
    }
  },
  { immediate: true },
)
// Watch for changes in showWeightsTab to fix index
watch(showWeightsTab, (newVal, oldVal) => {
  // If weights tab visibility changed and we're currently on or past the weights tab
  if (newVal !== oldVal) {
    if (!newVal && index.value > 1) {
      // Weights tab is now hidden and index is on Settings (was 3, should be 2)
      index.value = 2
    }
  }
})

onMounted(() => {
  if (props.isTemplate && props.templateTest) {
    store.commit('SET_TEST', structuredClone(props.templateTest))
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('beforeunload', preventUnload)
})

onBeforeUnmount(() => {
  debouncedAutoSave.flush()
  if (hasPendingChanges.value && !currentSavePromise) {
    void save()
  }
  debouncedAutoSave.cancel()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('beforeunload', preventUnload)
})

onBeforeRouteLeave(async () => {
  const saved = await flushPendingSave()

  if (!saved) {
    showError('alerts.errorSavingProgress')
    return false
  }

  return true
})
</script>

<style scoped>
.mobile-tab-select {
  margin-bottom: 16px;
}

@media (max-width: 960px) {
  .v-container {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
