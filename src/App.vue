<template>
  <v-app>
    <Toolbar />
    <GlobalErrorHandler />
    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Toolbar from './components/molecules/Toolbar'
import GlobalErrorHandler from './components/atoms/GlobalErrorHandler'

export default {
  name: 'RUXAILAB',
  components: {
    Toolbar,
    GlobalErrorHandler,
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        document.title = 'RUXAILAB ' + (to.name ? '| ' + to.name : '')
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
