<template>
    <v-app-bar app dense>
        <v-icon left @click="moveHome()">mdi-alpha-r-circle</v-icon>
        <v-toolbar-title 
        @click="moveHome()"
        style="cursor: pointer"
        >Research Workflow</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn text @click="moveSignIn()" v-if="!user">
            <v-icon left>mdi-lock</v-icon>
            Sign-in
        </v-btn>

        <v-btn text @click="signOut()" v-else>
            <v-icon left>mdi-logout</v-icon>
            Sign-out
        </v-btn>
    </v-app-bar>
</template>

<script>
export default {
    data: () => ({}),
    methods: {
        moveHome(){
            this.$router.push('/')
        },
        moveSignIn(){
            this.$router.push('/signin')
        },
        signOut() {
            this.$store.dispatch('logout');
            this.$router.push('/signin')
        }
    },
    computed: {
        user() {
            return this.$store.getters.user;
        }
    }
}
</script>