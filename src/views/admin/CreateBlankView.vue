<template>
  <div class="outermost">
    <v-col cols="12">
      <v-row justify="center">
        <span class="Titles ma-16">What kind of test are you looking to start?</span>
      </v-row>
    </v-col>
    <v-col cols="12" class="mt-6">
      <v-row class="cardsContainer">
        <!-- <v-col cols="1"></v-col> -->
        <v-col cols="12" md="6" sm="10" class="card">
          <v-card
            hover
            color="white"
            class="cards ml-5 mr-5 group"
            height="350"
            @click=";(test.testType = 'HEURISTICS'), (dialog = true)"
          >
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10 insideCards"
                height="50"
                width="50"
              >
                <v-img
                  class="ma-2"
                  style="z-index: 0"
                  src="../../../public/specialist.png"
                />
              </v-sheet>
              <div class="mt-6">
                <span class="cardsTitle ml-4">Usability Heuristic</span>
                <br>
                <span class="cardSubtitle ml-4"> Test </span>
              </div>
            </v-row>
            <v-divider />
            <v-row class="mt-1">
              <v-sheet class="ml-10 mt-8 mb-8 circle" />
              <span class="cardInternTitles ml-3 mt-8">Usability Percentage</span>
            </v-row>
            <v-row>
              <v-sheet class="ml-10 mb-8 circle" />
              <span class="cardInternTitles ml-3">Final Report PDF</span>
            </v-row>
            <v-row>
              <v-sheet class="ml-10 mb-8 circle" />
              <span class="cardInternTitles ml-3">Invite specialists to evaluate your application</span>
            </v-row>
          </v-card>
        </v-col>
        <!-- <v-col cols="1"></v-col> -->
        <v-col cols="12" md="6" sm="10" class="card">
          <v-card
            hover
            color="white"
            class="cards ml-5 mr-5"
            height="350"
            @click=";(test.testType = 'User'), (dialog = true)"
          >
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10 insideCards"
                height="50"
                width="50"
              >
                <v-img
                  class="ma-3"
                  style="z-index: 0"
                  src="../../../public/user.png"
                />
              </v-sheet>
              <div class="mt-6">
                <span class="cardsTitle ml-4">Usability User</span>
                <br>
                <span class="cardSubtitle ml-4"> Test </span>
              </div>
            </v-row>
            <v-divider />
            <v-row class="mt-1">
              <v-sheet class="ml-10 mt-8 mb-8 circle" />
              <span class="cardInternTitles ml-3 mt-8">Webcam, audio & screen record</span>
            </v-row>
            <v-row>
              <v-sheet class="ml-10 mb-8 circle" />
              <span class="cardInternTitles ml-3">Enhanced answer analysis</span>
            </v-row>
            <v-row>
              <v-sheet class="ml-10 mb-8 circle" />
              <span class="cardInternTitles ml-3">Moderated or non moderated tests</span>
            </v-row>
          </v-card>
        </v-col>
        <!-- <v-col cols="1"></v-col> -->
      </v-row>
    </v-col>
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card color="#f9f5f0">
        <v-btn
          icon
          dark
          fab
          color="red"
          fixed
          right
          class="mt-6 mr-2 arrowBack"
          @click="dialog = false"
        >
          <v-icon x-large>
            mdi-arrow-u-left-bottom
          </v-icon>
        </v-btn>
        <v-row align="center" justify="center" class="cardRow">
          <v-col cols="10" class="mt-16 ml-auto">
            <span class="Titles ml-5">Test Creation</span>
            <br>
            <span class="cardSubtitle ml-5">Add a name to your test!</span>
          </v-col>
          <v-col class="ml-auto mr-auto" cols="auto">
            <v-card
              color="white"
              style="border-radius: 20px !important"
              height="480"
            >
              <v-col cols="11">
                <div class="mt-4">
                  <span class="cardInternTitles ml-6">Test Name</span>
                </div>
                <v-text-field
                  v-model="test.testTitle"
                  class="ml-6 mt-3"
                  label="Test Name"
                  outlined
                  color="orange"
                  @change="$store.commit('SET_LOCAL_CHANGES', true)"
                />
                <span class="cardInternTitles ml-6">Test Description</span>
                <v-textarea
                  v-model="test.testDescription"
                  outlined
                  color="orange"
                  class="ml-6 mt-3"
                  label="Test Description"
                  @change="$store.commit('SET_LOCAL_CHANGES', true)"
                />
                <v-row>
                  <v-checkbox
                    v-model="test.isPublic"
                    class="ml-10 mt-8"
                    color="orange"
                    label="Turn this test public to all users"
                  />
                  <v-btn
                    dark
                    fab
                    large
                    color="orange"
                    class="ml-auto mt-4 mr-2 circleOrange"
                    @click="validate()"
                  >
                    <v-icon x-large>
                      mdi-arrow-right
                    </v-icon>
                  </v-btn>
                </v-row>
              </v-col>
            </v-card>
          </v-col>
          <v-col cols="5" class="imageColumn">
            <img
              height="500"
              draggable="false"
              src="../../../public/createSVG.svg"
              alt="Test Creation image"
            >
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- DIALOG USER -->

    <v-dialog
      v-model="dialogUser"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card color="#f9f5f0">
        <v-btn
          icon
          dark
          fab
          color="red"
          fixed
          right
          class="mt-6 mr-2"
          @click="dialogUser = false"
        >
          <v-icon x-large>
            mdi-arrow-u-left-bottom
          </v-icon>
        </v-btn>
        <v-col cols="12">
          <v-row justify="center">
            <span class="Titles mt-16 mb-8">What kind of test are you looking to start?</span>
          </v-row>
        </v-col>
        <v-col cols="12" class="mt-6">
          <v-row justify="center">
            <v-col cols="1" />
            <v-col cols="4">
              <v-card
                hover
                color="white"
                class="cards ml-5 mr-5 group"
                height="520"
                @click=";(test.userTestType = 'unmoderated'), validate()"
              >
                <v-row>
                  <div class="mt-6">
                    <span class="Titles ml-10">SelfTest</span>
                    <br>
                    <span class="cardSubtitle2 ml-10"> UNMODERATED </span>
                  </div>
                </v-row>
                <img
                  style="margin-left: 80px"
                  class="mt-5 mb-2"
                  height="230"
                  draggable="false"
                  src="../../../public/SelfTest.svg"
                  alt="Test Creation image"
                >
                <v-row class="mt-1">
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Answer on free time</span>
                </v-row>
                <v-row>
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Enhanced answer analysis</span>
                </v-row>
                <v-row>
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Task Customization</span>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col cols="4">
              <v-card
                disabled
                hover
                color="white"
                class="cards ml-5 mr-5"
                height="520"
                @click="chooseUserModerated()"
              >
                <v-row>
                  <div class="mt-6">
                    <span class="Titles ml-10">LiveTest </span>
                    <br />
                    <span class="cardSubtitle2 ml-10">
                      MODERATED (Coming soon...)</span
                    >
                  </div>
                </v-row>
                <img
                  style="margin-left: 80px"
                  class="mt-5 mb-2"
                  height="230"
                  draggable="false"
                  src="../../../public/LiveTest.svg"
                  alt="Test Creation image"
                >
                <v-row class="mt-1">
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Webcam, audio & screen record</span>
                </v-row>
                <v-row>
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Enhanced answer analysis</span>
                </v-row>
                <v-row>
                  <v-sheet
                    class="ml-13 mb-8 circle"
                    height="20"
                    width="20"
                  />
                  <span class="cardInternTitles ml-3">Moderated live test</span>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="1" />
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TestAdmin from '@/models/TestAdmin'
import Test from '@/models/Test'
import Vue from 'vue'

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
        Vue.$toast.warning('Please enter a title')
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
.circle {
  height: 20px;
  width: 20px;
}
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
.cardRow {
  display: flex;
  flex-wrap: wrap;
}

