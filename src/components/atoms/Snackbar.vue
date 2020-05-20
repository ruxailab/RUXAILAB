<template>
    <v-snackbar
    v-model="snackbar"
    color="red"
    :timeout="4000"
    top
    >
    {{errorMessage}}
    </v-snackbar>
</template>

<script>
export default {
    data: () => ({
        snackbar: false
    }),
    computed: {
        errorMessage() {
            return this.$store.getters.errorMessage;
        }
    },
    watch: {
        errorMessage() {
            if(this.errorMessage) this.snackbar = true;
        },
        snackbar() {
            if(!this.snackbar) this.$store.commit('setError', null);
        }
    }
}
</script>