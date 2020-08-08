<template>
<v-col cols="12" lg="2" md="2" sm="3" xs="2">
    <v-select
      class="pt-7 custom-language-height"
      prepend-inner-icon="mdi-translate"
      :items="languages"
      item-text="label"
      item-value="value"
      :label="$t('language')"
      v-model="lang"
      solo
      flat
      dense
      light
      background-color="grey lighten-4"
    ></v-select>
</v-col>
</template>

<script>
export default {
  data() {
    return {
      languages: [{ label: "English", value: "en" }, { label: "Español", value: "es" },{ label: "Português", value: "pt_br" }],
      lang: this.$i18n.locale
    };
  },
  watch: {
    lang: function(newValue) {
      this.$i18n.locale = newValue;
    }
  }
};
</script>


<style media="screen">
.v-input__control, .v-input__slot{
  min-height: 30px !important;
 }
</style>
