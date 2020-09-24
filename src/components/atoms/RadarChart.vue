<script>
import { Radar } from "vue-chartjs";

export default {
  props: {
    labels: {
      type: Array,
      required:true,
      default: function() {
        return [];
      }
    },
    data: {
      type:Array,
      required:true,
       default: function() {
        return [];
      }
    }
  },
  extends: Radar,
  watch: {
    data() {
      this.$data._chart.update();
    }
  },
  mounted() {
    this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            label: "Usability Percentage",
            backgroundColor: "rgba(39, 71, 196,0.2)",
            borderColor: "rgba(39, 71, 196,1)",
            pointBackgroundColor: "rgba(39, 71, 196,1)",
            data: this.data
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scale: {
          ticks: {
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    );
  }
};
</script>
