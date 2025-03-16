<template>
  <v-container fluid :class="backgroundContainerClass">
    <!-- Sinusoidal curve SVG at the top -->
    <svg
      class="sinusoidal-curve"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
    >
      <path
        d="M0,100 C200,150 400,50 600,100 C800,150 1000,50 1200,100 C1400,150 1600,50 1800,100 L1800 200 L0 200 Z"
        fill="currentColor"
      />
    </svg>

    <!-- Main content -->
    <v-row
      justify="space-around"
      align="center"
      class="my-10 background-blob-mobile1"
    >
      <h4 class="display-1 text-center mb-3 mx-1 hidden-md-and-up">
        {{ $t('pages.landing.feedbackTitle') }}
      </h4>
      <v-col cols="12" md="5">
        <v-img
          src="@/assets/landing/aboutTop.png"
          max-height="350"
          contain
        />
      </v-col>
      <v-col cols="12" md="6" class="middle-content">
        <h4 class="display-1 text-left mb-3 hidden-sm-and-down">
          {{ $t('pages.landing.feedbackTitle') }}
        </h4>

        <p align="justify" class="text-subtitle-1" style="line-height: 1.6">
          {{ $t('pages.landing.feedbackSubtitle1') }}
        </p>
        <p align="justify" class="text-subtitle-1" style="line-height: 1.6">
          {{ $t('pages.landing.feedbackSubtitle2') }}
        </p>
      </v-col>
    </v-row>

    <v-row
      justify="space-around"
      align="center"
      class="my-10 background-blob-mobile2"
    >
      <v-col cols="12" md="5" class="middle-content">
        <h4 class="display-1 text-left mb-3 hidden-sm-and-down">
          {{ $t('pages.landing.uxTitle') }}
        </h4>
        <h4 class="display-1 text-center mb-3 hidden-md-and-up">
          {{ $t('pages.landing.uxTitle') }}
        </h4>

        <v-img
          src="@/assets/landing/aboutBottom.png"
          max-height="350"
          contain
          class="mb-4 hidden-md-and-up"
        />

        <p align="justify" class="text-subtitle-1" style="line-height: 1.6">
          {{ $t('pages.landing.uxSubtitle1') }}
        </p>
        <p align="justify" class="text-subtitle-1" style="line-height: 1.6">
          {{ $t('pages.landing.uxSubtitle2') }}
        </p>
        <v-row class="hidden-sm-and-down">
          <v-btn
            outlined
            rounded
            class="mt-2"
            :class="buttonClass"
            @click="goToGithub()"
          >
            {{ $t('buttons.seeCode') }}
          </v-btn>
        </v-row>
        <v-row justify="center" class="hidden-md-and-up">
          <v-btn
            outlined
            rounded
            class="mt-2"
            :class="buttonClass"
          >
            {{ $t('buttons.seeCode') }}
          </v-btn>
        </v-row>
      </v-col>

      <v-col cols="12" md="5" class="hidden-sm-and-down">
        <v-img src="@/assets/landing/aboutBottom.png" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  methods: {
    goToGithub() {
      window.open(
        'https://github.com/uramakilab/remote-usability-lab',
        '_blank'
      )
    }
  },
  computed: {
    // Class to dynamically change background based on theme
    backgroundContainerClass() {
      return this.$vuetify.theme.dark
        ? 'background-dark'
        : 'background-light'
    },
    // Button styles based on dark mode
    buttonClass() {
      return this.$vuetify.theme.dark ? 'text-white' : 'text-black'
    }
  }
}
</script>

<style scoped>
.background-dark {
  background-color: #121212;
  color: white;
}

.background-light {
  background-color: #f5f7ff;
  color: black;
}

.background-blob-desktop {
  background-image: url('https://i.ibb.co/C7F8Vmq/blob.png');
  background-size: contain;
  background-position: center;
}

.background-blob-mobile1 {
  background-image: none;
}

.background-blob-mobile2 {
  background-image: none;
}

/* Preserve middle portion styling */
.middle-content {
  background-color: inherit;
  color: inherit;
}

.sinusoidal-curve {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px; /* Adjust the height of the curve */
  z-index: -1;
  fill: #F9A826; /* Adjust color of the curve */
}

@media screen and (max-width: 960px) {
  .background-blob-desktop {
    background-image: none;
  }
  .background-blob-mobile1 {
    background-image: url('https://i.ibb.co/C7F8Vmq/blob.png');
    background-size: contain;
    background-position: center;
  }
  .background-blob-mobile2 {
    background-image: url('https://i.ibb.co/hgZWz0Z/blob2.png');
    background-size: contain;
    background-position: center;
  }
}

.text-subtitle-1 {
  color: inherit; /* Inherit text color */
  transition: color 0.3s ease;
}

.v-btn.text-white {
  background-color: #F9A826;
  color: white;
}

.v-btn.text-black {
  background-color: #F9A826;
  color: black;
}
</style>
