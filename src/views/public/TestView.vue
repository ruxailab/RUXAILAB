<template >
  <div v-if="test  || test && test.type ==='User'">
    <Dialog :dialog="dialog" :text="dialogText">
      <v-card-title
        slot="title"
        class="headline error white--text"
        primary-title
      >Are you sure you want to submit this test?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialog = false">Cancel</v-btn>
        <v-btn class="red white--text ml-1" text @click="submitLog(false), dialog = false">Submit</v-btn>
      </div>
    </Dialog>
    <Snackbar />

    <v-dialog v-model="noExistUser" width="500" persistent>
      <CardSignIn @change="selected = !selected" v-if="selected" />
      <CardSignUp @change="selected = !selected" v-else />
    </v-dialog>

    <!-- Start Screen -->
    <v-row v-if="test && start " class="background background-img pa-0 ma-0" align="center">
      <v-col cols="6" class="ml-5">
        <h1 class="titleView pb-1">{{test.title}}</h1>
        <p align="justify" class="description">{{test.description}}</p>
        <v-row justify="center" class>
          <v-btn color="white" outlined rounded @click="start=!start">Start Test</v-btn>
        </v-row>
      </v-col>
    </v-row>

    <v-row v-else class="nav pa-0 ma-0" dense>
      <v-speed-dial v-if="showBtn" v-model="fab" fixed class="mr-3" bottom right open-on-hover>
        <template v-slot:activator>
          <v-btn v-model="fab" large color="#F9A826" dark fab class="btn-fix">
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon large v-else>mdi-hammer-screwdriver</v-icon>
          </v-btn>
        </template>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="submitLog(true)" fab dark small color="#F9A826" v-bind="attrs" v-on="on">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="dialog = true" fab dark small color="#F9A826" v-bind="attrs" v-on="on">
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>

      <v-navigation-drawer clipped v-model="drawer" :mini-variant="mini" permanent color="#3F3D56">
        <div class="header" v-if="!mini">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <div class="idText">{{test.id}}</div>
                <v-clamp class="titleText" autoresize :max-lines="2">{{test.title}}</v-clamp>
              </v-col>
              <v-col v-if="test.type === 'Expert'">
                <v-progress-circular
                  rotate="-90"
                  :value="answersSheet.progress"
                  color="#fca326"
                  :size="50"
                  class="mt-2"
                >{{answersSheet.progress}}</v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list
          class="nav-list"
          flat
          dense
          max-height="85%"
          style="overflow-y:auto;overflow-x:hidden;"
        >
          <div v-for="(item,n) in items" :key="n">
            <!--Pre Test-->
            <v-list-group
              @click="index = item.id"
              v-if="item.id == 0"
              :value="index == 0 ? true : false"
              no-action
            >
              <v-icon
                slot="appendIcon"
                :color="index == item.id ? '#ffffff' : '#fca326'"
              >mdi-chevron-down</v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index ==item.id? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </template>

              <v-list-item v-for="(preTest, i) in item.value" :key="i" @click="preTestIndex = i">
                <v-list-item-icon>
                  <v-icon
                    :color="preTestIndex == preTest.id ? '#ffffff' : '#fca326'"
                  >{{ preTest.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title
                    :style="preTestIndex == preTest.id ? 'color: white': 'color:#fca326'"
                  >{{ preTest.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
            <!--Heuris-->
            <v-list
              @click="index = item.id"
              v-else-if="item.id == 1 && test.type == 'Expert'"
              :value="index == 1 ? true : false"
            >
              <div v-if="mini">
                <v-tooltip right v-for="(heuris, i) in item.value" :key="i">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item @click="heurisIndex = i" link v-bind="attrs" v-on="on">
                      <v-list-item-icon>
                        <v-progress-circular
                          rotate="-90"
                          v-if="test.type === 'Expert' && progress(answersSheet.heuristics[i])!=100"
                          :value="progress(answersSheet.heuristics[i])"
                          :size="24"
                          :width="3"
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                        ></v-progress-circular>
                        <v-icon
                          v-else
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                        >{{ heuris.icon }}</v-icon>
                      </v-list-item-icon>

                      <v-list-item-content>
                        <v-list-item-title
                          :style="heurisIndex == i ? 'color: white': 'color:#fca326'"
                        >{{ heuris.title }}</v-list-item-title>
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
                  <v-list-item-icon>
                    <v-progress-circular
                      rotate="-90"
                      v-if="test.type === 'Expert' && progress(answersSheet.heuristics[i])!=100"
                      :value="progress(answersSheet.heuristics[i])"
                      :size="24"
                      :width="3"
                      :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                    ></v-progress-circular>
                    <v-icon
                      v-else
                      :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                    >{{ heuris.icon }}</v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title
                      :style="heurisIndex == i ? 'color: white': 'color:#fca326'"
                    >{{ heuris.title }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
            </v-list>
            <!--Tasks--->
            <v-list-group
              @click="index = item.id"
              v-else-if="item.id == 1  && test.type == 'User'"
              :value="index == 1 ? true : false"
              no-action
            >
              <v-icon
                slot="appendIcon"
                :color="index == item.id ? '#ffffff' : '#fca326'"
              >mdi-chevron-down</v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index ==item.id? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </template>
              <v-tooltip right v-for="(task, i) in item.value" :key="i">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item @click="heurisIndex = i" link v-bind="attrs" v-on="on">
                    <v-list-item-icon>
                      <v-icon :color="heurisIndex == i ? '#ffffff' : '#fca326'">{{ task.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        :style="heurisIndex == i ? 'color: white': 'color:#fca326'"
                      >{{ task.title }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>
            <!--Post Test-->
            <v-list-item @click="index = item.id" v-else-if="item.id ==2">
              <v-list-item-icon>
                <v-icon :color="index ==item.id? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index ==item.id? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
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
        <!-- Consent - Pre Test -->
        <ShowInfo v-if="index==0 && preTestIndex == 0" title="Pre Test - Consent">
          <iframe
            slot="content"
            :src="test.preTest.consent"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </ShowInfo>

        <!-- Form - Pre Test -->
        <ShowInfo v-if="index==0 && preTestIndex == 1" title="Pre Test - Form">
          <iframe
            slot="content"
            :src="test.preTest.form"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </ShowInfo>

        <!-- Heuristics -->
        <ShowInfo
          v-if="index==1 && test.type === 'Expert'"
          :title="test.heuristics[heurisIndex].title"
        >
          <div slot="content" class="ma-0 pa-0">
            <v-card-title class="subtitleView">{{test.heuristics[heurisIndex].title}}</v-card-title>
            <v-divider class="mb-5"></v-divider>
            <v-row
              v-for="(question,i) in test.heuristics[heurisIndex].questions"
              :key="i"
              justify="center"
            >
              <v-col cols="10">
                <v-row justify="space-around" align="center">
                  <v-col cols="11">
                    <p class="subtitleView">{{i+1}}) {{question.title}}</p>
                  </v-col>
                  <v-col cols="1">
                    <HelpBtn :question="question" />
                  </v-col>
                </v-row>

                <AddCommentBtn
                  :comment="answersSheet.heuristics[heurisIndex].questions[i]"
                  :heurisIndex="heurisIndex"
                >
                  <v-select
                    slot="answer"
                    v-if="answersSheet !== undefined"
                    :items="test.options"
                    @change="calcProgress()"
                    v-model="answersSheet.heuristics[heurisIndex].questions[i].res"
                    label="Respuestas/Answers"
                    outlined
                    dense
                  ></v-select>
                </AddCommentBtn>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>

        <!-- Tasks -->
        <ShowInfo v-if="index==1 && test.type === 'User'" :title="test.tasks[heurisIndex].name">
          <div slot="content" class="ma-0 pa-0">
            <v-card-title class="subtitleView">{{test.tasks[heurisIndex].name}}</v-card-title>
            <v-divider class="mb-5"></v-divider>
            <ViewTask :item="test.tasks[heurisIndex]" />
          </div>
        </ShowInfo>

        <!-- Post Test -->
        <ShowInfo v-if="index==2 " title="Post Test">
          <iframe
            slot="content"
            :src="test.postTest.form"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </ShowInfo>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import ViewTask from "@/components/atoms/ViewTask.vue";
import AddCommentBtn from "@/components/atoms/AddCommentBtn";
import HelpBtn from "@/components/atoms/QuestionHelpBtn";
import VClamp from "vue-clamp";
import Dialog from "@/components/atoms/Dialog";
import Snackbar from "@/components/atoms/Snackbar";
import CardSignIn from "@/components/atoms/CardSignIn";
import CardSignUp from "@/components/atoms/CardSignUp";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    ViewTask,
    AddCommentBtn,
    HelpBtn,
    VClamp,
    Dialog,
    Snackbar,
    CardSignIn,
    CardSignUp
  },
  data: () => ({
    selected: true,
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
    dialogText:
      "Are you sure you want to submit your test. You can only do it once."
  }),
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined)
        await this.mappingSteps();
    },
    items() {
      if (this.items.length) {
        this.index = this.items[0].id;
        if (this.items.find(obj => obj.id == 0)) {
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
        if (this.user.myAnswers) {
          let exist = this.user.myAnswers.find(test => test.id == this.id);
          if (!exist) {
            let payload = Object.assign(
              {},
              {
                id: this.test.id,
                title: this.test.title,
                type: this.test.type,
                reports: this.test.reports,
                answers: this.test.answers,
                cooperators: this.test.cooperators,
                answersSheet: Object.assign(this.test.answersSheet, {
                  submited: false
                }),
                accessLevel: 2
              }
            );
            this.$store
              .dispatch("pushMyAnswers", {
                docId: this.user.uid,
                element: payload
              })
          }
        }
      }
    }
  },
  methods: {
    mappingSteps() {
      if (this.test.type === "User") {
        //PreTest
        if (this.validate(this.test.preTest.consent))
          this.items.push({
            title: "Pre Test",
            icon: "mdi-checkbox-blank-circle-outline",
            value: [
              {
                title: "Consent",
                icon: "mdi-checkbox-blank-circle-outline",
                id: 0
              }
            ],
            id: 0
          });

        if (this.validate(this.test.preTest.form)) {
          if (this.items.length) {
            this.items[0].value.push({
              title: "Form",
              icon: "mdi-checkbox-blank-circle-outline",
              id: 1
            });
          } else {
            this.items.push({
              title: "Pre Test",
              icon: "mdi-checkbox-blank-circle-outline",
              value: [
                {
                  title: "Form",
                  icon: "mdi-checkbox-blank-circle-outline",
                  id: 1
                }
              ],
              id: 0
            });
          }
        }

        //Tasks
        if (this.validate(this.test.tasks) && this.test.tasks.length !== 0)
          this.items.push({
            title: "Tasks",
            icon: "mdi-checkbox-blank-circle-outline",
            value: this.test.tasks.map(i => {
              return {
                title: i.name,
                icon: "mdi-checkbox-blank-circle-outline"
              };
            }),
            id: 1
          });

        //PostTest
        if (this.validate(this.test.postTest.form))
          this.items.push({
            title: "Post Test",
            icon: "mdi-checkbox-blank-circle-outline",
            value: this.test.postTest,
            id: 2
          });
      } else if (this.test.type === "Expert") {
        //Heuristics
        if (
          this.validate(this.test.heuristics) &&
          this.test.heuristics.length !== 0
        )
          this.items.push({
            title: "Heuristics",
            icon: "mdi-checkbox-marked-circle-outline",
            value: this.test.heuristics.map(i => {
              return {
                title: i.title,
                icon: "mdi-checkbox-marked-circle-outline"
              };
            }),
            id: 1
          });
      }
    },
    validate(object) {
      return object !== null && object !== undefined && object !== "";
    },
    calcProgress() {
      var qtd = 0;
      this.answersSheet.heuristics.forEach(h => {
        qtd += h.questions.filter(q => q.res !== "").length;
      });

      this.answersSheet.progress = (
        (qtd * 100) /
        this.answersSheet.total
      ).toFixed(1);
    },
    submitLog(save) {
      let newAnswer = this.user.myAnswers.find(answer => answer.id == this.id);
      if (!save) newAnswer.answersSheet.submited = true;

      var log = {
        date: new Date().toLocaleString("en-US"),
        progress: this.answersSheet.progress,
        status: this.answersSheet.progress != 100 ? "In progress" : "Completed"
      };
      this.$store
        .dispatch("updateLog", {
          docId: newAnswer.reports,
          elementId: this.user.uid,
          element: log
        })
        .then(() => {
          if (!save) {
            this.$store
              .dispatch("pushAnswers", {
                docId: newAnswer.answers,
                element: Object.assign(this.answersSheet, {
                  uid: this.user.uid,
                  email: this.user.email
                })
              })
              .then(() => {
                this.$store.commit("setSuccess", "Test succesfully submited");
              })
              .catch(err => {
                this.$store.commit("setError", err);
              });
          }
        });

      this.$store
        .dispatch("updateMyAnswers", {
          docId: this.user.uid,
          element: newAnswer
        })
        .then(() => {
          if (save)
            this.$store.commit("setSuccess", "Project succesfully saved");
        })
        .catch(err => {
          if (save) this.$store.commit("setError", err);
        });
    },
    progress(item) {
      return (
        (item.questions.filter(q => q.res !== "").length * 100) / item.total
      );
    },
    setExistUser() {
      this.noExistUser = false;
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      if (this.$store.state.auth.user) this.setExistUser();
      return this.$store.state.auth.user;
    },
    answersSheet: {
      get() {
        if (this.user !== null && this.user !== undefined) {
          let x = this.user.myAnswers.find(answer => answer.id == this.id);
          if (x) return x.answersSheet;
          else return this.test.answersSheet;
        } else {
          return null;
        }
      },
      set(item) {
        return item;
      }
    },
    showBtn() {
      if (this.answersSheet !== undefined && this.answersSheet !== null) {
        if (!this.answersSheet.submited) return true;
      }
      if (this.test.type == "User") {
        return true;
      }
      return false;
    }
  },
  created() {
    if (!this.$store.test) this.$store.dispatch("getTest", { id: this.id });
  }
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
