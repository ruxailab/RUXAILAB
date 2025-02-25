<template>
  <v-footer dark padless>
    <v-card
      flat
      tile
      class="bg-dark text-white text-center p-4 shadow-lg rounded-lg"
      style="width:100%"
    >
      <v-card-text class="py-3">
        <p class="text-uppercase font-weight-bold">{{ $t('pages.landing.footer') }}</p>
        <a @click="sendTo('mailto:ruxailab@gmail.com')" class="text-decoration-none text-white">
          <strong>ruxailab@gmail.com</strong>
        </a>
      </v-card-text>

      <v-divider class="my-3 bg-light" />

      <!-- Updated Section: Centered Text & Right-Aligned Discord Icon -->
      <v-card-text class="d-flex justify-content-center align-items-center position-relative">
        <p class="font-italic m-0">
          {{ new Date().getFullYear() }} — <strong>RUXAILAB</strong>
        </p>
        <div class="discord-icon">
          <a
            v-for="icon in icons"
            :key="icon.icon"
            :href="icon.linkTo"
            target="_blank"
            class="text-white d-flex align-items-center justify-content-center"
            :aria-label="icon.icon"
          >
            <mdi-discord v-if="icon.icon === 'discord'" class="text-white" />
            <v-icon v-else class="mdi" :class="icon.icon" size="36"></v-icon>
          </a>
        </div>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
import MdiDiscord from '@/components/organisms/MdiDiscord.vue'; // Adjust path if needed

export default {
  components: {
    MdiDiscord,
  },
  data: () => ({
    icons: [
      { icon: 'discord', linkTo: 'https://discord.com/invite/YnkDk9BNYK' },
    ],
  }),
  methods: {
    sendTo(link) {
      window.open(link);
    },
  },
};
</script>

<style scoped>
.v-footer {
  background-color: #23272a; /* Discord-like dark theme */
  padding: 20px 0;
  border-top: 3px solid #7289da;
}

.v-footer a {
  transition: color 0.3s ease, transform 0.2s ease;
}

.v-footer a:hover {
  color: #ffcc00; /* Yellow color on hover */
  transform: scale(1.1);
}

.v-icon,
.mdi-discord {
  transition: transform 0.3s ease, color 0.3s ease;
  cursor: pointer;
}

.v-icon:hover,
.mdi-discord:hover {
  color: #7289da; /* Discord blue */
  transform: scale(1.2);
}

.discord-icon {
  position: absolute;
  right: 0;
}
</style>
