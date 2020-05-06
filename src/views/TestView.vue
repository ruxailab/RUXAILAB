<template >
  <v-stepper v-model="el" alt-labels>
    <v-row align="center">
      <template v-for="(step,n) in steps">
        <v-stepper-step
          :key="`${n+1}-step`"
          :complete="el > n+1"
          :step="n+1"
          editable
        >{{ step.key }}</v-stepper-step>
        <v-divider v-if="n+1 !== steps.length" :key="n+1"></v-divider>
      </template>
      <!--<v-stepper-step step="1" editable>Task Description</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2" editable>Pre Test</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3" editable>Tasks</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4" editable>Post Test</v-stepper-step>-->
    </v-row>
    <v-stepper-items>
      <v-stepper-content v-for="(step,n) in steps" :key="`${n+1}-content`" :step="n+1">
        <v-container v-if="step.key === 'Task Description'">
          <v-row>
            <v-col justify="center" align="center">
              <h1>{{step.value.title}}</h1>
              <h3>{{step.value.description}}</h3>
            </v-col>
          </v-row>
        </v-container>
        <v-container v-if="step.key === 'Pre Test'">
          <iframe
            v-if="!preTest"
            :src="step.value.consent"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>

          <iframe
            v-else
            :src="step.value.form"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </v-container>
        <v-container v-if="step.key === 'Tasks'">
          <v-row class="fill-height" align="center" justify="center">
            <v-btn color="success" @click="openPage">Start tasks</v-btn>
          </v-row>
        </v-container>
        <v-container v-if="step.key === 'Post Test'">
          <iframe
            :src="step.value"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </v-container>
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
      v-if="el === steps.length"
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
    el: 0,
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
        key: "Task Description",
        value: {
          title: this.test.title,
          description: this.test.description
        }
      });
      //PreTest
      if (this.test.preTest !== null && this.test.preTest !== undefined) {
        this.steps.push({ key: "Pre Test", value: this.test.preTest });
      }
      //Tasks
      this.steps.push({ key: "Tasks", value: this.test.tasks });

      //PostTest
      if (this.test.postTest !== null && this.test.postTest !== undefined) {
        this.steps.push({ key: "Post Test", value: this.test.postTest });
      }
      console.log(this.steps);
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