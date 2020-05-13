<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>
          <v-data-table :headers="headers" :items="heuristics" :items-per-page="5" show-expand>
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>
                  <b>Current Heuristics</b>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <AddHeurBtn
                  :heuris="heuris"
                  :dialog="dialog"
                  @addHeuris="updateHeuristics"
                  @dialog="changeDialog"
                />
              </v-toolbar>
            </template>

            <template v-slot:expanded-item="{ headers, item }">
              <!-- questions list -->
              <td :colspan="headers.length" class="pa-3">
                <h2 class="mb-1" style="text-align: center">{{ item.title }}</h2>
                <div class="caption" v-if="item.questions.length > 0">
                  <v-list>
                    <v-subheader>QUESTIONS:</v-subheader>
                    <v-list-item v-for="(question, n) in item.questions" :key="n" inactive>
                      <v-list-item-content>{{n + 1}}) {{question}}</v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
                <div class="caption" v-else>Heuristics has no questions</div>
              </td>
            </template>

            <template v-slot:item.actions="{ item }">
              <!-- table actions -->
              <v-row>
                <v-btn icon small class="mr-2" @click="editItem(item)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small @click="deleteItem(item)">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import AddHeurBtn from "../atoms/NewHeuristicButton";

export default {
  props: ["heuristics"],
  data: () => ({
    headers: [
      {
        text: "Title",
        align: "start",
        value: "title"
      },
      { text: "Edit/Delete", value: "actions", align: "end", sortable: false },
      { text: "", value: "data-table-expand" }
    ],
    heuris: {
      id: 0,
      title: "",
      questions: []
    },
    dialog: false,
    editIndex: -1
  }),
  methods: {
    updateHeuristics() {
      if (this.editIndex == -1) {
        this.heuristics.push(this.heuris);
      } else {
        Object.assign(this.heuristics[this.editIndex], this.heuris);
        this.editIndex = -1;
      }

      this.heuris = {
        id: this.heuristics[this.heuristics.length - 1].id + 1,
        title: "",
        questions: []
      };
    },
    changeDialog(payload) {
      this.dialog = payload;
    },
    deleteItem(item) {
      this.heuristics.splice(this.heuristics.indexOf(item), 1);
    },
    editItem(item) {
      this.editIndex = this.heuristics.indexOf(item);
      this.heuris.id = this.heuristics[this.editIndex].id;
      this.heuris.title = this.heuristics[this.editIndex].title;
      this.heuris.questions = Array.from(
        this.heuristics[this.editIndex].questions
      );
      this.dialog = true;
    }
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.heuris = {
          id: this.heuristics[this.heuristics.length - 1].id + 1,
          title: "",
          questions: []
        };
      }
    }
  },
  components: {
    AddHeurBtn
  }
};
</script>
