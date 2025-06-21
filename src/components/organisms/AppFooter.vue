<template>
  <v-footer class="pa-0">
    <v-card
      flat
      tile
      color="#272727"
      class="text-white text-center"
      style="width:100%"
    > 
      <v-card-text class="text-white py-1">
        {{ $t('pages.landing.footer') }}
        <a
          class="text-primary"
          @click="sendTo('mailto:ruxailab@gmail.com')"
        >ruxailab@gmail.com</a>
      </v-card-text>

      <v-divider />

      <v-card-text class="text-white">
        {{ currentYear }} —
        <strong>RUXAILAB</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Social media icons data
const icons = [
  { icon: 'mdi-facebook', linkTo: 'https://www.facebook.com' },
  { icon: 'mdi-twitter', linkTo: 'https://www.twitter.com' },
  { icon: 'mdi-instagram', linkTo: 'https://www.instagram.com/lgfacens/' },
];

const currentYear = computed(() => new Date().getFullYear());

const sendTo = (link) => {
  window.open(link);
};
</script>

<style></style>