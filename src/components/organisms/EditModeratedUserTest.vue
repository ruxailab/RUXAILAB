<template>
  <div>
    <v-tabs
      v-if="type === 'tabs'"
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
      v-else-if="type === 'content'"
      cols="12"
    >
      <!-- Desktop Layout -->
      <v-row v-if="isDesktop">
        <!-- PRE-TEST -->
        <v-col
          v-if="index === 0"
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
          v-if="index === 0"
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
              @change="saveWelcomeState"
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
                @change="saveLandingPage"
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
                @update:model-value="saveParticipantCamera"
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
          v-if="index === 0"
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
          v-if="index === 1"
          cols="12"
        >
          <ModeratedTasks />
        </v-col>
        
        <!-- Post Test -->
        <v-col
          v-if="index === 2"
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
          v-if="index === 2"
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
              @change="saveFinalMessage"
            />
          </v-card>
        </v-col>
      </v-row>

      <!-- Mobile/Tablet Layout -->
      <v-row v-else>
        <!-- PRE-TEST Mobile -->
        <v-col
          v-if="index === 0"
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
                @change="saveWelcomeState"
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
                @change="saveLandingPage"
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
                @update:model-value="saveParticipantCamera"
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
          v-if="index === 1"
          cols="12"
        >
          <ModeratedTasks />
        </v-col>

        <!-- Post Test Mobile -->
        <v-col
          v-if="index === 2"
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
                :class="{ 'mobile-post-form': !$vuetify.breakpoint.lgAndUp }"
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
                @change="saveFinalMessage"
              />
            </v-col>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import FormPostTest from '../atoms/FormPostTest.vue';
import UserVariables from '../atoms/UserVariables.vue';
import ModeratedTasks from '../atoms/ModeratedTasks.vue';
import UserConsent from '../atoms/UserConsent.vue';

defineProps({
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
});

const emit = defineEmits(['tabClicked']);

const { lgAndUp } = useDisplay();
const isDesktop = lgAndUp;

const store = useStore();
const { t } = useI18n();

const formData = ref({
  preTest: [],
  postTest: [],
});
const welcomeMessage = ref('');
const landingPage = ref('');
const participantCamera = ref('');
const finalMessage = ref('');

const consentStore = computed(() => store.getters.consent);
const test = computed(() => store.getters.test);
const testStructure = computed(() => store.state.Tests.Test.testStructure || {});
const welcomeMessageStore = computed(() => store.getters.welcomeMessage);
const landingPageStore = computed(() => store.getters.landingPage);
const participantCameraStore = computed(() => store.getters.participantCamera);
const finalMessageStore = computed(() => store.getters.finalMessage);

const updateData = (data) => {
  if (index === 0) {
    store.dispatch('setPreTest', data);
  }
  if (index === 2) {
    store.dispatch('setPostTest', data);
  }
};

const tabClicked = (index) => {
  emit('tabClicked', index);
};

const getWelcome = () => {
  if (testStructure.value.welcomeMessage) {
    store.dispatch('setWelcomeMessage', testStructure.value.welcomeMessage);
    welcomeMessage.value = testStructure.value.welcomeMessage;
  } else if (welcomeMessageStore.value) {
    welcomeMessage.value = welcomeMessageStore.value;
  }
};

const getLandingPage = () => {
  if (testStructure.value.landingPage) {
    store.dispatch('setLandingPage', testStructure.value.landingPage);
    landingPage.value = testStructure.value.landingPage;
  } else if (landingPageStore.value) {
    landingPage.value = landingPageStore.value;
  }
};

const getParticipantCamera = () => {
  if (testStructure.value.participantCamera) {
    store.dispatch('setParticipantCamera', testStructure.value.participantCamera);
    participantCamera.value = testStructure.value.participantCamera;
  } else if (participantCameraStore.value) {
    participantCamera.value = participantCameraStore.value;
  }
};

const getFinalMessage = () => {
  if (testStructure.value.finalMessage) {
    store.dispatch('setFinalMessage', testStructure.value.finalMessage);
    finalMessage.value = testStructure.value.finalMessage;
  } else if (finalMessageStore.value) {
    finalMessage.value = finalMessageStore.value;
  }
};

const saveWelcomeState = () => {
  store.dispatch('setWelcomeMessage', welcomeMessage.value);
  test.value.testStructure.welcomeMessage = welcomeMessage.value;
};

const saveLandingPage = () => {
  store.dispatch('setLandingPage', landingPage.value);
  test.value.testStructure.landingPage = landingPage.value;
};

const saveParticipantCamera = () => {
  store.dispatch('setParticipantCamera', participantCamera.value);
  test.value.testStructure.participantCamera = participantCamera.value;
};

const saveFinalMessage = () => {
  store.dispatch('setFinalMessage', finalMessage.value);
  test.value.testStructure.finalMessage = finalMessage.value;
};

onMounted(() => {
  getWelcome();
  getLandingPage();
  getParticipantCamera();
  getFinalMessage();

  if (type !== 'content' && type !== 'tabs') {
    console.error(`${type} type in EditUserTest.vue is not valid.`);
  }
  if (testStructure.value.postTest) {
    store.dispatch('setPostTest', testStructure.value.postTest);
  }
  if (testStructure.value.preTest) {
    store.dispatch('setPreTest', testStructure.value.preTest);
  }
  if (testStructure.value.consent) {
    store.dispatch('setConsent', testStructure.value.consent);
  }
});
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