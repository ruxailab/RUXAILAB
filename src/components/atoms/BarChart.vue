<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    labels: {
      default: 'Data One',
    },
    data: {},
    legend: {
      default: 'Legend',
    },
  },
  watch: {
    data() {
      this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            label: this.legend,
            backgroundColor: '#f87979',
            data: this.data,
          },
        ],
      },
      { responsive: true, maintainAspectRatio: false },
    )
    },
  },
  mounted() {
    this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            label: this.legend,
            backgroundColor: '#f87979',
            data: this.data,
          },
        ],
      },
      { responsive: true, maintainAspectRatio: false },
    )
  },
}
</script>
