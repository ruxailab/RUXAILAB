<template>
  <div>
    <v-row
      justify="start"
      align="center"
    >
      <v-col
        cols="10"
        sm="11"
        class="py-0"
      >
        <slot name="answer" />
      </v-col>
      <v-col
        cols="1"
        class="mb-6 py-0"
      >
        <v-tooltip
          v-if="!show"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              icon
              v-bind="props"
              @click="show = !show"
            >
              <v-icon :color="answerHeu.heuristicComment ? '#F9A826' : ''">
                mdi-comment-plus-outline
              </v-icon>
            </v-btn>
          </template>
          <span v-if="answerHeu.heuristicComment">{{
            $t('HeuristicsTable.AddCommentBtn.showComment')
          }}</span>
          <span v-else>{{
            $t('HeuristicsTable.AddCommentBtn.addComment')
          }}</span>
        </v-tooltip>
        <v-tooltip
          v-else
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              icon
              v-bind="props"
              @click="show = !show"
            >
              <v-icon>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('HeuristicsTable.AddCommentBtn.hideTextArea') }}</span>
        </v-tooltip>
      </v-col>

      <v-col
        cols="12"
        class="py-0"
      >
        <v-textarea
          v-if="show"
          v-model="localComment"
          variant="outlined"
          density="compact"
          auto-grow
          clearable
          clear-icon="mdi-close"
          :label="$t('common.comment')"
          @update:model-value="updateComment"
          :disabled="disable"
        />
        <ImageImport
          v-if="show"
          :heuristic-id="test.testStructure[heurisIndex]"
          :question-id="answerHeu.heuristicId"
          :test-id="store.getters.test.id"
          @image-uploaded="handleImageUploaded"
          :disable="disable"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import ImageImport from '@/ux/Heuristic/components/ImportImage.vue'

const props = defineProps({
  answerHeu: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  heurisIndex: {
    type: Number,
    default: 0,
  },
  disable: {
    type: Boolean,
    default: false,
    required: false
  }
})

const emit = defineEmits(['updateComment'])

const store = useStore()

const show = ref(false)
const localComment = ref('')

const test = computed(() => store.getters.test)
const hasContent = computed(
  () => props.answerHeu.heuristicComment || props.answerHeu.answerImageUrl
)

watch(
  () => props.heurisIndex,
  () => {
    show.value = false
    localComment.value = props.answerHeu.heuristicComment || ''
  }
)

watch(
  () => props.answerHeu.heuristicComment,
  (newVal) => {
    localComment.value = newVal || ''
    if (newVal && !show.value) {
      show.value = true
    }
  }
)

watch(
  () => props.answerHeu.answerImageUrl,
  (newVal) => {
    if (newVal && !show.value) {
      show.value = true
    }
  }
)

onMounted(() => {
  if (hasContent.value) {
    show.value = true
  }
})

const updateComment = (input) => {
  emit('updateComment', input)
}

const handleImageUploaded = (imageUrl) => {
  if (imageUrl) {
    localComment.value = ''; 
    emit('updateComment', '', props.heurisIndex, props.answerHeu.heuristicId)
  }
};
</script>