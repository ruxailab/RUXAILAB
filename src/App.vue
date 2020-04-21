<template>
  <v-app>
  <v-app-bar app>
    <!-- -->
  </v-app-bar>

  <!-- Sizes your content based upon application components -->
  <v-content>

    <!-- Provides the application the proper gutter -->
    <v-container fluid>

      <!-- If using vue-router -->
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
