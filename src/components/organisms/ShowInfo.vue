<template>
  <v-container style="overflow: scrol; justify-content: center">
    <v-row justify="space-around">
      <v-col cols="12">
        <h1>{{ $t('titles.drawer.' + title) }}</h1>
      </v-col>
      <slot name="top" />
    </v-row>
    <v-divider />
    <slot name="warning" />
    <v-row justify="center">
      <v-col cols="12">
        <v-card class="dataCard ma-0 pa-0">
          <slot name="content" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type:String,
    },
  },
}
</script>

<style scoped>
h1 {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
</style>