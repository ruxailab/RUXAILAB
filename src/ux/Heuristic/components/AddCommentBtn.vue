<template>
  <div>
    <v-row justify="start" align="center">
      <v-col
        :cols="openByDefault ? 12 : 10"
        :sm="openByDefault ? 12 : 11"
        class="py-0"
      >
        <slot name="answer" />
      </v-col>
      <v-col v-if="!openByDefault" cols="1" class="mb-6 py-0">
        <v-tooltip v-if="!show" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn icon v-bind="tooltipProps" @click="show = !show">
              <v-badge
                v-if="totalItemCount > 1"
                :content="totalItemCount"
                color="warning"
                floating
              >
                <v-icon :color="hasContent ? '#F9A826' : ''">
                  mdi-comment-plus-outline
                </v-icon>
              </v-badge>
              <v-icon v-else :color="hasContent ? '#F9A826' : ''">
                mdi-comment-plus-outline
              </v-icon>
            </v-btn>
          </template>
          <span v-if="hasContent">{{
            $t('HeuristicsTable.AddCommentBtn.showComment')
          }}</span>
          <span v-else>{{
            $t('HeuristicsTable.AddCommentBtn.addComment')
          }}</span>
        </v-tooltip>
        <v-tooltip v-else location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn icon v-bind="tooltipProps" @click="show = !show">
              <v-icon>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('HeuristicsTable.AddCommentBtn.hideTextArea') }}</span>
        </v-tooltip>
      </v-col>

      <v-col v-if="show" cols="12" class="py-0">
        <!-- Existing Comments Display -->
        <div
          v-if="showComments && !openByDefault && allComments.length > 0"
          class="mb-3"
        >
          <v-chip size="small" color="primary" variant="tonal" class="mb-2">
            <v-icon start size="small">mdi-comment-multiple</v-icon>
            {{ allComments.length }}
            {{
              allComments.length === 1
                ? $t('common.comment')
                : $t('common.comments')
            }}
          </v-chip>
          <v-card
            v-for="(comment, index) in allComments"
            :key="comment.id"
            variant="outlined"
            class="mb-2 pa-2"
          >
            <v-row align="center" no-gutters>
              <v-col cols="10">
                <v-textarea
                  v-if="editingCommentId === comment.id"
                  v-model="editingCommentText"
                  variant="outlined"
                  density="compact"
                  auto-grow
                  rows="2"
                  :disabled="disable"
                  @keydown.escape="cancelEditComment"
                />
                <div v-else class="text-body-2">
                  {{ comment.text }}
                </div>
              </v-col>
              <v-col cols="2" class="text-right">
                <template v-if="editingCommentId === comment.id">
                  <v-btn
                    icon="mdi-check"
                    variant="text"
                    size="small"
                    color="success"
                    :disabled="disable"
                    @click="saveEditComment(comment.id, index)"
                  />
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    color="grey"
                    :disabled="disable"
                    @click="cancelEditComment"
                  />
                </template>
                <template v-else>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="x-small"
                    color="primary"
                    :disabled="disable"
                    @click="startEditComment(comment)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="x-small"
                    color="error"
                    :disabled="disable"
                    @click="openDeleteCommentDialog(comment.id, index)"
                  />
                </template>
              </v-col>
            </v-row>
            <div
              v-if="comment.createdAt && comment.createdAt > 0"
              class="text-caption text-grey mt-1"
            >
              {{ formatDate(comment.createdAt) }}
            </div>
          </v-card>
        </div>

        <!-- Add New Comment -->
        <div v-if="showComments" class="comment-input-wrap">
          <v-textarea
            v-model="newCommentText"
            class="comment-evidence-input"
            variant="solo"
            density="comfortable"
            auto-grow
            rows="4"
            :clearable="!openByDefault"
            clear-icon="mdi-close"
            :label="commentFieldLabel"
            :placeholder="commentPlaceholder"
            :disabled="disable"
            @keydown.enter.ctrl="!openByDefault && addNewComment()"
          />
          <v-btn
            v-if="openByDefault && newCommentText?.trim()"
            icon="mdi-delete-outline"
            variant="text"
            color="error"
            class="comment-clear-btn"
            :disabled="disable"
            @click="clearDraftComment"
          />
        </div>
        <v-btn
          v-if="showComments && !openByDefault && newCommentText?.trim()"
          size="default"
          color="primary"
          variant="flat"
          class="mb-3 text-none comment-save-btn"
          :disabled="disable || !newCommentText?.trim()"
          @click="addNewComment"
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ $t('HeuristicsTable.AddCommentBtn.addComment') }}
        </v-btn>

        <v-divider
          v-if="
            showComments &&
            !openByDefault &&
            showImages &&
            (allImages.length > 0 || allComments.length > 0)
          "
          class="my-3"
        />

        <!-- Existing Images Display -->
        <div v-if="showImages && allImages.length > 0" class="mb-3">
          <v-chip size="small" color="primary" variant="tonal" class="mb-2">
            <v-icon start size="small">mdi-file-image-outline</v-icon>
            {{ allImages.length }}
            {{
              allImages.length === 1 ? $t('common.image') : $t('common.images')
            }}
          </v-chip>
          <v-row>
            <v-col
              v-for="(image, index) in allImages"
              :key="image.id"
              cols="6"
              sm="4"
              md="3"
            >
              <v-card variant="outlined" class="image-card">
                <video
                  v-if="isVideoMedia(image)"
                  :src="image.url"
                  class="media-thumbnail cursor-pointer"
                  controls
                  @click="openImagePreview(image)"
                />
                <v-img
                  v-else
                  :src="image.url"
                  height="150"
                  cover
                  class="cursor-pointer"
                  @click="openImagePreview(image)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  size="x-small"
                  color="error"
                  class="delete-image-btn"
                  :disabled="disable"
                  @click="openDeleteImageDialog(image.id, index)"
                />
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Add New Image -->
        <ImageImport
          v-if="showImages"
          :heuristic-id="heuristicIdForImage"
          :question-id="questionIdForImage"
          :question-index="questionIndex"
          :test-id="testIdForImage"
          :disable="disable"
          @image-uploaded="handleImageUploaded"
        />
      </v-col>
    </v-row>

    <v-dialog v-model="imagePreviewDialog" max-width="800">
      <v-card>
        <video
          v-if="previewMediaType?.startsWith('video/')"
          :src="previewImageUrl"
          class="preview-video"
          controls
          autoplay
        />
        <v-img v-else :src="previewImageUrl" max-height="600" cover />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="imagePreviewDialog = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <ConfirmDialog
    v-model:show="showDeleteCommentDialog"
    :title="$t('HeuristicsTable.AddCommentBtn.deleteCommentTitle')"
    :message="$t('HeuristicsTable.AddCommentBtn.deleteCommentMessage')"
    :confirm-text="$t('common.delete')"
    :cancel-text="$t('buttons.cancel')"
    confirm-color="error"
    confirm-icon="mdi-delete"
    icon="mdi-alert-circle-outline"
    icon-color="error"
    type="error"
    @confirm="confirmDeleteComment"
    @cancel="cancelDeleteComment"
  />

  <ConfirmDialog
    v-model:show="showDeleteImageDialog"
    :title="$t('HeuristicsTable.ImportImage.deleteImageTitle')"
    :message="$t('HeuristicsTable.ImportImage.deleteImageMessage')"
    :confirm-text="$t('common.delete')"
    :cancel-text="$t('buttons.cancel')"
    confirm-color="error"
    confirm-icon="mdi-delete"
    icon="mdi-alert-circle-outline"
    icon-color="error"
    type="error"
    @confirm="confirmDeleteImage"
    @cancel="cancelDeleteImage"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import ImageImport from '@/ux/Heuristic/components/ImportImage.vue'
