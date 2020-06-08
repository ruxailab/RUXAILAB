<template>
  <div>
    {{answers.answers}}
    <v-data-table :headers="headers" :items="answers.answers">
      <template v-slot:item.heuris="{item}">
        <v-data-table
        hide-default-footer
        :headers="header(item.answer.heuristics)"
        :items="item.answer.heuristics"
        >

        </v-data-table>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    aux: null
  }),
  methods: {
    header(heuris) {
      let aux = []
      console.log(heuris);
      heuris.questions.forEach((question) => {
        aux.push({
          text: 'Q' + question.id,
          value: 'question.res'
        })
      })
      return aux;
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