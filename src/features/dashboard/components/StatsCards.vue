<template>
  <v-row class="mb-6">
    <!-- Total Studies Card -->
    <v-col cols="6" sm="6" md="3">
      <v-card elevation="2" rounded="lg" class="stats-card">
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="auto">
              <div class="icon-wrapper">
                <v-icon icon="mdi-flask" size="32" color="secondary" />
              </div>
            </v-col>
            <v-col cols="12" sm class="text-left text-sm-right pt-0 pt-sm-3">
              <!--STUDIES WHERE USER IS TESTADMIN -->
              <div class="stats-value">{{ totalStudies }}/50</div>
              <div class="stats-label">Studies</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Storage Quota Card -->
    <v-col cols="6" sm="6" md="3">
      <v-card elevation="2" rounded="lg" class="stats-card">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="auto">
              <div class="icon-wrapper">
                <v-icon icon="mdi-harddisk" size="32" color="secondary" />
              </div>
            </v-col>
            <v-col cols="12" sm class="text-left text-sm-right pt-0 pt-sm-3">
              <!--STORAGE USED BY USER -->
              <div class="stats-value">
                {{ formattedStorage }}
              </div>
              <div class="stats-label">Storage</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Current Plan Card -->
    <v-col cols="6" sm="6" md="3">
      <v-card elevation="2" rounded="lg" class="stats-card">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="auto">
              <div class="icon-wrapper">
                <v-icon icon="mdi-crown" size="32" color="secondary" />
              </div>
            </v-col>
            <v-col cols="12" sm class="text-left text-sm-right pt-0 pt-sm-3">
              <div class="stats-value">Free</div>
              <div class="stats-label">Plan</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Total Participants Card -->
    <v-col cols="6" sm="6" md="3">
      <v-card elevation="2" rounded="lg" class="stats-card">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" sm="auto">
              <div class="icon-wrapper">
                <v-icon icon="mdi-account-group" size="32" color="secondary" />
              </div>
            </v-col>
            <!-- COOPERATORS FROM STUDIES WHERE USER IS TESTADMIN -->
            <v-col cols="12" sm class="text-left text-sm-right pt-0 pt-sm-3">
              <div class="stats-value">{{ totalParticipants }}/5</div>
              <div class="stats-label">Participants</div>
            </v-col>
          </v-row>
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
    default: 0,
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
  totalParticipants: {
    type: Number,
    default: 0,
  },
})

const formattedStorage = computed(() => {
  if (props.usedStorage >= 1000) {
    const gb = (props.usedStorage / 1000).toFixed(2)
    return `${gb}GB/0.5GB`
  }
  return `${props.usedStorage}MB/500MB`
})
</script>

<style scoped>
.stats-card {
  height: 160px;
}

@media (min-width: 600px) {
  .stats-card {
    height: auto;
  }
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
