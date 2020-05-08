<template>
  <v-container justify="center">
    <v-card>
      <v-stepper v-model="el" alt-labels non-linear>
        <v-stepper-header>
          <v-stepper-step step="1" editable>Test Description</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2" editable>
            Pre Test
            <small>Optional</small>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3" editable>Tasks</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="4" editable>
            Post Test
            <small>Optional</small>
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <v-container>
              <FormTestDescription :test="test" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="2">
            <v-container>
              <FormPreTest :preTest="preTest" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="3">
            <v-container>
              <ListTasks :tasks="tasks" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="4">
            <v-container>
              <FormPostTest :postTest="postTest" />
            </v-container>
          </v-stepper-content>
          <StepNavigation
            :step="el"
            :size="4"
            v-on:backStep="backStep()"
            v-on:nextStep="nextStep()"
            v-on:submit="submit()"
          />
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-container>
</template>


<script>
import FormTestDescription from "../components/atoms/FormTestDescription";
import FormPreTest from "../components/atoms/FormPreTest";
import FormPostTest from "../components/atoms/FormPostTest";
import ListTasks from "../components/molecules/ListTasks";
import StepNavigation from "../components/atoms/StepNavigation";

export default {
  components: {
    FormTestDescription,
    FormPreTest,
    FormPostTest,
    ListTasks,
    StepNavigation
  },
  data: () => ({
    el: 1,
    test: {
      title: "",
      description: "",
      type: ""
    },
    preTest: {
      consent: "",
      form: ""
    },
    tasks: [],
    postTest: "",
    object: {
      title: "",
      type: "",
      description: "",
      preTest: {
        consent: "",
        form: ""
      },
      tasks: [],
      postTest: ""
    }
  }),
  methods: {
    submit: function() {
      //Make object test
      this.object.title = this.test.title;
      this.object.type = this.test.type;
      this.object.description = this.test.description;

      this.object.preTest.consent =
        this.preTest.consent === "" ? null : this.preTest.consent;
      this.object.preTest.form =
        this.preTest.form === "" ? null : this.preTest.form;

      if (
        this.object.preTest.form === null &&
        this.object.preTest.consent === null
      ) {
        this.object.preTest = null;
      }

      this.tasks.forEach(task => {
        this.object.tasks.push(task);
      });

      this.object.postTest = this.postTest === "" ? null : this.postTest;

      //Send db
      this.$store.dispatch("createTest", {
        collection: "test",
        data: this.object
      });
    },
    nextStep() {
      if (this.el < 4) this.el += 1;
    },
    backStep() {
      if (this.el > 1) this.el -= 1;
    }
  }
};
</script>