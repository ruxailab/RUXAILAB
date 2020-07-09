<template>
  <v-container style="overflow: scrol;">
    <v-row justify="space-around">
      <v-col cols="12" class="titleView">{{title}}</v-col>
      <!--Base Tabs-->
      <!--<v-col cols="12" class="pa-0 pl-3 ma-0">
        <v-row justify="end" dense>
          <v-tabs
            background-color="transparent"
            color="#FCA326"
            class="tab-border-bottom pb-0 mb-0"
          >
            <v-tab @click="idx = 0">Consent</v-tab>
            <v-tab @click="idx = 1">Form</v-tab>
          </v-tabs>
        </v-row>
      </v-col>-->
    </v-row>
    <v-divider></v-divider>
    <v-row justify="center">
      <v-col cols="10">
        <v-card class="dataCard">
          <slot></slot>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["title"]
};
</script>

<style scoped>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
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
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>