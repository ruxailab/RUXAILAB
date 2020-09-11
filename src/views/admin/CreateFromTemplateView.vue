<template>
  <div>
    <v-row justify="center">
      <v-col cols="11">
        <v-row align="center" v-if="!searching">
          <span class="titleText ml-3 mb-2">Create from template</span>

          <v-text-field
            full-width
            dense
            class="ml-4 mt-6 hidden-sm-and-down"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            outlined
            color="grey darken-2"
            v-model="search"
          ></v-text-field>
          <v-spacer class="hidden-md-and-up"></v-spacer>
          <v-btn class="mr-3 hidden-md-and-up" icon @click="searching = true">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-row>
        <v-text-field
          :autofocus="searching"
          @blur="searching = false"
          v-else
          dense
          label="Search"
          prepend-inner-icon="mdi-magnify"
          outlined
          color="grey darken-2"
          v-model="search"
        ></v-text-field>
        <v-divider class="mb-1"></v-divider>
        <List @clicked="openTemp" :tests="filteredTemplates"></List>
        <!-- mudar para filteredTemplates dps que incluir o title -->
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="dialog-title ma-2 pa-2">Create Test</p>
          <v-divider></v-divider>
          <FormTestDescription :test="temp" ref="form" :lock="true" />
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
import List from "@/components/atoms/ListTests";
import FormTestDescription from "@/components/atoms/FormTestDescription";

export default {
  components: {
    List,
    FormTestDescription
  },
  data: () => ({
    temp: {
      title: "",
      description: "",
      type: "",
      idTemplate: ""
    },
    dialog: false,
    searching: false,
    search: "",
    testID: null,
    object: {}
  }),
  methods: {
    openTemp(item) {
      this.temp.idTemplate = item.id;
      this.temp.type = item.type;
      this.dialog = true;
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
          data: Object.assign(object, { date: d.toDateString() })
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
                  this.$store
                    .dispatch("createCooperators", {
                      data: {
                        test: {
                          id: id,
                          title: object.title,
                          type: object.type
                        },
                        cooperators: []
                      }
                    })
                    .then(idCooperators => {
                      this.$store.dispatch("setCooperatorsID", {
                        docId: id,
                        data: idCooperators
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
                        param: "myTests"
                      });
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
      this.object = Object.assign(this.object, {
        title: this.temp.title,
        description: this.temp.description,
        type: this.temp.type
      });
      this.object = Object.assign(this.object, {
        date: new Date().toDateString()
      });

      //assigning tasks/heuristics
      let selectTemplate = this.storeTemplates.find(t => t.id == this.temp.idTemplate)
      this.object = Object.assign(this.object, selectTemplate.template);
    },
    validate() {
      if (this.$refs.form.valida()) {
        this.submit();
      }
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`);
    }
  },
  computed: {
    storeTemplates() {
      return this.$store.state.templates.templates || [];
    },
    templates() {
      let array = [];
      if (this.storeTemplates !== null) {
        array = this.storeTemplates.map(temp => {
          let obj = {
            id: temp.id,
            title: temp.template.title || 'No Title',
            date: temp.header.date,
            type: temp.template.type,
            author: temp.header.author,
            version: temp.header.version
          };
          return obj;
        });
      }

      return array;
    },
    filteredTemplates() {
      if (this.templates !== null)
        return this.templates.filter(temp => {
          return temp.title.toLowerCase().includes(this.search.toLowerCase());
        });

      return [];
    },
    user() {
      return this.$store.getters.user;
    }
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.temp = {
          title: "",
          description: "",
          type: "",
          idTemplate: ""
        };

        this.object = {};
        this.selectTemplate = null;

        this.$refs.form.resetVal();
        this.dialog = false;
      }
    }
  },
  created() {
    // if (this.$store.state.templates.templates == null) {
      this.$store.dispatch("getTemplates");
    // }
  }
};
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>