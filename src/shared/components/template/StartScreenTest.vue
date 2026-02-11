<template>
  <div>
    <v-row class="start-screen pa-0 ma-0" align="center">
      <v-col md="8" class="ma-5 pa-5">
        <img
          src="@/assets/logo_full_white.png"
          alt="RUXAILAB"
          class="mb-10"
          style="max-width: 300px"
        />
        <h1 class="text-h2 font-weight-bold text-white">
          {{ test.testTitle }}
        </h1>
        <p class="text-body-1 mb-5 text-white text-justify">
          {{ test.testDescription }}
        </p>
        <v-btn
          color="white"
          variant="outlined"
          rounded
          size="x-large"
          @click="startTest"
        >
          {{ $t('buttons.startTest') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// Props
defineProps({
  test: {
    type: Object,
    required: true,
  },
})

// Emits
defineEmits(['start'])
</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-screen.leaving,
.start-screen.leaving > *,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.start-screen::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

.start-screen.leaving::before {
  opacity: 0;
}
</style>
