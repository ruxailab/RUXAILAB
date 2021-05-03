<template>
  <div>
    <v-row justify="center">
      <v-col cols="10">
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
        <List
          @clicked="openTemp"
          type="template"
          :items="filteredTemplates"
        ></List>
      </v-col>
    </v-row>
    <TempDialog
      :dialog="dialog"
      :template="temp"
      @submitTemplate="submit"
      @close="dialog = false"
      :allowCreate="true"
    />
  </div>
</template>

<script>
import List from "@/components/atoms/ListComponent";
import TempDialog from "@/components/molecules/TemplateInfoDialog";

export default {
  components: {
    List,
    TempDialog,
  },
  data: () => ({
    temp: {},
    dialog: false,
    searching: false,
    search: "",
    testID: null,
    object: {},
  }),
  methods: {
    openTemp(item) {
      this.temp = Object.assign({}, item);
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
                options: object.options,
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
                          nCoops: 0,
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
      this.object = Object.assign(this.object, {
        title: this.temp.title,
        description: this.temp.description,
        type: this.temp.type,
      });
      this.object = Object.assign(this.object, {
        date: new Date().toDateString(),
      });

      //assigning tasks/heuristics
      let selectTemplate = this.storeTemplates.find(
        (t) => t.id == this.temp.id
      );
      this.object = Object.assign(this.object, selectTemplate.body);
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`).catch(() => {});
    },
  },
  computed: {
    storeTemplates() {
      return this.$store.getters.templates || [];
    },
    templates() {
      let array = [];
      if (this.storeTemplates !== null) {
        array = this.storeTemplates.map((temp) => {
          let obj = {
            id: temp.id,
            title: temp.header.title || "No Title",
            date: temp.header.date,
            type: temp.body.type,
            author: temp.header.author,
            version: temp.header.version,
            description: temp.header.description,
          };
          return obj;
        });
      }

      return array;
    },
    filteredTemplates() {
      if (this.templates !== null)
        return this.templates.filter((temp) => {
          return temp.title.toLowerCase().includes(this.search.toLowerCase());
        });

      return [];
    },
    user() {
      return this.$store.getters.user;
    },
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.temp = {};

        this.object = {};
        this.selectTemplate = null;
      }
    },
  },
  created() {
    // if (this.$store.getters.templates == null) {
    this.$store.dispatch("getTemplates");
    // }
  },
};
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
.dialog-title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 34px;
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
.dialog-scroll::-webkit-scrollbar {
  width: 9px;
}
/* Track */
.dialog-scroll::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.dialog-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}
/* Handle on hover */
.dialog-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
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