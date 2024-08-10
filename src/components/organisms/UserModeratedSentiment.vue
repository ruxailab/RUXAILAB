<template>
  <div v-if="answers">

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
              <AudioWave 
                :file="selectedAnswerDocument.cameraUrlEvaluator" 
                :regions="selectedAnswerSentimentDocument.regions" 
                :newRegion.sync="newRegion"
              />


              <!-- Control Wave -->
              <v-btn
                color="#F9A826"
                class="white--text custom-btn"
                @click="analyzeTimeStamp()"
              >
                + Analyze
              </v-btn>

              {{ newRegion.start }} - {{ newRegion.end }}


              <!-- Transcript -->
              <div>Transcript</div>


            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>


    <v-overlay :value="overlay">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
      <h3>Analyzing ... </h3>
    </v-overlay>

    <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="4000"
    >
      {{ snackbar.text }}
      <template v-slot:action>
        <v-btn color="white" text @click="snackbar.visible = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

// External Libraries
import axios from 'axios'

// Components
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import AudioWave from '@/components/molecules/AudioWave.vue'
// import TranscriptGridView from './TranscriptGridView.vue'


// Controller
import AudioSentimentController from '@/controllers/AudioSentimentController';

const audioSentimentController = new AudioSentimentController()

export default {
  components: {
    ShowInfo,
    AudioWave,
    // TranscriptGridView,
  },
  data: () => ({
    answerSelect: 0,
    answers: [], // Array of answers IDs
    regions:[],

    selectedAnswerSentimentDocument: null,


    // New Region Data
    newRegion: {
      start: 0,
      end: 5,
    },

    // State Management
    overlay: false,
    snackbar: {
      visible: false,
      text: '',
      color: '' // Use a valid color name or hex code
    },
      
  }),
  watch: {
    selectedAnswerDocument: 'fetchSelectedAnswerSentimentDocument',
  },

  mounted() {

  },

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


    // Fetch the sentiment document for the selected answer [Firebase]
    async fetchSelectedAnswerSentimentDocument() {
      if (this.selectedAnswerDocument) {
        const answerDocId = this.answers[this.answerSelect];
        try {
          this.selectedAnswerSentimentDocument = await audioSentimentController.getById(answerDocId);
        } catch (error) {
          this.selectedAnswerSentimentDocument = null;
          console.error('Error fetching sentiment document:', error);
        }
      } else {
        this.selectedAnswerSentimentDocument = null;
      }
    },


    // Analyze the timestamp of the selected answer [AI Service]
    analyzeTimeStamp() {
      // Show the overlay
      this.overlay = !this.overlay

      axios.post('http://localhost:5000/test', 
      {
        url: this.selectedAnswerDocument.cameraUrlEvaluator,
        start_time: 0,
        end_time: 10,
        whisper_model_size:"base",
      }).then((response) => {
        // Hide the overlay
        this.overlay = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='success'
        this.snackbar['text']='Analysis Completed'


        const utterances_sentiment = response.data.utterances_sentiment
        console.log(utterances_sentiment)        
      }).catch((error) => {
        // Hide the overlay
        this.overlay = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='error'
        this.snackbar['text']='Analysis Failed'
      

        // Log the error
        console.error(error)
      })
    }
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
