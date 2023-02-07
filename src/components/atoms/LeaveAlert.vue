<template>
  <v-dialog v-model="dialogLeaveStatus" width="600" persistent>
    <v-card>
      <v-card-title
        class="headline error accent-4 white--text"
        primary-title
        >Are you sure you want to leave?</v-card-title
      >
      <v-card-text
        >Are you sure you want to leave? All your changes will be
        discarded</v-card-text
      >
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="grey lighten-3" text @click="setDialog()"
          >Stay</v-btn
        >
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="setDialog(),discardChanges()"
          >Leave</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
name: "LeaveAlert",
computed:{
  dialogLeaveStatus(){
      return this.$store.getters.getDialogLeaveStatus
    },
},
methods: {
  setDialog() {
    this.$store.commit('SET_DIALOG_LEAVE', false)
  },
  discardChanges(){
    console.log( this.$store.state.pathTo)
    this.$store.commit('SET_LOCAL_CHANGES',false)
    this.$router.push({name: this.$store.state.pathTo})
  }
}
}
</script>