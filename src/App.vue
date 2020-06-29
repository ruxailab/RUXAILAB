<template  > 
  <v-app>
    <Toolbar />

    <v-content>
      <v-container fluid class="pa-0" style="overflow: hidden!important;">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from "./components/molecules/Toolbar";

export default {
  name: "App",
  data: () => ({
    //
  }),
  components: {
    Toolbar
  }
};
</script>
