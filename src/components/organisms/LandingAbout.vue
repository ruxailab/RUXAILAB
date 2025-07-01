<template>
  <v-container
    fluid
    class="background-blob-desktop"
  >
    <v-row
      justify="space-around"
      align="center"
      class="my-10 background-blob-mobile1"
    >
      <h4 class="text-h4 text-center mb-3 mx-1 d-md-none">
        {{ $t('pages.landing.feedbackTitle') }}
      </h4>
      <v-col
        cols="12"
        md="5"
      >
        <v-img
          :src="require('@/assets/landing/aboutTop.png')"
          max-height="350"
          cover
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <h4 class="text-h4 text-left mb-3 d-none d-md-block">
          {{ $t('pages.landing.feedbackTitle') }}
        </h4>
        <p
          align="justify"
          class="mb-3"
          style="line-height: 1.6"
        >
          {{ $t('pages.landing.feedbackSubtitle1') }}
        </p>
        <p
          align="justify"
          style="line-height: 1.6"
        >
          {{ $t('pages.landing.feedbackSubtitle2') }}
        </p>
      </v-col>
    </v-row>

    <v-row
      justify="space-around"
      align="center"
      class="my-10 background-blob-mobile2"
    >
      <v-col
        cols="12"
        md="5"
      >
        <h4 class="text-h4 text-left mb-3 d-none d-md-block">
          {{ $t('pages.landing.uxTitle') }}
        </h4>
        <h4 class="text-h4 text-center mb-3 d-md-none">
          {{ $t('pages.landing.uxTitle') }}
        </h4>

        <v-img
          :src="require('@/assets/landing/aboutBottom.png')"
          max-height="350"
          cover
          class="mb-4 d-md-none"
        />

        <p
          align="justify"
          class="mb-3"
          style="line-height: 1.6"
        >
          {{ $t('pages.landing.uxSubtitle1') }}
        </p>
        <p
          align="justify"
          style="line-height: 1.6"
        >
          {{ $t('pages.landing.uxSubtitle2') }}
        </p>
        <v-row class="d-none d-md-flex">
          <v-btn
            variant="outlined"
            rounded
            class="mt-7"
            @click="goToGithub"
          >
            {{ $t('buttons.seeCode') }}
          </v-btn>
        </v-row>
        <v-row
          justify="center"
          class="d-md-none"
        >
          <v-btn
            variant="outlined"
            rounded
            class="mt-2"
            @click="goToGithub"
          >
            {{ $t('buttons.seeCode') }}
          </v-btn>
        </v-row>
      </v-col>

      <v-col
        cols="12"
        md="5"
        class="d-none d-md-flex"
      >
        <v-img :src="require('@/assets/landing/aboutBottom.png')" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const goToGithub = () => {
  window.open(
    'https://github.com/uramakilab/remote-usability-lab',
    '_blank'
  )}
</script>

<style scoped>
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
</style>