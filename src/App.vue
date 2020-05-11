<template>
  <v-app>
   <Toolbar/>
    
  <v-content>
    <v-container fluid>
      <router-view></router-view>
    </v-container>
  </v-content>

  </v-app>
</template>

<script>
import Toolbar from './components/atoms/Toolbar';

export default {
  name: 'App',
  data: () => ({
    //
  }),
  components: {
    Toolbar
  }
};
</script>
