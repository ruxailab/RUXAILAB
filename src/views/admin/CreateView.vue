<template>
  <div>
    <h2
      style="font-weight: 400; display: flex; justify-content: center; margin: 30px 0px"
    >Create a new test</h2>

    <v-row justify="center" style="padding: 0px 30px;">
      <v-row style="max-width: 90%" justify="center">
        <v-col cols="12" md="6">
          <v-card class="card" flat @click="dialog = true" :ripple="false">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img contain src="@/assets/createView/blankCanvas.svg" max-height="200"></v-img>
              </v-col>
              <v-col cols="12" md="6" class="card-text">
                <div class="card-title">Create a blank test</div>
                <div>Create a blank test to begin with a completely new and fresh template.</div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="card" flat @click="pushToFromTemplate()" :ripple="false">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img contain src="@/assets/createView/createFromTemplate.svg" max-height="200"></v-img>
              </v-col>
              <v-col cols="12" md="6" class="card-text-box">
                <div class="card-title">Create from template</div>
                <div>Create a test based on a template created by one of our users.</div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-row>

    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="dialog-title ma-2 pa-2">Create Test</p>
          <v-divider></v-divider>
          <FormTestDescription :test="test" ref="form" :lock="false" />
          <v-card-actions class="ma-0 pa-2">
            <v-spacer></v-spacer>
            <v-btn color="black" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="#F9A826" @click="validate()">Create</v-btn>
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
    FormTestDescription,
  },
  data: () => ({
    dialog: false,
    object: {},
    test: {
      title: "",
      description: "",
      type: "",
    },
    testID: null,
  }),
  methods: {
    pushToFromTemplate() {
        this.$router.push('/fromtemplate');
    },
    async submit() {
      await this.testAssembly(); // build Test
      let d = new Date();
      let object = this.object;
      let successful = true;
      //Send db
      await this.$store
        .dispatch("createTest", {
          collection: "test",
          data: Object.assign(object, { date: d.toDateString() }),
        })
        .then((id) => {
          this.testID = id;
          this.$store
            .dispatch("createAnswers", {
              data: {
                test: {
                  id: id,
                  title: object.title,
                  type: object.type,
                },
                answers: [],
                answersSheet: object.answersSheet,
              },
            })
            .then((idAnswers) => {
              this.$store.dispatch("setAnswerID", {
                docId: id,
                data: idAnswers,
              });
              this.$store
                .dispatch("createReport", {
                  data: {
                    test: {
                      id: id,
                      title: object.title,
                      type: object.type,
                      answers: idAnswers,
                    },
                    reports: [],
                  },
                })
                .then((idReport) => {
                  this.$store.dispatch("setReportID", {
                    docId: id,
                    data: idReport,
                  });
                  this.$store
                    .dispatch("createCooperators", {
                      data: {
                        test: {
                          id: id,
                          title: object.title,
                          type: object.type,
                        },
                        cooperators: [],
                      },
                    })
                    .then((idCooperators) => {
                      this.$store.dispatch("setCooperatorsID", {
                        docId: id,
                        data: idCooperators,
                      });
                      this.$store.dispatch("pushMyTest", {
                        docId: this.user.uid,
                        element: {
                          id: id,
                          title: object.title,
                          type: object.type,
                          reports: idReport,
                          answers: idAnswers,
                          cooperators: idCooperators,
                          accessLevel: 0,
                          date: d.toDateString(),
                          nCoops: 0
                        },
                        param: "myTests",
                      });
                    });
                });
            });
        })
        .catch((err) => {
          console.error("Error", err);
          successful = false;
        });

      if (successful) this.sendManager(this.testID);
    },
    testAssembly() {
      //Make object test
      //Assigning admin info

      if (this.id === null || this.id === undefined) {
        this.object = Object.assign(this.object, {
          admin: {
            id: this.user.uid,
            email: this.user.email,
          },
        });
      }

      //Assigning test info
      this.object = Object.assign(this.object, this.test);
      this.object = Object.assign(this.object, {
        date: new Date().toDateString(),
      });

      //assigning tasks/heuristics
      if (this.test.type === "User") {
        //assigning pre-test info
        this.object = Object.assign(this.object, {
          preTest: {
            consent: null,
            form: null,
          },
        });

        this.object = Object.assign(this.object, {
          tasks: [],
          answersSheet: null,
        });

        //assigning post test
        this.object = Object.assign(this.object, {
          postTest: {
            form: null,
          },
        });
      } else if (this.test.type === "Heuristics") {
        this.object = Object.assign(this.object, {
          heuristics: [],
          answersSheet: {
            total: 0,
            progress: 0,
            heuristics: [],
          },
        });

        this.object = Object.assign(this.object, { options: [] });
      }
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`);
    },
    validate() {
      if (this.$refs.form.valida()) {
        this.submit();
      }
    },
  },
  watch: {
    dialog() {
      this.test = {
        title: "",
        description: "",
        type: "",
      };
      this.object = {};

      if (!this.dialog) {
        this.$refs.form.resetVal();
        this.dialog = false;
      }
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
  },
};
</script>

<style scoped>
.dialog-title {
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
  border: 1px solid rgb(201, 201, 201);
  padding: 30px;
  height: 250px;
}
.card-title {
  font-size: 25px;
  color: #f9a826;
  margin: 0px 0px 10px 0px;
}
.card-text-box {
  margin: 0px 0px 0px 30px;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }
  .card-text-box {
    margin: 20px 0px 0px 0px;
  }
  .card {
      height: auto;
  }
}
</style>
