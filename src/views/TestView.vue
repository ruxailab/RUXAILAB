<template >
  <v-stepper v-model="el" alt-labels >
    <v-row align="center">
      <v-stepper-step step="1" editable>Task Description</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2" editable>Pre Test</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3" editable>Tasks</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4" editable>Post Test</v-stepper-step>
    </v-row>
    <v-stepper-items>
      <v-stepper-content  step="1">
        <v-row>
          <v-col justify="center" align="center">
            <h1>{{test.title}}</h1>
            <h3>{{test.description}}</h3>
          </v-col>
        </v-row>
      </v-stepper-content>
      <v-stepper-content step="2">
        <iframe
          :src="test.preTest.form"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >Carregando…</iframe>
      </v-stepper-content>
      <v-stepper-content step="3">
        <v-row v-for="(task,i) in test.tasks" :key="i">
          <v-card>
            <v-card-title>{{task.name}}</v-card-title>
            <v-card-text>{{task.description}}</v-card-text>
            <v-card-text>{{task.tip}}</v-card-text>
            <v-btn v-if="task.timer" color="success">Start</v-btn>
          </v-card>
        </v-row>
      </v-stepper-content>
      <v-stepper-content step="4">
        <iframe
          :src="test.postTest"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >Carregando…</iframe>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    el: 1,
    steps: []
  }),
  watch: {
    steps(val) {
      if (this.el > val) {
        this.el = val;
      }
    },
    test: async function() {
      if (this.test !== null && this.test !== undefined)
        await this.mappingSteps();
      this.el = 1;
    }
  },

  methods: {
    nextStep(n) {
      if (n === this.steps.length) {
        this.el = 1;
      } else {
        this.el = n + 1;
      }
    },
    mappingSteps() {
      //Test
      this.steps.push({
        type: "start",
        title: this.test.title,
        description: this.test.description
      });

      //PreTest
      if (this.test.preTest !== null && this.test.preTest !== undefined) {
        if (
          this.test.preTest.consent !== null &&
          this.test.preTest.consent !== undefined
        ) {
          this.steps.push({ type: "form", form: this.test.preTest.consent });
        }
        if (
          this.test.preTest.form !== null &&
          this.test.preTest.form !== undefined
        ) {
          this.steps.push({ type: "form", form: this.test.preTest.form });
        }
      }

      //Tasks
      this.test.tasks.forEach(task => {
        this.steps.push({ type: "task", task: task });
        if (task.postTest !== null && task.postTest !== undefined) {
          this.steps.push({ type: "form", form: task.postTest });
        }
      });

      //PostTest
      this.steps.push({ type: "form", form: this.test.postTest });
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    }
  },
  created() {
    this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>