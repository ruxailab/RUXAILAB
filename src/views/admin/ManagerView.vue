<template>
  <v-container class="pa-0 ma-0" fluid>
    <!-- Loading overlay -->
    <v-overlay
      v-if="this.$route.path.includes('manager')"
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        {{ $t('common.loading') }}
      </div>
    </v-overlay>

    <!-- Login dialog for user verification -->
    <v-dialog :value="flagToken && flagUser && !logined" width="500" persistent>
      <v-card v-if="user" class="pa-4 rounded-xl" elevation="8">
        <v-row class="ma-0 pt-5" justify="center">
          <v-avatar
            class="justify-center elevation-3"
            color="orange lighten-4"
            size="150"
          >
            <v-icon size="120" dark>
              mdi-account
            </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn
            color="#F9A826"
            class="white--text px-6 py-2 text-subtitle-1 font-weight-medium"
            x-large
            elevation="3"
            @click="setTest()"
          >
            {{ $t('common.continueAs') }} {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            {{ $t('common.notUser', { userEmail: user.email }) }}
            <a class="primary-link" @click="signOut()">{{
              $t('common.changeAccount')
            }}</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Main dashboard content -->
    <v-row v-if="test" class="nav pa-0 ma-0" dense>
      <!-- Navigation drawer component -->
      <Drawer :items="navigator" />

      <!-- Main content container -->
      <v-col class="background pa-0 ma-0">
        <div v-if="this.$route.path.includes('manager')">
          <!-- Top gradient banner section -->
          <div class="back-gradient">
            <v-row align="center" justify="center" style="height: 100%">
              <v-col class="text-div">
                <div v-if="accessLevel == 0" class="white--text">
                  <p class="mobile-center display-1 font-weight-medium">
                    {{ $t('titles.manager') }}
                  </p>
                  <p class="mobile-center title font-weight-regular">
                    {{ test.testTitle }}
                  </p>
                </div>
                <div
                  v-else
                  class="white--text mobile-center display-1 font-weight-medium"
                >
                  {{ test.testTitle }}
                </div>
                <!-- Mobile version of the floating image -->
                <v-img
                  class="hidden-md-and-up floating-img"
                  style="max-height: 40vh"
                  contain
                  src="@/assets/manager/IntroManager.svg"
                />
              </v-col>
              <!-- Desktop version of the floating image -->
              <v-img
                class="hidden-sm-and-down floating-img"
                contain
                max-width="40%"
                max-height="85%"
                src="@/assets/manager/IntroManager.svg"
              />
            </v-row>
          </div>

          <div>
            <v-container class="card-container">
              <!-- Admin level management section -->
              <div v-if="accessLevel == 0" class="presentation-text">
                {{ $t('common.editAndInvite') }}
              </div>

              <!-- Top cards for admin users - Edit Test & Cooperators -->
              <v-row
                v-if="accessLevel == 0"
                justify="center"
                justify-md="space-around"
              >
                <v-col v-for="(item, n) in topCards" :key="n" cols="12" md="6">
                  <v-card
                    class="rounded-xl cards-animation"
                    height="270px"
                    :style="item.cardStyle"
                    :ripple="false"
                    elevation="6"
                    @click="go(item.path)"
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
                      />
                    </v-row>

                    <!-- Card content box for caption and description -->
                    <div
                      class="white--text pa-4 card-content-box"
                      :style="{
                        height: '90px',
                        position: 'absolute',
                        bottom: '0',
                        width: '100%',
                        'background-color': item.bottom,
                        padding: '0 !important',
                      }"
                    >
                      <div class="card-inner-content">
                        <h2 class="text-h5 font-weight-bold text-truncate">
                          {{ $t(`titles.${item.title}`) }}
                        </h2>
                        <div class="text-subtitle-2 card-description">
                          {{ $t(`descriptions.${item.description}`) }}
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Analytics section header -->
              <div class="presentation-text mt-12">
                {{ $t('common.analyzeProject') }}
              </div>

              <!-- Bottom cards for analytics features - available to all users with access -->
              <v-row justify="center" justify-md="space-around">
                <v-col
                  v-for="(item, i) in bottomCards"
                  :key="i"
                  cols="12"
                  md="4"
                >
                  <v-card
                    class="rounded-xl cards-animation"
                    height="270px"
                    :style="item.cardStyle"
                    hover
                    :ripple="false"
                    elevation="6"
                    @click="go(item.path)"
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
                      />
                    </v-row>

                    <!-- Card content box for caption and description -->
                    <div
                      class="white--text pa-4 card-content-box"
                      :style="{
                        height: '90px',
                        position: 'absolute',
                        bottom: '0',
                        width: '100%',
                        'background-color': item.bottom,
                        padding: '0 !important',
                      }"
                    >
                      <div class="card-inner-content">
                        <h2 class="text-h5 font-weight-bold text-truncate">
                          {{ $t(`titles.${item.title}`) }}
                        </h2>
                        <div class="text-subtitle-2 card-description">
                          {{ $t(`descriptions.${item.description}`) }}
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </div>
        <!-- Router view for nested routes -->
        <router-view v-else />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Drawer from '@/components/atoms/Drawer.vue'
