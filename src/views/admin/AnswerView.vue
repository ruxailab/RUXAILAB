<template>
  <div>
    {{items}}
    <v-row>
      <v-col cols="3">
        <v-card>
          <v-card-title>
            <div class="caption">HEURISTICS</div>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="(heuris, i) in answers.answersSheet.heuristics"
              :key="i"
              @click="setHeaders(heuris),setItems(i)"
            >Heuristic {{i + 1}}</v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="9">
        <v-card>
          <v-card-title>Heuristics</v-card-title>
          <v-data-table class="ma-2" :headers="headers" :items="items"></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    headers: [],
    items: []
  }),
  methods: {
    setItems(index) {
      this.items = [];

      let aux 

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
    setHeaders(heuris) {
      let index = 0
      this.headers = [];
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
        index++
      });
    }
  },
  computed: {
    answers() {
      return this.$store.state.answers.answers || [];
    }
  },
  watch: {
    answers() {
      if (this.answers) {
        this.aux = this.answers.answers[0].answer;
      }
    }
  },
  created() {
    if (!this.$store.state.answers.answers) {
      this.$store.dispatch("getAnswers", { id: this.id });
    }
  }
};
</script>