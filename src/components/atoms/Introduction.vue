<template>
  <section>
    <!-- Desktop -->
    <v-container class="hidden-sm-and-down yellow-bg fixed-height">
      <v-img v-if="desktopImagePreloaded" src="@/assets/landing/introductionDesktop.svg">
        <v-container>
          <v-row align="center" class="mb-10">
            <v-col class="text-left" cols="12" md="6">
              <h1 class="display-3 font-weight-regular mb-4 mt-16 white--text">
                {{ $t('Introduction.title') }}
              </h1>
              <h4 class="display-1 white--text mb-4">
                {{ $t('Introduction.subtitle') }}
              </h4>
              <p class="white--text mb-4 text-justify content-width">
                {{ $t('Introduction.description') }}
              </p>
              <v-btn color="white" outlined rounded class="mb-2" @click="goTo('/signup')">
                {{ $t('Introduction.cta') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-img>
    </v-container>

    <!-- Mobile -->
    <v-container class="hidden-md-and-up ma-0 pa-0">
      <div class="yellow-bg">
        <div class="yellow-bg">
          <v-col>
            <h1 class="display-3 font-weight-regular white--text text-center mt-5">
              {{ $t('Introduction.title') }}
            </h1>
          </v-col>
        </div>
        <v-img v-if="mobileImagePreloaded" src="@/assets/landing/introductionMobile.svg" class="mb-4" max-height="350" contain />
        <div class="yellow-bg mx-1">
          <h4 class="display-1 white--text mb-4 text-center">
            {{ $t('Introduction.subtitle') }}
          </h4>
        </div>
        <div class="yellow-bg mx-3">
          <v-row justify="center">
            <p class="white--text mb-4 mx-4 text-center">
              {{ $t('Introduction.description') }}
            </p>
            <v-btn color="white" outlined rounded class="mb-2" @click="goTo('/signup')">
              {{ $t('Introduction.cta') }}
            </v-btn>
          </v-row>
        </div>
        <div class="yellow-bg bottom-margin" />
      </div>
      <div class="spacer" />
    </v-container>
  </section>
</template>

<style scoped>
.yellow-bg {
  background-color: #f4b700;
}

.fixed-height {
  height: 300px;
}

.bottom-margin {
  height: 40px;
}

.spacer {
  height: 10px;
}

.content-width {
  width: 80%;
}
</style>

<script>
export default {
  data() {
    return {
      desktopImagePreloaded: false,
      mobileImagePreloaded: false,
    };
  },
  mounted() {
    this.preloadImages();
  },
  methods: {
    preloadImages() {
      const desktopImage = new Image();
      desktopImage.onload = () => {
        this.desktopImagePreloaded = true;
      };
      desktopImage.onerror = () => {
        console.error('Error loading desktop image');
      };
      desktopImage.src = require('@/assets/landing/introductionDesktop.svg');

      const mobileImage = new Image();
      mobileImage.onload = () => {
        this.mobileImagePreloaded = true;
      };
      mobileImage.onerror = () => {
        console.error('Error loading mobile image');
      };
      mobileImage.src = require('@/assets/landing/introductionMobile.svg');
    },
    goTo(path) {
      this.$router.push(path).catch(() => {});
    },
  },
};
</script>
