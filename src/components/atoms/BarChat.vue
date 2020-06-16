<script>
import { Bar } from "vue-chartjs";

export default {
  props:['labels','data'],
  extends: Bar,
  mounted() {
    this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: this.data
          }
        ]
      },
      { responsive: true, maintainAspectRatio: false }
    );
  }
};
</script>
