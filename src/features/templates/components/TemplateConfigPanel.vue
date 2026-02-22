<template>
  <v-card class="pa-5" elevation="2">
    <h2 class="text-h6 mb-4">{{ $t('pages.templates.config.title') }}</h2>

    <v-alert
      type="info"
      variant="tonal"
      class="mb-4"
      :text="$t('pages.templates.config.ownerOnly')"
    />

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localVersion"
          :label="$t('pages.templates.config.version')"
          variant="outlined"
          :rules="versionRules"
          :disabled="isSaving"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="visibility"
          :items="visibilityOptions"
          item-title="title"
          item-value="value"
          :label="$t('pages.templates.config.visibility')"
          variant="outlined"
          :disabled="isSaving"
        />
      </v-col>
    </v-row>

    <v-text-field
      :model-value="template?.header?.templateAuthor?.userEmail || ''"
      :label="$t('pages.templates.config.owner')"
      variant="outlined"
      readonly
    />

    <div class="d-flex justify-end mt-4">
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        :disabled="isSaving || !hasChanges || !isVersionValid"
        @click="saveConfig"
      >
        {{ $t('common.save') }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { showSuccess, showError } from '@/shared/utils/toast'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
})

const store = useStore()
const { t } = useI18n()

const localVersion = ref('')
const visibility = ref('private')
const isSaving = ref(false)

const visibilityOptions = computed(() => [
  { title: t('pages.templates.config.public'), value: 'public' },
  { title: t('pages.templates.config.private'), value: 'private' },
])

const versionRules = computed(() => [
  (v) => !!String(v || '').trim() || t('errors.fieldRequired'),
])

const isVersionValid = computed(() =>
  Boolean(String(localVersion.value).trim()),
)

const hasChanges = computed(() => {
  const currentVersion = String(
    props.template?.header?.templateVersion || '1.0.0',
  )
  const currentVisibility = props.template?.header?.isTemplatePublic
    ? 'public'
    : 'private'

  return (
    currentVersion !== String(localVersion.value || '') ||
    currentVisibility !== visibility.value
  )
})

const syncFromTemplate = () => {
  localVersion.value = String(
    props.template?.header?.templateVersion || '1.0.0',
  )
  visibility.value = props.template?.header?.isTemplatePublic
    ? 'public'
    : 'private'
}

watch(
  () => props.template,
  () => {
    syncFromTemplate()
  },
  { immediate: true, deep: true },
)

const saveConfig = async () => {
  if (!props.template?.id || !isVersionValid.value) return

  isSaving.value = true
  try {
    await store.dispatch('updateTemplate', {
      id: props.template.id,
      data: {
        'header.templateVersion': String(localVersion.value).trim(),
        'header.isTemplatePublic': visibility.value === 'public',
        'header.updateDate': Date.now(),
      },
    })
    showSuccess('pages.templates.config.saved')
  } catch {
    showError('pages.templates.config.saveError')
  } finally {
    isSaving.value = false
  }
}
</script>
