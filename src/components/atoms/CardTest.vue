<template>
  <v-card shaped class="card">
    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="2" class="button">
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h1>{{test.title}}</h1>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
    props:['test']
};
</script>

<style>
</style>