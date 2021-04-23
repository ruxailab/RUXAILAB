<template>
  <div>
    <Snackbar />
    <!-- Leave Alert Dialog -->
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

    <!-- Save button -->
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

    <!-- Loading Overlay -->
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
      <!-- Heuristics tests -->
      <EditHeuristicsTest
        v-if="test.type == 'Heuristics'"
        type="tabs"
        @tabClicked="setIndex"
        slot="top"
      />
      <EditHeuristicsTest
        v-if="test.type === 'Heuristics'"
        type="content"
        :object="object"
        :index="index"
        @change="change = true"
        slot="content"
      />

      <!-- User tests -->
      <EditUserTest
        v-if="test.type === 'User'"
        type="tabs"
        @tabClicked="setIndex"
        slot="top"
      />

      <EditUserTest
        v-if="test.type === 'User'"
        :object="object"
        :index="index"
        type="content"
        @change="change = true"
        @valForm="validate"
        slot="content"
      />
    </ShowInfo>
  </div>
</template>

<script>
import Snackbar from "@/components/atoms/Snackbar";
import ShowInfo from "@/components/organisms/ShowInfo";
import IntroEdit from "@/components/molecules/IntroEdit.vue";
import EditHeuristicsTest from "@/components/organisms/EditHeuristicsTest";
import EditUserTest from "@/components/organisms/EditUserTest";

export default {
  props: ["id"],
  components: {
    Snackbar,
    ShowInfo,
    IntroEdit,
    EditHeuristicsTest,
    EditUserTest,
  },
  data: () => ({
    index: 0,
    object: {},
    valids: [true, true],
    change: false,
    dialog: false,
    intro: null,
  }),
  methods: {
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });
      let today = new Date();

      if (this.object.date !== today.toDateString())
        this.object.date = today.toDateString(); //update date if not the same as last update

      if ("template" in this.object) this.object.template.upToDate = false; //flag as outdated
      this.$store
        .dispatch("updateTest", {
          docId: this.id,
          data: this.object,
        })
        .then(() => {
          let element = Object.assign(
            {},
            {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              cooperators: this.object.cooperators,
              accessLevel: 0,
              date: this.object.date,
            }
          );
          if ("template" in this.object)
            element = Object.assign(element, {
              template: this.object.template,
            });

          this.$store.dispatch("updateMyTest", {
            docId: this.object.admin.id,
            element: element,
          });

          this.answers.answersSheet = this.object.answersSheet;
          if (this.test.type === "Heuristics")
            Object.assign(this.answers, { options: this.object.options });
          this.$store
            .dispatch("updateTestAnswer", {
              docId: this.test.answers,
              data: this.answers,
            })
            .then(() => {
              this.$store.commit("setSuccess", "Test updated succesfully");
              this.change = false;
            })
            .catch((err) => {
              this.$store.commit("setError", err);
            });
        })
        .catch((err) => {
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
        if (this.test.heuristics.length == 0 && this.test.options.length == 0)
          this.intro = true;
        else this.intro = false;
      } else if (this.test.type === "User") {
        if (
          this.test.tasks.length == 0 &&
          this.test.postTest.form == null &&
          this.test.preTest.consent == null &&
          this.test.preTest.form == null
        )
          this.intro = true;
        else this.intro = false;
      }
    },
    setIndex(ind) {
      this.index = ind;
    },
  },
  watch: {
    test: async function () {
      if (this.test !== null && this.test !== undefined) {
        this.setIntro();
      }
    },
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
      return this.$store.getters.answers || [];
    },
  },
  async created() {
    await this.$store.dispatch("getTest", { id: this.id });
    this.setIntro();
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
  },
};
</script>