<template>
  <div>
    <v-tabs
      bg-color="transparent"
      color="#FCA326"
      class="pb-0 mb-0 responsive-tabs"
    >
      <v-tab
        class="tab-content"
        @click="tabClicked(0)"
      >
        {{ $t('HeuristicsEditTest.titles.heuristics') }}
        <v-icon
          v-if="index === 0"
          class="tab-icon"
        >
          mdi-chevron-down
        </v-icon>
      </v-tab>

      <v-tab
        class="tab-content"
        @click="tabClicked(1)"
      >
        {{ $t('HeuristicsEditTest.titles.options') }}
        <v-icon
          v-if="index === 1"
          class="tab-icon"
        >
          mdi-chevron-down
        </v-icon>
      </v-tab>

      <v-tab
        class="tab-content"
        @click="tabClicked(2)"
      >
        {{ $t('HeuristicsEditTest.titles.weights') }}
        <v-icon
          v-if="index === 2"
          class="tab-icon"
        >
          mdi-chevron-down
        </v-icon>
      </v-tab>

      <v-tab
        class="tab-content"
        @click="tabClicked(3)"
      >
        {{ $t('HeuristicsEditTest.titles.settings') }}
        <v-icon
          v-if="index === 3"
          class="tab-icon"
        >
          mdi-chevron-down
        </v-icon>
      </v-tab>
    </v-tabs>

    <div class="mt-responsive">
      <Heuristic
        v-if="index == 0"
        :heuristics="object.heuristics"
        @change="change"
      />
      <OptionsTable
        v-if="index == 1"
        :options="object.options"
      />
      <WeightTable
        v-if="index == 2"
        :options="object.weight"
      />
      <Settings
        v-if="index == 3"
        :options="object.settings"
      />
    </div>
  </div>
</template>

<script>
import Heuristic from '@/components/molecules/HeuristicsTable'
import OptionsTable from '@/components/molecules/OptionsTable'
import Settings from '@/components/molecules/HeuristicsSenttings.vue'
import WeightTable from '@/components/molecules/WeightTable.vue'

export default {
  components: {
    Heuristic,
    OptionsTable,
    Settings,
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
    index: {
      type: Number,
      default: 0,
    },
  },
  emits: ['tabClicked', 'change'],
  computed: {
    currentTest() {
      return this.$store.state.Tests.Test.testStructure
    },
  },
  methods: {
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
    change(){
      this.$emit('change')
    }
  },
  
}
</script>

<style scoped>
/* Mobile-responsive styles */
@media (max-width: 960px) {

  .responsive-tabs {
    margin-top: 16px;
    padding: 6px;
    height: auto;
    border: 1px solid #9e9e9e; 
    border-radius: 4px;
  }
  
  .responsive-tabs >>> .v-tabs-slider {
    display: none;
  }

  .responsive-tabs >>> .v-tabs-bar {
    height: auto;
    flex-direction: column;
  }

  .responsive-tabs >>> .v-tabs-bar__content {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .responsive-tabs >>> .v-tab {
    min-width: 100%;
    justify-content: space-between;
    padding-left: 0;
    text-align: left;
    font-size: 16px;
  }

  .tab-content {
    display: flex;
    justify-content: space-between; 
    width: 100%;
  }

  .tab-icon {
    width: 20px; 
    height: 20px;
    display: block;
  }

  .responsive-tabs >>> .v-slide-group__wrapper {
    overflow: visible;
  }

  .mt-responsive {
  margin-top: 16px;
  }
}

/* Desktop-responsive styles */
@media (min-width: 960px) {
    .tab-icon {
      display: none; /* Hide icon on larger screens */
    }
  }
</style>
