<template>
  <PageWrapper
    title="Edit Test"
    :side-gap="true"
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Customize the settings and preferences of your test
      </p>
    </template>

    <v-container>
      <Snackbar />
      <ButtonSave
        :visible="change"
        @click="save"
      />

      <div>
        <VTabs
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
        >
          <VTab @click="index = 0">
            {{ 'Test' }}
          </VTab>
          <VTab @click="index = 1">
            {{ $t('ModeratedTest.consentForm') }}
          </VTab>
          <VTab @click="index = 2">
            {{ $t('ModeratedTest.preTest') }}
          </VTab>
          <VTab @click="index = 3">
            {{ 'Categories' }}
          </VTab>
          <VTab @click="index = 4">
            {{ 'Cards' }}
          </VTab>
          <VTab @click="index = 5">
            {{ $t('ModeratedTest.postTest') }}
          </VTab>
        </VTabs>

        <VCol cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <VRow>
              <VCol cols="9">
                <TextareaForm
                  v-model="welcomeMessage"
                  :title="$t('ModeratedTest.welcomeMessage')"
                  :subtitle="$t('ModeratedTest.welcomeMessageDescription')"
                />

                <TextareaForm
                  v-model="finalMessage"
                  :title="$t('ModeratedTest.finalMessage')"
                  :subtitle="$t('ModeratedTest.finalMessageDescription')"
                />
              </VCol>

              <VCol cols="3">
                <v-card
                  flat
                  class="elevation-2 rounded-lg pa-6"
                >
                  <v-card-title class="text-h5 font-weight-bold mb-4 bg-on-surface">
                    {{ $t('ModeratedTest.participantCamera') }}
                  </v-card-title>
                  <v-card-text>
                    <v-radio-group
                      v-model="participantCamera"
                      class="pt-0"
                      @update:model-value="change = true"
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
                  </v-card-text>
                </v-card>
              </VCol>
            </VRow>
          </div>

          <!-- CONSENT FORM -->
          <v-card
            v-if="index === 1"
            rounded="xxl"
          >
            <TextareaForm
              v-model="consent"
              :title="$t('ModeratedTest.consentForm')"
              subtitle="Edit the consent text for the test. Changes are saved when you click the Save button."
            />
          </v-card>

          <!-- PRE-TEST -->
          <v-card
            v-if="index === 2"
            rounded="xxl"
          >
            <UserVariables
              type="pre-test"
              @update="preTest = $event"
              @change="change = true"
            />
          </v-card>

          <!-- CATEGORIES -->
          <div
            v-if="index === 3"
            rounded="xxl"
          >
            <CategoriesEditCardSorting
              @change="change = true"
              @categories="categories = $event"
              @options="optionsCategories = $event"
            />
          </div>

          <!-- CARDS -->
          <div
            v-if="index === 4"
            rounded="xxl"
          >
            <CardsEditCardSorting
              @change="change = true"
              @cards="cards = $event"
              @options="optionsCards = $event"
            />
          </div>

          <!-- POS-TEST -->
          <v-card
            v-if="index === 5"
            rounded="xxl"
          >
            <UserVariables
              type="post-test"
              @update="postTest = $event"
              @change="change = true"
            />
          </v-card>
        </VCol>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/components/atoms/ButtonSave.vue';
import Snackbar from '@/components/atoms/Snackbar.vue';
import TextareaForm from '@/shared/components/TextareaForm.vue';
import UserVariables from '@/features/UserTest/components/UserVariables.vue';
import CardsEditCardSorting from '@/components/organisms/CardsEditCardSorting.vue';
import CategoriesEditCardSorting from '@/components/organisms/CategoriesEditCardSorting.vue';
import PageWrapper from '@/components/template/PageWrapper.vue';
import Test from '@/models/Test';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

// Variables
const index = ref(0);
const change = ref(false);
const welcomeMessage = ref('')
const finalMessage = ref('')
const participantCamera = ref('')
const preTest = ref([])
const postTest = ref([])
const consent = ref('')
const categories = ref([])
const cards = ref([])
const optionsCategories = ref({})
const optionsCards = ref({})

// Stores
const store = useStore();

// Computed
const test = computed(() => store.getters.test)

// Methods
const save = async () => {
  await submit()
  change.value = false
}

const submit = async () => {
  const object = {
    testStructure: {
      welcomeMessage: welcomeMessage.value,
      finalMessage: finalMessage.value,
      participantCamera: participantCamera.value,
      preTest: preTest.value,
      postTest: postTest.value,
      consent: consent.value,
      cardSorting: {
        categories: categories.value,
        cards: cards.value,
        options: { ...optionsCards.value, ...optionsCategories.value}
      },
    }
  }

  const updatedTest = new Test({ ...test.value, ...object })
  await store.dispatch('updateTest', updatedTest)
}

const getWelcome = () => {
  welcomeMessage.value = test.value.testStructure?.welcomeMessage || ''
}

const getFinalMessage = () => {
  finalMessage.value = test.value.testStructure?.finalMessage || ''
}

const getParticipantCamera = () => {
  participantCamera.value = test.value.testStructure?.participantCamera || ''
}

const getConsent = () => {
  consent.value = test.value.testStructure?.consent || ''
}

// Lifecycle
onMounted(() => {
  getWelcome()
  getFinalMessage()
  getParticipantCamera()
  getConsent()
})
</script>
