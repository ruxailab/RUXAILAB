<template>
  <v-app>
    <v-navigation-drawer permanent width="370" class="ruxailab-sidebar">
      <!-- Logo and Title -->
      <div class="pa-4 d-flex align-center">
        <v-avatar color="orange" size="40" class="mr-3">
          <span class="white--text text-h5">R</span>
        </v-avatar>
        <div>
          <h1 class="text-h5 grey--text text--darken-3 font-weight-medium mb-0">
            RUXAILAB
          </h1>
          <div class="caption grey--text">
            web accessibility evaluation tool
          </div>
        </div>
        <v-spacer></v-spacer>
      </div>

      <!-- Address Bar -->
      <div class="px-4 py-2">
        <div class="d-flex align-center mb-1">
          <div class="mr-2">Address:</div>
          <v-text-field
            dense
            hide-details
            outlined
            value="https://www.example.com/page"
            class="flex-grow-1"
          ></v-text-field>
          <v-btn icon class="ml-1">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Styles Toggle -->
      <div class="px-4 py-2">
        <v-card outlined class="pa-3">
          <div class="d-flex align-center">
            <div class="mr-4">Styles:</div>
            <div class="grey--text mr-2">OFF</div>
            <v-switch
              v-model="stylesEnabled"
              color="primary"
              hide-details
              inset
              dense
            ></v-switch>
            <div class="primary--text ml-2">ON</div>
          </div>
        </v-card>
      </div>

      <!-- Summary Section -->
      <div class="px-4 pt-4">
        <h2 class="text-h5 mb-2">Summary</h2>

        <!-- Tabs -->
        <div class="d-flex mb-4 grey lighten-4">
          <v-btn
            v-for="(tab, index) in tabs"
            :key="index"
            text
            small
            :class="activeTab === index ? 'primary--text' : ''"
            @click="activeTab = index"
            class="px-2"
          >
            <v-icon small class="mr-1">{{ tab.icon }}</v-icon>
            {{ tab.name }}
          </v-btn>
        </div>

        <!-- Statistics Grid -->
        <v-row>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="error" large>mdi-close-circle</v-icon>
              <div class="text-h4 error--text">6</div>
              <div class="caption">Errors</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="deep-orange" large>mdi-contrast-circle</v-icon>
              <div class="text-h4 deep-orange--text">2</div>
              <div class="caption">Contrast Errors</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="amber darken-2" large>mdi-alert</v-icon>
              <div class="text-h4 amber--text text--darken-2">4</div>
              <div class="caption">Alerts</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="success" large>mdi-check-circle</v-icon>
              <div class="text-h4 success--text">5</div>
              <div class="caption">Features</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="primary" large>mdi-sitemap</v-icon>
              <div class="text-h4 primary--text">10</div>
              <div class="caption">Structural Elements</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined class="pa-3 text-center">
              <v-icon color="deep-purple" large>mdi-cube-outline</v-icon>
              <div class="text-h4 deep-purple--text">0</div>
              <div class="caption">ARIA</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- View Details Button -->
        <div class="text-center mt-4 mb-4">
          <v-btn color="primary" class="px-4">
            <v-icon left>mdi-format-list-bulleted</v-icon>
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
