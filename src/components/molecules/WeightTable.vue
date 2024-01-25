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
            <v-tooltip v-model="show" top>
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
                    @click="atualizarDados(), addWeights()"
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
    {{ tam }}
    <!--{{ this.$store.state.Tests.Test.testStructure }} -->
    {{ batata }}
    <!-- {{ heuristics.length }} -->
    {{ tabs }}
    <!-- {{ per_cada_h }} -->
  </div>
</template>
  <script>
//   import { doc, getDoc,  } from "firebase/firestore";
//   import { db } from "@/firebase/index";

export default {
  data() {
    return {
      fbF: {
        hheuristc: [
          {
            element: [
              { title: 'h2', peso: 1 },
              { peso: 1, title: 'h3' },
              { peso: 1, title: 'h4' },
              { title: 'h5', peso: 1 },
              { peso: 1, title: 'h6' },
              { title: 'h7', peso: 1 },
              { peso: 1, title: 'h8' },
            ],
          },
          {
            element: [
              { peso: 1, title: 'h3' },
              { title: 'h4', peso: 1 },
              { title: 'h5', peso: 1 },
              { title: 'h6', peso: 1 },
              { title: 'h7', peso: 1 },
              { peso: 1, title: 'h8' },
            ],
          },
          {
            element: [
              { title: 'h4', peso: 1 },
              { title: 'h5', peso: 1 },
              { peso: 1, title: 'h6' },
              { title: 'h7', peso: 1 },
              { peso: 1, title: 'h8' },
            ],
          },
          {
            element: [
              { title: 'h5', peso: 1 },
              { peso: 1, title: 'h6' },
              { peso: 1, title: 'h7' },
              { title: 'h8', peso: 1 },
            ],
          },
          {
            element: [
              { peso: 1, title: 'h6' },
              { peso: 1, title: 'h7' },
              { title: 'h8', peso: 1 },
            ],
          },
          {
            element: [
              { peso: 1, title: 'h7' },
              { title: 'h8', peso: 1 },
            ],
          },
          { element: [{ title: 'h8', peso: 1 }] },
        ],
      },
      tabs: null,
      peso: null,
      row: [],
      comparisonSelect: null,
      per_cada_header: null,
      batata: new Array(8).fill(null).map(() => new Array(5).fill(null)),
    }
  },
  computed: {
    heuristics() {
      return this.$store.state.Tests.Test.testStructure
        ? this.$store.state.Tests.Test.testStructure
        : []
    },
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
      this.batata = ['d', 'e']
      localStorage.setItem('heuristicsData', JSON.stringify(this.fbF)) //converte o objeto this.fbF em string no localStorange com o nome 'heuristicsData'
      console.log('Dados atualizados localmente!')
    },
    addWeights() {
      // this.per_cada_h = Array.from( { length: this.heuristics.length } )
      // console.log(this.per_cada_h)
      // for (let i = 0; i < this.heuristics.length; i++) {
      //   this.heuristics[this.tabs].comparision = [
      //   ]
      // }
      // for (let i = 0; i < this.heuristics.length; i++) {
      //   this.heuristics[this.tabs].comparision = [];
      //   let Hmap = this.heuristics.length
      //   for (let index = 0; index < this.heuristics.length; index++) {
      //     this.heuristics[index].comparision[Hmap] = [
      //       {
      //         peso: 1,
      //         title: 'abacate',
      //       },
      //     ]
      //     Hmap--
      //   }
      // }
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