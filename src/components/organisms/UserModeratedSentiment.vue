<template>
  <div v-if="usersID">
    <!-- {{ testDocument }}

    <h1>qq</h1>
    {{answersDocument}}

    <h1>aa</h1>
    {{ selectedAnswerDocument }} -->

    <!-- {{ usersID }} -->

    <ShowInfo title="Sentiment Analysis">
      <div slot="content">
        <v-card flat class="task-container">
          <v-row class="ma-0 pa-0">
            <!-- Evaluators List -->
            <v-col class="ma-0 pa-0 task-list" cols="3">
              <v-list dense class="list-scroll">
                <v-subheader>Evaluators</v-subheader>
                <v-divider />
                <v-list-item-group v-model="userSelect" color="#fca326">
                  <v-list-item v-for="(item, i) in usersID" :key="i">
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

              {{ selectedAnswerSentimentDocument }}

    

              <!-- Audio Wave -->
              <AudioWave 
                :file="selectedAnswerDocument.cameraUrlEvaluator" 
                :regions="selectedAnswerSentimentDocument ? selectedAnswerSentimentDocument.regions || [] : []" 
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



    <!-- <v-overlay :value="overlay">
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
    </v-snackbar> -->
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
    userSelect: 0, // Index of the selected answer [Based on the usersID array]
    usersID: [], // Array of users IDs
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
      if (this.usersID.length > 0 && this.userSelect !== null) {
        return this.answersDocument[this.usersID[this.userSelect]]
      }
      return null
    },
  },

  created() {
    // Reset usersID array in case created is called multiple times
    this.usersID = []
    // Check if answersDocument is not empty
    if (this.answersDocument) {
      // Iterate over the keys of the answersDocument object
      Object.keys(this.answersDocument).forEach((key, index) => {
        // populate the usersID array
        this.usersID.push(this.answersDocument[key].userDocId)
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
        console.log('Fetching Sentiment Document..............................')
        if (this.selectedAnswerDocument) {
            const answerDocId = this.testDocument.answersDocId;
            const userDocId = this.usersID[this.userSelect];
            
            try {
                // Try to get the sentiment document
                let result = await audioSentimentController.getByAnswerDocIdandUserDocId(answerDocId, userDocId);
                
                if (!result) {
                    // Document does not exist, create it
                    console.warn(`Sentiment document for answerDocId ${answerDocId} and userDocId ${userDocId} does not exist. Creating new document.`);
                    const payload = {
                        answerDocId: answerDocId,
                        userDocId: userDocId,
                        regions: [] // Initialize with an empty array or default value
                    };
                    result = await audioSentimentController.create(payload);
                    console.warn(`Created new sentiment document with ID ${result.id}.`);
                }

                // Set the result to the selectedAnswerSentimentDocument
                this.selectedAnswerSentimentDocument = result;

            } catch (error) {
                this.selectedAnswerSentimentDocument = null;
                console.error('Error fetching sentiment document:', error);
            }
        } else {
            this.selectedAnswerSentimentDocument = null;
        }
    },


    // Analyze the timestamp of the selected answer [AI Service]
    async analyzeTimeStamp() {
      console.log('Analyzing Timestamp..............................')
      // // 1. Create Sentiment Object in Firestore
      // const answerDocId = this.testDocument.answersDocId
      // console.log(answerDocId)

      // const userDocId = this.usersID[this.userSelect]
      // console.log(userDocId)

      // try {  
      //   const res = await audioSentimentController.create({
      //     answerDocId:answerDocId,
      //     userDocId:userDocId,
      //   })

      //   console.log('Sentiment Document Created:', res)

      // } catch (err) {
      //   console.error(err.message)

      // } finally {
      // }

      //  // Add this Region to the sentiment document for the selected answer [Firebase]
      // const answerSentimentDocId = this.selectedAnswerSentimentDocument.id
      // console.log(answerSentimentDocId)

      // const res = await audioSentimentController.addSentimentRegion(answerSentimentDocId,"a")



      // Show the overlay
      this.overlay = !this.overlay

      axios.post('http://localhost:5000/test', 
      {
        url: this.selectedAnswerDocument.cameraUrlEvaluator,
        start_time: this.newRegion.start,
        end_time: this.newRegion.end,
        whisper_model_size:"base",
        
      }).then(async(response) => {
        // Hide the overlay
        this.overlay = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='success'
        this.snackbar['text']='Analysis Completed'


        const utterances_sentiment = response.data.utterances_sentiment
        // console.log(utterances_sentiment)      
        
//         0
// : 
// confidence
// : 
// 0.7347357273101807
// sentiment
// : 
// "POS"
// text
// : 
// " Hello, good morning, Karen. How are you?"
// timestamp
// : 
// (2) [0, 4]
// [[Prototype]]
// : 
// Object


        // Add this Region to the sentiment document for the selected answer [Firebase]
        const answerSentimentDocId = this.selectedAnswerSentimentDocument.id
        console.log(answerSentimentDocId)

       
        for (const utterance of utterances_sentiment) {
          const res = await audioSentimentController.addSentimentRegion(answerSentimentDocId,
            {
              "start": utterance.timestamp[0],
              "end": utterance.timestamp[1],
              "transcript": utterance.text,
              "sentiment": utterance.sentiment,
              "confidence": utterance.confidence
            }
          )
        }

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
