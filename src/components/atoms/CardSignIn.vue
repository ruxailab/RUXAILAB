<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-overlay
      class="text-center"
      v-model="loading"
      v-if="this.$route.path.includes('manager')"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      ></v-progress-circular>
      <div class="white-text mt-3">{{ $t('common.loading') }}</div>
    </v-overlay>

    <v-dialog :value="flagToken && !flagUser" width="500" persistent>
      <CardSignIn
        @logined="
          setTest()
          logined = true
        "
        @change="selected = !selected"
        v-if="selected"
      />
      <CardSignUp
        @logined="
          flagNewUser = true
          logined = true
          setTest()
        "
        @change="selected = !selected"
        v-else
      />
    </v-dialog>

    <v-dialog :value="flagToken && flagUser && !logined" width="500" persistent>
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange lighten-4" size="150">
            <v-icon size="120" dark>mdi-account</v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="#F9A826" class="white--text" @click="setTest()">
            {{ $t('common.continueAs') }} {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            {{ $t('common.notUser', { userEmail: user.email }) }}
            <a style="color: #f9a826" @click="signOut()">{{
              $t('common.changeAccount')
            }}</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row class="nav pa-0 ma-0" dense v-if="test">
      <drawer :userAccessLevelOnTest="[accessLevel]"></drawer>
      <!-- View -->
      <v-col class="background pa-0 ma-0">
        <div v-if="this.$route.path.includes('manager')">
          <div class="back-gradient">
            <v-row align="center" justify="center" style="height: 100%">
              <v-col class="text-div">
                <div
                  class="display-3 mb-4 white--text mobile-center"
                  style="font-size: 60px; font-weight: 500"
                >
                  {{ $t('titles.manager') }}
                </div>
                <v-img
                  class="hidden-md-and-up"
                  style="max-height: 40vh"
                  contain
                  src="@/assets/manager/IntroManager.svg"
                ></v-img>
                <div
                  style="font-size: 22px"
                  class="white--text mb-4 mobile-center"
                >
                  {{ test.title }}
                </div>
              </v-col>
              <v-img
                class="hidden-sm-and-down"
                contain
                max-width="40%"
                max-height="85%"
                src="@/assets/manager/IntroManager.svg"
              ></v-img>
            </v-row>
          </div>
          <div>
            <v-container class="card-container">
              <div class="presentation-text">
                {{ $t('common.editAndInvite') }}
              </div>

              <!-- Top Cards -->
              <v-row justify="center" justify-md="space-around">
                <v-col cols="12" md="6" v-for="(item, n) in topCards" :key="n">
                  <v-card
                    class="rounded-xl cards-animation"
                    height="270px"
                    :style="item.cardStyle"
                    @click="go(item.path)"
                    :ripple="false"
                    color="#F2F3F4"
                  >
                    <v-row
                      style="height: 200px"
                      justify="center"
                      align="center"
                    >
                      <v-img
                        max-height="150"
                        :style="item.imageStyle"
                        contain
                        :src="require('../../assets/manager/' + item.image)"
                      ></v-img>
                    </v-row>

                    <div
                      class="white--text pl-4"
                      :style="{
                        height: '90px',
                        position: 'absolute',
                        bottom: '0',
                        width: '100%',
                        'background-color': item.bottom,
                        'padding-top': '10px',
                        'border-top': '.3px solid #505050',
                      }"
                    >
                      <h2>{{ item.title }}</h2>
                      <div>
                        {{ $t(`descriptions.${item.description}`) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <div class="presentation-text mt-5">
                {{ $t('common.analyzeProject') }}
              </div>

              <!-- Bottom Cards -->
              <v-row justify="center" justify-md="space-around">
                <v-col
                  cols="12"
                  md="4"
                  v-for="(item, i) in bottomCards"
                  :key="i"
                >
                  <v-card
                    class="rounded-xl cards-animation"
                    height="270px"
                    :style="item.cardStyle"
                    @click="go(item.path)"
                    hover
                    :ripple="false"
                  >
                    <v-row
                      style="height: 200px"
                      justify="center"
                      align="center"
                      class="px-5"
                    >
                      <v-img
                        height="150"
                        contain
                        :src="require('../../assets/manager/' + item.image)"
                      ></v-img>
                    </v-row>

                    <div
                      class="white--text text-justification pl-4"
                      :style="{
                        height: '90px',
                        position: 'absolute',
                        bottom: '0',
                        width: '100%',
                        paddingTop: '2px',
                        'background-color': item.bottom,
                        'border-top': '.3px solid #505050',
                      }"
                    >
                      <h2>{{ item.title }}</h2>
                      <div>
                        {{ $t(`descriptions.${item.description}`) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </div>
        <router-view @goToCoops="go(items[6])" v-else></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import AuthController from '@/controllers/AuthController'

export default {
  data: () => ({
    showPassword: false,
    email: '',
    password: '',
  }),
  methods: {
    async onSignIn() {
      const authC = new AuthController()
      await authC.authSignIn(this.email, this.password)
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
      return this.$store.getters.loading
    },
  },
}
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
