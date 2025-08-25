<template>
  <div>
    <!-- Vista de analíticas para metodología general -->
    <AnalyticsView v-bind="$attrs" />
  </div>
</template>

<script setup>
import AnalyticsView from '@/views/admin/AnalyticsView.vue';
</script>

<style scoped>
/* Puedes agregar estilos específicos aquí */
</style>
