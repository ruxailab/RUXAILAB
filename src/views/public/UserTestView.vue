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

  <div v-if="introStage">
    <v-layout align-center justify-center class="background">
      <v-flex>
        <v-card width="400">
          <v-flex pa-2>
            <v-card-title primary-title class="subtitleView">
              <h3 class="headline mb-2">
                Welcome to the User Test
              </h3>
            </v-card-title>

            <v-card-actions>
              <v-btn color="green" @click="startTest">
                START!
              </v-btn>
            </v-card-actions>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
  </div>

  <div v-else>
    <v-layout class="backgroundTest">
      <template>
        <v-app class="subtitleView">
          <v-app-bar class="flex-grow" app dark>
            User Test
          </v-app-bar>
          <v-navigation-drawer
            app
            color="#ffffffb3"
            permanent
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  {{ test.testTitle }}
                </v-list-item-title>
                <v-list-item-subtitle class="description">
                  {{ test.id }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider />


            <v-list>
              <v-list-item
                v-for="(item, index) in items"
                :key="item[index]"
                link
                @click="indexTaskView(index)"
              >
                <v-list-item-icon>
                  <v-icon>{{ icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    {{ test.testStructure[index].taskName }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <ViewTask
              :item="test.testStructure[indexTask]"
            />
          </v-main>
        </v-app>
      </template>
    </v-layout>
  </div>
</template>


<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue"
import ViewTask from "@/components/molecules/ViewTask.vue"
import AddCommentBtn from "@/components/atoms/AddCommentBtn"
import HelpBtn from "@/components/atoms/QuestionHelpBtn"
import VClamp from "vue-clamp"
import Snackbar from "@/components/atoms/Snackbar"
import CardSignIn from "@/components/atoms/CardSignIn"
import CardSignUp from "@/components/atoms/CardSignUp"
export default {
  components: {
    // ShowInfo,
    ViewTask,
    // AddCommentBtn,
    // HelpBtn,
    //VClamp,
    // Snackbar,
    // CardSignIn,
    // CardSignUp,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ["id", "token"],
  data: () => ({
    questionStage: false,
    introStage: true,
    drawer: true,
    icon: 'mdi-subdirectory-arrow-right',
    items: [],
    indexTask: 0,


    // right: null,
    // logined: null,
    // selected: true,
    // fromlink: null,
    // drawer: true,
    // start: true, //change to true
    // mini: false,
    // noExistUser: true,
    // heurisIndex: 0,
    // preTestIndex: null,
    // idx: 0,
    // fab: false,
    // res: 0,
    // dialog: false,
    // calculatedProgress: 0,

  }),
  computed: {
    tasks() {
      return this.$store.getters.tasks
    },
    test() {
      return this.$store.getters.test
    },
    user() {
      if (this.$store.getters.user) this.setExistUser()
      return this.$store.getters.users
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
    cooperators() {
      return this.$store.getters.cooperators
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  watch: {
    // test: async function () {
    //   await this.mappingSteps()
    // },
  },
  methods: {
    startTest() {
      this.introStage = false
      this.questionStage = true
      this.items = [...this.test.testStructure]
      this.$store.dispatch("getTest", { id: this.test.id })
    },
    indexTaskView(payload) {
      this.indexTask = payload

    }
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
  color: #000000;
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
  color: #ffffffb3;
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
