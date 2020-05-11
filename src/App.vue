<template>
  <v-app>
   <Toolbar/>
    
  <v-content>
    <v-container fluid>
      <!-- <router-view></router-view> -->
      <Heuris/>
    </v-container>
  </v-content>

  </v-app>
</template>

<script>
import Toolbar from './components/atoms/Toolbar';
import Heuris from './components/HeuristicsTable'// delete

export default {
  name: 'App',
  data: () => ({
    //
  }),
  components: {
    Toolbar,
    Heuris //delete and remove ,
  }
};
</script>
