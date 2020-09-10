<template>
  <v-container v-if="test ">
    <Dialog :dialog="dialogDel" :text="dialogText">
      <v-card-title
        slot="title"
        class="headline error white--text"
        primary-title
      >Are you sure you want to delete this template?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogDel = false">Cancel</v-btn>
        <v-btn
          class="red white--text ml-1"
          :loading="loading"
          text
          @click="deleteTemplate(object), loading = true, change = false"
        >Delete</v-btn>
      </div>
    </Dialog>
    <Dialog
      :dialog="dialogAlert"
      text="Are you sure you want to leave? All your changes will be discarded"
    >
      <v-card-title
        slot="title"
        class="headline error accent-4 white--text"
        primary-title
      >Are you sure you want to leave?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogAlert = false">Stay</v-btn>
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="change = false,$router.push(go)"
        >Leave</v-btn>
      </div>
    </Dialog>

    <v-dialog v-model="dialogDetail" width="800px">
      <v-card min-height="400px" class="list-scroll">
        <v-col class="mb-1 pa-4 pb-1">
          <p class="subtitleView">
            Current informations
            <v-btn
              style="position: absolute; right: 4px; top: 8px"
              small
              icon
              @click="dialogDetail = false, open = []"
              class="ma-1"
            >
              <v-icon color="error">mdi-close</v-icon>
            </v-btn>
          </p>
        </v-col>
        <v-divider></v-divider>
        <v-row class="ma-0 pa-0">
          <v-col cols="10">
            <v-treeview
              v-model="tree"
              :open="open"
              activatable
              item-key="id"
              open-on-click
              dense
              :items="items"
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon v-if="!item.icon">{{ open ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
                <v-icon v-else>{{ icons[item.icon] }}</v-icon>
              </template>
            </v-treeview>
          </v-col>
        </v-row>
        <!-- <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="error" text>Close</v-btn>
          <v-btn text>Button</v-btn>
        </v-card-actions>-->
      </v-card>
    </v-dialog>

    <ShowInfo title="Template"></ShowInfo>
    <div slot="content">
      <v-card style="background: #f5f7ff">
        <v-col class="mb-1 pa-4 pb-1">
          <p class="subtitleView">Settings</p>
        </v-col>
        <v-divider></v-divider>
        <v-form ref="tempform" class="px-5">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="template.template.title"
                label="Title"
                :rules="titleRequired"
                counter="100"
                outlined
                @input="change=true"
                dense
              ></v-text-field>

              <v-textarea
                v-model="template.template.description"
                label="Description"
                outlined
                dense
                @input="change=true"
              ></v-textarea>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="template.header.date"
                label="Last Update"
                outlined
                dense
                disabled
              ></v-text-field>
              <v-text-field
                v-model="template.header.version"
                label="Version"
                outlined
                dense
                @input="change=true"
              ></v-text-field>
              <v-row class="mx-1">
                <v-btn outlined @click="dialogDetail=true">Detailed information</v-btn>
                <v-spacer></v-spacer>
                <v-btn outlined @click="updateTemplate(),change=true">update</v-btn>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
        <v-divider></v-divider>
        <v-row justify="center">
          <v-btn
            color="#f26363"
            class="white--text my-4"
            style="justify-self: center"
            @click="dialogDel = true"
          >
            <v-icon left>mdi-trash-can-outline</v-icon>Delete template
          </v-btn>
        </v-row>
      </v-card>

      <v-tooltip left v-if="change">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="change"
            large
            dark
            fab
            fixed
            bottom
            right
            color="#F9A826"
            @click=" update()"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon large>mdi-content-save</v-icon>
          </v-btn>
        </template>
        <span>Save</span>
      </v-tooltip>
    </div>
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo";
import Dialog from "@/components/atoms/Dialog";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Dialog
  },
  data: () => ({
    tree: [],
    open: [],
    icons: {
      question: "mdi-timeline-help",
      reponse: "mdi-timeline-check",
      description: "mdi-timeline-text"
    },
    change: false,
    dialogDel: false,
    dialogAlert: false,
    dialogDetail: false,
    loading: false,
    object: null,
    template: null,
    titleRequired: [
      v => !!v || "Field Required",
      v => v.length <= 100 || "Max 100 characters"
    ]
  }),
  methods: {
    update() {
      let payload = Object.assign({}, { header: this.template.header });

      payload.header.date = new Date().toLocaleString("en-US");
      if (this.template.template.type == "Expert") {
        Object.assign(payload, {
          template: Object.assign(
            {},
            {
              heuristics: this.test.heuristics,
              options: this.test.options,
              answersSheet: this.test.answersSheet,
              type: this.test.type
            }
          )
        });
      } else if (this.template.template.type == "User") {
        Object.assign(payload, {
          templatate: Object.assign(
            {},
            {
              tasks: this.test.tasks,
              preTest: this.test.preTest,
              postTest: this.test.postTest,
              type: this.test.type
            }
          )
        });
      }

      this.$store.dispatch("updateTemplate", {
        docId: this.id,
        data: payload
      });
    },
    deleteTemplate() {
      this.$store
        .dispatch("deteleTemplate", {
          id: this.id
        })
        .then(() => {
          this.object.template = null;
          this.submit();
          this.loading = false;
          this.dialogDel = false;
          this.$router.push(`/managerview/${this.object.id}`);
        });
    },
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });
      await this.$store.dispatch("getReports", { id: this.test.reports });
      await this.$store.dispatch("getCooperators", {
        id: this.test.cooperators
      });
      console.log(this.object.template);
      this.$store
        .dispatch("updateTest", {
          docId: this.object.id,
          data: this.object
        })
        .then(() => {
          this.$store.dispatch("updateMyTest", {
            docId: this.object.admin.id,
            element: {
              id: this.object.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              cooperators: this.object.cooperators,
              template: this.object.template,
              accessLevel: 0
            }
          });

          this.cooperators.cooperators.forEach(coop => {
            this.$store.dispatch("updateMyCoops", {
              docId: coop.id,
              element: {
                id: this.object.id,
                title: this.object.title,
                type: this.object.type,
                reports: this.object.reports,
                answers: this.object.answers,
                cooperators: this.object.cooperators,
                template: this.object.template,
                accessLevel: coop.accessLevel
              }
            });
          });

          this.answers.test.title = this.object.title;
          this.reports.test.title = this.object.title;
          this.cooperators.test.title = this.object.title;

          this.$store.dispatch("updateTestAnswer", {
            docId: this.test.answers,
            data: this.answers
          });

          this.$store.dispatch("updateTestReport", {
            docId: this.test.reports,
            data: this.reports
          });

          this.$store.dispatch("updateTestCooperators", {
            docId: this.test.cooperators,
            data: this.cooperators
          });

          this.$store.commit("setSuccess", "Test updated succesfully");
        })
        .catch(err => {
          this.$store.commit("setError", err);
        });
    },
    setTemplate() {
      this.template = this.$store.getters.template;
    },
    log() {
      console.log(this.template.template);
    },
    updateTemplate() {
      if (this.template.template.type == "Expert") {
        Object.assign(this.template.template, {
          heuristics: this.test.heuristics,
          options: this.test.options,
          answersSheet: this.test.answersSheet,
          type: this.test.type
        });
      } else if (this.template.template.type == "User") {
        Object.assign(this.template.template, {
          tasks: this.test.tasks,
          preTest: this.test.preTest,
          postTest: this.test.postTest,
          type: this.test.type
        });
      }
    }
  },
  computed: {
    templateStore() {
      if (this.$store.getters.template) this.setTemplate();
      return this.$store.getters.template;
    },
    test() {
      return this.$store.getters.test;
    },
    dialogText() {
      if (this.object)
        return `Are you sure you want to delete your template ? This action can't be undone`;

      return `Are you sure you want to delete this template? This action can't be undone`; //in case object isnt loaded
    },
    items() {
      let items = [];

      if (this.template) {
        let template = this.template.template;
        if (template.type == "Expert") {
          let id = 0;
          let heuristics = template.heuristics;
          let options = template.options;
          if (heuristics) {
            items.push({
              id: id++,
              name: "Heuristics",
              children: heuristics.map(h => {
                return {
                  id: id++,
                  name: h.title,
                  children: h.questions.map(q => {
                    return {
                      id: id++,
                      name: q.title,
                      children: q.descriptions.map(d => {
                        return {
                          id: id++,
                          name: d.title,
                          icon: "description"
                        };
                      }),
                      icon: "question"
                    };
                  })
                };
              })
            });
          }
          if (options) {
            items.push({
              id: id++,
              name: "Options",
              children: options.map(op => {
                return {
                  id: id++,
                  name: op.text,
                  children: [
                    { id: id++, name: `value: ${op.value}`, icon: "reponse" }
                  ]
                };
              })
            });
          }
        }
      }

      return items;
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
      }
    },
    templateStore: async function() {
      if (this.templateStore !== null && this.templateStore !== undefined) {
        this.template = await Object.assign({}, this.templateStore);
      }
    }
  },
  created() {
    if (!this.$store.getters.template) {
      this.$store.dispatch("getTemplate", { id: this.id });
    }

    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", {
        id: this.$store.state.auth.user.myTests.find(
          test => test.template == this.id
        ).id
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialogAlert = true;
      this.go = to.path;
    } else {
      next();
    }
  },
  beforeMount() {
    window.addEventListener("beforeunload", this.preventNav);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.preventNav);
  }
};
</script>

<style scoped>
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
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.list-scroll {
  height: 508px;
  overflow: auto;
}
/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}
/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}
/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
  /* background: #515069; */
}
</style>