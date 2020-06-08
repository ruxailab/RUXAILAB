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
          <v-divider v-if="accessLevel == 0 || accessLevel == null"></v-divider>
          <v-stepper-step step="5" editable v-if="accessLevel == 0 || accessLevel == null">
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
              <Heuristic :heuristics="heuristics" :answersSheet="answersSheet" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="4">
            <v-container>
              <FormPostTest :postTest="postTest" @valForm="validate" ref="form3" />
            </v-container>
          </v-stepper-content>
          <v-stepper-content step="5" v-if="accessLevel == 0 || accessLevel == null">
            <v-container>
              <FormCooperation :invitations="invitations" />
            </v-container>
          </v-stepper-content>
          <StepNavigation
            :step="el"
            :size="accessLevel == 0 || accessLevel == null ? 5 : 4"
            :create="true"
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
    accessLevel: null,
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
    answersSheet: {
      total: 0,
      progress: 0,
      heuristics: []
    },
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
      answers: "",
      reports: "",
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
        //Send db
        this.$store
          .dispatch("createTest", {
            collection: "test",
            data: this.object
          })
          .then(id => {
            this.$store
              .dispatch("createReport", {
                data: {
                  test: {
                    id: id,
                    title: this.object.title,
                    type: this.object.type
                  },
                  reports: []
                }
              })
              .then(idReport => {
                this.$store.dispatch("setReportID", {
                  docId: id,
                  data: idReport
                });

                this.$store
                  .dispatch("createAnswers", {
                    data: {
                      test: {
                        id: id,
                        title: this.object.title,
                        type: this.object.type
                      },
                      answers: []
                    }
                  })
                  .then(idAnswers => {
                    this.$store.dispatch("setAnswerID", {
                      docId: id,
                      data: idAnswers
                    });

                    this.$store.dispatch("pushMyTest", {
                      docId: this.user.uid,
                      element: {
                        id: id,
                        title: this.object.title,
                        type: this.object.type,
                        reports: idReport,
                        answers: idAnswers,
                        accessLevel: 0
                      },
                      param: "myTests"
                    });

                    //Making invites
                    this.invitations.forEach(item => {
                      let inv = {
                        to: {
                          id: item.id,
                          email: item.email,
                          accessLevel: item.accessLevel
                        },
                        from: {
                          id: this.user.uid,
                          email: this.user.email
                        },
                        test: {
                          id: id,
                          title: this.object.title,
                          type: this.object.type,
                          reports: idReport,
                          answers: idAnswers
                        }
                      };

                      this.$store.dispatch("pushNotification", {
                        docId: inv.to.id,
                        element: inv,
                        param: "notifications"
                      });
                    });
                  });
              });
          })
          .catch(err => {
            console.error("Error", err);
          });
      } else {
        this.snackMsg = "Test updated succesfully";
        this.snackColor = "success";
        this.snackbar = true;

        this.$store
          .dispatch("updateTest", {
            docId: this.id,
            data: this.object
          })
          .then(() => {
            this.$store.dispatch("updateMyTest", {
              docId: this.object.admin.id,
              element: {
                id: this.id,
                title: this.object.title,
                type: this.object.type,
                reports: this.object.reports,
                answers: this.object.answers,
                accessLevel: 0
              }
            });

            this.object.coop.forEach(coop => {
              this.$store.dispatch("updateMyCoops", {
                docId: coop.id,
                element: {
                  id: this.id,
                  title: this.object.title,
                  type: this.object.type,
                  reports: this.object.reports,
                  answers: this.object.answers,
                  accessLevel: coop.accessLevel
                }
              });
            });
          });
      }
    },
    nextStep() {
      if (this.el < this.accessLevel == 0 || this.accessLevel == null ? 5 : 4)
        this.el = Number(this.el) + 1;
    },
    backStep() {
      if (this.el > 1) this.el -= Number(this.el) - 1;
    },
    testLoad() {
      //Load admin
      this.object.admin = {
        id: this.testEdit.admin.id,
        email: this.testEdit.admin.email
      };

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
      ) {
        this.testEdit.heuristics.forEach(item => {
          this.heuristics.push(item);
        });
        this.answersSheet = this.testEdit.answersSheet;
      }
      //Load PostTest
      this.postTest =
        this.testEdit.postTest === null ? "" : this.testEdit.postTest;

      //Load Invitations
      this.invitations = Array.from(this.testEdit.coop);

      //Load Reports
      this.object.reports = this.testEdit.reports;

      //Load Answers
      this.object.answers = this.testEdit.answers;

      //Getting user access level
      this.testEdit.coop.forEach(coop => {
        if (coop.id === this.user.uid) {
          this.accessLevel = coop.accessLevel;
        }
      });
    },
    testAssembly() {
      //Make object test
      //Assigning admin info

      if (this.id === null || this.id === undefined)
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
        Object.assign(this.object, { answersSheet: this.answersSheet });
      }

      this.object.postTest = this.postTest === "" ? null : this.postTest;

      //assigning cooperations
      if (this.id !== null && this.id !== undefined) {
        let removed = this.testEdit.coop.filter(
          e => !this.invitations.includes(e)
        );
        let invite = this.invitations.filter(
          e => !this.testEdit.coop.includes(e)
        );

        removed.forEach(item => {
          this.$store.dispatch("removeMyCoops", {
            docId: item.id,
            element: {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              accessLevel: this.object.accessLevel
            }
          });
        });

        invite.forEach(item => {
          let inv = {
            to: {
              id: item.id,
              email: item.email,
              accessLevel: item.accessLevel
            },
            from: {
              id: this.user.uid,
              email: this.user.email
            },
            test: {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers
            }
          };
          this.$store.dispatch("pushNotification", {
            docId: inv.to.id,
            element: inv,
            param: "notifications"
          });
        });

        removed.forEach(item => {
          this.testEdit.coop.splice(this.testEdit.coop.indexOf(item), 1);
        });

        this.object.coop = this.testEdit.coop;
      }
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
        this.snackMsg = "Please create at least one ";
        if (this.test.type === "User") this.snackMsg += "task";
        else this.snackMsg += "heuristic";
        this.snackColor = "red";
        this.snackbar = "true";
      } else {
        this.submit();
      }
    }
  },
  watch: {
    snackbar() {
      if (this.snackbar === false && this.snackColor == "success")
        this.$router.push("/");
    },
    testEdit: async function() {
      if (this.testEdit !== null && this.testEdit !== undefined) {
        await this.testLoad();
      }
    }
    /*"test.type"() {
      this.tasks = [];
      this.heuristics = [];
    }*/
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
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", { id: this.id });
    }
  }
};
</script>