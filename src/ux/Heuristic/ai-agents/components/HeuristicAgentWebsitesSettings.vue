<template>
  <div>
    <v-card variant="outlined" class="mb-6">
      <v-card-item>
        <v-card-title class="text-h6">
          {{ $t('heuristicAgents.web.title') }}
        </v-card-title>
        <v-card-subtitle>
          {{ $t('heuristicAgents.web.subtitle') }}
        </v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="9">
            <v-text-field
              v-model="pageUrl"
              :label="$t('heuristicAgents.web.url')"
              placeholder="https://test.com"
              prepend-inner-icon="mdi-link"
              :disabled="saving || discovering || isTemplate"
              @keyup.enter="discoverPages"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              block
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="discovering"
              :disabled="saving || discovering || isTemplate || !pageUrl"
              @click="discoverPages"
            >
              {{ $t('heuristicAgents.web.search') }}
            </v-btn>
          </v-col>
        </v-row>
        <div v-if="pagesLoaded" class="mt-4">
          <div
            class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4"
          >
            <div>
              <h2 class="text-subtitle-1 font-weight-medium">
                {{ $t('heuristicAgents.pages.title') }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{
                  $t('heuristicAgents.pages.selected', {
                    selected: selectedUrls.length,
                    total: pages.length,
                  })
                }}
              </p>
            </div>
            <v-btn
              size="small"
              variant="text"
              :disabled="saving || discovering || isTemplate || !pages.length"
              @click="toggleAllPages"
            >
              {{
                allPagesSelected
                  ? $t('heuristicAgents.pages.deselectAll')
                  : $t('heuristicAgents.pages.selectAll')
              }}
            </v-btn>
          </div>
          <v-alert
            v-if="!pages.length"
            type="info"
            variant="tonal"
            icon="mdi-link-variant"
          >
            {{ $t('heuristicAgents.pages.empty') }}
          </v-alert>
          <v-list v-else class="url-list border rounded-lg">
            <v-list-item v-for="page in pages" :key="page.url">
              <template #prepend>
                <v-checkbox-btn
                  v-model="selectedUrls"
                  :value="page.url"
                  :disabled="saving || discovering || isTemplate"
                />
              </template>
              <v-list-item-title :class="{ 'pl-5': page.depth > 0 }">
                <span v-if="page.depth > 0" class="text-medium-emphasis"
                  >↳ </span
                >{{ page.url }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
        <div
          v-if="pagesLoaded && selectedUrls.length > 0"
          class="d-flex justify-end mt-4"
        >
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="discovering || isTemplate"
            @click="savePages"
          >
            {{ $t('agents.actions.save') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import HeuristicPageLoader from '../services/HeuristicPageLoader'
import { showSuccess, showError } from '@/shared/utils/toast'

const props = defineProps({ isTemplate: { type: Boolean, default: false } })
const store = useStore()
const { t } = useI18n()
const pageLoader = new HeuristicPageLoader()
const test = computed(() => store.getters.test)
const pageUrl = ref('')
const pages = ref([])
const selectedUrls = ref([])
const pagesLoaded = ref(false)
const discovering = ref(false)
const saving = ref(false)
watch(
  () => test.value?.heuristicAgentWebsites,
  (config) => {
    pageUrl.value = config?.url || ''
    pages.value = (config?.pages || []).map((page) => ({ ...page }))
    selectedUrls.value = [...(config?.selectedUrls || [])]
  },
  { immediate: true },
)
const allPagesSelected = computed(
  () =>
    pages.value.length > 0 && selectedUrls.value.length === pages.value.length,
)
const toggleAllPages = () => {
  selectedUrls.value = allPagesSelected.value
    ? []
    : pages.value.map((page) => page.url)
}
const discoverPages = async () => {
  if (discovering.value || saving.value || props.isTemplate || !test.value?.id)
    return
  discovering.value = true
  try {
    const discovered = await pageLoader.discover(pageUrl.value, test.value.id)
    pagesLoaded.value = true
    pages.value = discovered
    selectedUrls.value = discovered.slice(0, 1).map((page) => page.url)
    showSuccess(
      t('heuristicAgents.messages.urlsFound', { count: discovered.length }),
    )
  } catch (error) {
    showError(
      t('heuristicAgents.messages.discoverError', { error: error.message }),
    )
  } finally {
    discovering.value = false
  }
}
const savePages = async () => {
  if (saving.value || discovering.value || props.isTemplate || !test.value)
    return
  saving.value = true
  const updated = {
    ...test.value,
    heuristicAgentWebsites: {
      url: pageUrl.value.trim(),
      pages: pages.value.map((page) => ({ url: page.url, depth: page.depth })),
      selectedUrls: selectedUrls.value.filter((url) =>
        pages.value.some((page) => page.url === url),
      ),
    },
  }
  try {
    const result = await store.dispatch('updateStudy', updated)
    if (result === null) {
      showError(
        store.getters.error?.message ||
          t('HeuristicsSettings.messages.updateFailed'),
      )
      return
    }
    showSuccess(t('HeuristicsSettings.messages.settingsSaved'))
  } catch (error) {
    showError(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.url-list {
  max-height: 420px;
  overflow-y: auto;
}
</style>
