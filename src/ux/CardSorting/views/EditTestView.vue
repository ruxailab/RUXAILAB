<template>
  <PageWrapper title="Edit Test" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('CardSorting.customizeSettings') }}
      </p>
    </template>

    <v-container>
      <ButtonSave :visible="change" @click="save" />

      <div>
        <v-tabs
          v-model="index"
          bg-color="transparent"
          color="white"
          class="mb-4 pill-tabs"
          show-arrows
          density="compact"
          slider-color="transparent"
        >
          <v-tab
            :value="0"
            :class="{ 'active-pill': index === 0 }"
            rounded="pill"
            variant="text"
            class="mr-2"
          >
            {{ $t('CardSorting.test') }}
          </v-tab>
          <v-tab
            :value="1"
            :class="{ 'active-pill': index === 1 }"
            rounded="pill"
            variant="text"
            class="mr-2"
          >
            {{ $t('ModeratedTest.consentForm') }}
          </v-tab>
          <v-tab
            :value="2"
            :class="{ 'active-pill': index === 2 }"
            rounded="pill"
            variant="text"
            class="mr-2"
          >
            {{ $t('ModeratedTest.preTest') }}
          </v-tab>
          <v-tab
            :value="3"
            :class="{ 'active-pill': index === 3 }"
            rounded="pill"
            variant="text"
            class="mr-2"
          >
            {{ $t('CardSorting.categories') }}
          </v-tab>
          <v-tab
            :value="4"
            :class="{ 'active-pill': index === 4 }"
            rounded="pill"
            variant="text"
            class="mr-2"
          >
            {{ $t('CardSorting.cards') }}
          </v-tab>
          <v-tab
            :value="5"
            :class="{ 'active-pill': index === 5 }"
            rounded="pill"
            variant="text"
          >
            {{ $t('ModeratedTest.postTest') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="index" class="mt-4">
          <!-- TEST -->
          <v-window-item :value="0">
            <TestConfigForm
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              @update:welcome-message="
                ((welcomeMessage = $event), (change = true))
              "
              @update:final-message="((finalMessage = $event), (change = true))"
            />
          </v-window-item>

          <!-- CONSENT FORM -->
          <v-window-item :value="1">
            <TextareaForm
              v-model="consent"
              :title="$t('ModeratedTest.consentForm')"
              :subtitle="$t('ModeratedTest.consentFormSubtitle')"
              @update:value="((consent = $event), (change = true))"
            />
          </v-window-item>

          <!-- PRE-TEST -->
          <v-window-item :value="2">
            <v-card rounded="xxl">
              <UserVariables
                type="pre-test"
                @change="change = true"
                @update="store.dispatch('setPreTest', $event)"
              />
            </v-card>
          </v-window-item>

          <!-- CATEGORIES -->
          <v-window-item :value="3">
            <CategoriesEditCardSorting
              @change="change = true"
              @categories="categories = $event"
              @options="optionsCategories = $event"
            />
          </v-window-item>

          <!-- CARDS -->
          <v-window-item :value="4">
            <CardsEditCardSorting
              @change="change = true"
              @cards="cards = $event"
              @options="optionsCards = $event"
            />
          </v-window-item>

          <!-- POS-TEST -->
          <v-window-item :value="5">
            <v-card rounded="xxl">
              <UserVariables
                type="post-test"
                @change="change = true"
                @update="store.dispatch('setPostTest', $event)"
              />
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import UserVariables from '@/shared/components/UserVariables.vue'
import CardsEditCardSorting from '../components/CardsEditCardSorting.vue'
import CategoriesEditCardSorting from '../components/CategoriesEditCardSorting.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import TestConfigForm from '@/shared/components/TestConfigForm.vue'
import { CardSortingStudyCategory } from '../models/CardSortingStudyCategory'
import { CardSortingStudyCard } from '../models/CardSortingStudyCard'
import { CardSortingStudyOptions } from '../models/CardSortingStudyOptions'

// Variables
const index = ref(0)
const change = ref(false)
const welcomeMessage = ref('')
const finalMessage = ref('')
const consent = ref('')
const categories = ref([])
const cards = ref([])
const optionsCategories = ref({})
const optionsCards = ref({})

// Stores
const store = useStore()

// Computed
const test = computed(() => store.getters.test)

// Methods
const save = async () => {
  await submit()
  change.value = false
}

const submit = async () => {
  const testStructure = {
    welcomeMessage: welcomeMessage.value,
    finalMessage: finalMessage.value,
    preTest: store.getters.preTest,
    postTest: store.getters.postTest,
    consent: consent.value,
    cardSorting: {
      categories: categories.value.map((category) => category.toJson()),
      cards: cards.value.map((card) => card.toJson()),
      options: {
        card_description: optionsCards.value.card_description,
        card_image: optionsCards.value.card_image,
        category_description: optionsCategories.value.category_description,
        category_image: optionsCategories.value.category_image,
      },
    },
  }

  const rawData = { ...test.value, testStructure: testStructure }
  const study = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', study)
}

const getWelcome = () => {
  welcomeMessage.value = test.value.testStructure?.welcomeMessage || ''
}

const getFinalMessage = () => {
  finalMessage.value = test.value.testStructure?.finalMessage || ''
}

const getConsent = () => {
  consent.value = test.value.testStructure?.consent || ''
}

const getCategories = () => {
  if (!test.value.testStructure.cardSorting) return

  test.value.testStructure.cardSorting.categories.map((cat) => {
    categories.value.push(new CardSortingStudyCategory(cat))
  })
}

const getCards = () => {
  if (!test.value.testStructure.cardSorting) return

  test.value.testStructure.cardSorting.cards.map((card) => {
    cards.value.push(new CardSortingStudyCard(card))
  })
}

const getOptions = () => {
  if (!test.value.testStructure.cardSorting) return
  optionsCategories.value = new CardSortingStudyOptions(
    test.value.testStructure.cardSorting.options,
  )
  optionsCards.value = new CardSortingStudyOptions(
    test.value.testStructure.cardSorting.options,
  )
}

const getPreTest = () => {
  store.dispatch('setPreTest', test.value.testStructure?.preTest || [])
}

const getPostTest = () => {
  store.dispatch('setPostTest', test.value.testStructure?.postTest || [])
}

// Lifecycle
onMounted(() => {
  getWelcome()
  getFinalMessage()
  getConsent()
  getCategories()
  getCards()
  getOptions()
  getPreTest()
  getPostTest()
})
</script>

<style scoped>
.active-pill {
  background-color: #fca326 !important;
  color: white !important;
}

.pill-tabs :deep(.v-slide-group__content) {
  padding: 4px;
}
</style>
