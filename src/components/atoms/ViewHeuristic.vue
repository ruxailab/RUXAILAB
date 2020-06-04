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
            <v-overflow-btn
              :items="options"
              v-model="heuris.questions[i].res"
              label="respuestas/answers"
            ></v-overflow-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ['item','heuris'],
  data: () => ({
    options: [
      "Sí / Yes",
      "Ni Sí, ni No / Neither",
      "No",
      "No aplica-No es problema / Not applicable-It is not a problem"
    ]
  })
};
</script>

<style>
</style>