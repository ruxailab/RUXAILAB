<template>
  <div>
    <template>
        <v-btn small icon v-bind="attrs" v-on="on" class="mr-1" @click="$router.push('/help')" >
          <v-icon size="20">mdi-help-circle-outline</v-icon>
        </v-btn>
    </template>
  </div>
</template>

<script>
export default {}
</script>

<style></style>
