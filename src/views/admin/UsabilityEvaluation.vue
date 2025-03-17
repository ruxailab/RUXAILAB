<!-- Desc -> It'll allow users to select a category (Inspection, Inquiry, or Testing) and then choose from available methodologies (for now, only "Testing" and "Heuristic Evaluation" is active) -->

<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          {{ $t('UsabilityEvaluation.title') }}
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        <v-col cols="12" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('UsabilityEvaluation.testType_1.testTitle')"
            :type="$t('UsabilityEvaluation.test')"
            segund-type="TESTING"
            :texts="$t('UsabilityEvaluation.testType_1.text')"
            @click="navigateToTest('testing')"
          />
        </v-col>

        <v-col cols="12" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('UsabilityEvaluation.testType_2.testTitle')"
            :type="$t('UsabilityEvaluation.test')"
            segund-type="INSPECTION"
            :texts="$t('UsabilityEvaluation.testType_2.text')"
            @click="navigateToTest('inspection')"
          />
        </v-col>

        <v-col cols="12" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('UsabilityEvaluation.testType_3.testTitle')"
            :type="$t('UsabilityEvaluation.test')"
            segund-type="INQUIRY"
            :texts="$t('UsabilityEvaluation.testType_3.text')"
            @click="navigateToTest('inquiry')"
          />
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
    navigateToTest(type) {
      this.testType = type
      this.$router.push(`/${type}`)
    },
  },
}
</script>

<style scoped>
.outermost {
  height: 93vh;
  background-color: #f9f5f0;
}

.titles {
  font-size: 38px;
  text-align: center;
  font-weight: 600;
  color: #f99726;
}

.card {
  margin: auto;
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .outermost {
    height: auto;
  }

  .titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
}
</style>
