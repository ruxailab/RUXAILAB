<template>
  <v-stepper v-model="e1">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-stepper-header>
      <template v-for="(task,n) in tasks">
        <v-stepper-step
          :key="`${n+1}-step`"
          :complete="e1 > n+1"
          :step="n+1"
          editable
        >Task {{ n+1 }}</v-stepper-step>
        <v-divider v-if="n+1 !== tasks.length" :key="n+1"></v-divider>
      </template>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content v-for="(task,n) in tasks" :key="`${n+1}-content`" :step="n+1">
        <v-row v-if="!postTest" class="fill-height" align="center" justify="center">
          <v-col cols="12">
            <v-row justify="center">
              <h1>{{task.name}}</h1>
            </v-row>
            <v-spacer></v-spacer>
            <v-row justify="center">
              <p>{{task.description}}</p>
            </v-row>
            <v-spacer></v-spacer>
            <v-row justify="center" v-if="task.tip !== null">Tip: {{task.tip}}</v-row>
            <v-spacer></v-spacer>
            <v-row justify="center">
              <v-btn v-if="task.timer === true" color="success">
                <v-icon left>mdi-timer</v-icon>Start
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-else class="fill-height" align="center" justify="center">
          <iframe
            :src="task.postTest"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </v-row>
      </v-stepper-content>
      <StepNavigation
        :step="e1"
        :size="tasks.length"
        v-on:backStep="backStep()"
        v-on:nextStep="nextStep()"
        v-on:submit="nextStep()"
      />
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import StepNavigation from "../components/atoms/StepNavigation";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
  props: ["id"],
  components: {
    StepNavigation
  },
  data: () => ({
    e1: 0,
    postTest: false,
    loading: true
  }),
  methods: {
    nextStep() {
      var postTest = this.tasks[this.e1 - 1].postTest;
      if (postTest !== null && postTest !== undefined) {
        if (this.postTest) {
          if (this.e1 < this.tasks.length) this.e1 = Number(this.e1) + 1;
          else if (this.e1 === this.tasks.length) window.close();
          this.postTest = false;
        } else {
          this.postTest = true;
        }
      } else {
        if (this.e1 < this.tasks.length) this.e1 = Number(this.e1) + 1;
        else if (this.e1 === this.tasks.length) window.close();
      }
    },
    backStep() {
      if (this.e1 > 1) this.e1 = Number(this.e1) - 1;
    },
    async fetchUsers() {
      //this.loading = true;
      await pause(1000);
      this.e1 = 1;
      this.loading = false;
    }
  },
  watch: {
    tasks() {
      this.fetchUsers();
    }
  },
  computed: {
    tasks() {
      if (this.$store.getters.test) {
        return this.$store.getters.tasks;
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
</style>