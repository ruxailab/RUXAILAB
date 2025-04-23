<template>
  <div>
    <v-tabs
      v-if="type == 'tabs'"
      bg-color="transparent"
      color="#FCA326"
      class="pb-0 mb-0"
    >
      <v-tab @click="tabClicked(0)">
        {{ $t('ModeratedTest.preTest') }}
      </v-tab>
      <v-tab @click="tabClicked(1)">
        {{ $t('ModeratedTest.tasks') }}
      </v-tab>
      <v-tab @click="tabClicked(2)">
        {{ $t('ModeratedTest.postTest') }}
      </v-tab>
    </v-tabs>

    <v-col
      v-else-if="type == 'content'"
      cols="12"
    >
      <!-- Desktop Layout -->
      <v-row v-if="isDesktop">
        <!-- PRE-TEST -->
        <v-col
          v-if="index == 0"
          cols="8"
        >
          <v-card
            style="background: #f5f7ff"
            flat
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 px-5 pt-4"
            >
              <span class="cardsTitle ml-3">{{ $t('ModeratedTest.consentForm') }}</span>
              <br>
              <span class="cardsSubtitle ml-3">
                {{ $t('ModeratedTest.consentDescription') }}
              </span>
            </v-col>
            <UserConsent />
          </v-card>
        </v-col>
        <v-col
          v-if="index == 0"
          cols="4"
          class="pl-0"
          style="height: 19vh;"
        >
          <v-card
            flat
            style="background: #f5f7ff"
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 pt-4 px-8"
            >
              <span class="cardsTitle mt-4">{{ $t('ModeratedTest.welcomeMessage') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.welcomeMessageDescription') }}</span>
            </v-col>
            <v-textarea
              v-model="welcomeMessage"
              variant="outlined"
              color="orange"
              class="mx-6 mt-3"
              :placeholder="$t('ModeratedTest.welcomeMessage')"
              @change="saveWelcomeState()"
            />
            <v-col
              cols="12"
              class="pb-0 px-8"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.landingPage') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.landingPageDescription') }}</span>
              <v-text-field
                v-model="landingPage"
                class="mt-3"
                style="border-radius: 20px;"
                :placeholder="$t('ModeratedTest.url')"
                variant="outlined"
                color="orange"
                @change="saveLandingPage()"
              />
            </v-col>
            <v-col
              cols="12"
              class="pb-1 px-8 pb-0"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.participantCamera') }}</span>
              <v-radio-group
                v-model="participantCamera"
                class="pt-0"
                @update:model-value="saveParticipantCamera()"
              >
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.optional')"
                  color="orange"
                  value="optional"
                />
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.required')"
                  color="orange"
                  value="required"
                />
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.disabled')"
                  color="orange"
                  value="disabled"
                />
              </v-radio-group>
            </v-col>
          </v-card>
        </v-col>
        <v-col
          v-if="index == 0"
          cols="8"
          class="pt-0 pb-0"
        >
          <v-card
            style="background: #f5f7ff; min-height: 420px;"
            flat
            class="cards"
          >
            <v-col cols="12">
              <span class="cardsTitle ml-3">{{ $t('ModeratedTest.preForm') }}</span>
              <br>
              <span class="cardsSubtitle ml-3">{{ $t('ModeratedTest.preFormDescription') }}</span>
              <UserVariables @input="updateData" />
            </v-col>
          </v-card>
        </v-col>
        
        <!-- Tasks -->
        <v-col
          v-if="index == 1"
          cols="12"
        >
          <ModeratedTasks />
        </v-col>
        
        <!-- Post Test -->
        <v-col
          v-if="index == 2"
          cols="12"
        >
          <v-card
            style="background: #f5f7ff; min-height: 410px;"
            flat
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 px-5 pt-4"
            >
              <span class="cardsTitle ml-3">{{ $t('ModeratedTest.postForm') }}</span>
              <br>
              <span class="cardsSubtitle ml-3">{{ $t('ModeratedTest.postFormDescription') }}</span>
              <FormPostTest @input="updateData" />
            </v-col>
          </v-card>
        </v-col>
        <v-col
          v-if="index == 2"
          cols="12"
          class="pt-0"
        >
          <v-card
            style="background: #f5f7ff"
            flat
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 px-5 pt-4 pb-0"
            >
              <span class="cardsTitle ml-3">{{ $t('ModeratedTest.finalMessage') }}</span>
              <br>
              <span class="cardsSubtitle ml-3">{{ $t('ModeratedTest.finalMessageDescription') }}</span>
            </v-col>
            <v-textarea
              v-model="finalMessage"
              rows="3"
              variant="outlined"
              color="orange"
              class="mx-6 mt-3"
              :placeholder="$t('ModeratedTest.finalMessagePlaceholder')"
              @change="saveFinalMessage()"
            />
          </v-card>
        </v-col>
      </v-row>

      <!-- Mobile/Tablet Layout -->
      <v-row v-else>
        <!-- PRE-TEST Mobile -->
        <v-col
          v-if="index == 0"
          cols="12"
        >
          <v-card
            style="background: #f5f7ff"
            flat
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 px-4 pt-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.consentForm') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.consentDescription') }}</span>
            </v-col>
            <UserConsent />
          </v-card>

          <v-card
            flat
            style="background: #f5f7ff"
            class="cards mt-4"
          >
            <v-col
              cols="12"
              class="pb-0 pt-4 px-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.welcomeMessage') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.welcomeMessageDescription') }}</span>
              <v-textarea
                v-model="welcomeMessage"
                variant="outlined"
                color="orange"
                class="mt-3"
                :placeholder="$t('ModeratedTest.welcomeMessagePlaceholder')"
                @change="saveWelcomeState()"
              />
            </v-col>

            <v-col
              cols="12"
              class="pb-0 px-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.landingPage') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.landingPageDescription') }}</span>
              <v-text-field
                v-model="landingPage"
                class="mt-3"
                style="border-radius: 20px;"
                :placeholder="$t('ModeratedTest.landingPagePlaceholder')"
                variant="outlined"
                color="orange"
                @change="saveLandingPage()"
              />
            </v-col>

            <v-col
              cols="12"
              class="pb-1 px-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.participantCamera') }}</span>
              <v-radio-group
                v-model="participantCamera"
                class="pt-0"
                @update:model-value="saveParticipantCamera()"
              >
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.optional')"
                  color="orange"
                  value="optional"
                />
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.required')"
                  color="orange"
                  value="required"
                />
                <v-radio
                  :label="$t('ModeratedTest.cameraOptions.disabled')"
                  color="orange"
                  value="disabled"
                />
              </v-radio-group>
            </v-col>
          </v-card>

          <v-card
            style="background: #f5f7ff"
            flat
            class="cards mt-4"
          >
            <v-col cols="12">
              <span class="cardsTitle">{{ $t('ModeratedTest.preForm') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.preFormDescription') }}</span>
              <UserVariables @input="updateData" />
            </v-col>
          </v-card>
        </v-col>

        <!-- Tasks Mobile -->
        <v-col
          v-if="index == 1"
          cols="12"
        >
          <ModeratedTasks />
        </v-col>

        <!-- Post Test Mobile -->
        <v-col
          v-if="index == 2"
          cols="12"
        >
          <v-card
            style="background: #f5f7ff"
            flat
            class="cards"
          >
            <v-col
              cols="12"
              class="pb-0 px-4 pt-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.postForm') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.postFormDescription') }}</span>
              <FormPostTest
                :class="{'mobile-post-form': !$vuetify.breakpoint.lgAndUp}"
                @input="updateData"
              />
            </v-col>
          </v-card>

          <v-card
            style="background: #f5f7ff"
            flat
            class="cards mt-4"
          >
            <v-col
              cols="12"
              class="pb-0 px-4 pt-4"
            >
              <span class="cardsTitle">{{ $t('ModeratedTest.finalMessage') }}</span>
              <br>
              <span class="cardsSubtitle">{{ $t('ModeratedTest.finalMessageDescription') }}</span>
              <v-textarea
                v-model="finalMessage"
                rows="3"
                variant="outlined"
                color="orange"
                class="mt-3"
                :placeholder="$t('ModeratedTest.finalMessagePlaceholder')"
                @change="saveFinalMessage()"
              />
            </v-col>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>

<script>
import { useDisplay } from 'vuetify'
import FormPostTest from '../atoms/FormPostTest.vue'
import UserVariables from '../atoms/UserVariables.vue'
import ModeratedTasks from '../atoms/ModeratedTasks.vue'
import UserConsent from '../atoms/UserConsent.vue'

export default {
  components: { 
    FormPostTest, 
    UserVariables, 
    ModeratedTasks, 
    UserConsent 
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    object: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['tabClicked'],
  setup() {
    const { lgAndUp } = useDisplay()
    return {
      isDesktop: lgAndUp
    }
  },
  data() {
    return {
      formData: {
        preTest: [],
        postTest: [],
      },
      welcomeMessage: '',
      landingPage: '',
      participantCamera: '',
      finalMessage: '',
    }
  },
  computed: {
    consentStore() {
      return this.$store.getters.consent
    },
    test() {
      return this.$store.getters.test
    },
    testStructure() {
      return this.$store.state.Tests.Test.testStructure || {}
    },
    welcomeMessageStore() {
      return this.$store.getters.welcomeMessage
    },
    landingPageStore() {
      return this.$store.getters.landingPage
    },
    participantCameraStore() {
      return this.$store.getters.participantCamera
    },
    finalMessageStore() {
      return this.$store.getters.finalMessage
    },
  },

  mounted() {
    this.getWelcome()
    this.getLandingPage()
    this.getParticipantCamera()
    this.getFinalMessage()

    if (this.type !== 'content' && this.type != 'tabs') {
      console.error(this.type + ' type in EditUserTest.vue is not valid.')
    }
    if (this.testStructure.postTest) {
      this.$store.dispatch('setPostTest', this.testStructure.postTest)
    }
    if (this.testStructure.preTest) {
      this.$store.dispatch('setPreTest', this.testStructure.preTest)
    }
    if (this.testStructure.consent) {
      this.$store.dispatch('setConsent', this.testStructure.consent)
    }
  },

  methods: {
    updateData(data) {
      if (this.index == 0) {
        this.$store.dispatch('setPreTest', data)
      }
      if (this.index == 2) {
        this.$store.dispatch('setPostTest', data)
      }
    },
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
    getWelcome() {
      if (this.testStructure.welcomeMessage) {
        this.$store.dispatch(
          'setWelcomeMessage',
          this.testStructure.welcomeMessage,
        )
        this.welcomeMessage = this.testStructure.welcomeMessage
      } else if (this.welcomeMessageStore) {
        this.welcomeMessage = this.welcomeMessageStore
      }
    },

    getLandingPage() {
      if (this.testStructure.landingPage) {
        this.$store.dispatch('setLandingPage', this.testStructure.landingPage)
        this.landingPage = this.testStructure.landingPage
      } else if (this.landingPageStore) {
        this.landingPage = this.landingPageStore
      }
    },

    getParticipantCamera() {
      if (this.testStructure.participantCamera) {
        this.$store.dispatch(
          'setParticipantCamera',
          this.testStructure.participantCamera,
        )
        this.participantCamera = this.testStructure.participantCamera
      } else if (this.participantCameraStore) {
        this.participantCamera = this.participantCameraStore
      }
    },

    getFinalMessage() {
      if (this.testStructure.finalMessage) {
        this.$store.dispatch('setFinalMessage', this.testStructure.finalMessage)
        this.finalMessage = this.testStructure.finalMessage
      } else if (this.finalMessageStore) {
        this.finalMessage = this.finalMessageStore
      }
    },

    saveWelcomeState() {
      this.$store.dispatch('setWelcomeMessage', this.welcomeMessage)
      this.test.testStructure.welcomeMessage = this.welcomeMessage
    },
    saveLandingPage() {
      this.$store.dispatch('setLandingPage', this.landingPage)
      this.test.testStructure.landingPage = this.landingPage
    },
    saveParticipantCamera() {
      this.$store.dispatch('setParticipantCamera', this.participantCamera)
      this.test.testStructure.participantCamera = this.participantCamera
    },
    saveFinalMessage() {
      this.$store.dispatch('setFinalMessage', this.finalMessage)
      this.test.testStructure.finalMessage = this.finalMessage
    },
  },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}

@media (max-width: 1264px) {
  .cards {
    margin-bottom: 16px;
  }
  .cardsTitle {
    font-size: 16px;
  }
  .cardsSubtitle {
    font-size: 14px;
  }
}

@media (max-width: 600px) {
  .cards {
    margin-bottom: 12px;
  }
  .cardsTitle {
    font-size: 15px;
  }
  .cardsSubtitle {
    font-size: 13px;
  }
}
.mobile-post-form :deep(.v-select__selections) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-post-form :deep(.v-select) {
  max-width: 100%;
  min-width: 0;
}

.mobile-post-form :deep(.v-menu__content) {
  max-width: 90vw !important;
}

@media (max-width: 600px) {
  .mobile-post-form :deep(.v-select__slot) {
    font-size: 14px;
  }
  
  .mobile-post-form :deep(.v-select__selection) {
    max-width: calc(100% - 40px);
  }
}
</style>
