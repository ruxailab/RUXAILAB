<template>
  <v-container class="info-screen-container" fluid>
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="10" md="7" lg="6">
        <!-- Header -->
        <div class="text-center mb-8">
          <v-icon size="56" color="white" class="mb-4"
            >mdi-book-open-page-variant-outline</v-icon
          >
          <h1 class="text-h3 font-weight-light text-white mb-2">
            {{ $t('EvaluatorInfoDisplay.title') }}
          </h1>
          <p class="text-body-1 text-white mb-0" style="opacity: 0.85">
            {{ $t('EvaluatorInfoDisplay.subtitle') }}
          </p>
        </div>

        <!-- Sections -->
        <div v-if="sections.length > 0">
          <v-card
            v-for="(section, idx) in sections"
            :key="section.id || idx"
            class="mb-4 rounded-lg"
            elevation="0"
          >
            <div class="d-flex align-start pa-5">
              <v-icon
                :color="sectionIconColor(section.type)"
                class="mr-4 flex-shrink-0 mt-1"
                size="22"
              >
                {{ sectionIcon(section.type) }}
              </v-icon>
              <div class="flex-grow-1">
                <p
                  v-if="section.title"
                  class="text-body-1 font-weight-semibold mb-2"
                  :class="`text-${sectionIconColor(section.type)}`"
                >
                  {{ section.title }}
                </p>
                <div
                  class="text-body-2 text-on-surface ql-content mb-0"
                  style="line-height: 1.6"
                  v-html="section.content"
                />
              </div>
            </div>
            <v-divider v-if="idx < sections.length - 1" />
          </v-card>
        </div>

        <v-card v-else class="pa-6 text-center mb-4 rounded-lg" elevation="0">
          <p class="text-body-1 text-ternary mb-0">
            {{ $t('EvaluatorInfoDisplay.noContent') }}
          </p>
        </v-card>

        <!-- Start button -->
        <div class="text-center mt-8">
          <v-btn
            color="white"
            variant="flat"
            size="large"
            rounded
            elevation="2"
            class="px-10 start-btn"
            @click="emit('start')"
          >
            <v-icon start>mdi-play-circle-outline</v-icon>
            {{ $t('EvaluatorInfoDisplay.startButton') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['start'])

const sectionIcon = (type) => {
  const icons = {
    info: 'mdi-information-outline',
    warning: 'mdi-alert-outline',
    tip: 'mdi-lightbulb-outline',
  }
  return icons[type] ?? icons.info
}

const sectionIconColor = (type) => {
  const colors = { info: 'primary', warning: 'warning', tip: 'success' }
  return colors[type] ?? 'primary'
}
</script>

<style scoped>
.info-screen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2b2d42 0%, #3d405b 100%);
}

.start-btn {
  color: #2b2d42 !important;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
