<template>
  <div>
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error accent-4 white--text" primary-title
          >Are you sure you want to leave?</v-card-title
        >

        <v-card-text
          >Are you sure you want to leave? All your changes will be
          discarded</v-card-text
        >

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="grey lighten-3" text @click="dialog = false"
            >Stay</v-btn
          >
          <v-btn
            class="error accent-4 white--text ml-1"
            text
            @click="(change = false), $router.push(go)"
            >Leave</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Snackbar />

    <v-tooltip left v-if="change">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          large
          dark
          fab
          fixed
          bottom
          right
          color="#F9A826"
          @click="validateAll()"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon large>mdi-content-save</v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>
    <v-overlay class="text-center" v-model="loading">
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      ></v-progress-circular>
      <div class="white-text mt-3">Loading Test</div>
    </v-overlay>
    <IntroEdit v-if="test && intro == true" @closeIntro="intro = false" />
    <ShowInfo v-if="test && intro == false" title="Test Edit">
      <v-row dense slot="top">
        <v-tabs
          background-color="transparent"
          color="#FCA326"
          class="tab-border-bottom pb-0 mb-0"
        >
          <v-tab v-if="test.type === 'User'" @click="index = 0">Pre Test</v-tab>
          <v-tab v-if="test.type === 'User'" @click="index = 1">Tasks</v-tab>
          <v-tab v-if="test.type === 'Heuristics'" @click="index = 1"
            >Heuristics</v-tab
          >
          <v-tab v-if="test.type === 'Heuristics'" @click="index = 2"
            >Options</v-tab
          >
          <v-tab v-if="test.type === 'User'" @click="index = 3"
            >Post Test</v-tab
          >
        </v-tabs>
      </v-row>

      <div slot="content" class="ma-0 pa-0">
        <v-card v-if="index == 0" style="background: #f5f7ff">
          <v-card-title class="subtitleView">Pre Test</v-card-title>
          <v-divider></v-divider>
          <v-row justify="space-around" v-if="object.preTest">
            <v-col cols="10">
              <FormPreTest
                :preTest="object.preTest"
                @valForm="validate"
                :valIndex="0"
                @change="change = true"
              />
            </v-col>
          </v-row>
        </v-card>

        <div v-if="index == 1" class="ma-0 pa-0">
          <ListTasks
            v-if="test.type === 'User'"
            :tasks="object.tasks"
            @change="change = true"
          />
          <Heuristic
            v-else-if="test.type === 'Heuristics'"
            :heuristics="object.heuristics"
            :answersSheet="object.answersSheet"
            @change="change = true"
          />
        </div>

        <div class="ma-0 pa-0" v-if="index == 2">
          <OptionsTable
            :options="object.options"
            @valForm="validate"
            @change="change = true"
          />
        </div>

        <v-card v-if="index == 3" style="background: #f5f7ff">
          <v-card-title class="subtitleView">Post Test</v-card-title>
          <v-divider></v-divider>
          <v-row justify="space-around">
            <v-col cols="12">
              <FormPostTest
                :postTest="object.postTest"
                :valIndex="1"
                @input="object.postTest = $event"
                @valForm="validate"
                @change="change = true"
              />
            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>
  </div>
</template>

<script>
import FormPreTest from "@/components/atoms/FormPreTest";
import FormPostTest from "@/components/atoms/FormPostTest";
import ListTasks from "@/components/molecules/ListTasks";
import Heuristic from "@/components/molecules/HeuristicsTable";
import OptionsTable from "@/components/molecules/OptionsTable";
import Snackbar from "@/components/atoms/Snackbar";
import ShowInfo from "@/components/organisms/ShowInfo";
import IntroEdit from "@/components/molecules/IntroEdit.vue";

export default {
  props: ["id"],
  components: {
    FormPreTest,
    FormPostTest,
    ListTasks,
    Heuristic,
    OptionsTable,
    Snackbar,
    ShowInfo,
    IntroEdit
  },
  data: () => ({
    index: 0,
    object: {},
    valids: [true, true],
    change: false,
    dialog: false,
    intro: null
  }),
  methods: {
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });

      if ("template" in this.object) this.object.template.upToDate = false; //flag as outdated
      this.$store
        .dispatch("updateTest", {
          docId: this.id,
          data: this.object
        })
        .then(() => {
          this.$store.dispatch("updateMyTest", {
            docId: this.object.admin.id,
            element: {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              cooperators: this.object.cooperators,
              template: this.object.template,
              accessLevel: 0
            }
          });

          this.answers.answersSheet = this.object.answersSheet;
          if (this.test.type === "Heuristics")
            Object.assign(this.answers, { options: this.object.options });
          this.$store
            .dispatch("updateTestAnswer", {
              docId: this.test.answers,
              data: this.answers
            })
            .then(() => {
              this.$store.commit("setSuccess", "Test updated succesfully");
              this.change = false;
            })
            .catch(err => {
              this.$store.commit("setError", err);
            });
        })
        .catch(err => {
          this.$store.commit("setError", err);
        });
    },
    validate(valid, index) {
      this.valids[index] = valid;
    },
    validateAll() {
      if (this.test.type === "User" && !this.valids[0]) {
        this.$store.commit(
          "setError",
          "Please fill all fields in Pre Test correctly or leave them empty"
        );
      } else if (
        this.test.type === "Heuristics" &&
        this.object.options.length == 1
      ) {
        this.$store.commit(
          "setError",
          "Please create at least 2 options or none at all"
        );
      } else if (this.test.type === "User" && !this.valids[1]) {
        this.$store.commit(
          "setError",
          "Please fill all fields in Post Test correctly or leave them empty"
        );
      } else {
        this.submit();
      }
    },
    preventNav(event) {
      if (!this.change) return;
      event.preventDefault();
      event.returnValue = "";
    },
    async setIntro() {
      this.object = await Object.assign(this.object, this.test);
      if (this.test.type === "Heuristics") {
        this.index = 1;
        if (this.test.heuristics.length == 0 && this.test.options.length == 0)
          this.intro = true;
        else this.intro = false;
      } else if (this.test.type === "User") {
        this.index = 0;
        if (
          this.test.tasks.length == 0 &&
          this.test.postTest.form == null &&
          this.test.preTest.consent == null &&
          this.test.preTest.form == null
        )
          this.intro = true;
        else this.intro = false;
      }
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.setIntro();
      }
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    user() {
      return this.$store.getters.user;
    },
    test() {
      return this.$store.getters.test;
    },
    answers() {
      return this.$store.state.answers.answers || [];
    }
  },
  created() {
    if (
      !this.$store.state.tests.test &&
      this.id !== null &&
      this.id !== undefined
    ) {
      this.$store.dispatch("getTest", { id: this.id });
    } else {
      this.setIntro();
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialog = true;
      this.go = to.path;
    } else {
      next();
    }
  },
  beforeMount() {
    window.addEventListener("beforeunload", this.preventNav);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.preventNav);
  }
};
</script>

<style scoped>
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
</style>
