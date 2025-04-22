<template>
  <v-dialog
    v-model="dialogLeaveStatus"
    width="600"
    persistent
  >
    <v-card>
      <v-card-title
        class="text-h5 bg-error-accent-4 text-white"
        primary-title
      >
        {{ $t('alerts.leave') }}
      </v-card-title>
      <v-card-text>
        {{ $t('alerts.sureLeave') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          class="bg-grey-lighten-3"
          variant="text"
          @click="setDialog"
        >
          {{ $t('buttons.stay') }}
        </v-btn>
        <v-btn
          class="bg-error-accent-4 text-white ml-1"
          variant="text"
          @click="handleLeave"
        >
          {{ $t('buttons.leave') }}
        </v-btn>
        <v-btn
          class="bg-green text-white ml-1"
          variant="text"
          @click="submit"
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
  emits: ['save-and-leave'],
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
      this.$emit('save-and-leave');
    }
  }
};
</script>