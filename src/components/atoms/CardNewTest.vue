<template>
  <div>
    <v-hover v-slot:default="{ hover }">
      <v-card :elevation="hover ? 24 : 10" shaped class="card" @click="dialog = true">
        <v-card-text>
          <v-row class="fill-height" justify="center" align="center">
            <v-icon color="#f9a826" size="150">mdi-plus-circle-outline</v-icon>
          </v-row>
          <v-row class="fill-height" justify="center" align="center">
            <p>New Test</p>
          </v-row>
        </v-card-text>
      </v-card>
    </v-hover>
    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="titleView ma-2 pa-2">Create Test</p>
          <v-divider></v-divider>
          <FormTestDescription :test="test" ref="form1" />
          <v-card-actions class="ma-0 pa-2">
            <v-spacer></v-spacer>
            <v-btn color="black" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="#F9A826" @click="testAssembly(),dialog = false">Create</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";

export default {
  components: {
    FormTestDescription
  },
  data: () => ({
    dialog: false,
    object: {},
    test: {
      title: "",
      description: "",
      type: ""
    }
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    },
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
              .dispatch("createAnswers", {
                data: {
                  test: {
                    id: id,
                    title: this.object.title,
                    type: this.object.type
                  },
                  answers: [],
                  answersSheet: this.answersSheet
                }
              })
              .then(idAnswers => {
                this.$store.dispatch("setAnswerID", {
                  docId: id,
                  data: idAnswers
                });

                this.$store
                  .dispatch("createReport", {
                    data: {
                      test: {
                        id: id,
                        title: this.object.title,
                        type: this.object.type,
                        answers: idAnswers
                      },
                      reports: []
                    }
                  })
                  .then(idReport => {
                    this.$store.dispatch("setReportID", {
                      docId: id,
                      data: idReport
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
      }
    },
    testAssembly() {
      //Make object test
      //Assigning admin info

      if (this.id === null || this.id === undefined) {
        this.object = Object.assign(this.object, {
          admin: {
            id: this.user.uid,
            email: this.user.email
          }
        });
      }

      //Assigning test info
      this.object = Object.assign(this.object, this.test);

      //assigning pre-test info
      // this.object.preTest.consent =
      //   this.preTest.consent === "" ? null : this.preTest.consent;
      // this.object.preTest.form =
      //   this.preTest.form === "" ? null : this.preTest.form;
      this.object = Object.assign(this.object, {
        preTest: {
          consent: null,
          form: null
        }
      });
      // this.object = Object.assign(this.object, this.preTest);

      // if (
      //   this.object.preTest.form === null &&
      //   this.object.preTest.consent === null
      // ) {
      //   this.object.preTest = null;
      // }

      //assigning tasks/heuristics
      if (this.test.type === "User") {
        // this.object.tasks = Array.from(this.tasks);
        this.object = Object.assign(this.object, { tasks: null });
      } else if (this.test.type === "Expert") {
        // this.object.heuristics = Array.from(this.heuristics);
        // Object.assign(this.object, { answersSheet: this.answersSheet });
        this.object = Object.assign(this.object, {
          heuristics: null,
          answersSheet: null
        });
      }

      //assigning post test
      // this.object.postTest = this.postTest === "" ? null : this.postTest;
      this.object = Object.assign(this.object, { postTest: null });

      // //assigning cooperations
      // if (this.id !== null && this.id !== undefined) {
      //   let removed = this.testEdit.coop.filter(
      //     e => !this.invitations.includes(e)
      //   );
      //   let invite = this.invitations.filter(
      //     e => !this.testEdit.coop.includes(e)
      //   );

      //   removed.forEach(item => {
      //     this.$store.dispatch("removeMyCoops", {
      //       docId: item.id,
      //       element: {
      //         id: this.id,
      //         title: this.object.title,
      //         type: this.object.type,
      //         reports: this.object.reports,
      //         answers: this.object.answers,
      //         accessLevel: this.object.accessLevel
      //       }
      //     });
      //   });

      //   invite.forEach(item => {
      //     let inv = {
      //       to: {
      //         id: item.id,
      //         email: item.email,
      //         accessLevel: item.accessLevel
      //       },
      //       from: {
      //         id: this.user.uid,
      //         email: this.user.email
      //       },
      //       test: {
      //         id: this.id,
      //         title: this.object.title,
      //         type: this.object.type,
      //         reports: this.object.reports,
      //         answers: this.object.answers
      //       }
      //     };
      //     this.$store.dispatch("pushNotification", {
      //       docId: inv.to.id,
      //       element: inv,
      //       param: "notifications"
      //     });
      //   });

      //   removed.forEach(item => {
      //     this.testEdit.coop.splice(this.testEdit.coop.indexOf(item), 1);
      //   });

      //   this.object.coop = this.testEdit.coop;
      // }
      this.object = Object.assign(this.object, { coop: [] });
      console.log(this.object);
    }
  },
  watch: {
    dialog() {
      this.test = {
        title: "",
        description: "",
        type: ""
      };
      this.object = {}
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    }
  }
};
</script>

<style>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.card {
  max-width: 330px;
  height: 200px;
  border-radius: 3px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background-color: #fff;
  border-bottom: 2px solid transparent;
  margin: 0 16px 16px 0;
}
.icon {
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
</style>