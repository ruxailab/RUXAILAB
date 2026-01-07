<template>
  <v-card class="pa-6 elevation-3 rounded-xl chart-card h-100">
    <div class="d-flex justify-space-between align-center mb-4">
      <h4 class="font-weight-bold text-truncate ma-0" :title="questionTitle">
        {{ questionTitle }}
      </h4>
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            v-bind="props"
          />
        </template>
        <v-list density="compact">
          <v-list-item @click="downloadChart" link>
            <template v-slot:prepend>
              <v-icon icon="mdi-download" size="small" class="mr-2" />
            </template>
            <v-list-item-title>Export as PNG</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    
    <div class="d-flex flex-column flex-md-row align-center justify-center chart-wrapper">
      <!-- Chart Container -->
      <div class="chart-container mb-4 mb-md-0 mr-md-4">
        <canvas :id="canvasId"></canvas>
      </div>

      <!-- Custom Legend -->
      <div class="legend-container flex-grow-1">
        <div v-for="(item, idx) in legendItems" :key="item.label" class="d-flex align-center mb-2 legend-item">
          <div :style="{ background: item.color, minWidth: '12px', height: '12px', borderRadius: '50%', marginRight: '8px' }"></div>
          <div class="text-body-2 lh-1">
            <span class="font-weight-medium text-grey-800">{{ item.label }}</span>
            <span class="text-grey-600 ml-1">({{ item.count }} - {{ item.percentage }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { onMounted, watch, onUnmounted, ref, computed } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  questionTitle: String,
  options: Array,
  counts: Object,
  canvasId: String,
  chartColors: {
    type: Array,
    default: () => ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#FF7043', '#26A69A', '#D4E157']
  }
});

let chartInstance = null;
const legendItems = ref([]);

// Compute chart data for Chart.js
const chartData = computed(() => {
  const dataValues = props.options.map(opt => props.counts[opt] || 0);
  return {
    labels: props.options,
    datasets: [{
      data: dataValues,
      backgroundColor: props.chartColors,
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

// Compute legend items with percentages for display
const updateLegend = () => {
  const total = Object.values(props.counts).reduce((a, b) => a + b, 0);
  legendItems.value = props.options.map((opt, idx) => {
    const count = props.counts[opt] || 0;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    return {
      label: opt,
      count,
      percentage,
      color: props.chartColors[idx % props.chartColors.length]
    };
  });
};


const downloadChart = () => {
  const canvas = document.getElementById(props.canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `${props.questionTitle || 'chart'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const renderChart = () => {
  const canvas = document.getElementById(props.canvasId);
  if (!canvas) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Hide default canvas legend
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.chart._metasets[context.datasetIndex].total;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              return `${label}: ${value} (${percentage})`;
            }
          }
        }
      },
      cutout: '60%', // Donut thickness
    }
  });
};

watch(() => [props.options, props.counts], () => {
  updateLegend();
  renderChart();
}, { deep: true });

onMounted(() => {
  updateLegend();
  renderChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}

.chart-wrapper {
  width: 100%;
}

.chart-container {
  height: 180px;
  width: 180px;
  position: relative;
  flex-shrink: 0;
}

.legend-container {
  max-height: 180px;
  overflow-y: auto;
  width: 100%;
}

.lh-1 {
  line-height: 1.2;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .chart-container {
    height: 160px;
    width: 160px;
  }
}

@media (max-width: 600px) {
  .chart-wrapper {
    flex-direction: column !important;
  }
  
  .chart-container {
    margin-right: 0 !important;
    margin-bottom: 24px !important;
  }
  
  .legend-container {
    width: 100%;
  }
}
</style>
