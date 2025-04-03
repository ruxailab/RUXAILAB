<template>
  <v-dialog v-model="dialogLeaveStatus" width="600" persistent>
    <v-card>
      <v-card-title class="headline error accent-4 white--text" primary-title>
        {{ $t('alerts.leave') }}
      </v-card-title>
      <v-card-text>
        {{ $t('alerts.sureLeave') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn class="grey lighten-3" text @click="setDialog">
          {{ $t('buttons.stay') }}
        </v-btn>
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="handleLeave"
        >
          {{ $t('buttons.leave') }}
        </v-btn>
        <v-btn
          class="green white--text ml-1"
          text
          @click="submit()"
        >
          {{ $t('buttons.saveandleave') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LeaveAlert',
  computed: {
    dialogLeaveStatus() {
      return this.$store.getters.getDialogLeaveStatus;
    }
  },
  methods: {
    setDialog() {
      this.$store.commit('SET_DIALOG_LEAVE', false);
    },
    handleLeave() {
      this.discardChanges();
      this.$router.push({ name: this.$store.state.pathTo });
    },
    discardChanges() {
      this.$store.commit('SET_LOCAL_CHANGES', false);
      console.log(this.$store.state.pathTo);
    },
    submit() {
      this.$emit('submit');
    }
  }
};
</script>
