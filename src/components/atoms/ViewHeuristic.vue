<template>
  <v-container>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12">
        <v-row justify="center">
          <h1>{{item.title}}</h1>
        </v-row>
        <v-spacer></v-spacer>
        <v-row v-for="(question,i) in item.questions" :key="i" justify="center">
          <v-col>
            <h3>{{i+1}}) {{question.text}}</h3>
            <v-spacer></v-spacer>
            <v-overflow-btn :items="options" v-model="heuris.questions[i].res" @change="$emit('progress')"  label="respuestas/answers"></v-overflow-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["item", "heuris"],
  data: () => ({
    options: [
      {text:"Sí / Yes",value:1},
      {text:"Ni Sí, ni No / Neither",value:.5},
      {text:"No",value:0},
      {text:"No aplica-No es problema / Not applicable-It is not a problem",value:-1}
    ]
  }),
  methods: {
    resp(n) {
      return this.heuris.length > 0 ? this.heuris.questions[n] : [];
    }
  },
  computed: {
    res(n) {
      this.heuris.length > 0 ? this.heuris.questions[n] : null;
      return [];
    }
  }
};
</script>

<style>
</style>