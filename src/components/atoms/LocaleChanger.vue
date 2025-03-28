<template>
  <v-col cols="1" md="2">
    <!-- Desktop -->
    <v-select
      v-model="lang"
      class="pt-7 hidden-sm-and-down"
      prepend-inner-icon="mdi-translate"
      :items="languages"
      item-text="label"
      item-value="value"
      :label="$t('language')"
      solo
      flat
      dense
      light
      background-color="grey lighten-4"
    />

    <!-- Mobile -->
    <div class="hidden-md-and-up mr-1" style="display: flex; justify-content: center">
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn small color="primary" v-bind="attrs" icon v-on="on">
            <v-icon size="20" color="white">
              mdi-translate
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in languages"
            :key="index"
            link
            @click="lang = item.value"
          >
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      languages: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: 'Português', value: 'pt_br' },
        { label: 'हिन्दी', value: 'hi'},
        { label: 'Deutsch' , value:'de'},
        { label: 'Français', value: 'fr' },
        { label: '中文', value: 'zh' },
        { label: 'العربية', value: 'ar' },
        { label: 'Русский', value: 'ru' },
        { label: '日本語', value: 'ja' }
      ],
      lang: this.$i18n.locale,
    }
  },
  watch: {
    lang: function (newValue) {
      this.$i18n.locale = newValue
    },
  },
}
</script>

