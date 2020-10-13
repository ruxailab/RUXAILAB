  <!-- <v-list class="py-0">
    <div v-for="(test, n) in tests" :key="n">
      <v-list-item @click="emitClick(test)" :ripple="false">
        <v-list-item-avatar tile style="border-radius: 5px" size="40">
          <v-avatar tile :color="generateColor()" style="color: #545454">{{
            test.title[0].toUpperCase()
          }}</v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            {{ test.title }}
            <v-chip outlined style="color: grey" small class="ml-1">{{
              test.type
            }}</v-chip>
            <span
              style="position: absolute; right: 5px;"
              class="caption hidden-sm-and-down"
              >{{ test.date ? "Created " : "-" }}{{ test.date }}</span
            >
          </v-list-item-title>
          <v-list-item-subtitle class="hidden-md-and-up"
            >{{ test.author ? "Created by " : "" }}{{ test.author
            }}{{ test.date && test.author ? " on " : ""
            }}{{ test.date && !test.author ? "Created " : ""
            }}{{ test.date }}</v-list-item-subtitle
          >
          <v-list-item-subtitle class="hidden-sm-and-down">
            {{ test.author ? "Created by " : "" }}{{ test.author }}
            <v-chip
              v-if="test.version"
              style="position: absolute; right: 5px; color: grey"
              outlined
              small
              class="ml-1"
              >Version: {{ test.version }}</v-chip
            >
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider v-if="n !== tests.length - 1"></v-divider>
    </div>
    <v-row
      justify="center"
      align="center"
      class="ma-0 mt-2 pa-0"
      v-if="tests.length == 0"
    >
      <span>No tests found</span>
    </v-row>
  </v-list> -->
<template>
  <v-list class="py-0">
    <div v-for="(test, n) in tests" :key="n">
      <v-list-item @click="emitClick(test)" :ripple="false">
        <!-- Avatar -->
        <v-list-item-avatar tile style="border-radius: 5px" size="40">
          <v-avatar tile :color="generateColor()" style="color: #545454">{{
            test.title[0].toUpperCase()
          }}</v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <!-- Title -->
          <v-list-item-title>
            {{ test.title }}
            <v-chip outlined style="color: grey" small class="ml-1">{{
              test.type
            }}</v-chip>
          </v-list-item-title>

          <!-- Subtitle -->
          <v-list-item-subtitle
            v-if="
              type === 'answers' || type === 'myCoops' || type === 'template'
            "
          >
            {{ test.author ? `Created by ${test.author}` : "" }}
          </v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="type === 'myTests'">
            {{ test.date ? "Last Updated on " : "-" }}{{ test.date }}
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
                  {{ test.nCoops >= 0 ? test.nCoops : "-" }}
                  <v-icon class="ml-1">mdi-account-multiple</v-icon>
                </v-row>
              </template>
              <span>Cooperators</span>
            </v-tooltip>
            <v-tooltip top v-else-if="type === 'answers'">
              <template v-slot:activator="{ on, attrs }">
                <v-row v-bind="attrs" v-on="on">
                  <div class="caption">{{ test.answersSheet.progress }}%</div>

                  <v-progress-circular
                    rotate="-90"
                    :value="test.answersSheet.progress"
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
            v-if="type === 'answers' || type === 'template' || type === 'myCoops'"
            >Last Updated on {{ test.date }}</v-list-item-action-text
          >
          <v-list-item-action-text v-if="type === 'template'">
            <v-chip outlined small class="ml-1"
              >Version: {{ test.version }}</v-chip
            >
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
      <v-divider v-if="n !== tests.length - 1"></v-divider>
    </div>

    <v-row
      justify="center"
      align="center"
      class="ma-0 mt-2 pa-0"
      v-if="tests.length == 0"
    >
      <span v-if="type === 'myTests' || type === 'myCoops'"
        >No tests found</span
      >
      <span v-else-if="type === 'answers'">No answers found</span>
      <span v-else-if="type === 'template'">No templates found</span>
    </v-row>
  </v-list>
</template>

<script>
export default {
  props: {
    tests: {
      type: Array,
      required: true,
      default: function () {
        return [];
      },
    },
    type: {
      type: String,
      required: true,
    },
  },
  data: () => ({}),
  methods: {
    generateColor() {
      let hue = Math.floor(Math.random() * 360);
      let color = "hsl(" + hue + ", 80%, 80%)";

      return color;
    },
    emitClick(test) {
      this.$emit("clicked", test);
    },
  },
  mounted() {
    let availableTypes = ["myTests", "answers", "myCoops", "template"];

    if (!availableTypes.includes(this.type)) {
      console.error(this.type + " type in ListTests.vue is not valid.");
    }
  },
};
</script>