import { statistics } from '@/utils/statistics'
import i18n from '@/i18n'

export default {
  components: {
    Drawer,
  },

  data: () => ({
    // Authentication state flags
    flagUser: false, // User data loaded
    flagToken: false, // Token provided
    flagNewUser: false, // New user status
    logined: false, // Login status
  }),

  computed: {
    // Get current test data and process statistics
    test() {
      this.$store.dispatch('processStatistics', {
        resultEvaluator: statistics(),
        percentage: this.percentage,
        answers: this.$store.getters.testAnswerDocument,
      })
      return this.$store.getters.test
    },

    // Admin management cards (top row)
    topCards() {
      return [
        {
          image: 'IntroEdit.svg',
          title: 'test',
          imageStyle: 'transform: rotateY(180deg);',
          bottom: '#000',
          description: 'edit',
          cardStyle:
            'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden',
          path: `/edittest/${this.test.id}`,
        },
        {
          image: 'IntroCoops.svg',
          title: 'cooperators',
          imageStyle: '',
          bottom: '#000',
          description: 'cooperators',
          cardStyle:
            'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
          path: `/cooperators/${this.test.cooperators}`,
        },
      ]
    },

    // Analytics feature cards (bottom rows)
    bottomCards() {
      const bottomCards = [
        {
          image: 'IntroReports.svg',
          title: 'reports',
          imageStyle: 'height: 250px',
          bottom: '#000',
          description: 'reports',
          cardStyle:
            'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden',
          path: `/reportview/${this.test.answersDocId}`,
        },
        {
          image: 'IntroAnswer.svg',
          title: 'answers',
          imageStyle: 'height: 250px',
          bottom: '#000',
          description: 'answers',
          cardStyle:
            'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden',
          path: `/answerview/${this.test.answersDocId}`,
        },
      ]
      // Add final report option for admin users only
      if (this.accessLevel == 0) {
        bottomCards.push({
          image: 'FinalReport.png',
          title: 'finalReport',
          imageStyle: 'height: 250px',
          bottom: '#000',
          description: 'finalReport',
          cardStyle:
            'background-image: radial-gradient(circle at top left,  #ec6618, #f54e42); overflow: hidden',
          path: `/finalreportview/${this.test.id}`,
        })
      }
      return bottomCards
    },

    // Current user object
    user() {
      if (this.$store.getters.user) this.setFlag('flagUser', true)
      return this.$store.getters.user
    },

    // List of cooperators
    cooperators() {
      return this.$store.getters.cooperators
    },

    // App loading state
    loading() {
      return this.$store.getters.loading
    },

    // User's access level for current test
    // 0 = Owner/Admin, 1 = Collaborator/Public access, 2 = No access
    accessLevel() {
      // Check if user exists
      if (!this.user) return 1

      // Superadmin check
      if (this.user.accessLevel === 0) return 0

      // Test owner check
      const isTestOwner = this.test.testAdmin?.userDocId === this.user.id
      if (isTestOwner) return 0

      // Cooperator check
      const coopsInfo = this.test.cooperators?.find(
        (coops) => coops.userDocId === this.user.id,
      )
      if (coopsInfo) return coopsInfo.accessLevel

      // Public test check
      return this.test.isPublic ? 1 : 2
    },

    // Navigation menu items based on access level
    navigator() {
      if (!this.test) return []

      const items = [
        {
          title: 'Manager',
          icon: 'mdi-home',
          path: `/managerview/${this.test.id}`,
        },
      ]

      // Add template link if applicable
      if (this.test.template) {
        items.push(
          {
            title: 'Template',
            icon: 'mdi-file-compare',
            title: 'Reports',
            icon: 'mdi-book-multiple',
            path: `/reportview/${this.test.id}`,
          },
          {
            title: 'Answers',
            icon: 'mdi-order-bool-ascending-variant',
            path: `/answerview/${this.test.id}`,
          },
        )
      }

      return items
    },
  },

  watch: {
    // Handle user changes
    user() {
      if (this.user) {
        this.setFlag('flagUser', true)
      }
      if (this.user.myCoops && this.flagNewUser) {
        this.setTest()
        this.flagNewUser = false
      }
    },
  },

  async created() {
    // Load test data on component creation
    await this.$store.dispatch('getTest', { id: this.$route.params.id })
    await this.$store.dispatch('getCurrentTestAnswerDoc')

    // Redirect if insufficient permissions
    if (this.accessLevel == 2) {
      this.$toast.warning("You don't have permission to access this test!")
      this.$router.push('/testslist')
    }
  },

  methods: {
    // Navigate to specified route
    go(item) {
      if (item.id === undefined) return this.$router.push(item).catch(() => {})
      if (item.id === 2) return window.open(item.path)
      return this.$router.push(item.path).catch(() => {})
    },

    // Set flag value
    setFlag(flag, value) {
      this[flag] = value
    },

    // Sign out user
    signOut() {
      this.$store.dispatch('logout').then(() => {
        this.setFlag('flagUser', false)
      })
    },

    // Setup test and handle invitation acceptance
    async setTest() {
      if (this.user.myAnswers && this.test) {
        const answers = []
        const answersEntries = Object.entries(this.user.myAnswers)
        answersEntries.forEach((a) => {
          answers.push(a[1])
        })
        // Check for existing test acceptance
        const alreadyAccepted = answers.find(
          (a) => a.testDocId === this.test.id,
        )
        if (!alreadyAccepted) {
          // Process new invitation
          const invitation = this.test.cooperators.find(
            (coop) => coop.token === this.token,
          )
          if (invitation) {
            // Verify invited email matches current user
            if (this.user.email === invitation.email) {
              // Accept collaboration
              await this.$store.dispatch('acceptTestCollaboration', {
                test: this.test,
                cooperator: this.user,
              })
              this.flagToken = false
            } else {
              // Email mismatch error
              this.$store.commit('setError', {
                errorCode: 'inviteError',
                message: i18n.t('errors.signupWithInvitationEmail'),
              })
              await this.$store.dispatch('logout')
              this.$router.push({ path: '/' })
            }
          } else {
            // Invalid invitation error
            this.$store.commit('setError', {
              errorCode: 'inviteError',
              message: i18n.t('errors.invalidInvitation'),
            })
            this.$router.push({ path: '/' })
          }
        } else {
          this.flagToken = false
        }
      }
    },
  },

  // Handle route with token parameter
  beforeRouteEnter(to, from, next) {
    if (to.params.token)
      next((vm) => {
        vm.setFlag('flagToken', true)
        vm.token = to.params.token
      })
    next()
  },
}
</script>
<style>
.background {
  background-color: #e8eaf2;
  background-image: linear-gradient(135deg, #e8eaf2 0%, #f5f6fa 100%);
  height: 94%;
  overflow: auto;
  position: relative;
}

.background::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: radial-gradient(
      circle at 20% 35%,
      rgba(252, 163, 38, 0.1) 0%,
      transparent 25%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgba(41, 182, 246, 0.05) 0%,
      transparent 30%
    );
  pointer-events: none;
}

