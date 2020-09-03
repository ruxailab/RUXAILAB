<template>
  <v-list class="py-0">
    <div v-for="(test, n) in tests" :key="n">
      <v-list-item link :ripple="false">
        <v-list-item-avatar tile style="border-radius: 5px" size="40">
          <v-avatar tile :color="generateColor()" style="color: #545454">{{test.title[0]}}</v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            {{test.title}}
            <v-chip outlined style="color: grey" small class="ml-1">{{test.type}}</v-chip>
            <span
              style="position: absolute; right: 5px;"
              class="caption hidden-sm-and-down"
            >Created {{test.date}}</span>
          </v-list-item-title>
          <v-list-item-subtitle class="hidden-md-and-up">Created {{test.date}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider v-if="n !== tests.length - 1"></v-divider>
    </div>
  </v-list>
</template>

<script>
export default {
  props: ["tests"],
  data: () => ({}),
  methods: {
    generateColor() {
      let hue = Math.floor(Math.random() * 360);
      let color = "hsl(" + hue + ", 80%, 80%)";

      return color;
    },
  },
};
</script>