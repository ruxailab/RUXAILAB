<template>
  <v-stepper v-model="el">
    <v-stepper-header>
      <template v-for="(n,index) in steps">
        <v-stepper-step
          :key="`${index+1}-step`"
          :complete="el > index"
          :step="index+1"
        >Task {{ index }}</v-stepper-step>

        <v-divider v-if="index+1 !== steps.length" :key="index+1"></v-divider>
      </template>
    </v-stepper-header>
    <v-stepper-items>
      <v-stepper-content v-for="(n, index) in steps" :key="`${index+1}-content`" :step="index+1">
        <v-container  fluid>
          <v-row v-if="n.type === 'start'" justify="center">
            <v-col cols="2">
              <v-card-text>
                <v-card-title>{{n.title}}</v-card-title>
                <v-card-text>{{n.discription}}</v-card-text>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" @click="nextStep(index+1)">Continue</v-btn>
              <v-btn text>Cancel</v-btn>
            </v-col>
          </v-row>
          <v-row v-if="n.type === 'task'" justify="center">
            <v-col cols="1">
              <v-row>
                <v-card-title>{{n.task.name}}</v-card-title>
              </v-row>
              <v-row>
                <v-card-text>{{n.task.discription}}</v-card-text>
              </v-row>
              <v-row>
                <v-card-text>{{n.task.tip}}</v-card-text>
              </v-row>
              <v-row v-if="n.task.timer">
                <v-btn color="success">Start</v-btn>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" @click="nextStep(index+1)">Continue</v-btn>
              <v-btn text>Cancel</v-btn>
            </v-col>
          </v-row>
          <v-row v-if="n.type === 'form'" justify="center">
            <v-col cols="12">
              <iframe
                :src="n.form"
                width="100%"
                height="900"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
              >Carregando…</iframe>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" @click="nextStep(index+1)">Continue</v-btn>
              <v-btn text>Cancel</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    el: 0,
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
        discription: this.test.discription
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