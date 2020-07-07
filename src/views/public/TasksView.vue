<template>
  <v-stepper v-model="e1">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-stepper-header>
      <template v-for="(item,n) in items">
        <v-stepper-step :key="`${n+1}-step`" :complete="e1 > n+1" :step="n+1" editable></v-stepper-step>
        <v-divider v-if="n+1 !== items.length" :key="n+1"></v-divider>
      </template>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content v-for="(item,n) in items" :key="`${n+1}-content`" :step="n+1">
        <ViewTask v-if="type === 'User'" :postTest="postTest" :item="item" />
        <ViewHeuristic
          v-if="type === 'Expert' && answersSheet !== null && answersSheet !== undefined"
          :item="item"
          :heuris="answersSheet.heuristics[n]"
          :options="test.options"
          @progress="calcProgress"
        />
      </v-stepper-content>
      <StepNavigation
        :step="e1"
        :size="items.length"
        v-on:backStep="backStep()"
        v-on:nextStep="nextStep()"
        v-on:submit="submitLog()"
        v-on:save="save()"
      />
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import StepNavigation from "@/components/atoms/StepNavigation";
import ViewTask from "@/components/atoms/ViewTask";
import ViewHeuristic from "@/components/atoms/ViewHeuristic";

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
  props: ["id", "type"],
  components: {
    StepNavigation,
    ViewTask,
    ViewHeuristic
  },
  data: () => ({
    e1: 0,
    postTest: false,
    loading: true,
    answersSheet: null
  }),
  methods: {
    nextStep() {
      var postTest = this.items[this.e1 - 1].postTest;
      if (postTest !== null && postTest !== undefined) {
        if (this.postTest) {
          if (this.e1 < this.items.length) this.e1 = Number(this.e1) + 1;
          else if (this.e1 === this.items.length) window.close();
          this.postTest = false;
        } else {
          this.postTest = true;
        }
      } else {
        if (this.e1 < this.items.length) this.e1 = Number(this.e1) + 1;
        else if (this.e1 === this.items.length) {
          //window.close();
        }
      }
    },
    submitLog() {
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
          this.$store.dispatch("pushAnswers", {
            docId: newAnswer.answers,
            element: Object.assign(this.answersSheet, {
              uid: this.user.uid,
              email: this.user.email,})
          });
        });
    },
    backStep() {
      if (this.postTest) this.postTest = false;
      else if (this.e1 > 1) this.e1 = Number(this.e1) - 1;
    },
    save() {
      let newAnswer = this.user.myAnswers.find(answer => answer.id == this.id);
      this.$store.dispatch("updateMyAnswers", {
        docId: this.user.uid,
        element: newAnswer
      });
      this.submitLog();
    },
    async fetch() {
      await pause(1000);
      this.e1 = 1;
      this.loading = false;
    },
    calcProgress() {
      var qtd = 0;
      this.answersSheet.heuristics.forEach(h => {
        qtd += h.questions.filter(q => q.res != null).length;
      });

      this.answersSheet.progress = (qtd * 100) / this.answersSheet.total;
    }
  },
  watch: {
    items() {
      this.fetch();
    },
    user() {
      if (this.user !== null && this.user !== undefined) {
        let x = this.user.myAnswers.find(answer => answer.id == this.id);
        this.answersSheet = x.answersSheet;
      }
    }
  },
  computed: {
    items() {
      const type = this.type;
      if (this.$store.getters.test) {
        switch (type) {
          case "User":
            return this.$store.getters.tasks;
          case "Expert":
            return this.$store.getters.heuristics;
          default:
            return [];
        }
      }
      return [];
    },
    user() {
      return this.$store.state.auth.user;
    },
    test() {
      return this.$store.getters.test;
    },
  },
  created() {
    if (!this.$store.test) this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>
<style>
.paragraph {
  padding: 50px;
}
</style>