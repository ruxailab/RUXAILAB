<template>
    <v-app-bar app dense>
        <v-icon left @click="moveHome()">mdi-alpha-r-circle</v-icon>
        <v-toolbar-title 
        @click="moveHome()"
        style="cursor: pointer"
        >Research Workflow</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn text>
            <v-icon left>mdi-lock</v-icon>
            Sign-in
        </v-btn>
    </v-app-bar>
</template>

<script>
export default {
    data: () => ({}),
    methods: {
        moveHome(){
            this.$router.push('/')
        }
    }
}
</script>