<template>
  <div>
    <v-select
      class="pt-6"
      append-icon="mdi-translate"
      :items="languages"
      item-text="label"
      item-value="value"
      :label="$t('language')"
      v-model="lang"
    ></v-select>
  </div>
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