<template>
  <PageWrapper :title="pageTitle" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ pageSubtitle }}
      </p>
    </template>

    <v-container>
      <ButtonSave :visible="!isTemplate && change" @click="save" />

      <div>
        <v-tabs
          v-model="index"
          bg-color="#F5F5F5"
          color="black"
          class="mb-6 segmented-control"
          show-arrows
          density="compact"
          slider-color="transparent"
          rounded="pill"
        >
          <v-tab
            :value="0"
            :class="{ 'active-segment': index === 0 }"
            rounded="pill"
            variant="text"
            class="segmented-tab"
          >
            {{ $t('HeuristicsEditTest.titles.heuristics') }}
          </v-tab>
          <v-tab
            :value="1"
            :class="{ 'active-segment': index === 1 }"
            rounded="pill"
            variant="text"
            class="segmented-tab"
          >
            {{ $t('HeuristicsEditTest.titles.options') }}
          </v-tab>
          <v-tab
            :value="2"
            :class="{ 'active-segment': index === 2 }"
            rounded="pill"
            variant="text"
            class="segmented-tab"
          >
            {{ $t('HeuristicsEditTest.titles.weights') }}
          </v-tab>
          <v-tab
            v-if="showSettingsTab"
            :value="3"
            :class="{ 'active-segment': index === 3 }"
            rounded="pill"
            variant="text"
            class="segmented-tab"
          >
            {{ $t('HeuristicsEditTest.titles.settings') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="index" class="mt-4">
          <v-window-item :value="0">
            <HeuristicsTable
              :is-template="isTemplate"
              @change="change = true"
            />
          </v-window-item>
          <v-window-item :value="1">
            <OptionsTable
              :is-template="isTemplate"
              @change="change = true"
            />
          </v-window-item>
          <v-window-item :value="2">
            <WeightTable
              :is-template="isTemplate"
              @change="change = true"
            />
          </v-window-item>
          <v-window-item v-if="showSettingsTab" :value="3">
            <HeuristicsSettings :is-template="isTemplate" />
          </v-window-item>
        </v-window>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import HeuristicsTable from '../components/HeuristicsTable.vue'
import OptionsTable from '../components/OptionsTable.vue'
import WeightTable from '../components/weights_evaluation/WeightTable.vue'
import HeuristicsSettings from '../components/HeuristicsSettings.vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import { useI18n } from 'vue-i18n'

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

const index = ref(0)
const change = ref(false)
const windowWidth = ref(window.innerWidth)
const showSettingsTab = computed(() => !props.isTemplate)
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

// Tab items for mobile dropdown
const tabItems = computed(() => {
  const items = [
    { title: 'HEURISTICS', value: 0 },
    { title: 'OPTIONS', value: 1 },
    { title: 'WEIGHTS', value: 2 },
  ]

  if (showSettingsTab.value) {
    items.push({ title: 'SETTINGS', value: 3 })
  }

  return items
})

// Check if mobile
const isMobile = computed(() => windowWidth.value < 960)

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  if (props.isTemplate && props.templateTest) {
    store.commit('SET_TEST', structuredClone(props.templateTest))
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const save = async () => {
  if (props.isTemplate) return
  change.value = false

  const rawData = {
    ...store.getters.test,
    testStructure: store.getters.heuristics,
    testOptions: store.state.Tests.Test.testOptions,
    testWeights: store.getters.testWeights,
  }

  const study = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', study)
  await store.dispatch('getStudy', { id: route.params.id })
}
</script>

<style scoped>
.active-segment {
  background-color: white !important;
  color: #212121 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
}

.segmented-control {
  padding: 4px !important;
  height: auto !important;
  width: fit-content;
  max-width: 100%;
}

.segmented-tab {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  color: #757575 !important;
  min-height: 36px !important;
  height: 36px !important;
  transition: all 0.2s ease-in-out !important;
}

.segmented-control :deep(.v-slide-group__content) {
  padding: 0 !important;
}
</style>
