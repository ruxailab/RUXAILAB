<template>
  <div>
    <!-- testDocument: {{ testDocument }} -->
    <!-- testAnswerDocument : {{ testAnswerDocument }} -->
    usersID : {{ usersID }}
    selectedUserID : {{ selectedUserID }}
    selectedAnswerDocument : {{ selectedAnswerDocument }}
    selectedAnswerSentiment : {{ selectedAnswerSentiment }} 
    <div v-if="usersID">
      <div slot="content">
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

            </v-col>  

          </v-row>
        </v-card>
      </div>            
    </div>

  </div>
</template>

<script>
// // External Libraries
// import axios from 'axios'

// import ShowInfo from '@/components/organisms/ShowInfo.vue';
// import AudioSentimentController from '@/controllers/AudioSentimentController';

// Components
import ModeratedTestCard from '@/components/molecules/ModeratedTestCard.vue';
import AudioWave from '@/components/molecules/AudioWave.vue'


// Controllers
import AudioSentimentController from '@/controllers/AudioSentimentController';

// Init audioSentimentController
const audioSentimentController = new AudioSentimentController();

export default {
  components: {
    ModeratedTestCard,
    AudioWave,
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
      }
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
