<template  >
  <v-app>
    <Toolbar />

    <v-content>
      <v-container fluid class="pa-0">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from "./components/molecules/Toolbar";

export default {
  name: "App",
  data: () => ({}),
  components: {
    Toolbar,
  },
};
</script>

<style>
.ProseMirror:focus {
  outline: none;
}
.ProseMirror {
  height: 100%;
}
</style>
