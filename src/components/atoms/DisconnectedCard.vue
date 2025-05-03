<template>
  <v-dialog
    v-model="dialog"
    persistent
    :max-width="dialogMaxWidth"
    :model-value="true"
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h5 pb-0">
        Desconexão Detectada!
      </v-card-title>
      <v-container fluid>
        <v-row no-gutters>
          <v-col class="text-center cardSubtitle">
            <span>Infelizmente ocorreu uma desconexão. Você precisará realizar a
              conexão novamente!</span>
          </v-col>
          <v-col class="text-center">
            piel            <v-img
              draggable="false"
              src="../../../public/Disconnected.svg"
              alt="Disconnected image"
              class="mx-auto"
              style="max-width: 100%; height: auto; max-height: 22vh; object-fit: cover;"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions class="text-center">
        <v-btn
          color="orange-darken-1"
          variant="flat"
          size="large"
          class="mx-auto my-3"
          @click="reconnect"
        >
          Recomeçar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Reactive state
const dialog = ref(true)
const dialogMaxWidth = ref('40vw')

// Methods
const reconnect = () => {
  location.reload()
}

const updateDialogMaxWidth = () => {
  if (window.innerWidth <= 600) {
    dialogMaxWidth.value = '80vw'
  } else if (window.innerWidth <= 900) {
    dialogMaxWidth.value = '60vw'
  } else {
    dialogMaxWidth.value = '40vw'
  }
}

// Lifecycle hooks
onMounted(() => {
  updateDialogMaxWidth()
  window.addEventListener('resize', updateDialogMaxWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDialogMaxWidth)
})
</script>

<style scoped>
.v-dialog {
  text-align: center;
}

.v-card-title {
  background-color: orange;
  color: white;
  padding: 16px;
}

.v-btn {
  color: white;
}

.cardSubtitle {
  margin-top: 30px;
  color: #414d55;
  font-size: 20px;
  font-weight: 400;
  line-height: normal;
}
</style>