<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          {{ $t('Createblank.title') }}
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        <v-col cols="12" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/cardSorting.png')"
            title="Card Sorting"
            type="Test"
            segund-type="CardSorting"
            :texts="['Organize and categorize', 'Cluster analysis', 'Improve information structure']"
            @click="setTestType"
          />
        </v-col>

        <v-col cols="10" md="4" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('Createblank.testType_1.testTitle')"
            :type="$t('Createblank.test')"
            segund-type="HEURISTICS"
            :texts="$t('Createblank.testType_1.text')"
            @click="setTestType"
          />
        </v-col>
        <v-col cols="12" md="5" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            :title="$t('Createblank.testType_2.testTitle')"
            :type="$t('Createblank.test')"
            segund-type="User"
            :texts="$t('Createblank.testType_2.text')"
            @click="setTestType"
          />
        </v-col>
        <v-col cols="12" md="5" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            title="Accessibility Test"
            :type="$t('Createblank.test')"
            segund-type="Accessibility"
            :texts="$t('Createblank.testType_2.text')"
            @click="setTestType"
          />
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

<script setup>
import { ref } from 'vue';
import CardTypeTest from '@/components/atoms/CardTypeTest';
import CreateTestNameDialog from '@/components/dialogs/CreateTestNameDialog.vue';

const nameDialog = ref(false);
const testType = ref('');

const setTestType = (type) => {
  testType.value = type;
  nameDialog.value = true;
};
</script>

<style scoped>
.outermost {
  height: 100%;
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