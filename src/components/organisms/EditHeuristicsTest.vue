<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">Heuristics</v-tab>
    <v-tab @click="tabClicked(1)">Options</v-tab>
  </v-tabs>

  <div v-else-if="type == 'content'">
    <Heuristic
      v-if="index == 0"
      :heuristics="object.heuristics"
      @change="emitChange()"
    />

    <OptionsTable
      v-if="index == 1"
      :options="object.options"
      @change="emitChange()"
    />
  </div>
</template>

<script>
import Heuristic from "@/components/molecules/HeuristicsTable";
import OptionsTable from "@/components/molecules/OptionsTable";

export default {
  components: {
    Heuristic,
    OptionsTable,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
    },
    object: {
      type: Object,
    },
  },
  data: () => ({}),
  methods: {
    tabClicked(index) {
      this.$emit("tabClicked", index);
    },
    emitChange() {
      this.$emit("change");
    },
  },
  mounted() {
    if (this.type !== "content" && this.type != "tabs")
      console.error(this.type + " type in EditHeuristicTest.vue is not valid.");
  },
};
</script>