.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.primary-link {
  color: #f9a826 !important;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.primary-link:hover {
  color: #e38c0e !important;
  text-decoration: underline;
}

.background::-webkit-scrollbar {
  display: none;
}

.presentation-text {
  color: rgb(57, 54, 70);
  font-weight: 700;
  font-size: 26px;
  margin-bottom: 36px;
  position: relative;
  display: inline-block;
  transform: translateZ(0);
  transition: transform 0.3s ease-out;
}

.presentation-text:hover {
  transform: translateY(-2px);
}

.presentation-text::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -10px;
  height: 4px;
  width: 60px;
  background: linear-gradient(90deg, #fca326, #f6cd3d);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.presentation-text:hover::after {
  width: 100%;
}

.back-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
  box-shadow: 0 4px 30px rgba(252, 163, 38, 0.4);
  overflow: hidden;
  position: relative;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.back-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.6;
}

.back-gradient::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.15), transparent);
  pointer-events: none;
}

.text-div {
  max-width: 45%;
  padding: 30px 25px;
  position: relative;
  z-index: 1;
  transform: translateZ(0);
}

.text-div p {
  margin-bottom: 15px;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.25);
  line-height: 1.4;
  transition: transform 0.3s ease;
}

.text-div p:hover {
  transform: translateY(-2px);
}

