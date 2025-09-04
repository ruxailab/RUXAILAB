<template>
  <ShowInfo title="Tareas">
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center">
        <v-icon
          size="96"
          color="primary"
        >
          mdi-format-list-checks
        </v-icon>
        <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
          Comenzamos la fase de tareas
        </h2>
        <p class="text-body-1 mt-4 mb-4 text-grey-darken-1">
          Vas a realizar <strong>{{ numTasks }}</strong> tareas relacionadas con el uso de la herramienta.
          No hay respuestas correctas o incorrectas: lo importante es cómo interactúas.
        </p>
        <p class="text-body-1 mb-6 text-grey-darken-1">
          Cuando estés listo o lista, pulsa el botón para comenzar.
        </p>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="$emit('startTasks')"
        >
          Empezar tareas
        </v-btn>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
const props = defineProps({
    numTasks: Number
});
const emit = defineEmits(['startTasks']);
</script>
