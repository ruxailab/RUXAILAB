<template>
  <v-footer dark padless>
    <v-card flat tile class="indigo lighten-1 white--text text-center">
      <v-card-text>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="mx-4 white--text"
          icon
          @click="sendTo(icon.linkTo)"
        >
          <v-icon size="24px">{{ icon.icon }}</v-icon>
        </v-btn>
      </v-card-text>

      <v-card-text
        class="white--text pt-0"
      >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</v-card-text>

      <v-divider></v-divider>

      <v-card-text class="white--text">
        {{ new Date().getFullYear() }} —
        <strong>Research Workflow</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    icons: [
      { icon: "mdi-facebook", linkTo: "https://www.facebook.com" },
      { icon: "mdi-twitter", linkTo: "https://www.twitter.com" },
      { icon: "mdi-instagram", linkTo: "https://www.instagram.com/lgfacens/" }
    ]
  }),
  methods: {
    sendTo(link) {
      window.open(link);
    }
  }
};
</script>