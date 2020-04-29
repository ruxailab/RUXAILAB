<template>
  <v-app>
  <v-app-bar app>
    <v-icon left>mdi-alpha-r-circle</v-icon>
    <v-toolbar-title>Research Workflow</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn text>
      <v-icon left>mdi-lock</v-icon>
      Sign-in</v-btn>
  </v-app-bar>

 
  <v-content>
    <v-container fluid>
      <router-view></router-view>
    </v-container>
  </v-content>

  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    //
  }),
};
</script>
