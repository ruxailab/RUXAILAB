<template>
  <div>
    <v-list class="py-0" v-if="items">
      <div v-for="(item, n) in items" :key="n">
        <v-list-item @click="emitClick(item)" :ripple="false" v-if="item">
          <!-- Avatar -->
          <v-list-item-avatar tile style="border-radius: 5px" size="40">
            <v-avatar tile :color="generateColor()" style="color: #545454">{{
              item.testTitle[0].toUpperCase()
            }}</v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <!-- Title -->
            <v-list-item-title v-if="type === 'template'">
              <!-- {{ item.testType }} -->
              <v-chip outlined style="color: grey" small class="ml-1">{{
                item.header.type || item.body.type
              }}</v-chip>
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ item.testTitle }}
              <!-- Tales -->
              <v-chip outlined style="color: grey" small class="ml-1">{{
                item.testType
              }}</v-chip>
            </v-list-item-title>

            <!-- Subtitle -->
            <v-list-item-subtitle>
              Created by
              <strong v-if="type === 'myTests'">
                Me
              </strong>
              <strong v-else>{{
                item.testAdmin ? item.testAdmin.email : item.testAuthorEmail
              }}</strong>
              on
              <strong>{{ item.creationDate }}</strong>
            </v-list-item-subtitle>
            <div
              class="hidden-sm-and-down"
              style="position: absolute; right: 25%"
            >
              <v-tooltip top v-if="type === 'myTests'">
                <template v-slot:activator="{ on, attrs }">
                  <v-row
                    class="ma-0 pa-0"
                    v-bind="attrs"
                    v-on="on"
                    align="center"
                  >
                    {{
                      item.numberColaborators >= 0
                        ? item.numberColaborators
                        : "-"
                    }}
                    <v-icon class="ml-1">mdi-account-multiple</v-icon>
                  </v-row>
                </template>
                <span>Cooperators</span>
              </v-tooltip>
              <v-tooltip top v-else-if="type === 'sharedWithMe'">
                <template v-slot:activator="{ on, attrs }">
                  <v-row v-bind="attrs" v-on="on">
                    <div class="caption">{{ item.testProgress }}%</div>

                    <v-progress-circular
                      rotate="-90"
                      :value="item.testProgress"
                      color="grey darken-1"
                      :size="20"
                      class="ml-1"
                    ></v-progress-circular>
                  </v-row>
                </template>
                <span>Progress</span>
              </v-tooltip>
            </div>
          </v-list-item-content>

          <!-- Actions -->
          <v-list-item-action class="hidden-sm-and-down">
            <v-list-item-action-text v-if="item.updateDate"
              >Last Updated on {{ item.updateDate }}</v-list-item-action-text
            >
            <v-list-item-action-text v-if="type === 'template'">
              <v-chip outlined small class="ml-1"
                >Version: {{ item.header.version }}</v-chip
              >
            </v-list-item-action-text>
          </v-list-item-action>
        </v-list-item>
        <v-divider v-if="n !== items.length - 1"></v-divider>
      </div>

      <v-row
        justify="center"
        align="center"
        class="ma-0 mt-2 pa-0"
        v-if="items.length <= 0"
      >
        <span
          v-if="
            type === 'myTests' ||
              type === 'publicTests' ||
              type === 'sharedWithMe'
          "
          >No tests found</span
        >
        <span v-else-if="type === 'template'">No templates found</span>
      </v-row>
    </v-list>
    <!-- <v-row v-if="hasPagination" justify="center" class="mt-5">
      <v-btn :disabled="disablePrevious" icon @click="emitPreviousPage()"
        ><v-icon>mdi-arrow-left</v-icon></v-btn
      >
      <v-btn :disabled="disableNext" icon class="ml-3" @click="emitNextPage()"
        ><v-icon>mdi-arrow-right</v-icon></v-btn
      >
    </v-row> -->
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      default: function() {
        return [];
      },
    },
    type: {
      type: String,
      required: true,
    },
    hasPagination: {
      type: Boolean,
      default: false,
    },
    disableNext: {
      type: Boolean,
    },
    disablePrevious: {
      type: Boolean,
    },
  },
  data: () => ({}),
  methods: {
    generateColor() {
      let hue = Math.floor(Math.random() * 360);
      let color = "hsl(" + hue + ", 80%, 80%)";

      return color;
    },
    emitClick(item) {
      this.$emit("clicked", item);
    },
    emitNextPage() {
      this.$emit("nextPage");
    },
    emitPreviousPage() {
      this.$emit("previousPage");
    },
  },
  beforeUpdate() {
    let availableTypes = ["myTests", "publicTests", "sharedWithMe", "template"];

    if (!availableTypes.includes(this.type)) {
      console.error(this.type + " type in ListTests.vue is not valid.");
    }
  },
};
</script>
