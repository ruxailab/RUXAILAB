<template >
  <v-stepper v-model="el" alt-labels>
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
      <v-stepper-content step="1">
        <v-row>
          <v-col justify="center" align="center">
            <h1>{{test.title}}</h1>
            <h3>{{test.description}}</h3>
          </v-col>
        </v-row>
      </v-stepper-content>
      <v-stepper-content step="2">
        <iframe
          v-if="!preTest"
          :src="test.preTest.consent"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >Carregando…</iframe>

        <iframe
          v-else
          :src="test.preTest.form"
          width="100%"
          height="900"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >Carregando…</iframe>
      </v-stepper-content>
      <v-stepper-content step="3">
        <v-row class="fill-height" align="center" justify="center">
          <v-btn color="success" @click="openPage">Start tasks</v-btn>
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
    <v-btn large fab fixed bottom left elevation="24" outlined @click="backStep()">
      <v-icon>mdi-arrow-left-drop-circle</v-icon>
    </v-btn>
    <v-btn
      large
      dark
      fab
      fixed
      bottom
      right
      elevation="24"
      color="success"
      @click="nextStep(test.preTest)"
    >
      <v-icon>mdi-arrow-right-drop-circle</v-icon>
    </v-btn>
    <v-btn
      v-if="el === 4"
      large
      dark
      fab
      fixed
      bottom
      right
      elevation="24"
      color="success"
      @click="$router.push('/')"
    >
      <v-icon>mdi-content-save-outline</v-icon>
    </v-btn>
  </v-stepper>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    el: 1,
    steps: [],
    preTest: null
  }),
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined)
        await this.mappingSteps();
      this.el = 1;
    }
  },

  methods: {
    nextStep(preTest) {
      if (
        this.el === 2 &&
        preTest.form !== null &&
        preTest.form !== undefined
      ) {
        if (this.preTest) {
          this.el += 1;
          this.preTest = false;
        } else this.preTest = true;
      } else {
        if (this.el < 4) this.el += 1;
      }
    },
    backStep() {
      if (this.el > 1) this.el -= 1;
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
    },
    openPage() {
      window.open("/testview/" + this.id + "/tasksview");
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