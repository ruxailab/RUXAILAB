<template>
  <div>
    {{answers}}
    <v-row>
      <v-col cols="3">
        <v-card>
          <v-card-title>
            <div class="caption">HEURISTICS</div>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="(heuris, i) in answers.answers[0].answer.heuristics"
              :key="i"
              @click="setHeuristic(i)"
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
    aux: null,
    heuristics: [],
    headers: [],
    items: []
  }),
  methods: {
    setHeuristic(index) {
      this.heuristics = [];
      this.headers = [];
      this.items = [];

      this.answers.answers.forEach(answer => {
        answer.answer.heuristics.forEach(heuris => {
          if (heuris.id == index) {
            this.heuristics.push(heuris);
          }
        });
      });

      this.headers.push({ text: "ID", value: "uid" });
      this.heuristics[0].questions.forEach(question => {
        this.headers.push({
          text: "Question " + (question.id + 1).toString(),
          value: ""
        });
      });

      this.answers.answers.forEach(ans => {
        this.items.push({
          uid: ans.uid
        });

        // this.ans.
      });
    }
  },
  computed: {
    answers() {
      return this.$store.state.answers.answers || [];
    },
    headers() {
      let array = [];
      array.push({
        text: "ID",
        align: "start",
        value: "uid"
      });

      if (this.aux) {
        this.aux.heuristics.forEach(heuris => {
          array.push({
            text: "Heuristics " + (heuris.id + 1).toString(),
            value: "heuris"
          });
        });
      }

      return array;
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