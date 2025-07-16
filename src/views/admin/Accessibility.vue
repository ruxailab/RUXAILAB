<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          Accessibility Testing Types
        </p>
      </v-row>
    </v-col>
    <v-col 
    cols="12" 
    class="mt-6">
      <v-row>
        <v-col cols="10" 
        md="4" 
        sm="10" 
        class="card">
          <CardTypeTest
            :img="require('../../../public/human.svg')"
            title="Manual Testing"
            type="Accessibility"
            segund-type="MANUAL"
            :texts="[
              'Human testers follow accessibility guidelines',
              'Use of assistive technologies',
              'Detects contextual and usability issues',
            ]"
            @click="setTestType('MANUAL')"
          />
        </v-col>
        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/human.svg')"
            title="Automatic Testing"
            type="Accessibility"
            segund-type="AUTOMATIC"
            :texts="[
              'Automated tools scan for common issues',
              'Quick feedback and workflow integration',
              'Ideal for WCAG violations and regression',
            ]"
            @click="setTestType('AUTOMATIC')"
          />
        </v-col>
        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/human.svg')"
            title="AI Powered Testing"
            type="Accessibility"
            segund-type="AI"
            :texts="[
              'AI analyzes with machine learning',
              'Finds complex and contextual issues',
              'Intelligent remediation suggestions',
            ]"
            @click="navigateToTest('aipowered')"
          />
        </v-col>
      </v-row>
    </v-col>
  </div>

  <CreateTestNameDialog
    :is-open="nameDialog"
    :test-type="testType"
    :heading="
      testType === 'AUTOMATIC'
        ? 'Create Automatic Accessibility Test'
        : 'Create Manual Accessibility Test'
    "
    :sub-heading="
      testType === 'AUTOMATIC'
        ? 'Please provide a name and description for your automatic accessibility test'
        : 'Please provide a name and description for your accessibility test'
    "
    :test-name="'Test Name'"
    :test-description="'Test Description'"
    :test-label="'Create Test'"
    @close="nameDialog = false"
  />
</template>

<script setup>
import CardTypeTest from '@/components/atoms/CardTypeTest'
import CreateTestNameDialog from '@/components/dialogs/CreateTestNameDialog.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const nameDialog = ref(false)
const testType = ref('')

const setTestType = (type) => {
  testType.value = type
  if (type === 'MANUAL') {
    nameDialog.value = true
    console.log('Manual test type selected')
  }
  if (type === 'AUTOMATIC') {
    nameDialog.value = true
    console.log('Automatic test type selected')
  } else {
    navigateToTest(type.toLowerCase())
  }
}

const navigateToTest = (type) => {
  testType.value = type
  console.log('Navigating to test:', type)
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

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.card-desc {
  font-size: 1rem;
  color: #444;
}

/* Responsive styles similar to Choose.vue */
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
