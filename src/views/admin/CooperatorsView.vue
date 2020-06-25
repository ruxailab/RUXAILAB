<template>
  <LayoutTestFunctions>
    <v-row>
      <v-col cols="6" class="red">AAAAAA</v-col>
      <v-col cols="6" class="blue">BBBB</v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="blue">CCCC</v-col>
      <v-col cols="6" class="red">DDD</v-col>
    </v-row>
  </LayoutTestFunctions>
</template>

<script>
import LayoutTestFunctions from "@/components/organisms/LayoutTestFunctions.vue";
export default {
  components: {
    LayoutTestFunctions
  },
};
</script>

<style scoped>
</style>