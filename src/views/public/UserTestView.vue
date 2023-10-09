<template>
  <v-col cols="12">
      <span class="text-h3">ID do teste: {{ test.id }}</span>
      <br><br>
      <span class="text-h3">Titulo do teste: {{ test.testTitle }}</span>
      <br><br>
      <span class="text-h3">Descrição do teste: {{ test.testDescription }}</span>
      <br><br>
      <span class="text-h3">ID do admin do teste: {{ test.testAdmin.userDocId}}</span>
  </v-col>
</template>

<script>
export default {
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
}
</script>

<style></style>
