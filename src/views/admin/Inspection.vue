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
        <v-col cols="12" sm="10" md="5" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Usability Heuristic"
            type="Test"
            segund-type="HEURISTICS"
            :texts="['Usability Percentage', 'Final Report PDF', 'Invite specialists to evaluate your application']"
            @click="setTestType"
          />
        </v-col>

        <v-col cols="12" sm="10" md="5" class="card">
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

        <v-col cols="12" sm="10" md="5" class="card">
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

        <v-col cols="12" sm="10" md="5" class="card">
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
  padding: 1rem;
}

/* Ajustes para telas pequenas (até 600px) */
@media (max-width: 600px) {
  .outermost {
    padding-bottom: 1rem;
  }
  .titles {
    margin: 16px !important; /* Mantém a margem, mas sobrescreve em telas pequenas */
  }
  .card {
    padding: 0.5rem;
  }
}

/* Ajustes para telas médias (601px a 960px) */
@media (min-width: 601px) and (max-width: 960px) {
  .card {
    padding: 0.75rem;
  }
}

/* Ajustes para telas grandes (acima de 960px) */
@media (min-width: 961px) {
  .card {
    padding: 1rem;
  }
}
</style>