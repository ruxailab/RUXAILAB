<template>
  <div>
    <v-list class="py-0" v-if="items">
      <div v-for="(item, n) in items" :key="n">
        <v-list-item @click="emitClick(item)" :ripple="false" v-if="item">
          <!-- Avatar -->
          <v-list-item-avatar tile style="border-radius: 5px" size="40">
            <v-avatar
              v-if="type === 'template'"
              tile
              :color="generateColor()"
              style="color: #545454"
              ><!--{{ item.header.title[0].toUpperCase() }}-->
              </v-avatar
            >
            <v-avatar
              v-else
              tile
              :color="generateColor()"
              style="color: #545454"
              ><!--{{ item.title[0].toUpperCase() }}--></v-avatar
            >
          </v-list-item-avatar>

          <v-list-item-content>
            <!-- Title -->
            <v-list-item-title v-if="type === 'template'">
              {{ item.testTitle }}
              <v-chip outlined style="color: grey" small class="ml-1">{{
                item.header.type || item.body.type
              }}</v-chip>
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ item.title }}
              <v-chip outlined style="color: grey" small class="ml-1">{{
                item.type
              }}</v-chip>
            </v-list-item-title>

            <!-- Subtitle -->
            <v-list-item-subtitle
              v-if="
                type === 'answers' || type === 'myCoops' || type === 'template'
              "
            >
              {{
                item || item
                  ? `Created by ${
                      type === "template"
                        ? item
                        : item
                    }`
                  : ""
              }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-else-if="type === 'myTests'">
              {{ item.updateDate ? `Last Updated on ${item.updateDate}` : "-" }}
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
                    {{ item.nCoops >= 0 ? item.nCoops : "-" }}
                    <v-icon class="ml-1">mdi-account-multiple</v-icon>
                  </v-row>
                </template>
                <span>Cooperators</span>
              </v-tooltip>
              <v-tooltip top v-else-if="type === 'answers'">
                <template v-slot:activator="{ on, attrs }">
                  <v-row v-bind="attrs" v-on="on">
                    <div class="caption">{{ item.answersSheet.progress }}%</div>

                    <v-progress-circular
                      rotate="-90"
                      :value="item.answersSheet.progress"
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
            <v-list-item-action-text
              v-if="
                (type === 'answers' ||
                  type === 'template' ||
                  type === 'myCoops') &&
                  (item || item.header.date)
              "
              >Last Updated on
              {{
                type === "template" ? item.updateDate : item
              }}</v-list-item-action-text
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
        v-if="items.length == 0"
      >
        <span v-if="type === 'myTests' || type === 'myCoops'"
          >No tests found</span
        >
        <span v-else-if="type === 'answers'">No answers found</span>
        <span v-else-if="type === 'template'">No templates found</span>
      </v-row>
    </v-list>
    <v-row v-if="hasPagination" justify="center" class="mt-5">
      <v-btn :disabled="disablePrevious" icon @click="emitPreviousPage()"
        ><v-icon>mdi-arrow-left</v-icon></v-btn
      >
      <v-btn :disabled="disableNext" icon class="ml-3" @click="emitNextPage()"
        ><v-icon>mdi-arrow-right</v-icon></v-btn
      >
    </v-row>
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
    let availableTypes = ["myTests", "answers", "myCoops", "template"];

    if (!availableTypes.includes(this.type)) {
      console.error(this.type + " type in ListTests.vue is not valid.");
    }
  },
};
</script>
