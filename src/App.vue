<template>
  <v-app>
  <v-app-bar app>
    <!-- -->
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
