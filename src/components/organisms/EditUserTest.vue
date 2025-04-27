<template>
  <v-container class="flow-container" fluid>
    <v-progress-linear
      :value="progress"
      height="8"
      color="#FCA326"
      class="mb-6"
      rounded
      striped
      indeterminate="false"
    ></v-progress-linear>

    <v-col cols="12">
      <v-card rounded="xxl" class="step-card" v-if="currentStep === 0">
        <v-card-title class="subtitleView">
          {{ $t('UserTestTable.titles.consentForm') }}
        </v-card-title>
        <v-divider />
        <v-row justify="center">
          <v-col cols="10">
            <UserConsent @input="updateData" />
            <v-alert type="info" dense class="tip-alert">
              💡 Tip: Please read the consent form carefully before proceeding.
            </v-alert>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xxl" class="step-card" v-else-if="currentStep === 1">
        <v-card-title class="subtitleView">
          {{ $t('UserTestTable.titles.userVariables') }}
        </v-card-title>
        <v-divider />
        <v-row justify="center">
          <v-col cols="10">
            <UserVariables @input="updateData" />
            <v-alert type="info" dense class="tip-alert">
              💡 Tip: Please complete all the fields honestly.
            </v-alert>
          </v-col>
        </v-row>
      </v-card>

      <ListTasks
        v-else-if="currentStep === 2"
        :tasks="object.itemsTasks"
        @input="updateData"
        hide-timer
      />

      <v-card rounded="xxl" class="step-card" v-else-if="currentStep === 3">
        <v-card-title class="subtitleView">
          {{ $t('UserTestTable.titles.postForm') }}
        </v-card-title>
        <v-divider />
        <v-row justify="center">
          <v-col cols="10">
            <FormPostTest @input="updateData" />
            <v-alert type="info" dense class="tip-alert">
              💡 Tip: Thank you for your feedback!
            </v-alert>
          </v-col>
        </v-row>
      </v-card>

      <v-btn
        class="mt-8 next-btn"
        color="#FCA326"
        large
        rounded
        @click="nextStep"
      >
        {{ currentStep < 3 ? 'Next' : 'Finish' }}
      </v-btn>
    </v-col>
  </v-container>
</template>

<script>
import ListTasks from '@/components/molecules/ListTasks'
import FormPostTest from '@/components/atoms/FormPostTest'
import UserVariables from '@/components/atoms/UserVariables'
import UserConsent from '@/components/atoms/UserConsent'

export default {
  components: {
    ListTasks,
    UserVariables,
    UserConsent,
    FormPostTest,
  },
  props: {
    object: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      currentStep: 0,
    }
  },
  computed: {
    progress() {
      return (this.currentStep + 1) * 25
    },
    testStructure() {
      return this.$store.state.Tests.Test.testStructure
    },
  },
  mounted() {
    if (this.testStructure.postTest) {
      this.$store.dispatch('setPostTest', this.testStructure.postTest)
    }
    if (this.testStructure.preTest) {
      this.$store.dispatch('setPreTest', this.testStructure.preTest)
    }
    if (this.testStructure.consent) {
      this.$store.dispatch('setConsent', this.testStructure.consent)
    }
    window.openedTab = window.open(location.href, '_blank')
  },
  beforeDestroy() {
    if (window.openedTab) {
      window.openedTab.close()
    }
  },
  methods: {
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++
      } else {
        this.$emit('finished')
      }
    },
    updateData(data) {
      if (this.currentStep === 0) {
        this.$store.dispatch('setConsent', data)
      } else if (this.currentStep === 1) {
        this.$store.dispatch('setPreTest', data)
      } else if (this.currentStep === 2) {
        this.$store.dispatch('setTasks', data)
      } else if (this.currentStep === 3) {
        this.$store.dispatch('setPostTest', data)
      }
    },
  },
}
</script>

<style scoped>
.flow-container {
  min-height: 100vh;
  background-color: #f5f7ff;
  padding-top: 24px;
}
.step-card {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.subtitleView {
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  color: #222;
}
.tip-alert {
  margin-top: 16px;
  font-size: 14px;
}
.next-btn {
  display: block;
  margin: 0 auto;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>

