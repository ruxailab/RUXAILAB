<template>
  <div :class="[theme, 'outermost']">
    <v-col cols="12">
      <v-row justify="center">
        <p class="titles ma-16">
          {{ $t('Createblank.title') }}
        </p>
      </v-row>
    </v-col>

    <v-col cols="12" class="mt-6">
      <v-row>
        <v-col cols="10" md="5" sm="10" class="card">
          <CardTypeTest
            :img="require('../../../public/specialist.png')"
            :title="$t('Createblank.testType_1.testTitle')"
            :type="$t('Createblank.test')"
            segund-type="HEURISTICS"
            :texts="$t('Createblank.testType_1.text')"
            :dark-mode="isDarkMode"
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
            :dark-mode="isDarkMode"
            @click="setTestType"
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

  computed: {
    theme() {
      return localStorage.getItem('darkMode') === 'true' ? 'dark-mode' : 'light-mode';
    },
    isDarkMode() {
      return localStorage.getItem('darkMode') === 'true';
    }
  },

  methods: {
    toggleDarkMode() {
      localStorage.setItem('darkMode', !this.isDarkMode);
      window.dispatchEvent(new Event("storage")); // Manually trigger the event
    },
    setTestType(type) {
      this.testType = type
      this.nameDialog = true
    }
  },

  mounted() {
    window.addEventListener('storage', () => this.$forceUpdate()); // Force re-render on storage change
  },

  beforeUnmount() {
    window.removeEventListener('storage', () => this.$forceUpdate());
  }
}
</script>


<style scoped>
.outermost {
  height: 93vh;
  transition: background-color 0.3s, color 0.3s;
}

.titles {
  font-size: 38px;
  text-align: center;
  font-weight: 600;
  color: #f99726;
}

.card {
  margin: auto;
  padding: 20px;
}

/* Dark Mode */
.dark-mode {
  background-color: #1e1e1e;
  color: #fff;
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

/* Dark Mode for Cards */
.dark-card {
  background-color: #333 !important;
  color: #fff !important;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
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