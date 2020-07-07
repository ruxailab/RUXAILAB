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
    <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
      <p>{{ snackMsg }}</p>
      <v-btn text @click="snackbar = false">
        <v-icon>mdi-close-circle-outline</v-icon>
      </v-btn>
    </v-snackbar>
    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="titleView ma-2 pa-2">Create Test</p>
          <v-divider></v-divider>
          <FormTestDescription :test="test" ref="form1" />
          <v-card-actions class="ma-0 pa-2">
            <v-spacer></v-spacer>
            <v-btn color="black" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="#F9A826" @click="submit(),dialog = false">Create</v-btn>
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
    },
    snackbar: false,
    snackMsg: "",
    snackColor: "",
    testID: null
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    },
    async submit() {
      await this.testAssembly(); // build Test
      let object = this.object;
      let successful = true;
      this.snackMsg = "Test created succesfully";
      this.snackColor = "success";
      this.snackbar = true;
      //Send db
      await this.$store
        .dispatch("createTest", {
          collection: "test",
          data: object
        })
        .then(id => {
          this.testID = id;
          this.$store
            .dispatch("createAnswers", {
              data: {
                test: {
                  id: id,
                  title: object.title,
                  type: object.type
                },
                answers: [],
                answersSheet: object.answersSheet
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
                      title: object.title,
                      type: object.type,
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
                      title: object.title,
                      type: object.type,
                      reports: idReport,
                      answers: idAnswers,
                      accessLevel: 0
                    },
                    param: "myTests"
                  });
                });
            });
        })
        .catch(err => {
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
            email: this.user.email
          }
        });
      }

      //Assigning test info
      this.object = Object.assign(this.object, this.test);

      //assigning pre-test info

      this.object = Object.assign(this.object, {
        preTest: {
          consent: null,
          form: null
        }
      });

      //assigning tasks/heuristics
      if (this.test.type === "User") {
        this.object = Object.assign(this.object, {
          tasks: [],
          answersSheet: null
        });
      } else if (this.test.type === "Expert") {
        this.object = Object.assign(this.object, {
          heuristics: [],
          answersSheet: {
            total: 0,
            progress: 0,
            heuristics: []
          }
        });
      }

      //assigning post test

      this.object = Object.assign(this.object, { postTest: null });

      this.object = Object.assign(this.object, { coop: [] });

      this.object = Object.assign(this.object, { options: [] });
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`);
    }
  },
  watch: {
    dialog() {
      this.test = {
        title: "",
        description: "",
        type: ""
      };
      this.object = {};
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