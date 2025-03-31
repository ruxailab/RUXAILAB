<template>
  <div>
    <!-- testDocument: {{ testDocument }} -->
    <!-- testAnswerDocument : {{ testAnswerDocument }} -->
    usersID : {{ usersID }}
    selectedUserID : {{ selectedUserID }}
    selectedAnswerDocument : {{ selectedAnswerDocument }}
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
                :regions="selectedAnswerSentimentDocument ? selectedAnswerSentimentDocument.regions || [] : []" 
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
// const audioSentimentController = new AudioSentimentController();

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

      // Region Data
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
    }
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
