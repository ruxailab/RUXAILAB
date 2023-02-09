<template>
  <div v-if="test && test.testType === 'HEURISTICS'">
    <Snackbar />

    <!-- Submit TEST ANSWER Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title
          >Are you sure you want to submit this test?</v-card-title
        >

        <v-card-text
          >Are you sure you want to submit your test. You can only do it
          once.</v-card-text
        >

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="grey lighten-3" text @click="dialog = false"
            >Cancel</v-btn
          >
          <v-btn
            class="red white--text ml-1"
            text
            @click="submitLog(false), (dialog = false)"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!----------------------------------------------------------------------------------------->

    <!-- LOADER -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- DEALING WITH USER SIGNIN AND SIGNUP -->
    <v-dialog :value="fromlink && noExistUser" width="500" persistent>
      <CardSignIn
        @logined="logined = true"
        @change="selected = !selected"
        v-if="selected"
      />
      <CardSignUp
        @logined="logined = true"
        @change="selected = !selected"
        v-else
      />
    </v-dialog>

    <v-dialog
      :value="fromlink && !noExistUser && !logined"
      width="500"
      persistent
    >
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange lighten-4" size="150">
            <v-icon size="120" dark>mdi-account</v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="#F9A826" class="white--text" @click="setTest()"
            >Continue as {{ user.email }}</v-btn
          >
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            Not {{ user.email }}?
            <a style="color: #f9a826" @click="signOut()">Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!---------------------------------------------------------------------------------------------->

    <!-- Start Screen -->
    <v-row
      v-if="test && start"
      class="background background-img pa-0 ma-0"
      align="center"
    >
      {{ currentUserTestAnswer }}
      <v-col cols="6" class="ml-5">
        <h1 class="titleView pb-1">{{ test.testTitle }}</h1>
        <p align="justify" class="description">{{ test.testDescription }}</p>
        <v-row justify="center" class>
          <v-btn color="white" outlined rounded @click="start = !start"
            >Start Test</v-btn
          >
        </v-row>
      </v-col>
    </v-row>

    <v-row v-else class="nav pa-0 ma-0" dense>
      <v-speed-dial
        v-if="showBtn"
        v-model="fab"
        fixed
        class="mr-3"
        bottom
        right
        open-on-hover
      >
        <template v-slot:activator>
          <v-btn v-model="fab" large color="#F9A826" dark fab class="btn-fix">
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon large v-else>mdi-hammer-screwdriver</v-icon>
          </v-btn>
        </template>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="submitLog(true)"
              fab
              dark
              small
              color="#F9A826"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>

        <v-tooltip left v-if="currentUserTestAnswer">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :disabled="currentUserTestAnswer.progress < 100"
              class="white--text"
              @click="dialog = true"
              fab
              small
              color="#F9A826"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>

        <v-tooltip left v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="white--text"
              @click="dialog = true"
              fab
              small
              color="#F9A826"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>

      <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant="mini"
        permanent
        color="#3F3D56"
      >
        <div class="header" v-if="!mini">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <div class="idText">{{ test.id }}</div>
                <v-clamp class="titleText" autoresize :max-lines="2">{{
                  test.testTitle
                }}</v-clamp>
              </v-col>
              <v-col>
                <v-progress-circular
                  rotate="-90"
                  :value="currentUserTestAnswer.progress"
                  color="#fca326"
                  :size="50"
                  class="mt-2"
                  >{{ currentUserTestAnswer.progress }}</v-progress-circular
                >
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list
          class="nav-list"
          flat
          dense
          max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px"
        >
          <div v-for="(item, n) in items" :key="n">
            <!--Heuris-->
            <v-list
              @click="index = item.id"
              v-if="item.id == 1"
              :value="index == 1 ? true : false"
            >
              <div v-if="mini">
                <v-tooltip right v-for="(heuris, i) in item.value" :key="i">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item
                      @click="heurisIndex = i"
                      link
                      v-bind="attrs"
                      v-on="on"
                    >
                      <!-- <v-list-item-icon>
                        <v-progress-circular
                          rotate="-90"
                          v-if="
                            test.testType === 'HEURISTICS' &&
                              progress(testAnswerDocument.heuristicAnswers[i]) != 100
                          "
                          :value="progress(testAnswerDocument.heuristicAnswers[i])"
                          :size="24"
                          :width="3"
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                        ></v-progress-circular>
                        <v-icon
                          v-else
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                          >{{ heuris.icon }}</v-icon
                        >
                      </v-list-item-icon> -->

                      <v-list-item-content>
                        <v-list-item-title
                          :style="
                            heurisIndex == i ? 'color: white' : 'color:#fca326'
                          "
                          >{{ heuris.title }}</v-list-item-title
                        >
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <span>{{ heuris.title }}</span>
                </v-tooltip>
              </div>

              <div v-else>
                <v-list-item
                  v-for="(heuris, i) in item.value"
                  :key="i"
                  @click="heurisIndex = i"
                  link
                >
                  <!-- <v-list-item-icon>
                    <v-progress-circular
                      rotate="-90"
                      v-if="
                        test.testType === 'HEURISTICS' &&
                          progress(testAnswerDocument.heuristicAnswers[i]) != 100
                      "
                      :value="progress(testAnswerDocument.heuristicAnswers[i])"
                      :size="24"
                      :width="3"
                      :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                    ></v-progress-circular>
                    <v-icon
                      v-else
                      :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                      >{{ heuris.icon }}</v-icon
                    >
                  </v-list-item-icon> -->

                  <v-list-item-content>
                    <v-list-item-title
                      :style="
                        heurisIndex == i ? 'color: white' : 'color:#fca326'
                      "
                      >{{ heuris.title }}</v-list-item-title
                    >
                  </v-list-item-content>
                </v-list-item>
              </div>
            </v-list>
          </div>
        </v-list>

        <div class="footer">
          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = !mini" class="mr-2">
            <v-icon v-if="mini" color="white">mdi-chevron-right</v-icon>
            <v-icon v-else color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </div>
      </v-navigation-drawer>

      <v-col class="backgroundTest pa-0 ma-0 right-view" ref="rightView">
        <!-- Heuristics -->
        <ShowInfo
          v-if="index == 1"
          :title="test.testStructure[heurisIndex].title"
        >
          <div slot="content" class="ma-0 pa-0">
            <v-card-title class="subtitleView">{{
              test.testStructure[heurisIndex].title
            }}</v-card-title>
            <v-divider class="mb-5"></v-divider>
            <v-row
              v-for="(question, i) in test.testStructure[heurisIndex].questions"
              :key="i"
              justify="center"
            >
              <v-col cols="10">
                <v-row justify="space-around" align="center">
                  <v-col cols="11">
                    <p class="subtitleView">
                      {{ i + 1 }}) {{ question.title }}
                    </p>
                  </v-col>
                  <v-col cols="1">
                    <HelpBtn :question="question" />
                  </v-col>
                </v-row>

                <AddCommentBtn
                  :heurisIndex="heurisIndex"
                  :comment="currentUserTestAnswer"
                >
                  <v-select
                    slot="answer"
                    v-if="currentUserTestAnswer !== undefined"
                    :items="test.testOptions"
                    @change="calcProgress()"
                    label="Respuestas/Answers"
                    outlined
                    dense
                  ></v-select>
                </AddCommentBtn>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>
      </v-col>
    </v-row>
  </div>
  <div v-else-if="test && test.testType === 'USER'">
    <UserTestView />
  </div>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import AddCommentBtn from "@/components/atoms/AddCommentBtn";
