<template>
  <div>
    <v-row justify="start" align="center">
      <v-col cols="10" sm="11" class="py-0">
        <slot name="answer" />
      </v-col>
      <v-col cols="1" class="mb-6 py-0">
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
        <div v-if="allComments.length > 0" class="mb-3">
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
                    @click="handleRemoveComment(comment.id, index)"
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
        <v-textarea
          v-model="newCommentText"
          variant="outlined"
          density="compact"
          auto-grow
          rows="2"
          clearable
          clear-icon="mdi-close"
          :label="
            allComments.length > 0
              ? $t('HeuristicsTable.AddCommentBtn.addAnotherComment')
              : $t('common.comment')
          "
          :disabled="disable"
          @keydown.enter.ctrl="addNewComment"
        />
        <v-btn
          v-if="newCommentText?.trim()"
          size="small"
          color="primary"
          variant="tonal"
          class="mb-3"
          :disabled="disable || !newCommentText?.trim()"
          @click="addNewComment"
        >
          <v-icon start>mdi-plus</v-icon>
          {{ $t('HeuristicsTable.AddCommentBtn.addComment') }}
        </v-btn>

        <v-divider
          v-if="allImages.length > 0 || allComments.length > 0"
          class="my-3"
        />

        <!-- Existing Images Display -->
        <div v-if="allImages.length > 0" class="mb-3">
          <v-chip size="small" color="primary" variant="tonal" class="mb-2">
            <v-icon start size="small">mdi-image-multiple</v-icon>
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
                <v-img
                  :src="image.url"
                  height="150"
                  cover
                  class="cursor-pointer"
                  @click="openImagePreview(image.url)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  size="x-small"
                  color="error"
                  class="delete-image-btn"
                  :disabled="disable"
                  @click="handleRemoveImage(image.id, index)"
                />
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Add New Image -->
        <ImageImport
          :heuristic-id="heuristicIdForImage"
          :question-id="questionIdForImage"
          :test-id="testIdForImage"
          :disable="disable"
          @image-uploaded="handleImageUploaded"
        />
      </v-col>
    </v-row>

    <v-dialog v-model="imagePreviewDialog" max-width="800">
      <v-card>
        <v-img :src="previewImageUrl" max-height="600" cover />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="imagePreviewDialog = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ImageImport from '@/ux/Heuristic/components/ImportImage.vue'
import { useCommentImage } from '@/ux/Heuristic/composables/useCommentImage'

const props = defineProps({
  answerHeu: { type: Object, default: () => ({}), required: true },
  heurisIndex: { type: Number, default: 0 },
  disable: { type: Boolean, default: false, required: false },
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
const test = computed(() => store.getters.test || {})

const {
  show,
  newCommentText,
  editingCommentId,
  editingCommentText,
  imagePreviewDialog,
  previewImageUrl,
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
} = useCommentImage(props, emit)

const heuristicIdForImage = computed(() =>
  (props.heurisIndex ?? '0').toString(),
)
const questionIdForImage = computed(() =>
  (props.answerHeu?.heuristicId ?? '0').toString(),
)
const testIdForImage = computed(() => test.value?.id || '')
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
</style>
