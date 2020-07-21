<template>
  <v-container v-if="test">
    <Snackbar />

    <v-row justify="space-around">
      <v-col cols="12" class="titleView">Test Edit</v-col>
      <v-col cols="12" class="pa-0 pl-3 ma-0">
        <v-row dense>
          <v-tabs
            background-color="transparent"
            color="#FCA326"
            class="tab-border-bottom pb-0 mb-0"
          >
            <v-tab v-if="test.type === 'User'" @click="index = 0">Pre Test</v-tab>
            <v-tab v-if="test.type === 'User'" @click="index = 1">Tasks</v-tab>
            <v-tab v-if="test.type === 'Expert'" @click="index = 1">Heuristics</v-tab>
            <v-tab v-if="test.type === 'Expert'" @click="index = 2">Options</v-tab>
            <v-tab v-if="test.type === 'User'" @click="index = 3">Post Test</v-tab>
          </v-tabs>
        </v-row>
      </v-col>
    </v-row>
    <v-divider></v-divider>

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
          @click=" validateAll()"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon large>mdi-content-save</v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>

    <v-row justify="center">
      <v-col cols="12">
        <v-card v-if="index==0" class="dataCard">
          <v-card-title class="subtitleView">Pre Test</v-card-title>
          <v-divider></v-divider>
          <v-row justify="space-around">
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

        <v-row justify="center" v-if="index==1">
          <v-col cols="12" class="pa-0">
            <ListTasks v-if="test.type === 'User'" :tasks="object.tasks" @change="change = true" />
            <Heuristic
              v-else-if="test.type === 'Expert'"
              :heuristics="object.heuristics"
              :answersSheet="object.answersSheet"
              @change="change = true"
            />
          </v-col>
        </v-row>

        <v-row justify="center" v-if="index==2">
          <v-col cols="12" class="pa-0">
            <OptionsTable :options="object.options" @valForm="validate" @change="change = true" />
          </v-col>
        </v-row>

        <v-card v-if="index==3" class="dataCard">
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormPreTest from "@/components/atoms/FormPreTest";
import FormPostTest from "@/components/atoms/FormPostTest";
import ListTasks from "@/components/molecules/ListTasks";
import Heuristic from "@/components/molecules/HeuristicsTable";
import OptionsTable from "@/components/molecules/OptionsTable";
import Snackbar from "@/components/atoms/Snackbar";

export default {
  props: ["id"],
  components: {
    FormPreTest,
    FormPostTest,
    ListTasks,
    Heuristic,
    OptionsTable,
    Snackbar
  },
  data: () => ({
    index: 0,
    object: {},
    valids: [true, true],
    change: false
  }),
  methods: {
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });

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
              accessLevel: 0
            }
          });

          this.answers.answersSheet = this.object.answersSheet;
          this.$store
            .dispatch("updateTestAnswer", {
              docId: this.test.answers,
              data: this.answers
            })
            .then(() => {
              this.$store.commit("setSuccess", "Test updated succesfully");
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
        this.$store.commit("setError", "Please fill all fields in Pre Test correctly or leave them empty")
      } else if (
        this.test.type === "Expert" &&
        this.object.options.length == 1
      ) {
        this.$store.commit("setError", "Please create at least 2 options or none at all");
      } else if (this.test.type === "User" && !this.valids[1]) {
        this.$store.commit("setError", "Please fill all fields in Post Test correctly or leave them empty");
      } else {
        this.submit();
      }
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign(this.object, this.test);

        if (this.test.type === "Expert") this.index = 1;
        else if (this.test.type === "User") this.index = 0;
      }
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
    answers() {
      return this.$store.state.answers.answers || [];
    }
  },
  created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", { id: this.id });
    }
  }
};
</script>

<style scoped>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
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

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>