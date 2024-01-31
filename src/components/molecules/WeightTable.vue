<template>
  <div>
    <v-card class="mx-auto mt-10 mb-10 rounded-lg" width="900px">
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
          <v-tab-item v-for="(n, pes) in heuristics.length - 1" :key="pes">
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
                            <v-radio
                              v-for="(r, rad) in 9"
                              :key="rad"
                              :label="`${r}`"
                              :value="r"
                              active-class
                              class="padding-left"
                              on-icon="mdi-check-circle-outline"
                              off-icon="mdi-checkbox-blank-circle-outline"
                              color="#FCA326"
                            />
                          </v-radio-group>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <!-- save button -->
                <v-row align="center" justify="space-around">
                  <v-btn
                    class="mt-6 mb-4"
                    large
                    align="center"
                    color="#FCA326"
                    elevation="5"
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: 0,
      row: [],
      group: null,
    }
  },
  computed: {
    testAll() {
      return this.$store.state.Tests.Test
    },
    heuristics() {
      return this.$store.state.Tests.Test.testStructure
        ? this.$store.state.Tests.Test.testStructure
        : []
    },
    heuristicaTamanho() {
      return this.heuristics.length
    },
  },
  beforeMount() {
    const heuristicLength = this.$store.state.Tests.Test.testStructure.length

    const weightMap = {}
    if (this.testAll.testWeights = {}) {
      for (let i = 0; i < heuristicLength - 1; i++) {
        weightMap[i] = new Array(heuristicLength - (i + 1)).fill(null)
      }
      this.group = weightMap
    }
    else {
      this.group = this.testAll.testWeights
    }
    console.log(this.group)
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
</style>