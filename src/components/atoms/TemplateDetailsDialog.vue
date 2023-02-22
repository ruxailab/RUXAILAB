<template>
  <v-dialog v-model="dialog" width="800px" persistent>
    <v-card min-height="400px" class="list-scroll">
      <v-col class="mb-1 pa-4 pb-1">
        <p class="subtitleView">
          Current information:
          <v-btn
            style="position: absolute; right: 4px; top: 8px"
            small
            icon
            @click="closeDialog()"
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
              <v-icon v-if="!item.icon">{{
                open ? "mdi-folder-open" : "mdi-folder"
              }}</v-icon>
              <v-icon v-else>{{ icons[item.icon] }}</v-icon>
            </template>
          </v-treeview>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      required: true,
      default: () => false,
    },
    template: {
      type: Object,
      required: true,
      default: () => {
        return {};
      },
    },
  },
  data: () => ({
    tree: [],
    open: [],
    icons: {
      question: "mdi-timeline-help",
      reponse: "mdi-timeline-check",
      description: "mdi-timeline-text",
      item: "mdi-timeline",
    },
  }),
  methods: {
    closeDialog() {
      this.$emit("close");
      this.open = [];
    },
  },
  computed: {
    items() {
      let items = [];

      if (this.template) {
        let template = this.template.body;
        let type = this.template?.header?.type;
        if (type == "HEURISTICS") {
          let id = 0;
          let heuristics = template.heuristics;
          let options = template.options;
          if (heuristics) {
            items.push({
              id: id++,
              name: "HEURISTICS",
              children: heuristics.map((h) => {
                return {
                  id: id++,
                  name: h.title,
                  children: h.questions.map((q) => {
                    return {
                      id: id++,
                      name: q.title,
                      children: q.descriptions.map((d) => {
                        return {
                          id: id++,
                          name: d.title,
                          icon: "description",
                        };
                      }),
                      icon: "question",
                    };
                  }),
                };
              }),
            });
          }
          if (options) {
            items.push({
              id: id++,
              name: "Options",
              children: options.map((op) => {
                return {
                  id: id++,
                  name: op.text,
                  children: [
                    { id: id++, name: `value: ${op.value}`, icon: "reponse" },
                  ],
                };
              }),
            });
          }
        } else if (type == "User") {
          let id = 0;
          let tasks = template.tasks;
          let preTest = template.preTest;
          let postTest = template.postTest;
          if (tasks) {
            items.push({
              id: id++,
              name: "Tasks",
              children: tasks.map((task) => {
                return {
                  id: id++,
                  name: task.name,
                  children: Object.entries(task).map((item) => {
                    return {
                      id: id++,
                      name: `${item[0]}: ${item[1]}`,
                      icon: "item",
                    };
                  }),
                  icon: "question",
                };
              }),
            });
          }
          if (preTest) {
            items.push({
              id: id++,
              name: "Pre Test",
              children: Object.entries(preTest).map((item) => {
                return {
                  id: id++,
                  name: `${item[0]}: ${item[1]}`,
                  icon: "item",
                };
              }),
            });
          }
          if (postTest) {
            items.push({
              id: id++,
              name: "Post Test",
              children: Object.entries(postTest).map((item) => {
                return {
                  id: id++,
                  name: `${item[0]}: ${item[1]}`,
                  icon: "item",
                };
              }),
            });
          }
        }
      }

      return items;
    },
  },
};
</script>

<style scoped>
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