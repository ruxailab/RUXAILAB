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
        />
        <ImageImport
          v-if="show"
          :heuristic-id="test.testStructure[heurisIndex]"
          :question-id="answerHeu.heuristicId"
          :test-id="$store.getters.test.id"
          @image-uploaded="handleImageUploaded"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ImageImport from '@/components/atoms/ImportImage.vue'

export default {
  components: { ImageImport },
  props: {
    answerHeu: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    heurisIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ['updateComment'], 
  data: () => ({
    show: false,
    localComment: '', // Local state for the textarea
  }),
  computed: {
    test() {
      return this.$store.getters.test
    },
    hasContent() {
      return this.answerHeu.heuristicComment || this.answerHeu.answerImageUrl
    },
  },
  watch: {
    heurisIndex() {
      this.show = false 
      this.localComment = this.answerHeu.heuristicComment || '' // Sync local state
    },
    'answerHeu.heuristicComment'() {
      this.localComment = this.answerHeu.heuristicComment || '' // Update local state if prop changes
    },
    'answerHeu.heuristicComment'(newVal) {
      if (newVal && !this.show) {
        this.show = true
      }
    },
    'answerHeu.answerImageUrl'(newVal) {
      if (newVal && !this.show) {
        this.show = true
      }
    },
  },
  mounted() {
    if (this.hasContent) {
      this.show = true
    }
  },
  methods: {
    updateComment(input) {
      this.$emit('updateComment', input)
    },
    handleImageUploaded() {
      // Handle the image URL from the event emitted by ImportImage
      this.updateComment('')
    },
  },
}
</script>