<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <span class="Titles ma-16"
          >What kind of test are you looking to start?</span
        >
      </v-row>
    </v-col>
    <v-col cols="12" class="mt-6">
      <v-row class="cardsContainer">
        <!-- <v-col cols="1"></v-col> -->
        <v-col cols="12" md="6" sm="10" class="card">
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
        <!-- <v-col cols="1"></v-col> -->
        <v-col cols="12" md="6" sm="10" class="card">
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
        <!-- <v-col cols="1"></v-col> -->
      </v-row>
    </v-col>
    <TestCreationDialog :dialog="dialog" :test="test" :handleClick="validate" />
    <UserTestDialog
      :dialogUser="dialogUser"
      :test="test"
      :handleClick="validate"
      :chooseUserModerated="chooseUserModerated"
    />
  </div>
</template>

<script>
import CardComponent from '@/components/molecules/CardComponent.vue'
import TestCreationDialog from '@/components/molecules/TestCreationDialog.vue'
import UserTestDialog from '@/components/molecules/UserTestDialog.vue'
import TestAdmin from '@/models/TestAdmin'
import Test from '@/models/Test'

export default {
  data: () => ({
    dialog: false,
    dialogUser: false,
    object: {},
    test: {
      testTitle: '',
      testDescription: '',
      testType: '',
      userTestType: '',
      userTestStatus: {},
    },
    testID: null,
  }),
  computed: {
    user() {
      return this.$store.getters.user
    },
  },
  methods: {
    pushToFromTemplate() {
      this.$router.push('/fromtemplate')
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
    async submit() {
      const test = new Test({
        ...this.test,
        id: null,
        testAdmin: new TestAdmin({
          userDocId: this.user.id,
          email: this.user.email,
        }),
        creationDate: Date.now(),
        updateDate: Date.now(),
      })

      const testId = await this.$store.dispatch('createNewTest', test)
      console.log(test)

      this.sendManager(testId)
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`)
    },
    validate() {
      if (this.test.testTitle.length > 0) {
        if (this.test.testType == 'User' && this.dialogUser == false) {
          this.dialog = false
          this.dialogUser = true
        } else if (this.test.testType == 'User' && this.dialogUser == true) {
          this.submit()
        } else if (this.test.testType == 'HEURISTICS') {
          this.submit()
        }
      } else {
        this.$toast.warning('Please enter a title')
      }
    },
  },
}
</script>

<style scoped>
.outermost {
  height: 93vh;
  background-color: #f9f5f0;
}

.Titles {
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

.cardsContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.card {
  margin: auto;
}

/* Responsive styles */
@media (max-width: 600px) {
  .Titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }

  .cardsContainer {
    flex-direction: column;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .outermost {
    height: auto;
  }
  .Titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }
  .cardsContainer {
    flex-direction: column;
  }
}

@media (min-width: 1160px) {
  .Titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
}
</style>
