<template>
  <v-col
    cols="1"
    md="2"
  >
    <!-- Desktop -->
    <v-select
      :model-value="lang" 
      class="pt-7 hidden-sm-and-down" 
      prepend-inner-icon="mdi-translate"
      :items="languages"
      item-title="label"
      item-value="value"
      :label="$t('language')"
      variant="solo"
      flat
      density="compact"
      @update:model-value="updateLang"
    />
    <!-- Mobile -->
    <div
      class="hidden-md-and-up mr-1"
      style="display: flex; justify-content: center"
    >
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            size="small"
            color="primary"
            icon
            v-bind="props"
          >
            <v-icon
              size="20"
              color="white"
            >
              mdi-translate
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in languages"
            :key="index"
            link
            @click="updateLang(item.value)"
          >
            <v-list-item-title class="hindi-fix">{{
              item.label
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-col>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data() {
    return {
      languages: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: 'Português', value: 'pt_br' },
        { label: 'हिन्दी', value: 'hi' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Français', value: 'fr' },
        { label: '中文', value: 'zh' },
        { label: 'العربية', value: 'ar' },
        { label: 'Русский', value: 'ru' },
        { label: '日本語', value: 'ja' },
      ],
    }
  },

  computed: {
    ...mapGetters('Language', ['lang']),
  },
  mounted() {
    this.$i18n.locale = this.lang;
  },
  methods: {
    ...mapActions('Language', ['setLang']),
    updateLang(newLang) {
      this.setLang(newLang)
      this.$i18n.locale = newLang
    },
  },
};
</script>

<style>
.v-select.v-input--dense .v-select__selection,
.v-select__selection {
  padding-bottom: 4px !important;
}
</style>
