<template>
  <v-app>
    <v-navigation-drawer
      permanent
      width="370"
      class="ruxailab-sidebar"
    >
      <!-- Logo and Title -->
      <div class="pa-4 d-flex align-center">
        <v-avatar
          color="orange"
          size="40"
          class="mr-3"
        >
          <span class="text-white text-h5">R</span>
        </v-avatar>
        <div>
          <h1 class="text-h5 text-grey-darken-3 font-weight-medium mb-0">
            RUXAILAB
          </h1>
          <div class="text-caption text-grey">
            web accessibility evaluation tool
          </div>
        </div>
        <v-spacer />
      </div>

      <!-- Address Bar -->
      <div class="px-4 py-2">
        <div class="d-flex align-center mb-1">
          <div class="mr-2">
            Address:
          </div>
          <v-text-field
            density="compact"
            hide-details
            variant="outlined"
            model-value="https://www.example.com/page"
            class="flex-grow-1"
          />
          <v-btn
            icon
            class="ml-1"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Styles Toggle -->
      <div class="px-4 py-2">
        <v-card
          border
          class="pa-3"
        >
          <div class="d-flex align-center">
            <div class="mr-4">
              Styles:
            </div>
            <div class="text-grey mr-2">
              OFF
            </div>
            <v-switch
              v-model="stylesEnabled"
              color="primary"
              hide-details
              inset
              density="compact"
            />
            <div class="text-primary ml-2">
              ON
            </div>
          </div>
        </v-card>
      </div>

      <!-- Summary Section -->
      <div class="px-4 pt-4">
        <h2 class="text-h5 mb-2">
          Summary
        </h2>

        <!-- Tabs -->
        <div class="d-flex mb-4 bg-grey-lighten-4">
          <v-btn
            v-for="(tab, index) in tabs"
            :key="index"
            variant="text"
            size="small"
            :class="activeTab === index ? 'primary--text' : ''"
            class="px-2"
            @click="activeTab = index"
          >
            <v-icon
              size="small"
              class="mr-1"
            >
              {{ tab.icon }}
            </v-icon>
            {{ tab.name }}
          </v-btn>
        </div>

        <!-- Statistics Grid -->
        <v-row>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="error"
                size="large"
              >
                mdi-close-circle
              </v-icon>
              <div class="text-h4 text-error">
                6
              </div>
              <div class="text-caption">
                Errors
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="deep-orange"
                size="large"
              >
                mdi-contrast-circle
              </v-icon>
              <div class="text-h4 text-deep-orange">
                2
              </div>
              <div class="text-caption">
                Contrast Errors
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="amber-darken-2"
                size="large"
              >
                mdi-alert
              </v-icon>
              <div class="text-h4 text-amber-darken-2">
                4
              </div>
              <div class="text-caption">
                Alerts
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="success"
                size="large"
              >
                mdi-check-circle
              </v-icon>
              <div class="text-h4 text-success">
                5
              </div>
              <div class="text-caption">
                Features
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="primary"
                size="large"
              >
                mdi-sitemap
              </v-icon>
              <div class="text-h4 text-primary">
                10
              </div>
              <div class="text-caption">
                Structural Elements
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              border
              class="pa-3 text-center"
            >
              <v-icon
                color="deep-purple"
                size="large"
              >
                mdi-cube-outline
              </v-icon>
              <div class="text-h4 text-deep-purple">
                0
              </div>
              <div class="text-caption">
                ARIA
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- View Details Button -->
        <div class="text-center mt-4 mb-4">
          <v-btn
            color="primary"
            class="px-4"
          >
            <v-icon start>
              mdi-format-list-bulleted
            </v-icon>
            View details
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Main Content Area (placeholder) -->
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col>
            <v-card class="pa-4">
              <h2>Main Content Area</h2>
              <p>Your application content would go here.</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'RuxailabSidebar',
  data() {
    return {
      stylesEnabled: true,
      activeTab: 0,
      tabs: [
        { name: 'Summary', icon: 'mdi-home' },
        { name: 'Details', icon: 'mdi-format-list-bulleted' },
        { name: 'Reference', icon: 'mdi-information' },
        { name: 'Order', icon: 'mdi-format-list-numbered' },
        { name: 'Structure', icon: 'mdi-sitemap' },
        { name: 'Contrast', icon: 'mdi-contrast-circle' },
      ],
    }
  },
}
</script>

<style>
.ruxailab-sidebar {
  background-color: #e8eaed;
}
</style>
