<template>
  <div>
    <!-- testDocument: {{ testDocument }} -->
    <!-- testAnswerDocument : {{ testAnswerDocument }} -->
    usersID : {{ usersID }}
    selectedUserID : {{ selectedUserID }}
    selectedAnswerDocument : {{ selectedAnswerDocument }}
    selectedAnswerSentiment : {{ selectedAnswerSentiment }} 
    <div v-if="usersID" slot="content">
      <v-card flat class="task-container">
        <v-row class="ma-0 pa-0">

          <!------------------------------------------------------------------------------------------------------------------------->
          <!--------------------------------------------- Answers List [Left] ------------------------------------------------------->
          <!------------------------------------------------------------------------------------------------------------------------->
          <v-col class="ma-0 pa-0 task-list" cols="3">
            <v-list dense class="list-scroll">
              <v-subheader>Evaluators</v-subheader>
              <v-divider />

                <v-list-item-group v-model="selectedUserID" color="#fca326">
                <v-list-item v-for="(item, i) in usersID" :key="i" :value="item">
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ getCooperatorEmail(item) }}
                      <!-- {{ item }} -->
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-col>

          <!------------------------------------------------------------------------------------------------------------------------->
          <!--------------------------------------------- Vertical Line [Split] ----------------------------------------------------->
          <!------------------------------------------------------------------------------------------------------------------------->

          <v-divider vertical inset />

          <!------------------------------------------------------------------------------------------------------------------------->
          <!---------------------------------------------------------- Body [Right] ------------------------------------------------->
          <!------------------------------------------------------------------------------------------------------------------------->
          <v-col class="ma-0 pa-1 answer-list" cols="9" v-if="selectedAnswerDocument">
            <!-- Co-operators -->              
            <ModeratedTestCard
            :moderator="{ name: testDocument ? testDocument.testAdmin.email : '<Error>' }"
            :evaluator="{ name: selectedAnswerDocument ? getCooperatorEmail(selectedAnswerDocument.userDocId) : '<Error>' }"
            />   

            <!-- Audio Wave -->
            <AudioWave 
              ref="audioWave"
              :file="selectedAnswerDocument.cameraUrlEvaluator" 
              :regions="selectedAnswerSentiment ? selectedAnswerSentiment.regions || [] : []" 
              :activeRegion.sync="activeRegion"
            />


            <!-- Audio Wave End Banner-->
            <v-row class="align-center justify-space-between pa-3">
              <!-- Left Text -->
              <v-col cols="12" md="8">
                <span class="text--secondary caption">
                  Drag the sliders to adjust the start and end points or enter the exact times in the input fields.
                </span>
              </v-col>

              <!-- Right Controls -->
              <v-col cols="12" md="4" class="text-right">
                <v-btn color="orange" class="white--text" @click="analyzeTimeStamp()">
                  + Analyze
                </v-btn>
              </v-col>
            </v-row>


            <!-- Segments Transcripts Sentiment -->
            <SentimentTranscriptsList
            :playSegment="playSegmentInAudioWave"
            :regions="selectedAnswerSentiment ? selectedAnswerSentiment.regions || [] : []" 
            :deleteRegion="deleteRegion"
            />

          </v-col>  

        </v-row>
      </v-card>
    </div>       
    
      
    <v-overlay :value="overlay.visible" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        {{  overlay.text }}
      </div>
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
import ModeratedTestCard from '@/components/molecules/ModeratedTestCard.vue';
import AudioWave from '@/components/molecules/AudioWave.vue'
import SentimentTranscriptsList from './SentimentTranscriptsList.vue';

// Controllers
import AudioSentimentController from '@/controllers/AudioSentimentController';

// Init audioSentimentController
const audioSentimentController = new AudioSentimentController();

