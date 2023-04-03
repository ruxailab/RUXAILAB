<template>
  <!-- Submit Alert Dialog -->
  <!-- <v-dialog v-model="dialog" width="600" persistent>
    <v-card>
      <v-card-title class="headline error white--text" primary-title>
        Are you sure you want to submit this test?
      </v-card-title>

      <v-card-text>
        Are you sure you want to submit your test. You can only do it
        once.
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn class="grey lighten-3" text @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn
          class="red white--text ml-1"
          text
          @click="submitLog(false), (dialog = false)"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

  <v-layout align-center justify-center class="background">
    <v-flex>
      <div>
        <v-card width="400">
          <v-flex pa-2>
            <v-card-title primary-title class="subtitleView">
              <h3 class="headline mb-2">
                Welcome to the User Test
              </h3>
            </v-card-title>

            <v-card-actions>
              <v-btn color="green" @click="startQuiz">
                START!
              </v-btn>
              <v-btn color="orange">
                More Information
              </v-btn>
            </v-card-actions>
          </v-flex>
        </v-card>
      </div>

      <!-- <div v-if="questionStage">
        <question
          :question="questions[currentQuestion]"
          :question-number="currentQuestion + 1"
          @answer="handleAnswer"
        />
      </div> -->

      <!-- <div
        v-if="resultsStage"
      >
        You got {{ correct }} right out of {{ questions.length }} questions. Your percentage is {{ perc }}%.
      </div> -->
    </v-flex>
  </v-layout>
</template>


