<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          What kind of test are you looking to start?
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row class="cards-container">
        <!-- Active Card: User Testing -->
        <v-col cols="12" sm="6" md="3" lg="3" class="card">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            title="Usability User"
            type="Test"
            segund-type="User"
            :texts="['Webcam, audio & screen record', 'Enhanced answer analysis', 'Moderated or non-moderated tests']"
            @click="setTestType"
          />
        </v-col>

        <!-- Inactive Card: A/B Testing -->
        <v-col cols="12" sm="6" md="3" lg="3" class="card">
          <div>
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="A/B Testing"
              type="Test"
              segund-type="AB_TESTING"
              :texts="['Comparing two versions to measure performance']"
              :disabled="true"
            />
          </div>
        </v-col>

        <!-- Inactive Card: Eye-Tracking -->
        <v-col cols="12" sm="6" md="3" lg="3" class="card">
          <div>
            <CardTypeTest
              :img="require('../../../public/specialist.png')"
              title="Eye-Tracking"
              type="Test"
              segund-type="EYE_TRACKING"
              :texts="['Analyzing visual patterns through eye movement tracking']"
              :disabled="true"
            />
          </div>
        </v-col>

        <!-- Inactive Card: Log Analysis -->
        <v-col cols="12" sm="6" md="3" lg="3" class="card">
          <div>
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="Log Analysis"
              type="Test"
              segund-type="LOG_ANALYSIS"
              :texts="['Collecting data from real interactions']"
              :disabled="true"
            />
          </div>
        </v-col>
      </v-row>
    </v-col>

    <CreateTestNameDialog
      :is-open="nameDialog"
      :test-type="testType"
      :heading="$t('TestDialog.heading')"
      :subHeading="$t('TestDialog.sub-heading')"
      :testName="$t('TestDialog.test-name')"
      :testDescription="$t('TestDialog.test-description')"
      :testLabel="$t('TestDialog.test-label')"
      @close="nameDialog = false"
    />
  </div>
</template>

<script>
import CardTypeTest from '@/components/atoms/CardTypeTest'
import CreateTestNameDialog from '@/components/dialogs/CreateTestNameDialog.vue'

export default {
  components: {
    CardTypeTest,
    CreateTestNameDialog,
  },

  data: () => ({
    nameDialog: false,
    testType: '',
  }),

  methods: {
    setTestType(type) {
      this.testType = type
      this.nameDialog = true
    },
  },
}
</script>

<style scoped>
.outermost {
  min-height: 93vh;
  height: auto;
  background-color: #f9f5f0;
  padding-bottom: 2rem;
}

.titles {
  font-size: clamp(28px, 5vw, 38px);
  text-align: center;
  font-weight: 600;
  color: #f99726;
  margin: 0 auto;
}

.cards-container {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap; /* Ensures all cards stay in one row */
  max-width: 100%;
}

.card {
  flex: 1 1 23%; /* Ensures four cards in a row */
  display: flex;
  flex-direction: column;
  padding: 0.1rem; 
  overflow: hidden;
  word-wrap: break-word;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-content p {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  width: 100%;
  max-width: 90%;
}

/* Adjust for smaller screens */
@media (max-width: 1264px) {
  .card {
    flex: 1 1 32%;
    margin-bottom: 1rem;
  }
}

@media (max-width: 1360px) {
  .cards-container {
    flex-wrap: wrap; 
  }
  
  .card {
    flex: 1 1 45%;
  }
}

@media (max-width: 1000px) {
  .card {
    flex: 1 1 100%;
  }
}

</style>