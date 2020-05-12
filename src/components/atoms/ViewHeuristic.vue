<template>
  <v-container>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12">
        <v-row justify="center">
          <h1>{{item.title}}</h1>
        </v-row>
        <v-spacer></v-spacer>
        <v-row  v-for="(question,i) in item.questions" :key="i" justify="center" >
          <v-col>
            <h3>{{i+1}}) {{question}}</h3>
            <v-spacer></v-spacer>
            <v-textarea outlined ></v-textarea>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["item"]
};
</script>

<style>
</style>