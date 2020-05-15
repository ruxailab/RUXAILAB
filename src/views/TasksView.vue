<template>
  <v-stepper v-model="e1">
    <v-overlay :value="false">
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
          v-if="type === 'Expert'"
          :heuris="heuristics[n]"
          v-on:response="addHeuris(item.id,$event)"
          :item="item"
        />
      </v-stepper-content>
      <StepNavigation
        :step="e1"
        :size="items.length"
        v-on:backStep="backStep()"
        v-on:nextStep="nextStep()"
        v-on:submit="nextStep()"
      />
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import StepNavigation from "../components/atoms/StepNavigation";
import ViewTask from "../components/atoms/ViewTask";
import ViewHeuristic from "../components/atoms/ViewHeuristic";

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
    heuristics: [],
    heuris: {
      id: null,
      questions: []
    },
    question: {
      id: null,
      answer: null
    },
    object:{}
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
        else if (this.e1 === this.items.length){
          this.$store.dispatch('pushTestAnswer',{docId: this.id,answer:this.object})
          //window.close();
        } 
      }
    },
    backStep() {
      if (this.postTest) this.postTest = false;
      else if (this.e1 > 1) this.e1 = Number(this.e1) - 1;
    },
    async fetch() {
      await pause(1000);
      this.e1 = 1;
      this.loading = false;
    },
    answerAssembly() {
      this.items.forEach(item => {
        this.heuris.id = item.id;
        item.questions.forEach(q => {
          this.question.id = q.id;
          this.heuris.questions.push(Object.assign({},this.question));
          this.question = { 
            id: null,
            answer: null
          };
        });
        this.heuristics.push(Object.assign({}, this.heuris));
        this.heuris = {
          id: null,
          questions: []
        };
      });
      this.object = Object.assign({},{heuristics:this.heuristics})
    }
  },
  watch: {
    items() {
      this.fetch();
      this.answerAssembly()
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
    }
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