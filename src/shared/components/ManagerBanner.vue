<template>
  <v-row
    align="center"
    justify="center"
    class="manager-bg back-gradient pa-6"
  >
    <!-- Text Column -->
    <v-col
      cols="12"
      md="6"
      class="text-white text-center text-md-left"
    >
      <div>
        <p class="font-weight-medium text-h4 text-md-h2">
          {{ $t('titles.manager') }}
        </p>
        <p class="text-subtitle-1 text-md-subtitle-1">
          {{ title }}
        </p>
      </div>
    </v-col>

    <!-- Image Column -->
    <v-col
      cols="12"
      md="6"
      class="d-flex justify-center"
    >
      <v-img
        :src="require('@/assets/manager/IntroManager.svg')"
        max-height="300"
        max-width="100%"
      />
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.back-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
  width: 100%;
}

.manager-bg {
  min-height: 300px;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
