<template>
  <div>
    <!-- Vista de analíticas para metodología heurística -->
    <AnalyticsView v-bind="$attrs" />
  </div>
</template>

<script setup>
import AnalyticsView from '@/views/admin/[deprecated]AnalyticsView.vue';
</script>

<style scoped>
/* Puedes agregar estilos específicos aquí */
</style>
