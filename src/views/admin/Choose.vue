<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">What kind of test are you looking to start?</p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        

        

        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Testing"
            type="Category"
            segund-type="TESTING"
            :texts="['User Testing', 'A/B Testing', 'Eye-Tracking']"
            @click="navigateToTest('testing')"
          />
        </v-col>

        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Inspection"
            type="Category"
            segund-type="INSPECTION"
            :texts="['Heuristic Evaluation', 'Cognitive Walkthrough', 'Automated Evaluations']"
            @click="navigateToTest('inspection')"
          />
        </v-col>

        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Inquiry"
            type="Category"
            segund-type="INQUIRY"
            :texts="['Interviews', 'Focus Groups', 'Surveys & Questionnaires']"
            @click="navigateToTest('inquiry')"
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
    font-size: 28px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .outermost {
    height: auto;
  }

  .titles {
    font-size: 32px;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px;
  }
}
</style>
