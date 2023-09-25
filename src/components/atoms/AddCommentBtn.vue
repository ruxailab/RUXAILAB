<template>
  <div>
    <v-row justify="center" align="center">
      <v-col cols="11" class="py-0">
        <slot name="answer" />
      </v-col>
      <v-col cols="1" class="mb-6 py-0">
        <v-tooltip v-if="!show" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" @click="show = !show" v-on="on">
              <v-icon :color="answerHeu.heuristicComment ? '#F9A826' : ''">
                mdi-comment-plus-outline
              </v-icon>
            </v-btn>
          </template>
          <span v-if="answerHeu.heuristicComment">{{ $t('AddCommentBtn.showComment') }}</span>
          <span v-else>{{ $t('AddCommentBtn.addComment') }}</span>
        </v-tooltip>
        <v-tooltip v-else bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" @click="show = !show" v-on="on">
              <v-icon>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('AddCommentBtn.hideTextArea') }}</span>
        </v-tooltip>
      </v-col>

      <v-col cols="12" class="py-0">
        <v-textarea
          v-if="show"
          v-model="answerHeu.heuristicComment"
          outlined
          dense
          auto-grow
          clearable
          clear-icon="mdi-close"
          :label="$t('common.comment')"
          @change="updateComment"
        />
        <ImageImport
          v-if="show"
          :heuristic-id="this.test.testStructure[heurisIndex]"
          :question-id="this.answerHeu.heuristicId"
          :test-id="this.$store.getters.test.id"
          @imageUploaded="handleImageUploaded"
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
      require: true,
    },
    heurisIndex: {
      type: Number,
    },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
  watch: {
    heurisIndex() {
      this.show = false //close comment when changing heuristic
    },
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
