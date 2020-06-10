<template>
<v-col cols="12" lg="2" md="2" sm="3" xs="2">
    <v-select
      class="pt-7"
      prepend-inner-icon="mdi-translate"
      :items="languages"
      item-text="label"
      item-value="value"
      :label="$t('language')"
      v-model="lang"
      solo
      dense
      flat
      light
      background-color="grey lighten-4"
    ></v-select>
</v-col>
</template>

<script>
export default {
  data() {
    return {
      languages: [{ label: "English", value: "en" }, { label: "Español", value: "es" },{ label: "Português-BR", value: "pt_br" }],
      lang: this.$i18n.locale
    };
  },
  watch: {
    lang: function(newValue) {
      console.log("Changed", newValue);
      this.$i18n.locale = newValue;
    }
  }
};
</script>