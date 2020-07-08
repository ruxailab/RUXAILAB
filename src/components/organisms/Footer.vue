<template>
  <v-footer dark padless>
    <v-card flat tile class="gray lighten-3 white--text text-center"   style="width:100%">
      <v-card-text>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          class="mx-4 white--text d-none"
          icon
          @click="sendTo(icon.linkTo)"
        >
          <v-icon size="24px">{{ icon.icon }}</v-icon>
        </v-btn>
      </v-card-text>

      <v-card-text
        class="white--text pt-0"

      > We are looking for new partners to help us to grow the project! Feel free to contact us on uxremotelab@gmail.com</v-card-text>

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
