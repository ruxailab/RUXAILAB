<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          What kind of inspection test are you looking to start?
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        <v-col cols="10" md="5" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Usability Heuristic"
            type="Test"
            segund-type="HEURISTICS"
            :texts="['Usability Percentage', 'Final Report PDF', 'Invite specialists to evaluate your application']"
            @click="setTestType"
          />
        </v-col>

        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="Cognitive"
              type="Test"
              segund-type="COGNITIVE"
              :texts="['Analyzes the mental workload of tasks']"
              :disabled="true"
            />
          </div>
        </v-col>

        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/specialist.png')"
              title="Guided Walkthroughs"
              type="Test"
              segund-type="GUIDED"
              :texts="['Step-by-step simulation of typical tasks']"
              :disabled="true"
            />
          </div>
        </v-col>

        <v-col cols="10" md="5" sm="10" class="card">
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="Automated Evaluations"
              type="Test"
              segund-type="AUTOMATED"
              :texts="['Use of tools to verify accessibility or detect errors']"
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
}

.card {
  margin: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  word-wrap: break-word; /* Ensures text wraps */
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

@media (max-width: 600px) {
  .card {
    padding: 0.5rem; /* Reduces padding for small screens */
    text-align: center; /* Centers text inside cards */
    max-width: 100%;
  }

  .titles {
    font-size: 28px;
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
