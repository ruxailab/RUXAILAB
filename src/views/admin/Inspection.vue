<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          What kind of inspection test are you looking to start?
        </p>
      </v-row>
    </v-col>

    <v-col
      cols="12"
      class="mt-6"
    >
      <v-row>
        <v-col
          cols="10"
          md="5"
          sm="10"
          class="card"
        >
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Usability Heuristic"
            type="Test"
            segund-type="HEURISTICS"
            :texts="[
              'Usability Percentage',
              'Final Report PDF',
              'Invite specialists to evaluate your application'
            ]"
            @click="() => setTestType('HEURISTICS')"
          />
        </v-col>

        <v-col
          cols="10"
          md="5"
          sm="10"
          class="card"
        >
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

        <v-col
          cols="10"
          md="5"
          sm="10"
          class="card"
        >
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/specialist.png')"
              title="Guided Walkthrough"
              type="Test"
              segund-type="GUIDED"
              :texts="['Step-by-step simulation of typical tasks']"
              :disabled="true"
            />
          </div>
        </v-col>

        <v-col
          cols="10"
          md="5"
          sm="10"
          class="card"
        >
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="Automated Evaluation"
              type="Test"
              segund-type="AUTOMATED"
              :texts="[
                'Use of tools to verify accessibility or detect errors'
              ]"
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
      :sub-heading="$t('TestDialog.sub-heading')"
      :test-name="$t('TestDialog.test-name')"
      :test-description="$t('TestDialog.test-description')"
      :test-label="$t('TestDialog.test-label')"
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
  padding: 1rem;
  box-sizing: border-box;
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
  flex-wrap: nowrap;
  max-width: 100%;
}

.card {
  flex: 1 1 23%;
  display: flex;
  flex-direction: column;
  padding: 0.1rem;
  overflow: hidden;
  word-wrap: break-word;
}

/* Media Queries para Responsividade */

/* Telas pequenas (≤ 600px) */
@media (max-width: 600px) {
  .outermost {
    padding: 0.5rem;
  }

  .titles {
    font-size: clamp(20px, 5vw, 28px);
    margin: 1rem 0;
  }
}

@media (max-width: 1264px) {
  .card {
    padding: 0.25rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 1360px) {
  .cards-container {
    flex-wrap: wrap;
  }

  .card {
    padding: 0.5rem;
    margin-bottom: 1.5rem;
  }
}

/* Desktop (961px e acima) */
@media (min-width: 961px) {
  .outermost {
    padding: 2rem;
  }

  .titles {
    font-size: clamp(32px, 5vw, 38px);
  }

  .card {
    padding: 1rem;
    margin-bottom: 2rem;
  }
}
</style>