<script>
// import ShowInfo from "@/components/organisms/ShowInfo.vue"
// import ViewTask from "@/components/molecules/ViewTask.vue"
// import AddCommentBtn from "@/components/atoms/AddCommentBtn"
// import HelpBtn from "@/components/atoms/QuestionHelpBtn"
// import VClamp from "vue-clamp"
// import Snackbar from "@/components/atoms/Snackbar"
// import CardSignIn from "@/components/atoms/CardSignIn"
// import CardSignUp from "@/components/atoms/CardSignUp"
export default {
  // components: {
  //   ShowInfo,
  //   ViewTask,
  //   AddCommentBtn,
  //   HelpBtn,
  //   VClamp,
  //   Snackbar,
    // CardSignIn,
  //   CardSignUp,
  // },
  // eslint-disable-next-line vue/require-prop-types
  props: ["id", "token"],
  data: () => ({
    questionStage: false,
    logined: null,
    selected: true,
    fromlink: null,
    drawer: true,
    start: true, //change to true
    mini: false,
    index: null,
    noExistUser: true,
    heurisIndex: 0,
    preTestIndex: null,
    items: [],
    idx: 0,
    fab: true,
    res: 0,
    dialog: false,
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard' },
      { title: 'Photos', icon: 'mdi-image' },
      { title: 'About', icon: 'mdi-help-box' },
    ],
    right: null
  }),
  computed: {
//     test() {
//       return this.$store.getters.test
//     },
//     user() {
//       if (this.$store.getters.user) this.setExistUser()
//       return this.$store.getters.user
//     },
//     answersSheet: {
//       get() {
//         if (this.user !== null && this.user !== undefined) {
//           const x = this.user.myAnswers.find((answer) => answer.id == this.id)
//           if (x) {
//             if (x.answersSheet.tasks) {
//               /* eslint-disable*/
//               this.test.answersSheet = Object.assign({}, x.answersSheet)
//               this.test.tasks = Object.assign({}, x.answersSheet.tasks)
//               return this.test.answersSheet
//             }
//             return x.answersSheet;
//           } else {
//             return this.test.answersSheet;
//           }
//         } else {
//           return null;
//         }
//       },
//       set(item) {
//         return item;
//       },
//     },
//     showBtn() {
//       if (this.answersSheet !== undefined && this.answersSheet !== null) {
//         if (!this.answersSheet.submitted) return true;
//       }
//       if (this.test.type == "User") {
//         return true;
//       }
//       return false;
//     },
//     cooperators() {
//       return this.$store.getters.cooperators;
//     },
    // loading() {
    //   return this.$store.getters.loading
    // },
  },
  watch: {
//     cooperators() {
//       if (this.cooperators && this.token) {
//         let invitation = this.cooperators.cooperators.find(
//           (coop) => coop.token == this.token
//         );
//         if (!invitation) {
//           this.$router
//             .push("/")
//             .then(() => {
//               this.$store.commit("setError", "Invalid invitation");
//             })
//             .catch(() => { });
//         }
//       }
//     },
//     test: async function () {
//       if (this.test !== null && this.test !== undefined)
//         await this.mappingSteps();
//       if (this.test && this.token) {
//         if (!this.$store.getters.cooperators)
//           this.$store.dispatch("getCooperators", {
//             id: this.test.cooperators,
//           });
//         else if (this.$store.getters.cooperators !== this.test.cooperators)
//           this.$store.dispatch("getCooperators", {
//             id: this.test.cooperators,
//           });
//       }
//     },
//     items() {
//       if (this.items.length) {
//         this.index = this.items[0].id;
//         if (this.items.find((obj) => obj.id == 0)) {
//           //se tiver preTest mexe no preTestIndex
//           this.preTestIndex = this.items[0].value[0].id;
//         }
//       }
//     },
//     heurisIndex() {
//       this.$refs.rightView.scrollTop = 0; //faz scroll pra cima qnd muda a heuristica
//     },
    async user() {
      if (this.user) {
        this.noExistUser = false
        if (this.logined) this.setTest()
      }
    },
  },
  methods: {
    startQuiz() {
      //this.introStage = false
      this.questionStage = true
      // console.log(
      //   "test" + JSON.stringify(this.questions[this.currentQuestion])
      // )
    },

//     updateAnswer() {
//       this.calcProgress();
//     },
//     mappingSteps() {
//       if (this.test.type === "User") {
//         //PreTest
//         if (this.validate(this.test.preTest.consent))
//           this.items.push({
//             title: "Pre Test",
//             icon: "mdi-checkbox-blank-circle-outline",
//             value: [
//               {
//                 title: "Consent",
//                 icon: "mdi-checkbox-blank-circle-outline",
//                 id: 0,
//               },
//             ],
//             id: 0,
//           });
//         if (this.validate(this.test.preTest.form)) {
//           if (this.items.length) {
//             this.items[0].value.push({
//               title: "Form",
//               icon: "mdi-checkbox-blank-circle-outline",
//               id: 1,
//             });
//           } else {
//             this.items.push({
//               title: "Pre Test",
//               icon: "mdi-checkbox-blank-circle-outline",
//               value: [
//                 {
//                   title: "Form",
//                   icon: "mdi-checkbox-blank-circle-outline",
//                   id: 1,
//                 },
//               ],
//               id: 0,
//             });
//           }
//         }
//         //Tasks
//         if (this.validate(this.test.tasks) && this.test.tasks.length !== 0)
//           this.items.push({
//             title: "Tasks",
//             icon: "mdi-checkbox-blank-circle-outline",
//             value: this.test.tasks.map((i) => {
//               return {
//                 title: i.name,
//                 icon: "mdi-checkbox-blank-circle-outline",
//               };
//             }),
//             id: 1,
//           });
//         //PostTest
//         if (this.validate(this.test.postTest.form))
//           this.items.push({
//             title: "Post Test",
//             icon: "mdi-checkbox-blank-circle-outline",
//             value: this.test.postTest,
//             id: 2,
//           });
//       } else if (this.test.type === "Heuristics") {
//         //Heuristics
//         if (
//           this.validate(this.test.heuristics) &&
//           this.test.heuristics.length !== 0
//         )
//           this.items.push({
//             title: "Heuristics",
//             icon: "mdi-checkbox-marked-circle-outline",
//             value: this.test.heuristics.map((i) => {
//               return {
//                 title: i.title,
//                 icon: "mdi-checkbox-marked-circle-outline",
//               };
//             }),
//             id: 1,
//           });
//       }
//     },
//     validate(object) {
//       return object !== null && object !== undefined && object !== "";
//     },
//     calcProgress() {
//       var qtd = 0;
//       if (this.answersSheet.heuristics) {
//         this.answersSheet.heuristics.forEach((h) => {
//           qtd += h.questions.filter((q) => q.res !== "").length;
//         });
//         this.answersSheet.progress = (
//           (qtd * 100) /
//           this.answersSheet.total
//         ).toFixed(1);
//       } else if (this.test.answersSheet.tasks) {
//         // TODO: Implement progress system for User Tests
//         this.answersSheet.total = this.answersSheet.tasks.length;
//         this.answersSheet.progress = 0;
//       }
//     },
//     submitLog(save) {
//       let newAnswer = this.user.myAnswers.find(
//         (answer) => answer.id == this.id
//       );
//       if (!save) newAnswer.answersSheet.submitted = true;
//       var log = {
//         date: new Date().toLocaleString("en-US"),
//         progress: this.answersSheet.progress,
//         status: this.answersSheet.progress != 100 ? "In progress" : "Completed",
//       };
//       log.status = newAnswer.answersSheet.submitted ? "Submitted" : log.status;
//       if (this.answersSheet.tasks) {
//         this.answersSheet.tasks = Object.assign({}, this.test.tasks);
//         newAnswer.answersSheet = this.answersSheet;
//       }
//       this.$store
//         .dispatch("updateLog", {
//           docId: newAnswer.reports,
//           elementId: this.user.uid,
//           element: log,
//         })
//         .then(() => {
//           if (!save) {
//             this.$store
//               .dispatch("pushAnswers", {
//                 docId: newAnswer.answers,
//                 element: Object.assign(this.answersSheet, {
//                   uid: this.user.uid,
//                   email: this.user.email,
//                 }),
//               })
//               .then(() => {
//                 this.$store.commit("setSuccess", "Test succesfully submitted");
//               })
//               .catch((err) => {
//                 this.$store.commit("setError", err);
//               });
//           }
//         });
//       newAnswer.date = new Date().toDateString();
//       this.$store
//         .dispatch("updateMyAnswers", {
//           docId: this.user.uid,
//           element: newAnswer,
//         })
//         .then(() => {
//           if (save)
//             this.$store.commit("setSuccess", "Project succesfully saved");
//         })
//         .catch((err) => {
//           if (save) this.$store.commit("setError", err);
//         });
//       if (newAnswer.answersSheet.tasks) {
//         this.$store
//           .dispatch("pushAnswers", {
//             docId: newAnswer.answers,
//             element: Object.assign(this.answersSheet, {
//               uid: this.user.uid,
//               email: this.user.email,
//             }),
//           })
//           .then(() => {
//             this.$store.commit("setSuccess", "Test succesfully submitted");
//           })
//           .catch((err) => {
//             this.$store.commit("setError", err);
//           });
//       }
//     },
//     progress(item) {
//       return (
//         (item.questions.filter((q) => q.res !== "").length * 100) / item.total
//       );
//     },
//     setExistUser() {
//       this.noExistUser = false;
//     },
//     signOut() {
//       this.$store.dispatch("logout").then(() => {
//         this.noExistUser = true;
//       });
//     },
    setTest() {
      if (this.user.myAnswers) {
        this.fromlink = false
        const exist = this.user.myAnswers.find((test) => test.id == this.id)
        if (!exist) {
          const payload = Object.assign(
            {},
            {
              id: this.test.id,
              title: this.test.title,
              type: this.test.type,
              reports: this.test.reports,
              answers: this.test.answers,
              cooperators: this.test.cooperators,
              answersSheet: Object.assign(this.test.answersSheet, {
                submitted: false,
              }),
              accessLevel: {
                text: "Evaluator",
                value: 2,
              },
            }
          )
          //Get invitation
          const coop = this.cooperators.cooperators.find(
            (coop) => coop.token == this.token
          )
          if (coop) {
            //User invited and he has account
            if (this.user.uid == coop.id) {
              this.$store
                .dispatch("pushMyAnswers", {
                  docId: this.user.uid,
                  element: payload,
                })
                .then(() => {
                  //Update invitation to accepted
                  this.$store.dispatch("updateCooperator", {
                    docId: this.test.cooperators,
                    elementId: this.user.uid,
                    element: true,
                    param: "accepted",
                  })
                  //Remove notification
                  const inv = this.user.notifications.find(
                    (not) => not.test.id == this.id
                  )
                  this.$store.dispatch("removeNotification", {
                    docId: this.user.uid,
                    element: inv,
                  })
                  //Update state reports
                  var log = {
                    date: new Date().toLocaleString("en-US"),
                    progress: 0,
                    status: "In progress",
                  }
                  this.$store.dispatch("updateLog", {
                    docId: this.test.reports,
                    elementId: this.user.uid,
                    element: log,
                  })
                })
            }
            //User invited and he doesn't have account
            else if (coop.id == null) {
              this.$store
                .dispatch("pushMyAnswers", {
                  docId: this.user.uid,
                  element: payload,
                })
                .then(() => {
                  //Update Invitation insert User ID and invitation accepted
                  this.$store
                    .dispatch("updateCooperator", {
                      docId: this.test.cooperators,
                      elementId: this.token,
                      element: this.user.uid,
                      identifier: "token",
                      param: "id",
                    })
                    .then(() => {
                      this.$store.dispatch("updateCooperator", {
                        docId: this.test.cooperators,
                        elementId: this.token,
                        identifier: "token",
                        element: true,
                        param: "accepted",
                      })
                    })
                  //Insert User at state reports
                  const item = Object.assign(
                    {},
                    {
                      uid: this.user.uid,
                      email: this.user.email,
                      log: {
                        date: new Date().toLocaleString("en-Us"),
                        progress: 0,
                        status: "In progress",
                      },
                    }
                  )
                  this.$store.dispatch("pushLog", {
                    docId: this.test.reports,
                    element: item,
                  })
                })
            }
          } else {
            this.$store.commit("setError", "Invalid invitation")
          }
        }
      }
    },
//   },
//   async created() {
//     if (!this.$store.test) {
//       await this.$store.dispatch("getTest", { id: this.id });
//       await this.$store.dispatch("getCooperators", {
//         id: this.test.cooperators,
//       });
//     }
//   },
//   beforeRouteEnter(to, from, next) {
//     if (to.params.token)
//       next((vm) => {
//         vm.fromlink = true;
//       });
//     next();
  },
}
</script>

<style scoped>
.background {
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.backgroundTest {
  background-color: #e8eaf2;
  height: 94%;
  overflow: scroll;
}

.background:before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(../../assets/BackgroundTestView.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right 0px top -20px;
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.description {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}

.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.btn-fix:focus::before {
  opacity: 0 !important;
}

.titleText {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-left: 15px;
  padding: 10px;
  padding-left: 0px;
  padding-top: 0px;
  /*
  height: 2.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; */
}

/* Right side scroll bar */
/* width */
.right-view::-webkit-scrollbar {
  width: 9px;
}

/* Track */
.right-view::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.right-view::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}

/* Handle on hover */
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}

/* Nav bar list scroll bar */
/* width */
.nav-list::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.nav-list::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.nav-list::-webkit-scrollbar-thumb {
  background: #777596;
  border-radius: 4px;
}

/* Handle on hover */
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #64618a;
  /* background: #515069; */
}

.card-title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 48px;
  line-height: 56px;
  margin-left: 12px;
  margin-bottom: 20px;
}</style>
