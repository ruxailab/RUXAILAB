<template>
  <v-container>
    <Snackbar />
    <!-- Leave Alert Dialog -->
    <v-dialog
      v-model="dialog"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-error-accent-4 text-white"
        >
          Are you sure you want to leave?
        </v-card-title>
        <v-card-text>All your changes will be discarded</v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="closeDialog"
          >
            Stay
          </v-btn>
          <v-btn
            class="bg-error-accent-4 text-white ml-1"
            variant="text"
            @click="leave"
          >
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Save Button -->
    <v-tooltip
      v-if="accessLevel === 0"
      location="left"
    >
      <template #activator="{ props }">
        <v-btn
          size="large"
          icon
          color="#F9A826"
          :disabled="testAnswerDocLength > 0"
          v-bind="props"
          class="save-btn"
          @click="validateAll"
        >
          <v-icon
            size="large"
            :class="{ 'disabled-btn': testAnswerDocLength > 0 }"
          >
            mdi-content-save
          </v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      />
      <div class="white-text mt-3">
        Loading Test
      </div>
    </v-overlay>

    <v-row>
      <v-col
        cols="12"
        class="pb-0"
      >
        <!-- Heuristic Tests -->
        <EditHeuristicsTest
          v-if="test.testType === 'HEURISTICS'"
          type="content"
          :object="object"
          :index="index"
          @tab-clicked="setIndex"
          @change="change = true"
        >
          <template #content>
            <!-- Content slot for Heuristics Test -->
          </template>
        </EditHeuristicsTest>

        <!-- Unmoderated User Tests -->
        <EditUserTest
          v-if="test.testType === 'User' && test.userTestType === 'unmoderated'"
          type="tabs"
          @tab-clicked="setIndex"
        >
          <template #top>
            <!-- Top slot for Unmoderated User Test -->
          </template>
        </EditUserTest>
        <EditUserTest
          v-if="test.testType === 'User' && test.userTestType === 'unmoderated'"
          type="content"
          :object="object"
          :index="index"
          @val-form="validate"
        >
          <template #content>
            <!-- Content slot for Unmoderated User Test -->
          </template>
        </EditUserTest>

        <!-- Moderated User Tests -->
        <EditModeratedUserTest
          v-if="test.testType === 'User' && test.userTestType === 'moderated'"
          type="tabs"
          @tab-clicked="setIndex"
          @change="change = true"
        >
          <template #top>
            <!-- Top slot for Moderated User Test -->
          </template>
        </EditModeratedUserTest>
        <EditModeratedUserTest
          v-if="test.testType === 'User' && test.userTestType === 'moderated'"
          type="content"
          :object="object"
          :index="index"
          @change="change = true"
          @val-form="validate"
        >
          <template #content>
            <!-- Content slot for Moderated User Test -->
          </template>
        </EditModeratedUserTest>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'
import EditHeuristicsTest from '@/components/organisms/EditHeuristicsTest'
import EditUserTest from '@/components/organisms/EditUserTest'
import EditModeratedUserTest from '@/components/organisms/EditModeratedUserTest'

export default {
  name: 'EditTestView',
  components: {
    Snackbar,
    EditHeuristicsTest,
    EditUserTest,
    EditModeratedUserTest,
  },

  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialog = true
      this.go = to.path
    } else {
      next()
    }
  },

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  data: () => ({
    index: 0,
    object: {},
    valids: [true, true],
    change: false,
    dialog: false,
    go: '',
  }),

  computed: {
    accessLevel() {
      if (!this.user) return 1
      if (this.user.accessLevel === 0) return 0
      if (this.test.testAdmin?.userDocId === this.user.id) return 0
      const coopsInfo = this.test.cooperators?.find(
        (coops) => coops.userDocId === this.user.id
      )
      return coopsInfo?.accessLevel ?? 1
    },

    testAnswerDocLength() {
      return Object.keys(this.$store.getters.testAnswerDocument?.heuristicAnswers ?? {}).length
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
      return this.$store.getters.answers ?? []
    },

    totalQuestions() {
      const items = this.object?.heuristics ?? this.object?.tasks ?? []
      return items.reduce((sum, h) => sum + (h.total || 0), 0)
    },
  },

  watch: {
    test: {
      handler(newTest) {
        if (newTest) this.setIntro()
      },
      immediate: true,
    },
  },

  async created() {
    try {
      await Promise.all([
        this.$store.dispatch('getTest', { id: this.id }),
        this.$store.dispatch('getCurrentTestAnswerDoc'),
      ])
    } catch (error) {
      console.error('Failed to load test data:', error)
      // Optionally show a snackbar or redirect
    }
  },

  beforeMount() {
    window.addEventListener('beforeunload', this.preventNav)
  },

  beforeUnmount() {
    window.removeEventListener('beforeunload', this.preventNav)
  },

  methods: {
    async submit() {
      this.object.testStructure = this.$store.state.Tests.Test.testStructure
      if (this.test.testType === 'User') {
        this.object.testStructure = {
          welcomeMessage: this.$store.getters.welcomeMessage,
          landingPage: this.$store.getters.landingPage,
          participantCamera: this.$store.getters.participantCamera,
          consent: this.$store.getters.consent,
          userTasks: this.$store.getters.tasks,
          preTest: this.$store.getters.preTest,
          postTest: this.$store.getters.postTest,
          finalMessage: this.$store.getters.finalMessage,
        }
      }
      await this.$store.dispatch('updateTest', { ...this.test, ...this.object })
    },

    validate(valid, index) {
      this.valids[index] = valid
    },

    async validateAll() {
      await this.submit()
      this.change = false
    },

    preventNav(event) {
      if (this.change) {
        event.preventDefault()
        event.returnValue = ''
      }
    },

    async setIntro() {
      this.object = { ...this.test }
    },

    setIndex(ind) {
      this.index = ind
    },

    closeDialog() {
      this.dialog = false
      this.go = ''
    },

    leave() {
      this.change = false
      this.$router.push(this.go)
    },
  },
}
</script>

<style scoped>
.save-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}
.save-btn.disabled-btn,
.disabled-btn {
  color: rgba(134, 125, 125, 0.438) !important;
}
.save-btn.disabled-btn {
  background-color: rgba(185, 185, 185, 0.308) !important;
}
</style>