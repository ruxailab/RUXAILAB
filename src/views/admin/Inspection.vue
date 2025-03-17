<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          {{ $t('UsabilityEvaluation.testType_2.SubTest.subTitle') }}
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row justify="center">
        <v-col cols="12" md="6" sm="6" lg="4" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="
              $t(
                'UsabilityEvaluation.testType_2.SubTest.subTestType-1.subTestTitle',
              )
            "
            :type="$t('UsabilityEvaluation.testType_2.SubTest.subTest')"
            segund-type="Heuristic"
            :texts="
              $t('UsabilityEvaluation.testType_2.SubTest.subTestType-1.text')
            "
            @click="setTestType"
          />
        </v-col>

        <v-col cols="12" md="6" sm="6" lg="4" class="card">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            :title="
              $t(
                'UsabilityEvaluation.testType_2.SubTest.subTestType-2.subTestTitle',
              )
            "
            :type="$t('UsabilityEvaluation.testType_2.SubTest.subTest')"
            segund-type="Cognitive walkthrough"
            :texts="
              $t('UsabilityEvaluation.testType_2.SubTest.subTestType-2.text')
            "
            :class="{ disabled: isDisabled }"
            @click="!isDisabled && setTestType"
          />
        </v-col>
        <v-col cols="12" md="6" sm="6" lg="4" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="
              $t(
                'UsabilityEvaluation.testType_2.SubTest.subTestType-3.subTestTitle',
              )
            "
            :type="$t('UsabilityEvaluation.testType_2.SubTest.subTest')"
            segund-type="Guided walkthrough"
            :texts="
              $t('UsabilityEvaluation.testType_2.SubTest.subTestType-3.text')
            "
            :class="{ disabled: isDisabled }"
            @click="!isDisabled && setTestType"
          />
        </v-col>

        <v-col cols="12" md="6" sm="6" lg="4" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="
              $t(
                'UsabilityEvaluation.testType_2.SubTest.subTestType-4.subTestTitle',
              )
            "
            :type="$t('UsabilityEvaluation.testType_2.SubTest.subTest')"
            segund-type="Auto Evaluation"
            :texts="
              $t('UsabilityEvaluation.testType_2.SubTest.subTestType-4.text')
            "
            :class="{ disabled: isDisabled }"
            @click="!isDisabled && setTestType"
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
    isDisabled: true, // Set to false when enabling the feature
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
  width: 100%;
  max-width: 400px;
  padding: 10px;
  margin: auto;
}

.disabled {
  pointer-events: none;
  opacity: 0.5; /* Dim to indicate it's disabled */
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }
  .card {
    max-width: 100%; /* Full width on small screens */
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .outermost {
    height: auto;
  }

  .titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }

  .card {
    max-width: 90%;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
}
</style>
