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
    </v-row>
    <v-stepper-items>
      <v-stepper-content v-for="(step,n) in steps" :key="`${n+1}-content`" :step="n+1">
        <v-container v-if="step.key === 'Test Description'">
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
      <StepNavigation
        :step="el"
        :size="steps.length"
        v-on:backStep="backStep()"
        v-on:nextStep="nextStep()"
        v-on:submit="nextStep()"
      />
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import StepNavigation from "../components/atoms/StepNavigation";

export default {
  props: ["id"],
  components: {
    StepNavigation
  },
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
    nextStep() {
      var preTest = this.test.preTest
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
        else this.$router.push('/')

      }
    },
    backStep() {
      if (this.el > 1) this.el -= 1;
    },
    mappingSteps() {
      //Test
      this.steps.push({
        key: "Test Description",
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
    if (!this.$store.test) this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>