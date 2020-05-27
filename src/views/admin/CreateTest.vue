<template>
  <v-container>
    <v-card>
      <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
        <!-- <p v-if="id === null">Test registered successfully</p>
        <p v-else>Test updated successfully</p>-->
        <p>{{ snackMsg }}</p>
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
          <v-divider></v-divider>
          <v-stepper-step step="5" editable>
            Cooperation
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
              <FormPreTest :preTest="preTest" @valForm="validate" ref="form2" />
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
              <FormPostTest :postTest="postTest" @valForm="validate" ref="form3" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="5">
            <v-container>
              <FormCooperation :invitations="invitations" />
            </v-container>
          </v-stepper-content>
          <StepNavigation
            :step="el"
            :size="5"
            v-on:backStep="backStep()"
            v-on:nextStep="nextStep()"
            v-on:submit="validateAll()"
          />
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-container>
</template>


<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";
import FormPreTest from "@/components/atoms/FormPreTest";
import FormPostTest from "@/components/atoms/FormPostTest";
import ListTasks from "@/components/molecules/ListTasks";
import StepNavigation from "@/components/atoms/StepNavigation";
import Heuristic from "@/components/molecules/HeuristicsTable";
import FormCooperation from "@/components/atoms/FormCooperation";

export default {
  props: ["id"],
  components: {
    FormTestDescription,
    FormPreTest,
    FormPostTest,
    ListTasks,
    StepNavigation,
    Heuristic,
    FormCooperation
  },
  data: () => ({
    el: 1,
    snackbar: false,
    snackMsg: "",
    snackColor: "",
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
    invitations: [],
    object: {
      title: "",
      type: "",
      description: "",
      preTest: {
        consent: "",
        form: ""
      },
      postTest: "",
      admin: null,
      answers: [],
      coop: []
    },
    valids: [false, true, true]
  }),
  methods: {
    submit() {
      this.testAssembly();
      if (this.id === null || this.id === undefined) {
        this.snackMsg = "Test created succesfully";
        this.snackColor = "success";
        this.snackbar = true;
        console.log("create");
        //Send db
        this.$store
          .dispatch("createTest", {
            collection: "test",
            data: this.object
          })
          .then(id => {
            this.$store.dispatch("pushMyTest", {
              docId: this.user.uid,
              element: {
                id: id,
                title: this.object.title,
                type: this.object.type
              },
              param: "myTests"
            });

            this.invitations.forEach(item => {
              item.test.id = id;
              item.test.title = this.object.title;
              item.test.type = this.object.type;
            });

            this.invitations.forEach(inv => {
              console.log(inv);
              this.$store.dispatch("pushNotification", {
                docId: inv.to.id,
                element: inv,
                param: "notifications"
              });
            });
          })
          .catch(err => {
            console.log("err", err);
          });
      } else {
        this.snackMsg = "Test updated succesfully";
        this.snackColor = "success";
        this.snackbar = true;
        console.log("update");
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

      //Load Heuristics
      if (
        this.testEdit.heuristics !== null &&
        this.testEdit.heuristics !== undefined
      )
        this.testEdit.heuristics.forEach(item => {
          this.heuristics.push(item);
        });

      //Load PostTest
      this.postTest =
        this.testEdit.postTest === null ? "" : this.testEdit.postTest;
    },
    testAssembly() {
      //Make object test
      //Assigning admin info
      this.object.admin = {
        id: this.user.uid,
        email: this.user.email
      };

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
    validate(valid, index) {
      this.valids[index] = valid;
    },
    validateAll() {
      this.$refs.form1.valida();
      this.$refs.form2.valida();
      this.$refs.form3.valida();

      let valid = true;
      this.valids.forEach(item => {
        if (item === false) {
          valid = false;
        }
      });

      if (valid === false) {
        this.snackMsg = "Please fill all required fields correclty";
        this.snackColor = "red";
        this.snackbar = "true";
      } else if (this.tasks.length === 0 && this.heuristics.length === 0) {
        console.log("invalid, please create at least one thing");
        this.snackMsg = "Please create at least one ";
        if (this.test.type === "User") this.snackMsg += "task";
        else this.snackMsg += "heuristic";
        this.snackColor = "red";
        this.snackbar = "true";
      } else {
        console.log("valid");
        this.submit();
      }
    },
    pushInvitations(item) {
      this.invitations.push(item);
    },
    removeInvitations(item) {
      this.invitations.splice(this.invitations.indexOf(item), 1);
    }
  },
  watch: {
    snackbar() {
      if (this.snackbar === false && this.snackColor == "success")
        this.$router.push("/");
    },
    testEdit: async function() {
      if (this.testEdit !== null && this.testEdit !== undefined)
        await this.testLoad();
    }
  },
  computed: {
    testEdit() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    }
  },
  created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined)
      this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>