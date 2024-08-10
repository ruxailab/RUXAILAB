<template>
  <div v-if="answers">
    {{testDocument}}
    {{ answersDocument }}
    <!-- <h3>aaaaaaa</h3> -->
    <!-- {{ answers }} -->
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
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-divider vertical inset />

            <!-- Answer Sentiment -->
            <v-col class="ma-0 pa-1 answer-list" cols="9">
              <!-- Co-operators -->
               <div>Copoprators</div>

              <!-- Audio Wave -->
              <AudioWave :file="selectedAnswerDocument.cameraUrlEvaluator" />

              <!-- Transcript -->
               <div>Transcript</div>


              <v-btn color="orange" @click="creatSentimenteObject">
                Create Object
              </v-btn>  
              aaa: {{ selectedAnswerDocument }}




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


// Controller
import AudioSentimentController from '@/controllers/AudioSentimentController';
// import answerController from '@/controllers/AnswerController';

const audioSentimentController = new AudioSentimentController()

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

    // cameraUrlEvaluator() {
    //   if (this.answers.length > 0 && this.answerSelect !== null) {
    //     const selectedAnswer = this.answersDocument[
    //       this.answers[this.answerSelect]
    //     ]
    //     return selectedAnswer.cameraUrlEvaluator
    //   }
    //   return null
    // },

    selectedAnswerDocument() {
      if (this.answers.length > 0 && this.answerSelect !== null) {
        return this.answersDocument[this.answers[this.answerSelect]]
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


    async creatSentimenteObject() {
      // console.log("testDocument",this.testDocument)
      // console.log("answersDocument",this.answersDocument)

      // console.log("answers",this.answers)

      // console.log(this.selectedAnswerDocument)


      // // 1. Create Sentiment Object in Firestore
      // const answerDocId = this.answers[this.answerSelect]

      // try {  
      //   const res = await audioSentimentController.create({
      //     answerDocId:answerDocId,
      //   })

      // } catch (err) {
      //   console.error(err.message)

      // } finally {
      // }


      // // 2. Get Sentiment Object from Firestore
      // const answerDocId = this.answers[this.answerSelect]

      // try {  
      //   const res = await audioSentimentController.getById(answerDocId)

      //   console.log("res",res)

      // } catch (err) {
      //   console.error(err.message)

      // } finally {
      // }


      // // 3. Add Result to Sentiment Object in Firestore
      // const answerDocId = this.answers[this.answerSelect]

      // try {  
      //   const res = await audioSentimentController.addRegionSentiment(answerDocId,
      //     {
      //       "start": 0,
      //       "end": 10,
      //       "transcript": "I am happy",
      //       "sentiment": "positive",
      //       "score": 0.9
      //     }
      //   )

      // } catch (err) {
      //   console.error(err.message)

      // } finally {
      // }






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
