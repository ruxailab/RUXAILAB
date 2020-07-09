<template >
  <v-container v-if="test" class="pa-0 ma-0">
    <v-speed-dial v-if="answersSheet && !start" v-model="fab" fixed class="mr-3" bottom right open-on-hover>
      <template v-slot:activator>
        <v-btn v-model="fab" large color="#F9A826" dark fab class="btn-fix">
          <v-icon v-if="fab">mdi-close</v-icon>
          <v-icon large v-else>mdi-hammer-screwdriver</v-icon>
        </v-btn>
      </template>
      <v-btn @click="save()" fab dark small color="#F9A826">
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
      <v-btn @click="submitLog(false)" fab dark small color="#F9A826">
        <v-icon>mdi-file-move</v-icon>
      </v-btn>
    </v-speed-dial>

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
      <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        color="#3F3D56"
      >
        <div class="header" v-if="!mini">
          <v-list-item>
            <v-row dense>
              <v-col class="pa-0 ma-0">
                <div class="idText">{{test.id}}</div>
                <!--<v-overflow-btn
                  class="pa-0 ma-0"
                  dark
                  dense
                  v-model="selectedTest"
                  @change="pushToTest()"
                  item-value="id"
                  item-text="title"
                  :items="myTests"
                  :label="test.title"
                  background-color="#343344"
                ></v-overflow-btn>-->
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list flat dense>
          <div v-for="(item,n) in items" :key="n">
            <v-list-group
              @click="index = n"
              v-if="item.id == 0"
              :value="index == 0 ? true : false"
              no-action
            >
              <v-icon slot="appendIcon" :color="index == n ? '#ffffff' : '#fca326'">mdi-chevron-down</v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == n ? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index ==n? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </template>

              <v-list-item v-for="(preTest, i) in item.value" :key="i" @click="preTestIndex = i">
                <v-list-item-icon>
                  <v-icon :color="preTestIndex == i ? '#ffffff' : '#fca326'">{{ preTest.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title
                    :style="preTestIndex == i ? 'color: white': 'color:#fca326'"
                  >{{ preTest.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <v-list-group
              @click="index = n"
              v-else-if="item.id == 1"
              :value="index == 1 ? true : false"
              color="white"
              no-action
            >
              <v-icon slot="appendIcon" :color="index == n ? '#ffffff' : '#fca326'">mdi-chevron-down</v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index ==n? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index ==n? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </template>

              <v-list-item v-for="(heuris, i) in item.value" :key="i" @click="heurisIndex = i" link>
                <v-list-item-icon>
                  <v-icon :color="heurisIndex == i ? '#ffffff' : '#fca326'">{{ heuris.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title
                    :style="heurisIndex == i ? 'color: white': 'color:#fca326'"
                  >{{ heuris.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <v-list-item link @click="index = n" v-else>
              <v-list-item-icon>
                <v-icon :color="index ==n? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index ==n? 'color: white': 'color:#fca326'"
                >{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
        </v-list>

        <div class="footer" v-if="!mini">
          <v-btn icon @click="go(`/settingsview/${id}`)" class="ml-3">
            <v-icon color="white">mdi-cog</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = !mini" class="mr-2">
            <v-icon color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </div>

        <div class="footer" style="height:16%" v-else>
          <v-list class="mt-0 pa-0">
            <v-list-item class="pt-0">
              <v-list-item-icon @click="go(`/settingsview/${id}`)">
                <v-icon color="white">mdi-cog</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon @click.stop="mini = !mini">
                <v-icon color="white">mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </div>
      </v-navigation-drawer>
      <v-col class="backgroundTest pa-0 ma-0">
        <ShowInfo v-if="index==0 && preTestIndex == 0" title="Pre Test - Consent">
          <iframe
            :src="test.preTest.consent"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </ShowInfo>
        <ShowInfo v-if="index==0 && preTestIndex == 1" title="Pre Test - Form">
          <iframe
            :src="test.preTest.form"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </ShowInfo>

        <ShowInfo v-if="index==1" :title="test.heuristics[heurisIndex].title">
          <v-card-title class="subtitleView">{{test.heuristics[heurisIndex].title}}</v-card-title>
          <v-divider class="mb-5"></v-divider>
          <v-row
            v-for="(question,i) in test.heuristics[heurisIndex].questions"
            :key="i"
            justify="center"
          >
            <v-col cols="10">
              <p class="subtitleView">{{i+1}}) {{question.text}}</p>

              <v-select
                v-if="answersSheet !== null"
                class="mt-3"
                :items="test.options"
                @change="calcProgress()"
                v-model="answersSheet.heuristics[heurisIndex].questions[i].res"
                label="Respuestas/Answers"
                outlined
                dense
              ></v-select>

              <v-select
                v-else
                class="mt-3"
                :items="test.options"
                @change="calcProgress()"
                v-model="test.answersSheet.heuristics[heurisIndex].questions[i].res"
                label="Respuestas/Answers"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>
        </ShowInfo>

        <ShowInfo v-if="index==2 " title="Post Test">
          <iframe
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
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";

export default {
  props: ["id"],
  components: {
    ShowInfo
  },
  data: () => ({
    drawer: true,
    start: true, //change to true
    mini: false,
    index: 0,
    heurisIndex: 0,
    preTestIndex: 0,
    items: [],
    idx: 0,
    fab: false,
    answersSheet: null
  }),
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined)
        await this.mappingSteps();
      this.el = 1;
    },
    user() {
      if (this.user !== null && this.user !== undefined) {
        let x = this.user.myAnswers.find(answer => answer.id == this.id);
        this.answersSheet = x.answersSheet;
      }
    }
  },
  methods: {
    mappingSteps() {
      //PreTest
      if (
        this.validate(this.test.preTest.consent) &&
        this.validate(this.test.preTest.form)
      )
        this.items.push({
          title: "Pre Test",
          icon: "mdi-checkbox-blank-circle-outline",
          value: [
            {
              title: "Consent",
              icon: "mdi-checkbox-blank-circle-outline"
            },
            {
              title: "Form",
              icon: "mdi-checkbox-blank-circle-outline"
            }
          ],
          id: 0
        });
      //Tasks
      if (this.validate(this.test.tasks))
        this.items.push({
          title: "Tasks",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.tasks,
          id: 1
        });

      //Heuristics
      if (this.validate(this.test.heuristics))
        this.items.push({
          title: "Heuristics",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.heuristics.map(i => {
            return {
              title: i.title,
              icon: "mdi-checkbox-blank-circle-outline"
            };
          }),
          id: 1
        });

      //PostTest
      if (this.validate(this.test.postTest))
        this.items.push({
          title: "Post Test",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.postTest,
          id: 3
        });
    },
    validate(object) {
      return object !== null && object !== undefined;
    },
    save() {
      let newAnswer = this.user.myAnswers.find(answer => answer.id == this.id);
      this.$store.dispatch("updateMyAnswers", {
        docId: this.user.uid,
        element: newAnswer
      });
      this.submitLog(true);
    },
    calcProgress() {
      var qtd = 0;
      this.answersSheet.heuristics.forEach(h => {
        qtd += h.questions.filter(q => q.res != null).length;
      });

      this.answersSheet.progress = (qtd * 100) / this.answersSheet.total;
    },
    submitLog(save) {
      let newAnswer = this.user.myAnswers.find(answer => answer.id == this.id);
      var log = {
        date: new Date().toLocaleString("pt-BR"),
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
          if (!save)
            this.$store.dispatch("pushAnswers", {
              docId: newAnswer.answers,
              element: Object.assign(this.answersSheet, {
                uid: this.user.uid,
                email: this.user.email
              })
            });
        });
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.state.auth.user;
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
.description{
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}
.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
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
</style>