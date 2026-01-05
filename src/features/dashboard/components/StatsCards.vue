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
              <!--STUDIES WHERE USER IS TESTADMIN -->
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
               <!--STORAGE USED BY USER -->
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
             <!-- COOPERATORS FROM STUDIES WHERE USER IS TESTADMIN -->
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

/* Extra small screens (around 433px) */
@media (max-width: 500px) {
    .stats-card {
        height: auto;
        min-height: 90px;
    }
    
    .icon-wrapper {
        min-width: 32px;
        height: 32px;
        padding: 4px;
    }
    
    .stats-value {
        font-size: 13px;
        font-weight: 700;
    }
    
    .stats-label {
        font-size: 10px;
        font-weight: 400;
    }
}

/* Mobile responsive (cols="6" - 2 cards per row) */
@media (max-width: 599px) {
    .stats-card {
        height: auto;
        min-height: 110px;
    }
    
    .icon-wrapper {
        min-width: 40px;
        height: 40px;
        padding: 6px;
    }
    
    .stats-value {
        font-size: 16px;
        font-weight: 700;
    }
    
    .stats-label {
        font-size: 12px;
        font-weight: 400;
    }
}

/* Tablet responsive (sm="6" - 2 cards per row) */
@media (min-width: 600px) and (max-width: 959px) {
    .stats-card {
        height: auto;
        min-height: 115px;
    }
    
    .icon-wrapper {
        min-width: 44px;
        height: 44px;
        padding: 7px;
    }
    
    .stats-value {
        font-size: 18px;
        font-weight: 700;
    }
    
    .stats-label {
        font-size: 14px;
        font-weight: 400;
    }
}

/* Desktop responsive (md="3" - 4 cards per row) */
@media (min-width: 960px) {
    .stats-card {
        height: 120px;
    }
    
    .icon-wrapper {
        min-width: 48px;
        height: 48px;
        padding: 8px;
    }
    
    .stats-value {
        font-size: 20px;
        font-weight: 700;
    }
    
    .stats-label {
        font-size: 16px;
        font-weight: 400;
    }
}
</style>
