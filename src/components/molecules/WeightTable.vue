<template>
  <v-col>
    <v-card
      v-if="heuristics.length < 2"
      class="mx-auto mt-10 mb-10 py-6 if-card" align="center"
      width="970px"
    >
      Precisa de no mínimo 2 heuristicas para poder ter colocar os pesos.
    </v-card>
    <v-card v-else class="mx-auto mt-10 mb-10 rounded-lg" width="950px">
      <!-- tabs  -->
      <template>
        <v-tabs
          v-model="tabs"
          centered
          background-color="#e35e1b"
          dark
          show-arrows
        >
          <v-tabs-slider color="#FCA326" />
          <v-tab v-for="(heuri, index) in heuristics.length - 1" :key="index">
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on"> H {{ heuri }}</span>
              </template>
              <span>{{ heuristics[index].title }}</span>
            </v-tooltip>
          </v-tab>
        </v-tabs>
        <!-- tbody  -->
        <v-tabs-items v-model="tabs">
          <v-tab-item
            v-for="(n, pes) in heuristics && heuristics.length
              ? heuristics.length - 1
              : 0"
            :key="pes"
          >
            <v-card flat>
              <v-card-text>
                <v-simple-table>
                  <template>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Heuristicas
                        </th>
                        <th class="text-center">
                          peso
                        </th>
                      </tr>
                    </thead>
                    <!-- tbody -->
                    <tbody>
                      <tr
                        v-for="(f, tam) in heuristics.length - (tabs + 1)"
                        :key="tam"
                      >
                        <td>
                          H {{ f + (tabs + 1) }}
                          <!-- tooltips -->
                          <v-tooltip right>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                color="#FCA326"
                                small
                                dark
                                v-bind="attrs"
                                v-on="on"
                              >
                                mdi-help-circle
                              </v-icon>
                            </template>
                            <span>{{ heuristics[f].title }}</span>
                          </v-tooltip>
                        </td>
                        <!-- radio-group -->
                        <td class="text-center d-flex justify-center">
                          <v-radio-group
                            v-model="group[tabs][tam]"
                            dense
                            row
                            class="justify-space-between"
                          >
                            <v-tooltip
                              v-for="(r, rad) in importance"
                              :key="rad"
                              bottom
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-radio
                                  :label="`${r}`"
                                  :value="r"
                                  active-class
                                  class="padding-left"
                                  on-icon="mdi-check-circle-outline"
                                  off-icon="mdi-checkbox-blank-circle-outline"
                                  color="#FCA326"
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>
                              <span>
                                H{{ f + (tabs + 1) }} has
                                {{ importt[r - 1] }} than H {{ tabs + 1 }}</span
                              >
                            </v-tooltip>
                          </v-radio-group>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <!-- save button -->
                <v-row align="center" justify="space-around">
                  <v-btn
                    dark
                    depressed
                    class="mt-8 mb-4"
                    large
                    align="center"
                    color="#FCA326"
                    type="submit"
                    @click="updateDatas()"
                  >
                    save
                  </v-btn>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </template>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: 'WeightTable',
  data() {
    return {
      tabs: 0,
      row: [],
      group: {},
      scores: null,
      importance: {
        'Equal Importance': 1,
        'Moderate Importance': 2,
        'Strong Importance': 3,
        'Very Strong Importance': 4,
        'Extreme Importance': 5,
        'Moderately Less Important': 6,
        'Strongly Less Important': 7,
        'Very Strongly Less Important': 8,
        'Extremely Less Important': 9,
      },
      importt: [
        'Equal Importance',
        'Moderate Importance',
        'Strong Importance',
        'Very Strong Importance',
        'Extreme Importance',
        'Moderately Less Important',
        'Strongly Less Important',
        'Very Strongly Less Important',
        'Extremely Less Important',
      ],
    }
  },
  computed: {
    testAll() {
      return this.$store.state.Tests.Test
    },
    heuristics() {
      return this.testAll.testStructure || []
    },
    heuristicaTamanho() {
      return this.heuristics.length
    },
    scoresPercentage() {
      return this.$store.state.Tests.scoresPercentage
    },
  },
  beforeMount() {
    if (!this.testAll.testWeights) {
      console.error('testWeights is undefined')
      return
    }
    const heuristicLength = this.testAll.testStructure.length
    this.group = this.testAll.testWeights

    if (Object.keys(this.testAll.testWeights).length === 0) {
      // Verifica se é um objeto vazio
      const weightMap = {}
      for (let i = 0; i < heuristicLength - 1; i++) {
        weightMap[i] = new Array(heuristicLength - (i + 1)).fill(null)
      }
      this.group = weightMap
    }
  },

  methods: {
    updateDatas() {
      this.testAll.testWeights = this.group
      this.$store.dispatch('updateTest', this.testAll)
    },
  },
}
</script>

<style scoped>
.justify-space-between {
  justify-content: space-between !important;
}
.padding-left {
  padding-left: 23px;
}

.if-card {
  border-radius: 15px;
  border: 0.2px solid #fca326;
  width: 950px;
  font-size: 18px;
}
</style>
