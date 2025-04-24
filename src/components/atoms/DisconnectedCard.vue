<template>
  <v-dialog
    v-model="dialog"
    persistent
    :max-width="dialogMaxWidth"
    :value="true"
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h5 pb-0">Desconexão Detectada!</v-card-title>
      <v-container fluid>
        <v-row no-gutters>
          <v-col class="text-center cardSubtitle">
            <span>
              Infelizmente ocorreu uma desconexão. Você precisará realizar a
              conexão novamente!
            </span>
          </v-col>
          <v-col class="text-center">
            <v-img
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
          color="orange darken-1"
          depressed
          large
          @click="reconnect"
          class="mx-auto my-3"
        >
          Recomeçar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: true,
      dialogMaxWidth: '40vw', // Default width for desktop
    }
  },
  methods: {
    reconnect() {
      location.reload()
    },
    updateDialogMaxWidth() {
      // Use mutually exclusive conditions for proper responsiveness
      if (window.innerWidth <= 600) {
        this.dialogMaxWidth = '80vw' // phones
      } else if (window.innerWidth <= 900) {
        this.dialogMaxWidth = '60vw' // tablets
      } else {
        this.dialogMaxWidth = '40vw' // desktops
      }
    },
  },
  mounted() {
    this.updateDialogMaxWidth()
    window.addEventListener('resize', this.updateDialogMaxWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateDialogMaxWidth)
  },
}
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
