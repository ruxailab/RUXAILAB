<template>
    <v-container>
        <h1>Emotions</h1>
        <p>Here you can see the emotions of the test participants.</p>
    </v-container>
</template>

<script>
    export default {
        computed: {
            testId() {
                return this.$route.params.id;
            },
        },
    };
</script>