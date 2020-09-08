<template>
  <div>
    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="titleView ma-2 pa-2">Create Test</p>
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
    dialog: true,
    object: {},
    test: {
      title: "",
      description: "",
      type: ""
    },
    testID: null,
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    },
    async submit() {
      await this.testAssembly(); // build Test
      let d = new Date()
      let object = this.object;
      let successful = true;
      //Send db
      await this.$store
        .dispatch("createTest", {
          collection: "test",
          data: Object.assign(object, {date: d.toDateString()}),
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
                          date: d.toDateString()
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
      this.object = Object.assign(this.object, {date: new Date().toDateString()})

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
      } else if (this.test.type === "Expert") {
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
    }
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
@media screen and (max-width: 960px){
  .titleView {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
