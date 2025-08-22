<template>
  <v-row>
    <!-- Consent Form -->
    <v-col cols="8">
      <CardForm title="Consent Form" subtitle="This is a Consent Checkbox with a text for confirm the consentiment">
        <InputTextEditTest :value="preTest.consent" label="Consent Form..." :rows="3"
          @input="preTest.consent = $event; onChange()" />
      </CardForm>
    </v-col>

    <!-- Right Menu -->
    <v-col cols="4" class="pl-0" style="height: 19vh;">
      <!-- Welcom Message -->
      <CardForm title="Welcome Message"
        subtitle="This message will be the first thing participants see before the session is started.">
        <InputTextEditTest :value="preTest.welcomeMessage" label="Thank you for participating..." :rows="3"
          @input="preTest.welcomeMessage = $event; onChange()" />
      </CardForm>

      <!-- Landing Page -->
      <CardForm class="mt-2" title="Landing Page"
        subtitle="This URL will automatically load when participants starts session.">
        <InputTextEditTest :value="preTest.landingPage" label="URL" :rows="1"
          @input="preTest.landingPage = $event; onChange()" />
      </CardForm>
    </v-col>

    <!-- Pre Form -->
    <v-col cols="8" class="pt-0 pb-0">
      <CardForm title="Pre-Form" subtitle="This is a pre-questions you make to get participants data">
        <VariableManager @onChange="changeVariables" :value="preTest.preForm" />
      </CardForm>
    </v-col>
  </v-row>
</template>

<script>
import CardForm from '@/components/molecules/CardForm'
import InputTextEditTest from '@/components/atoms/InputTextEditTest'
import VariableManager from '@/components/molecules/VariableManager'

export default {
  components: {
    CardForm,
    InputTextEditTest,
    VariableManager,
  },

  data: () => ({
    preTest: {
      consent: '',
      landingPage: '',
      // participantCamera: '',
      preForm: [],
      welcomeMessage: '',
    }
  }),

  computed: {
    test() {
      return this.$store.getters.test
    },

    testStructure() {
      return this.$store.getters.testStructure
    },
  },

  created() {
    if (!this.testStructure) {
      this.$store.commit('SET_TEST_STRUCTURE', this.test.testStructure)
    }

    const { consent = '', welcomeMessage = '', landingPage = '', preForm = [] } = this.testStructure || {}
    this.preTest.preForm = preForm
    this.preTest.consent = consent
    this.preTest.landingPage = landingPage
    this.preTest.welcomeMessage = welcomeMessage
  },

  methods: {
    onChange() {
      this.$store.commit('SET_TEST_STRUCTURE', this.preTest)
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },

    changeVariables(variables) {
      this.preTest.preForm = variables
      this.onChange()
    },
  }
}
</script>