.imageColumn {
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  margin: auto;
}
.cardsContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.cardsTitle {
  font-family: 'Poppins', Helvetica;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  max-height: 23px;
  background-color: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardSubtitle2 {
  color: rgba(139, 149, 156, 0.64);
  font-family: 'Poppins', Helvetica;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardInternTitles {
  max-width: 270px;
  font-family: 'Poppins', Helvetica;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.cards {
  border-radius: 20px !important;
}
.cards :hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}
.insideCards {
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(236, 62, 27, 0.404) 1%,
    rgba(240, 152, 25, 0.3) 97.63%
  );
  z-index: 10;
}
.circle {
  border-radius: 24px;
  background: linear-gradient(
    90deg,
    rgba(255, 80, 45, 0.514) 1%,
    rgba(240, 150, 25, 0.432) 97.63%
  );
}

/* Responsive styles */
@media (max-width: 600px) {
  .Titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }
  .cardRow {
    flex-direction: column;
    align-items: center;
  }
  .cardsContainer {
    flex-direction: column;
  }
  .cardsTitle {
    font-size: 16 px;
  }
  .cardSubtitle {
    font-size: 15px;
  }
  .cardSubtitle2 {
    font-size: 16px;
  }
  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }
  .circle {
    height: 10px;
    width: 10px;
  }
  .circleOrange {
    margin-top: 10px;
  }

  .cards {
    height: 250px; /* Adjust card height for smaller screens */
  }

  .mt-6 {
    margin-top: 30px; /* Adjust margin for smaller screens */
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .cardRow {
    flex-direction: column;
    align-items: center;
  }
  .outermost {
    height: auto;
  }
  .Titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }
  .cardsContainer {
    flex-direction: column;
  }

  .cards {
    height: 300px; /* Adjust card height for medium screens */
    width: 100%;
  }

  .mt-6 {
    margin-top: 40px; /* Adjust margin for medium screens */
  }
}

@media (min-width: 1160px) {
  .Titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }

  .cards {
    height: 350px; /* Adjust card height for larger screens */
  }

  .mt-6 {
    margin-top: 50px; /* Adjust margin for larger screens */
  }
}
</style>

<style scoped>
.v-text-field--outlined >>> fieldset {
  border-radius: 8px;
  border: 1px solid #ffceb2;
}
</style>
