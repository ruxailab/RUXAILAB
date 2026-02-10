<template>
  <div>
    <v-row justify="start" align="center">
      <v-col cols="10" sm="11" class="py-0">
        <slot name="answer" />
      </v-col>
      <v-col cols="1" class="mb-6 py-0">
        <v-tooltip v-if="!show" location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              v-bind="props"
              @click="show = !show"
            >
              <v-icon :color="answerHeu?.heuristicComment ? '#F9A826' : ''">
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
        <v-tooltip v-else location="bottom">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" @click="show = !show">
              <v-icon>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('HeuristicsTable.AddCommentBtn.hideTextArea') }}</span>
        </v-tooltip>
      </v-col>

      <v-col cols="12" class="py-0">
        <v-textarea
          v-if="show"
          v-model="localComment"
          variant="outlined"
          density="compact"
          auto-grow
          clearable
          clear-icon="mdi-close"
          :label="$t('common.comment')"
          :disabled="disable"
          @update:model-value="updateComment"
          @blur="handleCommentBlur"
        />
        <ImageImport
          v-if="show"
          :heuristic-id="heuristicIdForImage"
          :question-id="questionIdForImage"
          :test-id="testIdForImage"
          :disable="disable"
          @image-uploaded="handleImageUploaded"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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
    required: false,
  },
})

const emit = defineEmits(['updateComment', 'updateImage'])

const store = useStore()

const show = ref(false)
const localComment = ref('')

const test = computed(() => store.getters.test || {})
const hasContent = computed(
  () => props.answerHeu?.heuristicComment || props.answerHeu?.answerImageUrl
)

const heuristicIdForImage = computed(() => {
  const index = props.heurisIndex ?? '0';
  return index.toString();
})

const questionIdForImage = computed(() => {
  const id = props.answerHeu?.heuristicId ?? '0';
  return id.toString();
})

const testIdForImage = computed(() => {
  return test.value?.id || '';
})

const initializeLocalComment = () => {
  if (props.answerHeu?.heuristicComment) {
    localComment.value = props.answerHeu.heuristicComment;
  }
}

const handleCommentBlur = () => {
  // Trigger update when user leaves the comment field
  emit('updateComment', localComment.value);
}

watch(
  () => props.heurisIndex,
  () => {
    show.value = false
    initializeLocalComment();
  }
)

watch(
  () => props.answerHeu,
  (newVal) => {
    if (newVal?.heuristicComment !== undefined) {
      localComment.value = newVal.heuristicComment || '';
    }
    // Show the comment area if there's content
    if (hasContent.value && !show.value) {
      show.value = true;
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  initializeLocalComment();
  if (hasContent.value) {
    show.value = true
  }
  nextTick(() => {
    if(props.answerHeu?.heuristicComment){
      emit('updateComment', props.answerHeu.heuristicComment);
    }
  });
})

const updateComment = (input) => {
  localComment.value = input || '';
  emit('updateComment', input || '');
}

const handleImageUploaded = (imageUrl) => {
  if (imageUrl) {
    localComment.value = ''; 
    emit('updateComment', '');
    emit('updateImage', imageUrl);
    show.value = true;
  }
}
</script>
