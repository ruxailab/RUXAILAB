<template>
  <v-row class="mb-4 mb-md-6">
    <!-- Total Studies Card -->
    <v-col
      cols="6"
      sm="6"
      md="3"
      class="mb-4 mb-sm-0"
    >
      <v-card
        elevation="1"
        elevation-hover="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-3 pa-sm-4">
          <div class="d-flex justify-space-between align-center">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-flask"
                size="small"
                class="icon-size"
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
      class="mb-4 mb-sm-0"
    >
      <v-card
        elevation="1"
        elevation-hover="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-3 pa-sm-4">
          <div class="d-flex justify-space-between align-center">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-harddisk"
                size="small"
                class="icon-size"
                color="secondary"
              />
            </div>
            <div class="text-right">
               <!--STORAGE USED BY USER -->
              <div class="stats-value">
                {{ formatStorage(usedStorage) }}/500MB
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
      class="mb-4 mb-sm-0"
    >
      <v-card
        elevation="1"
        elevation-hover="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-3 pa-sm-4">
          <div class="d-flex justify-space-between align-center">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-crown"
                size="small"
                class="icon-size"
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
      class="mb-4 mb-sm-0"
    >
      <v-card
        elevation="1"
        elevation-hover="2"
        rounded="lg"
        class="stats-card"
      >
        <v-card-text class="pa-3 pa-sm-4">
          <div class="d-flex justify-space-between align-center">
            <div class="icon-wrapper">
              <v-icon
                icon="mdi-account-group"
                size="small"
                class="icon-size"
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
import { computed } from 'vue'

const props = defineProps({
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

const formatStorage = (storageMB) => {
  if (storageMB === 0) return '0MB';
  if (storageMB < 1000) return `${storageMB}MB`;
  return `${(storageMB / 1000).toFixed(1)}GB`;
}
</script>

<style scoped>
.stats-card {
    min-height: 90px;
    height: auto;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    cursor: pointer;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.icon-wrapper {
    background-color: rgba(var(--v-theme-secondary), 0.1);
    border-radius: 10px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;
    max-width: 40px;
    max-height: 40px;
}

.icon-size {
    font-size: 20px;
}

.stats-value {
    font-size: 18px;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
    word-break: break-word;
}

.stats-label {
    font-size: 14px;
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), 0.7);
    margin-top: 2px;
}

/* Mobile-first responsive design */
@media (max-width: 600px) {
    .stats-card {
        min-height: 80px;
        padding: 8px 0;
    }
    
    .icon-wrapper {
        min-width: 36px;
        min-height: 36px;
        max-width: 36px;
        max-height: 36px;
        padding: 5px;
    }
    
    .icon-size {
        font-size: 16px;
    }
    
    .stats-value {
        font-size: 16px;
        font-weight: 700;
    }
    
    .stats-label {
        font-size: 12px;
    }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 960px) {
    .stats-card {
        min-height: 100px;
    }
    
    .icon-wrapper {
        min-width: 44px;
        min-height: 44px;
        max-width: 44px;
        max-height: 44px;
    }
    
    .icon-size {
        font-size: 18px;
    }
    
    .stats-value {
        font-size: 17px;
    }
    
    .stats-label {
        font-size: 13px;
    }
}

/* Desktop */
@media (min-width: 961px) {
    .stats-card {
        min-height: 120px;
    }
    
    .icon-wrapper {
        min-width: 48px;
        min-height: 48px;
        max-width: 48px;
        max-height: 48px;
    }
    
    .icon-size {
        font-size: 24px;
    }
    
    .stats-value {
        font-size: 20px;
    }
    
    .stats-label {
        font-size: 16px;
    }
}

/* Extra small devices (phones in portrait) */
@media (max-width: 360px) {
    .stats-value {
        font-size: 14px;
    }
    
    .stats-label {
        font-size: 11px;
    }
    
    .icon-wrapper {
        min-width: 32px;
        min-height: 32px;
        max-width: 32px;
        max-height: 32px;
        padding: 4px;
    }
    
    .icon-size {
        font-size: 14px;
    }
}

/* Ensure proper spacing for touch */
@media (max-width: 960px) {
    .stats-card {
        padding: 4px;
    }
}
</style>