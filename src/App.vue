<template>
  <v-app>
    <Toolbar />

    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Toolbar from './components/molecules/Toolbar'

export default {
  name: 'App',
  components: {
    Toolbar,
  },
  data: () => ({}),
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        document.title = 'ReTLab ' + (to.name ? '| ' + to.name : '')
      },
    },
  },
}
</script>

<style>
.ProseMirror:focus {
  outline: none;
}
.ProseMirror {
  height: 100%;
}
</style>