import { useCommentImage } from '@/ux/Heuristic/composables/useCommentImage'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'

const props = defineProps({
  answerHeu: { type: Object, default: () => ({}), required: true },
  heurisIndex: { type: Number, default: 0 },
  questionIndex: { type: Number, default: 0 },
  disable: { type: Boolean, default: false, required: false },
  openByDefault: { type: Boolean, default: false },
  commentLabel: { type: String, default: '' },
  commentPlaceholder: { type: String, default: '' },
  showComments: { type: Boolean, default: true },
  showImages: { type: Boolean, default: true },
})

const emit = defineEmits([
  'updateComment',
  'updateImage',
  'addComment',
  'updateCommentById',
  'removeComment',
  'addImage',
  'removeImage',
])

const store = useStore()
const { t } = useI18n()
const test = computed(() => store.getters.test || {})
const showDeleteCommentDialog = ref(false)
const selectedCommentToDelete = ref(null)
const showDeleteImageDialog = ref(false)
const selectedImageToDelete = ref(null)

const openDeleteCommentDialog = (commentId, index) => {
  selectedCommentToDelete.value = {
    id: commentId,
    index,
  }

  showDeleteCommentDialog.value = true
}

const confirmDeleteComment = () => {
  if (!selectedCommentToDelete.value) return

  handleRemoveComment(
    selectedCommentToDelete.value.id,
    selectedCommentToDelete.value.index,
  )

  showDeleteCommentDialog.value = false
  selectedCommentToDelete.value = null
}

