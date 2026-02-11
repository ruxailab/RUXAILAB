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
        <VTabs bg-color="transparent" color="#FCA326" class="pb-0 mb-0">
          <VTab @click="index = 0">
            {{ $t('CardSorting.test') }}
          </VTab>
          <VTab @click="index = 1">
            {{ $t('ModeratedTest.consentForm') }}
          </VTab>
          <VTab @click="index = 2">
            {{ $t('ModeratedTest.preTest') }}
          </VTab>
          <VTab @click="index = 3">
            {{ $t('CardSorting.categories') }}
          </VTab>
          <VTab @click="index = 4">
            {{ $t('CardSorting.cards') }}
          </VTab>
          <VTab @click="index = 5">
            {{ $t('ModeratedTest.postTest') }}
          </VTab>
        </VTabs>

        <VCol cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <TestConfigForm
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              @update:welcome-message="
                ((welcomeMessage = $event), (change = true))
              "
              @update:final-message="((finalMessage = $event), (change = true))"
            />
          </div>

          <!-- CONSENT FORM -->
          <div v-if="index === 1" rounded="xxl">
            <TextareaForm
              v-model="consent"
              :title="$t('ModeratedTest.consentForm')"
              :subtitle="$t('ModeratedTest.consentFormSubtitle')"
              @update:value="((consent = $event), (change = true))"
            />
          </div>

          <!-- PRE-TEST -->
          <v-card v-if="index === 2" rounded="xxl">
            <UserVariables
              type="pre-test"
              @change="change = true"
              @update="store.dispatch('setPreTest', $event)"
            />
          </v-card>

          <!-- CATEGORIES -->
          <div v-if="index === 3" rounded="xxl">
            <CategoriesEditCardSorting
              @change="change = true"
              @categories="categories = $event"
              @options="optionsCategories = $event"
            />
          </div>

          <!-- CARDS -->
          <div v-if="index === 4" rounded="xxl">
            <CardsEditCardSorting
              @change="change = true"
              @cards="cards = $event"
              @options="optionsCards = $event"
            />
          </div>

          <!-- POS-TEST -->
          <v-card v-if="index === 5" rounded="xxl">
            <UserVariables
              type="post-test"
              @change="change = true"
              @update="store.dispatch('setPostTest', $event)"
            />
          </v-card>
        </VCol>
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
