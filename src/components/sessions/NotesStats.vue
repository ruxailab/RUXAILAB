<template>
  <div class="notes-stats">
    <h3 class="text-h6 mb-2">Notas Creadas</h3>
    <v-chip color="secondary" class="mb-2">{{ totalNotes }}</v-chip>
    <div class="text-caption">Total de notas creadas en la sesión</div>
    <div v-if="totalNotes === 0" class="text-grey mt-2">No hay notas creadas.</div>
  </div>
</template>

<script>
export default {
  name: 'NotesStats',
  props: {
    totalNotes: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.notes-stats {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
}
</style>
