<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16 ma-md-10 ma-sm-6">
          What kind of test are you looking to start?
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        <v-col cols="12" md="4" sm="12" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Testing"
            type="Category"
            segund-type="TESTING"
            :texts="['User Testing', 'A/B Testing', 'Eye-Tracking']"
            @click="navigateToTest('testing')"
          />
        </v-col>

        <v-col cols="12" md="4" sm="12" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Inspection"
            type="Category"
            segund-type="INSPECTION"
            :texts="['Heuristic Evaluation', 'Cognitive Walkthrough', 'Automated Evaluations']"
            @click="navigateToTest('inspection')"
          />
        </v-col>

        <v-col cols="12" md="4" sm="12" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Inquiry"
            type="Category"
            segund-type="INQUIRY"
            :texts="['Interviews', 'Focus Groups', 'Surveys & Questionnaires']"
            :disabled="true"
          />
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
    navigateToTest(type) {
      this.testType = type;
      this.$router.push(`/${type}`);  // Navigates to /inspection, /inquiry, or /testing
    },
  },
}
</script>

<style scoped>
.outermost {
  height: auto; /* Allows container to grow with content */
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

/* Adjustments for small screens (up to 600px) */
@media (max-width: 600px) {
  .titles {
    font-size: 28px; /* Reduces font size */
    margin: 16px !important; /* Overrides margin for small screens */
  }
}

/* Adjustments for medium screens (601px to 1160px) */
@media (min-width: 601px) and (max-width: 1160px) {
  .titles {
    font-size: 32px;
  }
}

/* Adjustments for large screens (above 1160px) */
@media (min-width: 1160px) {
  .titles {
    font-size: 38px;
  }
}
</style>