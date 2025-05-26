<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          What kind of test are you looking to start?
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
          md="4"
          sm="10"
          class="card"
        >
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Testing"
            type="Category"
            segund-type="TESTING"
            :texts="['User Testing', 'A/B Testing', 'Eye-Tracking']"
            @click="navigateToTest('testing')"
          />
        </v-col>

        <v-col
          cols="10"
          md="4"
          sm="10"
          class="card"
        >
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            title="Inspection"
            type="Category"
            segund-type="INSPECTION"
            :texts="['Heuristic Evaluation', 'Cognitive Walkthrough', 'Automated Evaluations']"
            @click="navigateToTest('inspection')"
          />
        </v-col>

        <v-col
          cols="10"
          md="4"
          sm="10"
          class="card"
        >
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

<script setup>
import CardTypeTest from '@/components/atoms/CardTypeTest'
import CreateTestNameDialog from '@/components/dialogs/CreateTestNameDialog.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nameDialog = ref(false)
const testType = ref('')

const navigateToTest = (type) => {
  testType.value = type;
  router.push(`/${type}`);  // Navigates to /inspection, /inquiry, or /testing
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