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
      <v-row justify="center">
        <v-col cols="12" sm="6" md="4" lg="3" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Usability Heuristic"
            type="Test"
            segund-type="HEURISTICS"
            :texts="['Usability Percentage', 'Final Report PDF', 'Invite specialists to evaluate your application']"
            @click="setTestType"
          />
        </v-col>

        <v-col cols="12" sm="6" md="4" lg="3" class="card">
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

        <v-col cols="12" sm="6" md="4" lg="3" class="card">
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

        <v-col cols="12" sm="6" md="4" lg="3" class="card">
          <div class="inactive-card">
            <CardTypeTest
              :img="require('../../../public/user.png')"
              title="Automated Evaluation"
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

.card {
  padding: 0.5rem;
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

  .card {
    padding: 0.25rem;
    margin-bottom: 1rem;
  }
}

/* Tablets (601px - 960px) */
@media (min-width: 601px) and (max-width: 960px) {
  .outermost {
    padding: 1rem;
  }

  .titles {
    font-size: clamp(24px, 5vw, 32px);
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