const cancelDeleteComment = () => {
  showDeleteCommentDialog.value = false
  selectedCommentToDelete.value = null
}

const openDeleteImageDialog = (imageId, index) => {
  selectedImageToDelete.value = {
    id: imageId,
    index,
  }

  showDeleteImageDialog.value = true
}

const confirmDeleteImage = () => {
  if (!selectedImageToDelete.value) return

  handleRemoveImage(
    selectedImageToDelete.value.id,
    selectedImageToDelete.value.index,
  )

  showDeleteImageDialog.value = false
  selectedImageToDelete.value = null
}

const cancelDeleteImage = () => {
  showDeleteImageDialog.value = false
  selectedImageToDelete.value = null
}

const {
  show,
  newCommentText,
  editingCommentId,
  editingCommentText,
  imagePreviewDialog,
  previewImageUrl,
  previewMediaType,
  allComments,
  allImages,
  hasContent,
  totalItemCount,
  formatDate,
  addNewComment,
  startEditComment,
  cancelEditComment,
  saveEditComment,
  removeComment: handleRemoveComment,
  handleImageUploaded,
  removeImage: handleRemoveImage,
  openImagePreview,
  isVideoMedia,
  clearDraftComment,
} = useCommentImage(props, emit)

if (props.openByDefault) {
  show.value = true
}

const heuristicIdForImage = computed(() =>
  (props.heurisIndex ?? '0').toString(),
)
const questionIdForImage = computed(() =>
  (props.answerHeu?.heuristicId ?? '0').toString(),
)
const testIdForImage = computed(() => test.value?.id || '')

const commentFieldLabel = computed(() => {
  if (props.openByDefault) return ''
  if (props.commentLabel) return props.commentLabel
  return allComments.value.length > 0
    ? t('HeuristicsTable.AddCommentBtn.addAnotherComment')
    : t('common.comment')
})
</script>

<style scoped>
.image-card {
  position: relative;
}

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.cursor-pointer {
  cursor: pointer;
}

.media-thumbnail {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: #071829;
}

.preview-video {
  display: block;
  width: 100%;
  max-height: 600px;
  background: #071829;
}

.comment-input-wrap {
  position: relative;
}

.comment-clear-btn {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  z-index: 2;
}

.comment-evidence-input :deep(.v-field) {
  border: 1px solid rgba(0, 33, 63, 0.14);
  border-radius: 8px;
  background: #fff !important;
  box-shadow: none;
}

.comment-evidence-input :deep(.v-field--focused) {
  border-color: #00213f;
  box-shadow: 0 0 0 3px rgba(0, 33, 63, 0.08);
}

.comment-evidence-input :deep(.v-field__input) {
  min-height: 136px;
  padding-top: 1rem;
  font-size: 1rem;
  line-height: 1.55;
}

.comment-evidence-input :deep(.v-label) {
  display: none;
}

.comment-save-btn {
  min-width: 132px;
}
</style>
