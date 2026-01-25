<template>
  <v-col cols="1" md="2">
    <!-- Desktop -->
    <v-select
      :model-value="lang"
      class="pt-7 hidden-sm-and-down"
      prepend-inner-icon="mdi-translate"
      :items="languages"
      item-title="label"
      item-value="value"
      :label="$t('language')"
      variant="solo"
      flat
      density="compact"
      @update:model-value="updateLang"
    />
    <!-- Mobile -->
    <div
      class="hidden-md-and-up mr-1"
      style="display: flex; justify-content: center"
    >
      <v-menu>
        <template #activator="{ props }">
          <v-btn size="small" color="primary" icon v-bind="props">
            <v-icon size="20" color="white"> mdi-translate </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in languages"
            :key="index"
            link
            @click="updateLang(item.value)"
          >
            <v-list-item-title class="hindi-fix">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-col>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { locale } = useI18n()

const languages = ref([
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Português', value: 'pt_br' },
  { label: 'हिन्दी', value: 'hi' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Français', value: 'fr' },
  { label: '中文', value: 'zh' },
  { label: 'العربية', value: 'ar' },
  { label: 'Русский', value: 'ru' },
  { label: '日本語', value: 'ja' },
])

const lang = computed(() => store.getters['Language/lang'])

function normalizeLocaleKey(l) {
  if (!l) return 'en'
  return String(l).trim().toLowerCase().replace('-', '_')
}
const updateLang = (newLang) => {
  const normalized = normalizeLocaleKey(newLang) || 'en'
  store.dispatch('Language/setLang', normalized)
  locale.value = normalized
}

onMounted(() => {
  const normalized = normalizeLocaleKey(lang.value) || 'en'
  locale.value = normalized
})

watch(
  () => store.getters['Language/lang'],
  (newLang) => {
    const normalized = normalizeLocaleKey(newLang) || 'en'
    if (locale.value !== normalized) {
      locale.value = normalized
    }
  },
)
</script>

<style>
.v-select.v-input--dense .v-select__selection,
.v-select__selection {
  padding-bottom: 4px !important;
}
</style>
