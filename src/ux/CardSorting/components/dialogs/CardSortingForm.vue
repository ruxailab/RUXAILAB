<template>
  <v-dialog
    :model-value="dialog"
    max-width="560"
    persistent
    @update:model-value="close"
  >
    <v-card class="rounded-xl form-card">
      <v-card-title class="d-flex align-start ga-4 pa-6 pb-2">
        <div
          class="form-icon rounded-lg d-flex align-center justify-center"
          :class="isCategory ? 'bg-primary-lighten' : 'bg-orange-lighten'"
        >
          <v-icon :color="isCategory ? 'primary' : 'orange-darken-1'" size="28">
            {{ isCategory ? 'mdi-folder-outline' : 'mdi-card-text-outline' }}
          </v-icon>
        </div>
        <div class="flex-grow-1">
          <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
            {{ dialogTitle }}
          </h3>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            {{ dialogSubtitle }}
          </p>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          color="grey-darken-1"
          :disabled="uploadingImage"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pt-2 pb-2">
        <VForm ref="form" @submit.prevent="submit">
          <v-text-field
            v-model="localTask.title"
            :label="nameLabel"
            :rules="requiredRule"
            :placeholder="namePlaceholder"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            autofocus
            hide-details="auto"
          />

          <div v-if="showDescription" class="mt-5">
            <label
              class="text-subtitle-2 font-weight-medium text-grey-darken-3 d-block mb-2"
            >
              {{ $t('common.description') }}
            </label>
            <quill-editor
              v-model:value="localTask.description"
              class="description-editor"
              :options="editorOptions"
            />
          </div>

          <div v-if="showImage" class="mt-5">
            <label
              class="text-subtitle-2 font-weight-medium text-grey-darken-3 d-block mb-2"
            >
              {{ $t('common.image') }}
            </label>
            <v-file-input
              v-model="imageFile"
              accept="image/gif,image/jpeg,image/png,image/webp"
              :label="$t('common.selectImage')"
              :placeholder="$t('CardSorting.imageHint')"
              prepend-icon=""
              prepend-inner-icon="mdi-image-outline"
              variant="outlined"
              density="comfortable"
              show-size
              clearable
              hide-details="auto"
              :disabled="uploadingImage"
              :error-messages="imageError"
              @update:model-value="onImageSelected"
            />
            <div
              v-if="localTask.image"
              class="image-preview mt-4 rounded-lg d-flex align-center justify-center"
            >
              <img
                :src="localTask.image"
                :alt="localTask.title || $t('common.image')"
                class="image-preview__img"
              />
              <v-btn
                icon
                size="small"
                variant="flat"
                color="error"
                class="image-preview__remove"
                :disabled="uploadingImage"
                @click="clearImage"
              >
                <v-icon size="18">mdi-trash-can-outline</v-icon>
              </v-btn>
            </div>
          </div>
        </VForm>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-4 d-flex justify-end ga-3">
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          class="text-none rounded-lg px-6"
          height="44"
          :disabled="uploadingImage"
          @click="close"
        >
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none rounded-lg px-6"
          height="44"
          :loading="uploadingImage"
          @click="submit"
        >
          <v-icon start size="18">
            {{ isEdit ? 'mdi-content-save-outline' : 'mdi-plus' }}
          </v-icon>
          {{ isEdit ? $t('common.save') : $t('common.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'

const { t } = useI18n()

const props = defineProps({
  dialog: Boolean,
  task: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'category',
    validator: (value) => ['category', 'card'].includes(value),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialog', 'save'])

// Keep in sync with the cardsorting_ size limit in storage.rules.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const store = useStore()
const form = ref(null)
const imageFile = ref(null)
const pendingImage = ref(null)
const uploadingImage = ref(false)
const imageError = ref('')
const localTask = ref({
  title: '',
  description: '',
  image: '',
})

const requiredRule = [
  (v) => !!String(v || '').trim() || t('CardSorting.nameRequired'),
]

const isCategory = computed(() => props.type === 'category')

const showDescription = computed(() =>
  isCategory.value
    ? !!props.options.category_description
    : !!props.options.card_description,
)

const showImage = computed(() =>
  isCategory.value
    ? !!props.options.category_image
    : !!props.options.card_image,
)

const dialogTitle = computed(() => {
  if (isCategory.value) {
    return props.isEdit
      ? t('CardSorting.editCategory')
      : t('CardSorting.newCategory')
  }
  return props.isEdit ? t('CardSorting.editCard') : t('CardSorting.newCard')
})

const dialogSubtitle = computed(() => {
  if (isCategory.value) {
    return props.isEdit
      ? t('CardSorting.editCategoryHint')
      : t('CardSorting.newCategoryFormHint')
  }
  return props.isEdit
    ? t('CardSorting.editCardHint')
    : t('CardSorting.newCardHint')
})

const nameLabel = computed(() =>
  isCategory.value ? t('CardSorting.categoryName') : t('CardSorting.cardName'),
)

const namePlaceholder = computed(() =>
  isCategory.value
    ? t('CardSorting.categoryNamePlaceholder')
    : t('CardSorting.cardNamePlaceholder'),
)

const editorOptions = {
  theme: 'snow',
  placeholder: t('common.enterTextHere'),
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
}

const syncLocalTask = () => {
  const source = props.task || {}
  clearPendingImage()
  localTask.value = {
    title: source.title || '',
    description: source.description || '',
    image: source.image || '',
  }
  imageFile.value = null
  imageError.value = ''
}

const close = () => {
  if (uploadingImage.value) return
  emit('update:dialog', false)
  form.value?.resetValidation()
}

// The picked image is only previewed locally; it is uploaded on save so that
// cancelling or replacing it never leaves an unused file in Storage.
const clearPendingImage = () => {
  if (!pendingImage.value) return
  URL.revokeObjectURL(localTask.value.image)
  localTask.value.image = ''
  pendingImage.value = null
}

const clearImage = () => {
  clearPendingImage()
  localTask.value.image = ''
  imageFile.value = null
}

const onImageSelected = (files) => {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) {
    clearImage()
    return
  }

  clearPendingImage()
  imageError.value = ''
  if (file.size >= MAX_IMAGE_BYTES) {
    imageFile.value = null
    imageError.value = t('CardSorting.imageTooLarge')
    return
  }
  pendingImage.value = file
  localTask.value.image = URL.createObjectURL(file)
}

// Images go to Storage and only their URL is kept on the study: a base64
// data URL inside the study document quickly exceeds Firestore's 1 MiB limit.
const uploadPendingImage = async () => {
  const file = pendingImage.value
  const folder = `cardsorting_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const reference = storageRef(
    storage,
    `tests/${store.getters.test.id}/${folder}/${file.name}`,
  )
  await uploadBytes(reference, file)
  return getDownloadURL(reference)
}

const submit = async () => {
  if (uploadingImage.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  let image = localTask.value.image || ''
  if (pendingImage.value) {
    imageError.value = ''
    uploadingImage.value = true
    try {
      image = await uploadPendingImage()
    } catch (error) {
      console.error('Card sorting image upload failed:', error)
      imageError.value = t('CardSorting.imageUploadError')
      return
    } finally {
      uploadingImage.value = false
    }
    clearPendingImage()
  }

  emit('save', {
    title: String(localTask.value.title || '').trim(),
    description: localTask.value.description || '',
    image,
  })
  emit('update:dialog', false)
}

watch(
  () => props.dialog,
  (isOpen) => {
    if (isOpen) {
      syncLocalTask()
    }
  },
)

watch(
  () => props.task,
  () => {
    if (props.dialog) {
      syncLocalTask()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.form-card {
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
}

.form-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
}

.bg-primary-lighten {
  background: rgba(var(--v-theme-primary), 0.12);
}

.bg-orange-lighten {
  background: rgba(255, 152, 0, 0.14);
}

.description-editor {
  min-height: 140px;
  background: #fff;
  border-radius: 8px;
}

.description-editor :deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border-color: #e5e7eb;
}

.description-editor :deep(.ql-container) {
  min-height: 110px;
  border-radius: 0 0 8px 8px;
  border-color: #e5e7eb;
  font-size: 14px;
}

.image-preview {
  position: relative;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 12px;
  min-height: 120px;
}

.image-preview__img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 6px;
}

.image-preview__remove {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
