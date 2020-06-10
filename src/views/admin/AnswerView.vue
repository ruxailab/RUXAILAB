<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-row v-if="!loading">
      <v-col cols="3">
        <v-card>
          <v-card-title>
            <div class="caption">HEURISTICS</div>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="(heuris, i) in answers.answersSheet.heuristics"
              :key="i"
              @click="setHeaders(heuris,i),setItems(i)"
            >Heuristic {{i + 1}}</v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="9">
        <v-card v-if="heurisSelected">
          <v-card-title>Heuristics {{heurisSelected}}</v-card-title>
          <v-text-field class="mx-3" append-icon="mdi-magnify" label="Search" v-model="search"></v-text-field>
          <v-data-table class="ma-2" :headers="headers" :items="items" :search="search"></v-data-table>
        </v-card>

        <h2 v-else class="ml-3">Please select a heuristic</h2>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    search: "",
    heurisSelected: null,
    headers: [],
    items: [],
  }),
  methods: {
    setItems(index) {
      this.items = [];

      let aux;

      this.answers.answers.forEach(answer => {
        aux = {
          uid: null,
          questions: []
        };
        aux.uid = answer.uid;
        aux.questions = Array.from(answer.heuristics[index].questions);
        this.items.push(aux);
      });
    },
    setHeaders(heuris, i) {
      let index = 0;
      (this.heurisSelected = i + 1), (this.headers = []);
      this.headers.push({
        text: "ID",
        align: "start",
        value: "uid"
      });

      heuris.questions.forEach(question => {
        this.headers.push({
          text: "Question " + (question.id + 1).toString(),
          value: `questions[${index}].res`
        });
        index++;
      });
    }
  },
  computed: {
    answers() {
      return this.$store.state.answers.answers || [];
    },
    loading(){
      return this.answers.length == 0
    }
  },
  watch: {
  },
  created() {
    if (!this.$store.state.answers.answers || !this.$store.state.answers.answers.id !== this.id) {
      this.$store.dispatch("getAnswers", { id: this.id });
    }
  }
};
</script>