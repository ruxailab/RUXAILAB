<template>
    <div>
        <v-row align="center" justify="center">
            <v-col cols="6">
                <v-card
                :elevation="2"
                >
                    <v-card-title class="justify-center">
                        <h3 v-if="isSignin">Sign-In</h3>
                        <h3 v-else>Sign-Up</h3>
                    </v-card-title>
                    <v-form class="mx-3">
                        <v-text-field
                        label="E-mail"
                        prepend-inner-icon="mdi-account-circle"
                        >
                        </v-text-field>

                        <v-text-field
                        label="Password"
                        prepend-inner-icon="mdi-lock"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword"
                        :type="showPassword ? 'text' : 'password'"
                        >

                        </v-text-field>
                    </v-form>
                    <v-card-actions class="justify-center">
                        <v-btn
                        color="green lighten-1"
                        rounded
                        class="white--text"
                        v-if="isSignin"
                        >
                            Sign-In</v-btn>
                        <v-btn
                        color="green lighten-1"
                        rounded
                        class="white--text"
                        v-else
                        @click="algumacoisa"
                        >
                            Sign-Up</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    props: ['isSignin'],
    data: () => ({
        showPassword: false
    }),
    methods: {

    }
}
</script>

<style>

</style>