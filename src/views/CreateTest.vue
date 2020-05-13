<template>
  <v-container>
    <v-card>
      <v-snackbar v-model="snackbar" color="success" top :timeout="2000">
        <p v-if="id === null">Test registered successfully</p>
        <p v-else>Test updated successfully</p>
        <v-btn text @click="snackbar = false">
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
      </v-snackbar>
      <v-stepper v-model="el" alt-labels non-linear>
        <v-stepper-header>
          <v-stepper-step step="1" editable>Test Description</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2" editable>
            Pre Test
            <small>Optional</small>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step v-if="test.type === 'User'" step="3" editable>Tasks</v-stepper-step>
          <v-stepper-step v-else-if="test.type === 'Expert'" step="3" editable>Heuristic</v-stepper-step>
          <v-stepper-step v-else step="3" editable>Select type</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="4" editable>
            Post Test
            <small>Optional</small>
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <v-container>
              <FormTestDescription :test="test" @valForm="validate" ref="form1" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="2">
            <v-container>
              <FormPreTest :preTest="preTest" @valForm="validate" ref="form2"/>
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="3">
            <v-container v-if="test.type === 'User'">
              <ListTasks :tasks="tasks" />
            </v-container>
            <v-container v-if="test.type === 'Expert'">
              <Heuristic :heuristics="heuristics" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="4">
            <v-container>
              <FormPostTest :postTest="postTest" @valForm="validate" ref="form3"/>
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
    <v-btn @click="validateAll()">general</v-btn>
  </v-container>
</template>


<script>
import FormTestDescription from "../components/atoms/FormTestDescription";
import FormPreTest from "../components/atoms/FormPreTest";
import FormPostTest from "../components/atoms/FormPostTest";
import ListTasks from "../components/molecules/ListTasks";
import StepNavigation from "../components/atoms/StepNavigation";
import Heuristic from "../components/molecules/HeuristicsTable";

export default {
  props: ["id"],
  components: {
    FormTestDescription,
    FormPreTest,
    FormPostTest,
    ListTasks,
    StepNavigation,
    Heuristic
  },
  data: () => ({
    el: 1,
    snackbar: false,
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
    heuristics: [],
    postTest: "",
    object: {
      title: "",
      type: "",
      description: "",
      preTest: {
        consent: "",
        form: ""
      },
      postTest: ""
    },
    valids: [false, true, true]
  }),
  methods: {
    submit() {
      this.testAssembly();
      if (this.id === null || this.id === undefined) {
        this.snackbar = true;
        //Send db
        this.$store.dispatch("createTest", {
          collection: "test",
          data: this.object
        });
      } else {
        this.snackbar = true;
        this.$store.dispatch("updateTest", {
          docId: this.id,
          data: this.object
        });
      }
    },
    nextStep() {
      if (this.el < 4) this.el = Number(this.el) + 1;
    },
    backStep() {
      if (this.el > 1) this.el -= Number(this.el) - 1;
    },
    testLoad() {
      //Load Test Description
      this.test.title = this.testEdit.title;
      this.test.type = this.testEdit.type;
      this.test.description = this.testEdit.description;

      //Load Pretest
      if (
        this.testEdit.preTest !== null &&
        this.testEdit.preTest !== undefined
      ) {
        this.preTest.consent =
          this.testEdit.preTest.consent === null ||
          this.testEdit.preTest.consent === undefined
            ? ""
            : this.testEdit.preTest.consent;

        this.preTest.form =
          this.testEdit.preTest.form === null ||
          this.testEdit.preTest.form === undefined
            ? ""
            : this.testEdit.preTest.form;
      }

      //Load Tasks
      if (this.testEdit.tasks !== null && this.testEdit.tasks !== undefined)
        this.testEdit.tasks.forEach(task => {
          this.tasks.push(task);
        });
      //Load PostTest
      this.postTest =
        this.testEdit.postTest === null ? "" : this.testEdit.postTest;
    },
    testAssembly() {
      //Make object test
      //Assigning test info
      this.object = Object.assign(this.object, this.test);

      //assigning pre-test info
      this.object.preTest.consent =
        this.preTest.consent === "" ? null : this.preTest.consent;
      this.object.preTest.form =
        this.preTest.form === "" ? null : this.preTest.form;
      // this.object = Object.assign(this.object, this.preTest);

      if (
        this.object.preTest.form === null &&
        this.object.preTest.consent === null
      ) {
        this.object.preTest = null;
      }

      //assigning tasks/heuristics
      if (this.test.type === "User") {
        this.object.tasks = Array.from(this.tasks);
      } else if (this.test.type === "Expert") {
        this.object.heuristics = Array.from(this.heuristics);
      }

      this.object.postTest = this.postTest === "" ? null : this.postTest;
    },
    validate(valid, index){
      //Test-description index 0
      //Pre-test index 1
      //Post-test index 2
      this.valids[index] = valid
      // console.log(this.valids);
    },
    validateAll(){
      this.$refs.form1.valida();
      this.$refs.form2.valida();
      this.$refs.form3.valida();

      let valid = true;
      this.valids.forEach(item => {
        if(item === false){
          valid = false;
        }
      })

      if(valid === false ||
         (this.tasks.length === 0 && this.heuristics.length === 0)
      ) {
        console.log('invalid')
      } else {
        console.log('valid');
      } 

    },
    log() {
      console.log('valids ' + this.valids)
    }
  },
  watch: {
    snackbar() {
      if (this.snackbar === false) this.$router.push("/");
    },
    testEdit: async function() {
      if (this.testEdit !== null && this.testEdit !== undefined)
        await this.testLoad();
    }
  },
  computed: {
    testEdit() {
      return this.$store.getters.test;
    }
  },
  created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined)
      this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>