export default {
  components: {
    ModeratedTestCard,
    AudioWave,
    SentimentTranscriptsList,
  },
  mounted() {
    console.log("Component is mounted!"); // Similar to useEffect(() => {}, [])
  },
  data() {
    // like useState in React
    return {
      selectedUserID: null, // Will store the selected user ID [use]
      
      selectedAnswerSentiment : null, // the sentiment state for the selectedUserID
      
      // Active Region Data
      activeRegion:{
        start:0,
        end:5,
      },

      // State Management
      overlay : {
        visible:false,
        text:""
      },
      snackbar: {
        visible: false,
        text: '',
        color: '' // Use a valid color name or hex code
      },
    };
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
    async fetchSelectedAnswerSentiment() {
      // console.log('Fetching Sentiment Document..............................');

      const answerDocId = this.testDocument.answersDocId;
      const userDocId = this.selectedUserID;

      try {
        let result = await audioSentimentController.getByAnswerDocIdandUserDocId(answerDocId, userDocId);
        if (!result) {
          console.warn(`Sentiment document for answerDocId ${answerDocId} and userDocId ${userDocId} does not exist. Creating new document.`);
          const payload = {
            answerDocId: answerDocId,
            userDocId: userDocId,
          };
          result = await audioSentimentController.create(payload);
          console.warn(`Created new sentiment document with ID ${result.id}.`);
        }
        this.selectedAnswerSentiment = result;
      } catch (error) {
        console.error('Error fetching sentiment document:', error);
        this.selectedAnswerSentiment = null;
      }
    },
    
    playSegmentInAudioWave(start, end) {
      this.$refs.audioWave.playSegment(start, end)
    },

    
    async deleteRegion(region) {
      // Confirm the deletion
      if (!confirm('Are you sure you want to delete this region?')) return;
      
      // Show the overlay
      this.overlay = {
        visible:true,
        text:"Deleting..."
      }

      try{
        // Delete Region in firestore :D
        const result = await audioSentimentController.deleteSentimentRegion(this.selectedAnswerSentiment.id, region.idx);
        
        // Fetch the updated sentiment document
        await this.fetchSelectedAnswerSentiment();
        
        // Hide the overlay
        this.overlay['visible'] = false
        
        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='success'
        this.snackbar['text']='Region Deleted Successfully'
      }
      catch(error){
        console.error('Error deleting region:', error);

        // Hide the overlay
        this.overlay = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='error'
        this.snackbar['text']='Error Deleting Region'
      }
    },

  
    // Analyze the timestamp of the selected answer [AI Service]
    async analyzeTimeStamp() {
      console.log('Analyzing Timestamp..............................', this.activeRegion.start, this.activeRegion.end)

      // Show the overlay
      this.overlay = {
        visible:true,
        text:"Analyzing..."
      }

      // Call Backend
      try {
        const response = await axios.post('http://localhost:8001/audio-transcript-sentiment/process', 
          {
            url: this.selectedAnswerDocument.cameraUrlEvaluator,
            start_time_ms: this.activeRegion.start * 1000.0, // Convert to milli seconds
            end_time_ms: this.activeRegion.end * 1000.0, // Convert to milli seconds
          });

        // Check if API returned a successful status
        if (!response.data || response.data.status !== 'success') {
          throw new Error(`API Error: ${response.data?.error || 'Unknown error'}`);
        }
        
        // Extract Data
        const data = response.data.data
        console.log('Analysis Completed', data)

        const utterances_sentiment = data.utterances_sentiment
        // console.log(utterances_sentiment)

        // Add this Region to the sentiment document for the selected answer [Firebase]
        const answerSentimentDocId = this.selectedAnswerSentiment.id
        // console.log(answerSentimentDocId)

        for (const utterance of utterances_sentiment) {
          const res = await audioSentimentController.addSentimentRegion(answerSentimentDocId,
            {
              "start": utterance.timestamp[0]+this.activeRegion.start,
              "end": utterance.timestamp[1]+this.activeRegion.start,
              "transcript": utterance.text,
              "sentiment": utterance.label,
              "confidence": utterance.confidence
            }
          )
        }

        // Fetch the updated sentiment document
        await this.fetchSelectedAnswerSentiment()

        // Hide the overlay
        this.overlay['visible'] = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='success'
        this.snackbar['text']='Analysis Completed'
      } 
      catch(error) {
        // Hide the overlay
        this.overlay['visible'] = false

        // Show the snackbar
        this.snackbar['visible']=true
        this.snackbar['color']='error'
        this.snackbar['text']='Analysis Failed'
      
        // Log the error
        console.error("error",error)
      }
    }
  },
  computed: {
    // In Vue, computed properties are similar to derived state in React. They automatically update when their dependencies change, just like useMemo in React.
    testDocument() {
      return this.$store.getters.test // Derived state
    },

    testAnswerDocument() {
      return this.$store.getters.testAnswerDocument.taskAnswers; // Access the store getter
    },

    usersID() {
    return Object.values(this.testAnswerDocument).map(answer => answer.userDocId);
    },

    // Compute selectedAnswerDocument based on selectedUserID
    selectedAnswerDocument() {
      return this.testAnswerDocument[this.selectedUserID] || null;
    },
  },

  watch: {
    selectedUserID: {
      immediate: true, // Runs when the component is mounted
      async handler(newUserId) {
        if (!newUserId) return;

        this.fetchSelectedAnswerSentiment();
      },
    },
  },
};
</script>


<style>
.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-weight: 600;
}
.list-scroll {
  height: 508px;
  overflow: auto;
}
.list-scroll::-webkit-scrollbar {
  width: 7px;
}
.list-scroll::-webkit-scrollbar-track {
  background: none;
}
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>
