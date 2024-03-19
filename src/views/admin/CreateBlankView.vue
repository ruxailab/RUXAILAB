<template>
  <div style="height: 93vh; background-color: #f9f5f0;">
    <v-col cols="12">
      <v-row justify="center">
        <span class="Titles ma-16"
          >What kind of test are you looking to start?</span
        >
      </v-row>
    </v-col>
    <v-col cols="12" class="mt-6">
      <v-row justify="center">
        <v-col cols="1"></v-col>
        <v-col cols="4">
          <CardComponent
            :height="350"
            title="Usability Heuristic"
            subtitle="Test"
            feature1="Usability Percentage"
            feature2="Final Report PDF"
            feature3="Invite specialists to evaluate your application"
            imageSrc="../../../public/specialist.png"
            :handleClick="() => handleTestType('HEURISTICS')"
          />
        </v-col>
        <v-col cols="1"></v-col>
        <v-col class="" cols="4">
          <CardComponent
            :height="350"
            title="Usability User"
            subtitle="Test"
            feature1="Webcam, audio & screen record"
            feature2="Enhanced answer analysis"
            feature3="Moderated or non moderated tests"
            imageSrc="../../../public/user.png"
            :handleClick="() => handleTestType('User')"
          />
        </v-col>
        <v-col cols="1"></v-col>
      </v-row>
    </v-col>
    <TestCreationDialog
      :dialog="dialog"
      @close="dialog = false"
      @validate="validate"
    />
    <UserTestDialog
      :dialogUser="dialogUser"
      @close="dialogUser = false"
      @choose-user-moderated="chooseUserModerated"
    />
  </div>
</template>

<script>
import CardComponent from '@/components/molecules/CardComponent.vue'
import TestCreationDialog from '@/components/molecules/TestCreationDialog.vue'
import UserTestDialog from '@/components/molecules/UserTestDialog.vue'

export default {
  components: {
    CardComponent,
    TestCreationDialog,
    UserTestDialog,
  },
  data() {
    return {
      dialog: false,
      dialogUser: false,
      test: {
        testTitle: '',
        testDescription: '',
        testType: '',
        userTestType: '',
        userTestStatus: {},
      },
    }
  },
  methods: {
    handleTestType(type) {
      this.test.testType = type
      this.dialog = true
    },
    chooseUserModerated() {
      this.test.userTestType = 'moderated'
      this.test.userTestStatus = {
        user: false,
        moderator: false,
        consentStatus: 'open',
        preTestStatus: 'closed',
        postTestStatus: 'closed',
      }
      this.validate()
    },
    async validate() {
      if (this.test.testTitle.length > 0) {
        if (this.test.testType === 'User' && !this.dialogUser) {
          this.dialog = false
          this.dialogUser = true
        } else {
          this.submit()
        }
      } else {
        this.$toast.warning('Please enter a title')
      }
    },
    async submit() {
      const test = {
        ...this.test,
        id: null,
        creationDate: Date.now(),
        updateDate: Date.now(),
      }

      // Assuming dispatch action returns test id
      const testId = await this.$store.dispatch('createNewTest', test)

      // Redirect to manager view
      this.$router.push(`/managerview/${testId}`)
    },
  },
}
</script>

<style scoped>
.Titles {
  font-family: 'Poppins', Helvetica;
  font-size: 38px;
  font-style: normal;
  text-align: center;
  font-weight: 600;
  line-height: initial;
  background: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
