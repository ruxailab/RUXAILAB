<script>
import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  mixins: [mixins.reactiveData],
  data() {
    return {
      chartData: {
        labels: ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"],
        datasets: [{
          label: 'Valores ao longo do tempo',
          data: [10, 20, 15, 25, 18],
          borderColor: 'orange',
          borderWidth: 1,
          fill: false,
        }],
      },
      chartOptions: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            title: {
              display: true,
              text: 'Datas',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Valores',
            },
          },
        },
        maintainAspectRatio: false, // Permite ajustar o tamanho do gráfico manualmente
        responsive: true,
      },
    };
  },
  mounted() {
    this.renderChart(this.chartData, this.chartOptions);
  },
};
</script>

<style scoped>
/* Adicione estilos específicos do componente aqui se necessário */
</style>
