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
                        <!-- batata[tabs][tam] -->
                        <td class="text-center d-flex justify-center">
                          <v-radio-group
                            v-model="batata[tabs][tam]"
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
                <v-row align="center" justify="space-around">
                  <v-btn
                    class="mt-6 mb-4"
                    large
                    align="center"
                    color="#FCA326"
                    elevation="5"
                    type="submit"
                    @click="atualizarDados()"
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
    <!-- {{ heuristicaTamanho }} -->
    <!--{{ this.$store.state.Tests.Test.testStructure }} -->
    <!-- {{ batata }} -->
    <!-- {{ heuristics.length }} -->
    <!-- {{ tabs }} -->
    {{ testAll.testWeights }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: 0,
      peso: null,
      row: [],
      batata: null,
    }
  },
  computed: {
    testAll() {
      return this.$store.state.Tests.Test
    },
    // heuristicsWeights() {},
    heuristics() {
      return this.$store.state.Tests.Test.testStructure
        ? this.$store.state.Tests.Test.testStructure
        : []
    },
    heuristicaTamanho() {
      console.log(this.heuristics.length)
      return this.heuristics.length
    },
  },
  beforeMount() {
    const heuristicLength = this.$store.state.Tests.Test.testStructure.length
    // console.log(heuristicLength)
    // console.log(this.$store.state.Tests.Test.testStructure)
    // //
    // const emptyHeuristicaArray = Array.from(
    //   { length: heuristicLength - 1 },
    //   (_, index) => new Array(heuristicLength - (index + 1)).fill(null))
    //   //
    // const emptyHeuristicaArrayMap = [...Array(heuristicLength - 1)].map(
    //   (_, index) => [...Array(heuristicLength - (index + 1))].map(() => null))
    //
    //
    // console.log(this.batata.length)
    // console.log(emptyHeuristicaArray)
    // console.log(emptyHeuristicaArrayMap)
    //
    console.log(this.$store.state.Tests.Test.testWeight)
    const meuMap = {}

    if (this.testAll.testWeights) {
      this.batata = this.testAll.testWeights
       }
    else {
      for (let i = 0; i < heuristicLength - 1; i++) {
        meuMap[i] = new Array(heuristicLength - (i + 1)).fill(null)
      }
      this.batata = meuMap
      }
    


    console.log(this.batata)
    console.log(meuMap)
    //
  },
  mounted() {
    // Carregar os dados salvos do localStorage ao renderizar a página
    const savedData = localStorage.getItem('heuristicsData') //salva a localStorage em uma constante
    if (savedData) {
      //se houver
      this.fbF = JSON.parse(savedData) //converte a string JSON de volta em objeto
      console.log('Dados carregados do localStorage!')
    }
  },
  methods: {
    // Salva os dados localmente
    atualizarDados() {
      this.testAll.testWeights = this.batata
      this.$store.dispatch('updateTest', this.testAll)
      localStorage.setItem('heuristicsData', JSON.stringify(this.fbF)) //converte o objeto this.fbF em string no localStorange com o nome 'heuristicsData'
      console.log('Dados atualizados localmente!')
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