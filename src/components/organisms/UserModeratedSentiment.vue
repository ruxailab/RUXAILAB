<template>
  <div v-if="answers">
    {{ answersDocument }}
    <h3>aaaaaaa</h3>
    {{ answers }}
    <ShowInfo title="Sentiment Analysis">
      <div slot="content">
        <v-card flat class="task-container">
          <v-row class="ma-0 pa-0">
            <!-- Evaluators List -->
            <v-col class="ma-0 pa-0 task-list" cols="3">
              <v-list dense class="list-scroll">
                <v-subheader>Evaluators</v-subheader>
                <v-divider />
                <v-list-item-group v-model="answerSelect" color="#fca326">
                  <v-list-item v-for="(item, i) in answers" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ getCooperatorEmail(item) }}
                        <!-- {{ item }}/{{ getCooperatorEmail(item) }} -->
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-divider vertical inset />

            <!-- Answer Sentiment -->
            <v-col class="ma-0 pa-1 answer-list" cols="9">
              <h5>Sentiment Preview</h5>
              <h5>{{ answerSelect }}</h5>
              <!-- Upper -->

              <!-- Audio Wave -->
              <AudioWave />
              <!-- <AudioWave :file="cameraUrlEvaluator" /> -->
              <!-- <h4>{{ cameraUrlEvaluator }}</h4> -->

              <!-- Transcript -->

              <!-- <v-data-table :headers="dataHeaders" :items="taskAnswers">
                <template v-slot:item.userDocId="{ item }">
                  <span>{{ getCooperatorEmail(item.userDocId) }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn color="orange" text @click="viewAnswers(item)">
                    Show Answers
                  </v-btn>
                </template>
              </v-data-table> -->
            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>

    <!-- User Moderated Sentiment -->
    <!-- <h5>{{ testAnswerDocument.type }}</h5> -->
    <!-- <h4>{{ answers.length }}</h4> -->
    <!-- <h4>{{ answers }}</h4> -->
    <!-- Audio Wave -->
    <!-- <AudioWave /> -->

    <!-- Transcripts -->
    <!-- <TranscriptGridView /> -->

    <!-- <template> -->
    <!-- Answer Body -->
    <!-- </template> -->
  </div>
</template>

<script>
// Components
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import AudioWave from '@/components/molecules/AudioWave.vue'
// import TranscriptGridView from './TranscriptGridView.vue'

export default {
  components: {
    ShowInfo,
    AudioWave,
    // TranscriptGridView,
  },
  data: () => ({
    answerSelect: 0,
    answers: [],
  }),
  computed: {
    testDocument() {
      return this.$store.getters.test
    },
    answersDocument() {
      if (!this.$store.getters.testAnswerDocument) {
        return {}
      }
      return this.$store.getters.testAnswerDocument.taskAnswers
    },
    cameraUrlEvaluator() {
      if (this.answers.length > 0 && this.answerSelect !== null) {
        const selectedAnswer = this.answersDocument[
          this.answers[this.answerSelect]
        ]
        return selectedAnswer.cameraUrlEvaluator
      }
      return null
    },
  },

  created() {
    // Reset answers array in case created is called multiple times
    this.answers = []
    // Check if answersDocument is not empty
    if (this.answersDocument) {
      // Iterate over the keys of the answersDocument object
      Object.keys(this.answersDocument).forEach((key, index) => {
        // Populate the answers array
        this.answers.push(this.answersDocument[key].userDocId)
      })
    }
  },

  methods: {
    getCooperatorEmail(userDocId) {
      let cooperatorEmail = null
      if (
        this.testDocument.cooperators &&
        Array.isArray(this.testDocument.cooperators)
      ) {
        for (const element of this.testDocument.cooperators) {
          if (element && element.email && element.userDocId === userDocId) {
            cooperatorEmail = element.email
          }
        }
      }
      return cooperatorEmail
    },
  },
}
</script>

<style>
.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.list-scroll {
  height: 508px;
  overflow: auto;
}

/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}

/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
  /* background: #515069; */
}
</style>