import HelpBtn from "@/components/atoms/QuestionHelpBtn";
import VClamp from "vue-clamp";
import Snackbar from "@/components/atoms/Snackbar";
import CardSignIn from "@/components/atoms/CardSignIn";
import CardSignUp from "@/components/atoms/CardSignUp";
import UserTestView from "@/views/public/UserTestView.vue";

export default {
  props: ["id", "token"],
  components: {
    ShowInfo,
    AddCommentBtn,
    HelpBtn,
    VClamp,
    Snackbar,
    CardSignIn,
    CardSignUp,
    UserTestView,
  },
  data: () => ({
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
    fab: false,
    res: 0,
    dialog: false,
    isPreview: false,
    previewtestAnswerDocument: null,
  }),
  watch: {
    test: async function() {
      await this.mappingSteps();
    },
    items() {
      if (this.items.length) {
        this.index = this.items[0].id;
        if (this.items.find((obj) => obj.id == 0)) {
          //se tiver preTest mexe no preTestIndex
          this.preTestIndex = this.items[0].value[0].id;
        }
      }
    },
    heurisIndex() {
      this.$refs.rightView.scrollTop = 0; //faz scroll pra cima qnd muda a heuristica
    },
    async user() {
      if (this.user) {
        this.noExistUser = false;
        if (this.logined) this.setTest();
      }
    },
  },
  methods: {
    updateAnswer() {
      this.calcProgress();
    },
    mappingSteps() {
      //Heuristics
      if (
        this.validate(this.test.testStructure) &&
        this.test.testStructure.length !== 0
      )
        this.items.push({
          title: "HEURISTICS",
          icon: "mdi-checkbox-marked-circle-outline",
          value: this.test.testStructure.map((i) => {
            return {
              title: i.title,
              icon: "mdi-checkbox-marked-circle-outline",
            };
          }),
          id: 1,
        });
    },
    validate(object) {
      return object !== null && object !== undefined && object !== "";
    },
    calcProgress() {
      console.log("hello", this.currentUserTestAnswer);
      var qtd = 0;
      if (this.currentUserTestAnswer.heuristicQuestions) {
        this.currentUserTestAnswer.heuristicQuestions.forEach((h) => {
          qtd += h.heuristicQuestions.filter((q) => q.res !== "").length;
        });

        if (qtd > 0) {
          this.currentUserTestAnswer.progress = (
            (qtd * 100) /
            this.currentUserTestAnswer.total
          ).toFixed(1);
        }
      }
    },
    submitLog(save) {
      let newAnswer = this.user.myAnswers.find(
        (answer) => answer.id == this.id
      );

      if (!save) newAnswer.testAnswerDocument.submitted = true;

      var log = {
        date: new Date().toLocaleString("en-US"),
        progress: this.testAnswerDocument.progress,
        status:
          this.testAnswerDocument.progress != 100 ? "In progress" : "Completed",
      };
      log.status = newAnswer.testAnswerDocument.submitted
        ? "Submitted"
        : log.status;

      if (this.testAnswerDocument.tasks) {
        this.testAnswerDocument.tasks = Object.assign({}, this.test.tasks);
        newAnswer.testAnswerDocument = this.testAnswerDocument;
      }

      this.$store
        .dispatch("updateLog", {
          docId: newAnswer.reports,
          elementId: this.user.uid,
          element: log,
        })
        .then(() => {
          if (!save) {
            this.$store
              .dispatch("pushAnswers", {
                docId: newAnswer.answers,
                element: Object.assign(this.testAnswerDocument, {
                  uid: this.user.uid,
                  email: this.user.email,
                }),
              })
              .then(() => {
                this.$store.commit("setSuccess", "Test succesfully submitted");
              })
              .catch((err) => {
                this.$store.commit("setError", err);
              });
          }
        });

      newAnswer.date = new Date().toDateString();
      this.$store
        .dispatch("updateMyAnswers", {
          docId: this.user.uid,
          element: newAnswer,
        })
        .then(() => {
          if (save)
            this.$store.commit("setSuccess", "Project succesfully saved");
        })
        .catch((err) => {
          if (save) this.$store.commit("setError", err);
        });

      if (newAnswer.testAnswerDocument.tasks) {
        this.$store
          .dispatch("pushAnswers", {
            docId: newAnswer.answers,
            element: Object.assign(this.testAnswerDocument, {
              uid: this.user.uid,
              email: this.user.email,
            }),
          })
          .then(() => {
            this.$store.commit("setSuccess", "Test succesfully submitted");
          })
          .catch((err) => {
            this.$store.commit("setError", err);
          });
      }
    },
    progress(item) {
      return (
        (item.heuristicQuestions.filter((q) => q.res !== "").length * 100) /
        item.total
      );
    },
    setExistUser() {
      this.noExistUser = false;
    },
    signOut() {
      this.$store.dispatch("logout").then(() => {
        this.noExistUser = true;
      });
    },
    setTest() {
      alert("settest?");
      // if (this.user.myAnswers) {
      //   this.fromlink = false;
      //   let exist = this.user.myAnswers.find((test) => test.id == this.id);
      //   if (!exist) {
      //     let payload = Object.assign(
      //       {},
      //       {
      //         id: this.test.id,
      //         title: this.test.title,
      //         type: this.test.testType,
      //         reports: this.test.reports,
      //         answers: this.test.answers,
      //         cooperators: this.test.cooperators,
      //         testAnswerDocument: Object.assign(this.test.testAnswerDocument, {
      //           submitted: false,
      //         }),
      //         accessLevel: {
      //           text: "Evaluator",
      //           value: 2,
      //         },
      //       }
      //     );
      //     //Get invitation
      //     let coop = this.cooperators.cooperators.find(
      //       (coop) => coop.token == this.token
      //     );

      //     if (coop) {
      //       //User invited and he has account
      //       if (this.user.uid == coop.id) {
      //         this.$store
      //           .dispatch("pushMyAnswers", {
      //             docId: this.user.uid,
      //             element: payload,
      //           })
      //           .then(() => {
      //             //Update invitation to accepted
      //             this.$store.dispatch("updateCooperator", {
      //               docId: this.test.cooperators,
      //               elementId: this.user.uid,
      //               element: true,
      //               param: "accepted",
      //             });

      //             //Remove notification
      //             let inv = this.user.notifications.find(
      //               (not) => not.test.id == this.id
      //             );
      //             this.$store.dispatch("removeNotification", {
      //               docId: this.user.uid,
      //               element: inv,
      //             });

      //             //Update state reports
      //             var log = {
      //               date: new Date().toLocaleString("en-US"),
      //               progress: 0,
      //               status: "In progress",
      //             };
      //             this.$store.dispatch("updateLog", {
      //               docId: this.test.reports,
      //               elementId: this.user.uid,
      //               element: log,
      //             });
      //           });
      //       }
      //       //User invited and he doesn't have account
      //       else if (coop.id == null) {
      //         this.$store
      //           .dispatch("pushMyAnswers", {
      //             docId: this.user.uid,
      //             element: payload,
      //           })
      //           .then(() => {
      //             //Update Invitation insert User ID and invitation accepted
      //             this.$store
      //               .dispatch("updateCooperator", {
      //                 docId: this.test.cooperators,
      //                 elementId: this.token,
      //                 element: this.user.uid,
      //                 identifier: "token",
      //                 param: "id",
      //               })
      //               .then(() => {
      //                 this.$store.dispatch("updateCooperator", {
      //                   docId: this.test.cooperators,
      //                   elementId: this.token,
      //                   identifier: "token",
      //                   element: true,
      //                   param: "accepted",
      //                 });
      //               });

      //             //Insert User at state reports
      //             let item = Object.assign(
      //               {},
      //               {
      //                 uid: this.user.uid,
      //                 email: this.user.email,
      //                 log: {
      //                   date: new Date().toLocaleString("en-Us"),
      //                   progress: 0,
      //                   status: "In progress",
      //                 },
      //               }
      //             );
      //             this.$store.dispatch("pushLog", {
      //               docId: this.test.reports,
      //               element: item,
      //             });
      //           });
      //       }
      //     } else {
      //       this.$store.commit("setError", "Invalid invitation");
      //     }
      //   }
      // }
    },
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      if (this.$store.getters.user) this.setExistUser();
      return this.$store.getters.user;
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer;
    },
    // testAnswerDocument: {
    //   get() {
    //     if (this.user !== null && this.user !== undefined) {
    //       let x = this.user.myAnswers.find((answer) => answer.id == this.id);
    //       if (x) {
    //         if(x.testAnswerDocument.tasks) {
    //           /* eslint-disable*/
    //           this.test.testAnswerDocument = Object.assign({},x.testAnswerDocument)
    //           this.test.tasks = Object.assign({}, x.testAnswerDocument.tasks)
    //           return this.test.testAnswerDocument
    //         }
    //         return x.testAnswerDocument;
    //       } else {
    //         return this.test.testAnswerDocument;
    //       }
    //     } else {
    //       return null;
    //     }
    //   },
    //   set(item) {
    //     return item;
    //   },
    // },
    showBtn() {
      if (
        this.testAnswerDocument !== undefined &&
        this.testAnswerDocument !== null
      ) {
        if (!this.testAnswerDocument.submitted) return true;
      }
      if (this.test.testType == "User") {
        return true;
      }
      return false;
    },
    cooperators() {
      return this.$store.getters.cooperators;
    },
    loading() {
      return this.$store.getters.loading;
    },
  },
  async created() {
    if (!this.$store.test) {
      await this.$store.dispatch("getTest", { id: this.id });
    }

    if (this.$route.query.preview === "true") {
      this.isPreview = true;
    }

    await this.$store.dispatch("getCurrentTestAnswerDoc");
  },
  beforeRouteEnter(to, from, next) {
    if (to.params.token)
      next((vm) => {
        vm.fromlink = true;
      });
    next();
  },
};
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
}
</style>
