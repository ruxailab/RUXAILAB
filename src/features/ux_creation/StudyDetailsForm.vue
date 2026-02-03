<template>
  <v-container fluid class="create-study-view">
    <v-container class="py-6">
      <!-- Stepper Header -->
      <StepperHeader :current-step="4" :steps="steps" />

      <!-- Page Header -->
      <SectionHeader
        :title="$t('studyCreation.studyDetails')"
        :subtitle="$t('studyCreation.provideStudyInfo')"
      />

      <!-- Main Content -->
      <v-row justify="center" class="mb-6">
        <v-col cols="12" lg="10" xl="8">
          <v-row>
            <!-- Basic Information Column -->
            <v-col cols="12" md="8">
              <v-card class="custom-card" elevation="4">
                <v-card-text class="pa-8">
                  <!-- Basic Information -->
                  <div class="mb-0">
                    <div class="d-flex align-center mb-6">
                      <v-icon
                        icon="mdi-form-textbox"
                        class="mr-3"
                        color="primary"
                      />
                      <h3 class="text-h5 font-weight-medium">
                        {{ $t('studyCreation.details.basicInformation') }}
                      </h3>
                    </div>

                    <v-form ref="form" @submit.prevent="validate">
                      <v-text-field
                        v-model="test.title"
                        :rules="[
                          (v) => !!v || $t('studyCreation.details.validation.enterTitle'),
                        ]"
                        :label="$t('studyCreation.details.studyTitle')"
                        :placeholder="$t('studyCreation.details.enterTitle')"
                        variant="outlined"
                        :counter="200"
                        maxlength="200"
                        :error="test.title?.length === 200"
                        :error-messages="test.title?.length === 200 ? $t('studyCreation.details.validation.max200Characters') : []"
                        prepend-inner-icon="mdi-format-title"
                        class="mb-4"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                      <v-textarea
                        v-model="test.description"
                        :label="$t('studyCreation.details.studyDescription')"
                        :placeholder="
                          $t('studyCreation.details.enterDescription')
                        "
                        variant="outlined"
                        :counter="600"
                        maxlength="600"
                        :error="test.description?.length === 600"
                        :error-messages="test.description?.length === 600 ? $t('studyCreation.details.validation.max600Characters') : []"
                        prepend-inner-icon="mdi-text"
                        class="mb-4"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                      <div v-if="method == STUDY_TYPES.HEURISTIC">
                        <v-text-field
                          v-model="websiteDetails.siteName"
                          :rules="[
                            (v) =>
                              !!v ||
                              $t(
                                'studyCreation.details.validation.enterWebsiteName',
                              ),
                            (v) =>
                              v.length <= 200 ||
                              $t(
                                'studyCreation.details.validation.max200Characters',
                              ),
                          ]"
                          :label="$t('studyCreation.details.websiteName')"
                          :placeholder="
                            $t('studyCreation.details.enterWebsiteName')
                          "
                          variant="outlined"
                          :counter="200"
                          maxlength="200"
                          :error="websiteDetails.siteName?.length === 200"
                          :error-messages="websiteDetails.siteName?.length === 200 ? $t('studyCreation.details.validation.max200Characters') : []"
                          prepend-inner-icon="mdi-alpha-n-box"
                          class="mb-4"
                          @change="store.commit('SET_LOCAL_CHANGES', true)"
                        />
                        <v-text-field
                          v-model="websiteDetails.siteURL"
                          :rules="[
                            (v) =>
                              !!v ||
                              $t(
                                'studyCreation.details.validation.enterWebsiteUrl',
                              ),
                            (v) => {
                              try {
                                if (!v) return true
                                const url = new URL(v)
                                return (
                                  ['http:', 'https:'].includes(url.protocol) ||
                                  $t(
                                    'studyCreation.details.validation.urlProtocol',
                                  )
                                )
                              } catch {
                                return $t(
                                  'studyCreation.details.validation.validUrl',
                                )
                              }
                            },
                          ]"
                          :label="$t('studyCreation.details.websiteUrl')"
                          :placeholder="
                            $t('studyCreation.details.enterWebsiteUrl')
                          "
                          variant="outlined"
                          :counter="200"
                           maxlength="200"
                          :error="websiteDetails.siteURL?.length === 200"
                          :error-messages="websiteDetails.siteURL?.length === 200 ? $t('studyCreation.details.validation.max200Characters') : []"
                          prepend-inner-icon="mdi-link-variant"
                          @change="store.commit('SET_LOCAL_CHANGES', true)"
                        />
                      </div>
                    </v-form>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Privacy Settings Column -->
            <v-col cols="12" md="4">
              <v-card class="custom-card" elevation="4">
                <v-card-text class="pa-8">
                  <!-- Privacy Settings -->
                  <div class="mb-0">
                    <div class="d-flex align-center mb-6">
                      <v-icon
                        icon="mdi-shield-account"
                        class="mr-2"
                        color="primary"
                      />
                      <div>
                        <h3 class="text-h5 font-weight-medium">
                          {{ $t('studyCreation.details.privacySettings') }}
                        </h3>
                        <p class="text-body-2 text-grey-darken-1 mt-1">
                          {{ $t('studyCreation.details.controlVisibility') }}
                        </p>
                      </div>
                    </div>

                    <v-list class="bg-transparent pa-0">
                      <v-list-item class="pa-0 mb-4">
                        <template #prepend>
                          <v-icon
                            :icon="test.isPublic ? 'mdi-earth' : 'mdi-lock'"
                            :color="test.isPublic ? 'success' : 'warning'"
                            class="mr-0"
                          />
                        </template>

                        <v-list-item-title class="font-weight-medium">
                          {{
                            test.isPublic
                              ? $t('studyCreation.details.publicStudy')
                              : $t('studyCreation.details.privateStudy')
                          }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          {{
                            test.isPublic
                              ? $t('studyCreation.details.visibleToEveryone')
                              : $t('studyCreation.details.onlyInvitedUsers')
                          }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <!-- Switch on separate row -->
                      <div class="d-flex justify-center">
                        <v-switch
                          v-model="test.isPublic"
                          color="primary"
                          hide-details
                          :label="
                            test.isPublic
                              ? $t('studyCreation.details.public')
                              : $t('studyCreation.details.private')
                          "
                        />
                      </div>
                    </v-list>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Action Buttons -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card class="custom-card" elevation="4">
                <v-card-text class="pa-6">
                  <div
                    class="d-flex flex-column-reverse flex-sm-row justify-sm-space-between align-sm-center"
                  >
                    <!-- Back button (goes below on mobile) -->
                    <div class="w-100 w-sm-auto mt-3 mt-sm-0">
                      <BackButton
                        :label="$t('studyCreation.backToStudyType')"
                        adjust="start"
                        @back="goBack"
                      />
                    </div>

                    <!-- Create button (goes above on mobile) -->
                    <div class="w-100 w-sm-auto">
                      <v-btn
                        color="success"
                        size="large"
                        :loading="isLoading"
                        prepend-icon="mdi-plus"
                        block
                        @click="validate"
                      >
                        {{ $t('studyCreation.createStudy') }}
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import StepperHeader from '@/features/ux_creation/StepperHeader.vue'
import SectionHeader from '@/features/ux_creation/SectionHeader.vue'
import BackButton from '@/features/ux_creation/components/BackButton.vue'
import {
  getMethodManagerView,
  instantiateStudyByType,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'
import StudyAdmin from '@/shared/models/StudyAdmin'
import { showError, showWarning } from '@/shared/utils/toast'

const router = useRouter()
const store = useStore()
const { t } = useI18n()

const test = ref({
  title: '',
  description: '',
  isPublic: false,
  subType: '',
})

const websiteDetails = ref({
  siteName: '',
  siteURL: '',
})

const category = computed(() => store.state.Tests.studyCategory)
const method = computed(() => store.state.Tests.studyMethod)
const studyType = computed(() => store.state.Tests.studyType)
const isLoading = ref(false)

const steps = computed(() => [
  { value: 1, title: t('studyCreation.steps.category'), complete: true },
  { value: 2, title: t('studyCreation.steps.methods'), complete: true },
  { value: 3, title: t('studyCreation.steps.studyType'), complete: true },
  { value: 4, title: t('studyCreation.steps.details'), complete: false },
])

const validate = () => {
  if (!test.value.title) {
    showWarning('studyCreation.details.validation.enterTitle')
    return
  }
  if (test.value.title.length > 200) {
    showWarning('studyCreation.details.validation.max200Characters')
    return
  }
  if (test.value.description.length > 600) {
    showWarning('studyCreation.details.validation.max600Characters')
    return
  }
  handleTestType()
}

const handleTestType = () => {
  const testCategory = category.value
  if (testCategory === 'test') {
    const extraDetails = {}
    const testMethod = method.value
    extraDetails.subType = testMethod
    test.value = { ...test.value, ...extraDetails }
    submit()
  } else if (testCategory === 'accessibility') {
    submitAccessibility()
  } else {
    submit()
  }
}

const submit = async () => {
  let testType =
    category.value == 'test' ? STUDY_TYPES.USER : STUDY_TYPES.HEURISTIC
  if (method.value === STUDY_TYPES.CARD_SORTING)
    testType = STUDY_TYPES.CARD_SORTING

  isLoading.value = true
  const user = store.getters.user
  const rawData = {
    id: null,
    testTitle: test.value.title,
    testDescription: test.value.description,
    testType: testType,
    isPublic: test.value.isPublic,
    subType: test.value.subType,
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
    status: 'active',
  }
  const newTest = instantiateStudyByType(testType, rawData)

  const testId = await store.dispatch('createStudy', newTest)
  isLoading.value = false

  store.commit('RESET_STUDY_DETAILS')

  if (studyType.value === 'Accessibility') router.push('/sample')
  else {
    const methodView = getMethodManagerView(testType, newTest.subType)
    if (testId) {
      router.push({ name: methodView, params: { id: testId } })
    }
  }
}

const submitAccessibility = async () => {
  const selectedMethod = method.value
  let testType =
    selectedMethod === 'AUTOMATIC'
      ? STUDY_TYPES.ACCESSIBILITY_AUTOMATIC
      : STUDY_TYPES.ACCESSIBILITY_MANUAL

  isLoading.value = true
  const user = store.getters.user

  const rawData = {
    id: null,
    title: test.value.title,
    description: test.value.description,
    testType: testType,
    isPublic: test.value.isPublic || false,
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
    status: 'draft',
    websiteUrl: '',
    collaborators: {
      [user.id]: 'admin',
    },
  }

  try {
    const newTest = instantiateStudyByType(testType, rawData)
    const testId = await store.dispatch('createStudy', newTest)

    isLoading.value = false
    store.commit('RESET_STUDY_DETAILS')

    if (selectedMethod === 'AUTOMATIC') {
      router.push(`/accessibility/automatic/${testId}`)
    } else {
      router.push(`/accessibility/manual/${testId}`)
    }
  } catch (error) {
    isLoading.value = false
    showError(error.message)
  }
}

const goBack = () => {
  router.push({ name: 'study-create-step3' })
}
</script>

<style scoped>
.create-study-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.custom-card {
  border-radius: 20px !important;
  border: 2px solid transparent !important;
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
</style>
