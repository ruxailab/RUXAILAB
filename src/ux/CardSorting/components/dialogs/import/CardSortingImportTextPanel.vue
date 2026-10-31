<template>
  <div>
    <div class="d-flex align-center justify-space-between ga-3 mb-2">
      <label class="text-subtitle-2 font-weight-medium text-grey-darken-3">
        {{ label }}
      </label>
      <v-btn
        variant="text"
        color="grey-darken-2"
        size="small"
        class="text-none rounded-lg paste-btn"
        :loading="isPasting"
        @click="pasteFromClipboard"
      >
        <v-icon start size="16">mdi-content-paste</v-icon>
        {{ $t('CardSorting.importPaste') }}
      </v-btn>
    </div>
    <v-textarea
      :model-value="modelValue"
      :placeholder="placeholder"
      variant="outlined"
      auto-grow
      rows="8"
      max-rows="16"
      hide-details="auto"
      class="import-textarea"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <p v-if="pasteError" class="text-body-2 text-error mt-2 mb-0">
      {{ pasteError }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const pasteError = ref('')
const isPasting = ref(false)

const pasteFromClipboard = async () => {
  pasteError.value = ''
  isPasting.value = true
  try {
    if (!navigator?.clipboard?.readText) {
      throw new Error('clipboard unavailable')
    }

    const text = await navigator.clipboard.readText()
    if (!text) return

    const nextValue = props.modelValue.trim()
      ? `${props.modelValue.replace(/\s+$/, '')}\n${text}`
      : text
    emit('update:modelValue', nextValue)
  } catch {
    pasteError.value = t('CardSorting.importPasteError')
  } finally {
    isPasting.value = false
  }
}

defineExpose({ pasteFromClipboard })
</script>
