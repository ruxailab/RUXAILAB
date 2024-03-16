<template>
  <div>
    <v-tabs background-color="transparent" color="#FCA326" class="pb-0 mb-0">
      <v-tab @click="tabClicked(0)">
        Heuristics
      </v-tab>
      <v-tab @click="tabClicked(1)">
        Options
      </v-tab>
      <v-tab @click="tabClicked(2)">
        Import .csv
      </v-tab>
      <v-tab @click="tabClicked(3)">
        Weights
      </v-tab>
    </v-tabs>

    <div>
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
      <ImportCsvTable
        v-if="index == 2"
        :options="object.importCsv"
        @change="emitChange()"
      />
      <WeightTable
        v-if="index == 3"
        :options="object.weight"
        @change="emitChange()"
      />
    </div>
  </div>
</template>

<script>
import Heuristic from '@/components/molecules/HeuristicsTable'
import OptionsTable from '@/components/molecules/OptionsTable'
import ImportCsvTable from '@/components/molecules/ImportCsvTable'
import WeightTable from '@/components/molecules/WeightTable.vue'

export default {
  components: {
    Heuristic,
    OptionsTable,
    ImportCsvTable,
    WeightTable,
  },
  props: {
    type: {
      type: String,
      required: true,
    },

    object: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    index: 0,
  }),
  computed: {
    currentTest() {
      return this.$store.state.Tests.Test.testStructure
    },
  },
  methods: {
    tabClicked(index) {
      this.index = index
      this.$emit('tabClicked', index)
    },
    emitChange() {
      this.$emit('change')
    },
  },
}
</script>