.card-container {
  width: 70%;
  padding: 30px;
  position: relative;
  z-index: 2;
  margin-top: -30px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.cards-animation {
  transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  transform: translateY(0) rotateX(0) rotateY(0);
  will-change: transform, box-shadow;
  overflow: hidden !important;
  perspective: 1000px;
}

.cards-animation:hover {
  transform: translateY(-12px) rotateX(2deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), 0 12px 12px rgba(0, 0, 0, 0.15) !important;
}

.cards-animation:hover .v-image {
  transform: scale(1.08) translateY(-5px);
}

.cards-animation .v-image {
  transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.cards-animation::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  z-index: -1;
  border-radius: 20px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cards-animation:hover::after {
  opacity: 1;
}

.v-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  border-radius: 18px 18px 0 0;
  pointer-events: none;
  z-index: 1;
}

.v-card:hover .white--text h2 {
  transform: translateX(5px);
}

.v-card .white--text h2 {
  position: relative;
  transition: transform 0.3s ease;
}

.v-card .white--text h2::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  transition: width 0.3s ease;
}

.v-card:hover .white--text h2::after {
  width: 50px;
}

.floating-img {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.v-progress-circular {
  filter: drop-shadow(0 0 8px rgba(252, 163, 38, 0.5));
}

.v-overlay__content {
  backdrop-filter: blur(5px);
}

.white-text {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  font-weight: 500;
}

.card-content-box {
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  padding: 0 !important;
}

.card-inner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-inner-content h2 {
  margin: 0 0 4px 0 !important;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.2rem !important;
  line-height: 1.2;
  display: block;
  max-height: 25px;
  font-family: 'Montserrat', 'Roboto', -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif !important;
  letter-spacing: 0.03em;
  font-weight: 700 !important;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

.card-inner-content .card-description {
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.15;
  max-height: 36px;
  font-size: 0.8rem !important;
  opacity: 0.9;
  font-family: 'Nunito', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif !important;
  letter-spacing: 0.02em;
  font-weight: 500;
}

.v-row:not(:first-child) .card-inner-content h2 {
  font-size: 1.15rem !important;
  margin-bottom: 3px !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: linear-gradient(90deg, #ffffff, #e0e0e0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.v-row:not(:first-child) .card-inner-content .card-description {
  line-height: 1.1;
  font-size: 0.75rem !important;
  font-weight: 400;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Nunito:wght@400;500;600&display=swap');

.v-card:hover .card-inner-content h2 {
  transform: translateX(5px);
  background: linear-gradient(90deg, #ffffff, #eeeeee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.v-row:first-child .card-inner-content h2 {
  letter-spacing: 0.04em;
  background: linear-gradient(90deg, #ffffff, #e0e0e0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  text-transform: uppercase;
}

@media screen and (max-width: 600px) {
  .card-inner-content h2 {
    font-size: 1rem !important;
    letter-spacing: 0.02em;
  }
}

.card-inner-content .card-description {
  width: 100%;
  word-break: break-word;
}

h2.text-truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .cards-animation,
  .v-image,
  .presentation-text,
  .floating-img {
    transition: none !important;
    animation: none !important;
  }

  .cards-animation:hover,
  .presentation-text:hover,
  .text-div p:hover {
    transform: none !important;
  }

  .v-card:hover .white--text h2 {
    transform: none !important;
  }
}
</style>
