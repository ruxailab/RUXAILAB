<script>
import { Bar } from "vue-chartjs";

export default {
  extends: Bar,
  props:['data'],
  mounted() {
    this.renderChart(
      {
        labels: [
          "Sí / Yes",
          "Ni Sí, ni No / Neither",
          "No",
          "No aplica-No es problema / Not applicable-It is not a problem",
          "Not answered"
        ],
        datasets: [
          {
            label: "Quantity answers",
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
