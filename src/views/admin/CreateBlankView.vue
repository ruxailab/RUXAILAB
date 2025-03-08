<template>
  <div class="outermost">
    <div class="content-container">
      <h1 class="title">{{ $t('Createblank.title') }}</h1>
      
      <div class="cards-container">
        <div class="card-wrapper">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('Createblank.testType_1.testTitle')"
            :type="$t('Createblank.test')"
            segund-type="HEURISTICS"
            :texts="$t('Createblank.testType_1.text')"
            @click="setTestType"
          />
        </div>

        <div class="card-wrapper">
          <CardTypeTest
            :img="require('../../../public/user.png')"
            :title="$t('Createblank.testType_2.testTitle')"
            :type="$t('Createblank.test')"
            segund-type="User"
            :texts="$t('Createblank.testType_2.text')"
            @click="setTestType"
          />
        </div>
      </div>
    </div>

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
  min-height: 100vh;
  background-color: #f9f5f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.title {
  font-size: 38px;
  text-align: center;
  font-weight: 600;
  color: #f99726;
  margin-bottom: 40px;
  padding: 0 20px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  width: 100%;
}

.card-wrapper {
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
}

/* Mobile styles */
@media (max-width: 600px) {
  .outermost {
    padding: 10px;
  }
  
  .title {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  .cards-container {
    gap: 20px;
  }
  
  .card-wrapper {
    width: 100%;
  }
}

/* Tablet styles */
@media (min-width: 601px) and (max-width: 1024px) {
  .title {
    font-size: 32px;
  }
  
  .card-wrapper {
    width: calc(50% - 15px);
    min-width: 280px;
  }
}

/* Ensuring minimum height on smaller screens */
@media (max-height: 700px) {
  .outermost {
    min-height: 100vh;
  }
}
</style>