<template>
  <div>
    <Snackbar />

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title
          >Are you sure you want to delete this report?</v-card-title
        >

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="grey lighten-3" text @click="dialog = false"
            >Cancel</v-btn
          >
          <v-btn
            class="red white--text ml-1"
            :loading="loadingBtn"
            text
            @click="removeReport(report), (loadingBtn = true)"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay class="text-center" v-model="loading">
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      ></v-progress-circular>
      <div class="white-text mt-3">Loading Reports</div>
    </v-overlay>

    <Intro v-if="reports.length == 0 && !loading" @goToCoops="goToCoops()" />
    <ShowInfo title="Reports" v-else>
      <v-row justify="end" dense slot="top" class="mr-3">
        <p class="subtitleView">
          Last Updated: {{ new Date().toLocaleString('en') }}
        </p>
      </v-row>

      <div slot="content" class="ma-0 pa-0">
        <v-data-table
          style="background: #f5f7ff"
          :headers="headers"
          :items="reports"
          :items-per-page="10"
          height="420px"
          dense
        >
          <template v-slot:item.more="{ item }">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click=";(dialog = true), (report = item)">
                  <v-list-item-title>Remove Report</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template v-slot:item.progress="{ item }">
            <div>{{ item.progress }}</div>
          </template>
          <template v-slot:item.submitted="{ item }">
            <div>{{ checkIfIsSubmitted(item.submitted) }}</div>
          </template>
          <template v-slot:item.lastUpdate="{ item }">
            <div>{{ formatDate(item.lastUpdate) }}</div>
          </template>
        </v-data-table>
      </div>
    </ShowInfo>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo'
import Intro from '@/components/molecules/IntroReports'
import Snackbar from '@/components/atoms/Snackbar'
export default {
  props: ['id'],
  components: {
    ShowInfo,
    Intro,
    Snackbar,
  },
  data: () => ({
    headers: [
      { text: 'Evaluator', value: 'userDocId' },
      { text: 'Last Update', value: 'lastUpdate' },
      { text: 'Progress', value: 'progress', justify: 'center' },
      { text: 'Status', value: 'submitted' },
      { text: 'More', value: 'more', justify: 'end' },
    ],
    loading: true,
    dialog: false,
    loadingBtn: false,
    report: null,
  }),
  methods: {
    checkIfIsSubmitted(status) {
      return status == true ? 'submitted' : 'in progress'
    },
    removeReport(report) {
      this.$store
        .dispatch('removeReport', {
          docId: this.id,
          element: {
            id: report.uid,
          },
          param: 'reports',
        })
        .then(() => {
          //remove from answers
          if (report.log.status == 'Submitted')
            this.$store.dispatch('removeUserAnswer', {
              docId: this.answers.id,
              element: Object.assign({}, { id: report.uid }),
            })
          this.$store.commit('setSuccess', 'Report successfully deleted')
          this.loadingBtn = false
          this.dialog = false
        })
        .catch((err) => {
          this.$store.commit('setError', err)
        })
    },
    formatDate(timestamp) {
      console.log(timestamp)
      const currentDate = new Date()
      const startDate = new Date(timestamp)

      const yearDiff = currentDate.getFullYear() - startDate.getFullYear()
      const monthDiff = currentDate.getMonth() - startDate.getMonth()
      const dayDiff = currentDate.getDate() - startDate.getDate()
      const hourDiff = currentDate.getHours() - startDate.getHours()
      const minuteDiff = currentDate.getMinutes() - startDate.getMinutes()

      if (yearDiff > 0) {
        return `${yearDiff} year${yearDiff !== 1 ? 's' : ''} ago`
      } else if (monthDiff > 0) {
        return `${monthDiff} month${monthDiff !== 1 ? 's' : ''} ago`
      } else if (dayDiff > 0) {
        return `${dayDiff} day${dayDiff !== 1 ? 's' : ''} ago`
      } else if (hourDiff > 0) {
        return `${hourDiff} hour${hourDiff !== 1 ? 's' : ''} ago`
      } else if (minuteDiff > 0) {
        return `${minuteDiff} minute${minuteDiff !== 1 ? 's' : ''} ago`
      } else {
        return 'Now'
      }
    },
    goToCoops() {
      this.$emit('goToCoops')
    },
  },
  computed: {
    reports() {
      const rawReports = this.$store.getters.testAnswerDocument.heuristicAnswers
      const processedReports = []

      for (const userId in rawReports) {
        const report = rawReports[userId]
        const processedReport = {
          userDocId: report.userDocId,
          total: report.total,
          submitted: this.checkIfIsSubmitted(report.submitted),
          progress: parseFloat(report.progress).toFixed(2) + '%',
          lastUpdate: report.lastUpdate,
        }

        processedReports.push(processedReport)
      }

      return processedReports
    },
    test() {
      return this.$store.getters.test
    },
    dialogText() {
      return (
        'Are you sure you want to delete ' +
        (this.report !== null ? this.report.email : '') +
        `'s report? This action can't be undone`
      )
    },
    answers() {
      return this.$store.getters.answers || {}
    },
  },
  watch: {
    reports() {
      if (Object.values(this.reports).length) this.loading = false
    },
  },
  async created() {
    console.log(this.reports)
    await this.$store.dispatch('getCurrentTestAnswerDoc')
  },
}
</script>

<style scoped>
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
</style>
