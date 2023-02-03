<template>
    <v-card color="#f5f7ff">
        <v-row class="ma-0 pa-0">
            <v-col cols="12" align-self="center">
                <div class="card-title">{{ $t("SIGNIN.sign-in") }}</div>

                <div class="divider"></div>

                <v-form class="mx-3" @keyup.native.enter="onSignIn()">
                    <v-text-field
                        :label="$t('SIGNIN.email')"
                        outlined
                        prepend-inner-icon="mdi-account-circle"
                        v-model="email"
                        dense
                    ></v-text-field>

                    <v-text-field
                        :label="$t('SIGNIN.password')"
                        prepend-inner-icon="mdi-lock"
                        outlined
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword"
                        :type="showPassword ? 'text' : 'password'"
                        v-model="password"
                        dense
                    ></v-text-field>
                </v-form>
                <v-card-actions class="justify-center mt-4">
                    <v-btn
                        color="#F9A826"
                        rounded
                        class="white--text"
                        @click="onSignIn()"
                        :loading="loading"
                        >{{ $t("SIGNIN.sign-in") }}</v-btn
                    >
                </v-card-actions>
                <v-card-actions class="justify-center mt-1">
                    <p>
                        <a style="color: #F9A826" @click="$emit('change')">{{
                            $t("SIGNIN.dont-have-account")
                        }}</a>
                    </p>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import AuthController from "@/controllers/AuthController";

export default {
    data: () => ({
        showPassword: false,
        email: "",
        password: "",
    }),
    methods: {
        async onSignIn() {
            const authC = new AuthController();
            await authC.authSingIn(this.email, this.password);
            // await this.$store
            //   .dispatch("signin", {
            //     email: this.email,
            //     password: this.password
            //   })
            //   .then(() => {
            //     this.$emit("logined");
            //   });
        },
    },
    computed: {
        loading() {
            return this.$store.getters.loading;
        },
    },
};
</script>

<style scoped>
.card-title {
    font-family: Roboto;
    font-style: normal;
    font-weight: 300;
    font-size: 48px;
    line-height: 56px;
    margin-left: 12px;
    margin-bottom: 20px;
}
</style>
