<template>
  <v-row class="mb-6">
    <!-- Total Studies Card -->
    <v-col
      cols="6"
      sm="6"
      md="3"
    >
      <v-card
        elevation="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-start">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-flask"
                size="32"
                color="secondary"
              />
            </div>
            <div class="text-right">
              <div class="stats-value">
                {{ totalStudies }}/50
              </div>
              <div class="stats-label">
                Studies
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Storage Quota Card -->
    <v-col
      cols="6"
      sm="6"
      md="3"
    >
      <v-card
        elevation="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-start">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-harddisk"
                size="32"
                color="secondary"
              />
            </div>
            <div class="text-right">
              <div class="stats-value">
                {{ usedStorage }}/500MB
              </div>
              <div class="stats-label">
                Storage
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Current Plan Card -->
    <v-col
      cols="6"
      sm="6"
      md="3"
    >
      <v-card
        elevation="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-start">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-crown"
                size="32"
                color="secondary"
              />
            </div>
            <div class="text-right">
              <div class="stats-value">
                Free
              </div>
              <div class="stats-label">
                Plan
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Total Participants Card -->
    <v-col
      cols="6"
      sm="6"
      md="3"
    >
      <v-card
        elevation="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-start">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-account-group"
                size="32"
                color="secondary"
              />
            </div>
            <div class="text-right">
              <div class="stats-value">
                {{ totalParticipants }}
              </div>
              <div class="stats-label">
                Participants
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
    totalStudies: {
        type: Number,
        default: 0
    },
    usedStorage: {
        type: Number,
        default: 0
    },
    totalParticipants: {
        type: Number,
        default: 0
    }
})
</script>

<style scoped>
.stats-card {
    height: 120px;
    transition: transform 0.2s ease-in-out;
}

.stats-card:hover {
    transform: translateY(-2px);
}

.icon-wrapper {
    background-color: rgb(var(--v-theme-secondary), 0.15);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 48px;
}

.stats-value {
    font-size: 20px;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
}

.stats-label {
    font-size: 16px;
    font-weight: 400;
}
</style>
