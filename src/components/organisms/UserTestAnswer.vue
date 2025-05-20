<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <IntroAnswer v-if="intro" @goToCoops="goToCoops" />
    <v-row v-else-if="hasAnswers" justify="center" class="ma-0 mt-4">
      <ShowInfo title="Answers">
        <v-card class="ma-4 pa-4">
          <!-- Summary Statistics Row -->
          <v-row class="mb-4">
            <v-col cols="12" sm="6" md="3">
              <v-card outlined>
                <v-card-title class="subtitle-1">Total Participants</v-card-title>
                <v-card-text class="text-h5">{{ answers.length }}</v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card outlined>
                <v-card-title class="subtitle-1">Completed</v-card-title>
                <v-card-text class="text-h5">
                  {{ completedCount }} ({{ completionRate }}%)
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card outlined>
                <v-card-title class="subtitle-1">Avg Time</v-card-title>
                <v-card-text class="text-h5">{{ averageTime }}s</v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card outlined>
                <v-card-title class="subtitle-1">With Observations</v-card-title>
                <v-card-text class="text-h5">{{ observationCount }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Search and Filters -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                label="Search by user name or status"
                prepend-icon="mdi-magnify"
                solo
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                label="Filter by status"
                multiple
                chips
                clearable
              />
            </v-col>
          </v-row>

          <!-- Data Table -->
          <v-data-table
            :headers="headers"
            :items="filteredAnswers"
            :search="search"
            :items-per-page="10"
            class="elevation-1 mt-4"
            dense
          >
            <template v-slot:item.time="{ item }">
              <span :class="getTimeClass(item.time)">
                {{ formatTime(item.time) }}
              </span>
            </template>
            <template v-slot:item.completed="{ item }">
              <v-chip :color="item.completed ? 'green' : 'red'" dark small>
                {{ item.completed ? 'Completed' : 'Incomplete' }}
                <v-icon right small>
                  {{ item.completed ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </v-chip>
            </template>
            <template v-slot:item.answered="{ item }">
              <v-chip :color="item.answered ? 'blue' : 'grey'" dark small>
                {{ item.answered ? 'Answered' : 'No Answer' }}
              </v-chip>
            </template>
            <template v-slot:item.observation="{ item }">
              <v-chip :color="item.observation ? 'purple' : 'grey'" dark small>
                {{ item.observation ? 'Has Note' : 'No Note' }}
                <v-icon right small v-if="item.observation">
                  mdi-note-text
                </v-icon>
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                small
                color="primary"
                @click="viewDetails(item)"
                v-if="item.observation || item.answer"
              >
                Details
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </ShowInfo>
    </v-row>
    <div v-else>
      <IntroAnswer />
    </div>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo'
import IntroAnswer from '@/components/molecules/IntroAnswer'

export default {
  components: {
    ShowInfo,
    IntroAnswer,
  },
  data: () => ({
    intro: null,
    search: '',
    statusFilter: [],
    statusOptions: [
      { text: 'Completed', value: 'completed' },
      { text: 'Incomplete', value: 'incomplete' },
      { text: 'Answered', value: 'answered' },
      { text: 'Has Observation', value: 'observation' },
    ],
    headers: [
      { text: 'User', value: 'user', width: '20%' },
      { text: 'Time (seconds)', value: 'time', align: 'center', width: '15%' },
      { text: 'Status', value: 'completed', align: 'center', width: '15%' },
      { text: 'Answer', value: 'answered', align: 'center', width: '15%' },
      { text: 'Observation', value: 'observation', align: 'center', width: '15%' },
      { text: 'Actions', value: 'actions', align: 'center', sortable: false, width: '20%' },
    ],
  }),
  computed: {
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
    answers() {
      const data = this.testAnswerDocument?.taskAnswers || {}
      return Object.entries(data).map(([user, result]) => {
        return {
          user,
          time: result.time || 0,
          completed: result.completed || false,
          answered: !!result.answer,
          observation: !!result.observation,
          rawData: result // Store the full result for details view
        }
      })
    },
    filteredAnswers() {
      let filtered = this.answers
      
      // Apply search filter
      if (this.search) {
        const query = this.search.toLowerCase()
        filtered = filtered.filter(a =>
          a.user.toLowerCase().includes(query) ||
          String(a.completed).toLowerCase().includes(query) ||
          String(a.answered).toLowerCase().includes(query) ||
          String(a.observation).toLowerCase().includes(query)
      }
      
      // Apply status filters
      if (this.statusFilter.length > 0) {
        filtered = filtered.filter(a => {
          return this.statusFilter.some(filter => {
            switch(filter) {
              case 'completed': return a.completed
              case 'incomplete': return !a.completed
              case 'answered': return a.answered
              case 'observation': return a.observation
              default: return true
            }
          })
        })
      }
      
      return filtered
    },
    hasAnswers() {
      return this.answers.length > 0
    },
    loading() {
      return this.$store.getters.loading
    },
    completedCount() {
      return this.answers.filter(a => a.completed).length
    },
    completionRate() {
      return this.answers.length > 0 
        ? Math.round((this.completedCount / this.answers.length) * 100)
        : 0
    },
    averageTime() {
      const completed = this.answers.filter(a => a.completed)
      return completed.length > 0
        ? Math.round(completed.reduce((sum, a) => sum + a.time, 0) / completed.length)
        : 0
    },
    observationCount() {
      return this.answers.filter(a => a.observation).length
    }
  },
  methods: {
    goToCoops() {
      this.$emit('goToCoops')
    },
    formatTime(seconds) {
      return seconds.toFixed(1)
    },
    getTimeClass(time) {
      if (time < 30) return 'fast-time'
      if (time > 120) return 'slow-time'
      return 'normal-time'
    },
    viewDetails(item) {
      // Implement your detail view logic here
      console.log('View details for:', item)
      // You might want to show a dialog with:
      // - The full answer text
      // - The observation text
      // - Any other relevant details
    }
  },
  async created() {
    await this.$store.dispatch('getCurrentTestAnswerDoc')
  }
}
</script>

<style scoped>
.fast-time {
  color: #4CAF50;
  font-weight: bold;
}
.normal-time {
  color: #2196F3;
}
.slow-time {
  color: #F44336;
  font-weight: bold;
}
.v-chip {
  min-width: 100px;
  justify-content: center;
}
</style>
