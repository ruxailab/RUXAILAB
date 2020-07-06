<template>
  <v-container v-if="test">
    <v-row justify="space-around">
      <v-col cols="12" class="titleView">Test Edit</v-col>
      <v-col cols="12" class="pa-0 pl-3 ma-0">
        <v-row dense>
          <v-tabs
            background-color="transparent"
            color="#FCA326"
            class="tab-border-bottom pb-0 mb-0"
          >
            <v-tab @click="index = 0">Pre Test</v-tab>
            <v-tab v-if="test.type === 'User'" @click="index = 1">Tasks</v-tab>
            <v-tab v-else-if="test.type === 'Expert'" @click="index = 1">Heuristics</v-tab>
            <v-tab @click="index = 2">Post Test</v-tab>
          </v-tabs>
        </v-row>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-btn v-if="change" large dark fab fixed bottom right color="#F9A826">
      <v-icon large>mdi-content-save</v-icon>
    </v-btn>
    <v-row justify="center">
      {{change}}
      ---------
      {{object}}
      <v-col cols="10">
        <v-card v-if="index==0" class="dataCard">
          <v-card-title class="subtitleView">Pre Test</v-card-title>
          <v-divider></v-divider>
          <v-row justify="space-around">
            <v-col cols="10">
              <FormPreTest
                :preTest="object.preTest"
                @valForm="validate"
                ref="form2"
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
        <v-card v-if="index==2" class="dataCard">
          <v-card-title class="subtitleView">Post Test</v-card-title>
          <v-divider></v-divider>
          <v-row justify="space-around">
            <v-col cols="10">
              <FormPostTest
                :postTest="object.postTest"
                @valForm="validate"
                ref="form3"
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

export default {
  props: ["id"],
  components: { FormPreTest, FormPostTest, ListTasks, Heuristic },
  data: () => ({
    index: 0,
    object: {},
    valids: [false, true, true],
    change: false
  }),
  methods: {
    testLoad() {
      //   //Load admin
      //   this.object.admin = {
      //     id: this.testEdit.admin.id,
      //     email: this.testEdit.admin.email
      //   };
      //   //Load Test Description
      //   this.test.title = this.testEdit.title;
      //   this.test.type = this.testEdit.type;
      //   this.test.description = this.testEdit.description;
      //   //Load Pretest
      //   if (
      //     this.testEdit.preTest !== null &&
      //     this.testEdit.preTest !== undefined
      //   ) {
      //     this.preTest.consent =
      //       this.testEdit.preTest.consent === null ||
      //       this.testEdit.preTest.consent === undefined
      //         ? ""
      //         : this.testEdit.preTest.consent;
      //     this.preTest.form =
      //       this.testEdit.preTest.form === null ||
      //       this.testEdit.preTest.form === undefined
      //         ? ""
      //         : this.testEdit.preTest.form;
      //   }
      //   //Load Tasks
      //   if (this.testEdit.tasks !== null && this.testEdit.tasks !== undefined)
      //     this.testEdit.tasks.forEach(task => {
      //       this.tasks.push(task);
      //     });
      //   //Load Heuristics
      //   if (
      //     this.testEdit.heuristics !== null &&
      //     this.testEdit.heuristics !== undefined
      //   ) {
      //     this.testEdit.heuristics.forEach(item => {
      //       this.heuristics.push(item);
      //     });
      //     this.answersSheet = this.testEdit.answersSheet;
      //   }
      //   //Load PostTest
      //   this.postTest =
      //     this.testEdit.postTest === null ? "" : this.testEdit.postTest;
      //   //Load Invitations
      //   this.invitations = Array.from(this.testEdit.coop);
      //   //Load Reports
      //   this.object.reports = this.testEdit.reports;
      //   //Load Answers
      //   this.object.answers = this.testEdit.answers;
      //   //Getting user access level
      //   this.testEdit.coop.forEach(coop => {
      //     if (coop.id === this.user.uid) {
      //       this.accessLevel = coop.accessLevel;
      //     }
      //   });
    },
    validate(valid, index) {
      this.valids[index] = valid;
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign(this.object, this.test);
      }
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
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