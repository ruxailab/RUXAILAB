<template>
  <v-container>
    <Snackbar />
    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error accent-4 white--text" primary-title>
          Are you sure you want to leave?
        </v-card-title>

        <v-card-text>All your changes will be discarded</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialog = false">
            Stay
          </v-btn>
          <v-btn
            class="error accent-4 white--text ml-1"
            text
            @click=";(change = false), $router.push(go)"
          >
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Save button -->
    <v-tooltip v-if="accessLevel === 0" left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          large
          dark
          fab
          fixed
          bottom
          right
          color="#F9A826"
          v-bind="attrs"
          style="z-index:100"
          @click="validateAll()"
          v-on="on"
        >
          <v-icon large>
            mdi-content-save
          </v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>

    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Loading Test
      </div>
    </v-overlay>

    <!--
        <IntroEdit v-if="test && intro == true" @closeIntro="intro = false" />
          <IntroEdit v-if="test.testStructure" @closeIntro="intro = false" />  -->

    <!--
        <ShowInfo v-if="test" title="Test Edit">  -->
    <!-- Heuristics tests -->
    <!--TODO: change hard coded type
            <EditHeuristicsTest
                v-if="test.testType == "HEURISTICS""
                type="tabs"
                @tabClicked="setIndex"
                slot="top"
            />
        -->
    <v-row>
      <v-col cols="12">
        <EditHeuristicsTest
          v-if="test.testType === 'HEURISTICS'"
          slot="content"
          type="content"
          :object="object"
          :index="index"
          @change="change = true"
        />
      </v-col>
      <!-- User tests -->

      <EditUserTest
        v-if="test.testType === 'User'"
        slot="top"
        type="tabs"
        @tabClicked="setIndex"
      />

      <EditUserTest
        v-if="test.testType === 'User'"
        slot="content"
        :object="object"
        :index="index"
        type="content"
        @change="change = true"
        @valForm="validate"
      />

      <!-- </ShowInfo>  -->
    </v-row>
  </v-container>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'
//import ShowInfo from "@/components/organisms/ShowInfo";
//import IntroEdit from "@/components/molecules/IntroEdit.vue";
import EditHeuristicsTest from '@/components/organisms/EditHeuristicsTest'

import EditUserTest from '@/components/organisms/EditUserTest'

export default {
  components: {
    Snackbar,
    //ShowInfo,
    // IntroEdit,
    EditHeuristicsTest,
    EditUserTest,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['id'],
  data: () => ({
    index: 0,
    object: {},
    valids: [true, true],
    change: false,
    dialog: false,
    intro: false,
  }),
  computed: {
    accessLevel() {
      // If user is superadmin
      if (this.user) {
        if (this.user.accessLevel == 0) return 0
        // Check if user is collaborator or owner
        const isTestOwner = this.test.testAdmin.userDocId === this.user.id
        console.log(isTestOwner)
        if (isTestOwner) return 0

        const answers = []
        const answersEntries = this.object.entries(this.user.myAnswers)
        answersEntries.forEach((a) => {
          answers.push(a[1])
        })

        const isCooperator = answers.find((a) => a.testDocId === this.test.id)
        if (isCooperator) {
          return isCooperator.accessLevel
        }
      }

      return 3
    },
    loading() {
      return this.$store.getters.loading
    },
    user() {
      return this.$store.getters.user
    },
    test() {
      return this.$store.getters.test
    },
    answers() {
      return this.$store.getters.answers || []
    },
    totalQuestions() {
      let result = 0
      if (this.object?.heuristics) {
        this.object?.heuristics.forEach((h) => {
          result += h.total
        })
      } else if (this.object?.tasks) {
        this.object?.tasks.forEach((h) => {
          result += h.total
        })
      }

      return result
    },
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.setIntro()
      }
    },
  },
  async created() {
    await this.$store.dispatch('getTest', { id: this.id })
  },
  beforeMount() {
    window.addEventListener('beforeunload', this.preventNav)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.preventNav)
  },
  methods: {
    async submit() {
      this.object.testStructure = this.$store.state.Tests.Test.testStructure

      let auxT = Object.assign(this.test, this.object)
      // const auxT = Test.toTest(this.object)
      // console.log(auxT)
      this.$store.dispatch('updateTest', auxT)
    },

    mountAnswerSheet() {
      const aux = {
        heuristics: [],
        tasks: [],
        progress: 0,
        total: this.totalQuestions,
      }

      if (this.object?.heuristics) {
        this.object.heuristics.forEach((heuris) => {
          const questions = Array.from(heuris.questions)
          const arrayQuestions = []

          questions.forEach((el) => {
            arrayQuestions.push(
              Object.assign({}, { id: el.id, res: '', com: '', imgUrl: '' }),
            )
          })

          aux.heuristics.push(
            Object.assign(
              {},
              {
                id: heuris.id,
                total: heuris.total,
                questions: arrayQuestions,
              },
            ),
          )
        })

        delete aux.tasks
      } else if (this.object?.tasks) {
        aux.tasks = [...this.object.tasks]
        delete aux.heuristics
      }

      return aux
    },
    validate(valid, index) {
      this.valids[index] = valid
    },
    validateAll() {
      if (this.test.type === 'User' && !this.valids[0]) {
        this.$store.commit(
          'setError',
          'Please fill all fields in Pre Test correctly or leave them empty',
        )
      } else if (
        this.test.type === 'HEURISTICS' &&
        this.object.options.length == 1
      ) {
        this.$store.commit(
          'setError',
          'Please create at least 2 options or none at all',
        )
      } else if (this.test.type === 'User' && !this.valids[1]) {
        this.$store.commit(
          'setError',
          'Please fill all fields in Post Test correctly or leave them empty',
        )
      } else {
        console.log('saved')
        this.submit()
      }
    },
    preventNav(event) {
      if (!this.change) return
      event.preventDefault()
      event.returnValue = ''
    },
    async setIntro() {
      console.log('Set Intro')
      this.object = await Object.assign(this.object, this.test)
    },
    setIndex(ind) {
      this.index = ind
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialog = true
      this.go = to.path
    } else {
      next()
    }
  },
}
</script>
