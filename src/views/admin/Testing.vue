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
      <v-row>
        <!-- Active Card: User Testing -->
        <v-col cols="10" md="5" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            title="Usability User"
            type="Test"
            segund-type="User"
            :texts="['Webcam, audio & screen record', 'Enhanced answer analysis', 'Moderated or non moderated tests']"
            @click="setTestType"
          />
        </v-col>

        <!-- Inactive Card: A/B Testing -->
        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
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
        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
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
        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
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

.card {
  margin: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
}

.inactive-card {
  opacity: 0.6;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.inactive-message {
  font-size: 14px;
  color: #888;
  text-align: center;
  margin-top: 10px;
  font-style: italic;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card img {
  max-width: 40px;
}

@media (max-width: 600px) {
  .card {
    padding: 0.5rem;
    text-align: center;
    max-width: 100%;
  }

  .titles {
    font-size: 28px;
  }

  .card img {
    max-width: 30px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .card {
    padding: 1rem;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px;
  }
}
</style>
