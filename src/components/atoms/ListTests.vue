<template>
  <v-list class="py-0">
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
              >{{ test.date ? "Last Updated on " : "-" }}{{ test.date }}</span
            >
          </v-list-item-title>
          <v-list-item-subtitle class="hidden-md-and-up"
            >{{ test.author ? "Created by " : "" }}{{ test.author
            }}{{ test.date && test.author ? " on " : ""
            }}{{ test.date && !test.author ? "Last updated on " : ""
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
  </v-list>
</template>

<script>
export default {
  props: {
    tests: {
      type: Array,
      required: true,
      default: function() {
        return [];
      }
    }
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
    }
  }
};
</script>