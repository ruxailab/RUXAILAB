<template>
  <PageWrapper
    :title="$t('pages.settings.study_configuration')"
    :loading="loadingPage"
    :loading-text="$t('pages.settings.loading_settings')"
  >
    <!-- Actions Slot for Save Button -->
    <template #actions>
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="text-none font-weight-semibold rounded-s px-6"
        :loading="loading"
        :disabled="!localChanges"
        @click="submit()"
      >
        <v-icon start size="18"> mdi-check </v-icon>
        {{ $t('buttons.save') }}
      </v-btn>
    </template>

    <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('pages.settings.manage_test_settings') }}
      </p>
    </template>

    <!-- Main Content -->
    <Snackbar />
    <LeaveAlert @submit="onSubmit" />

    <v-dialog v-model="tempDialog" max-width="800">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center px-6 py-4">
          <v-icon color="primary" size="28" class="mr-3">
            mdi-file-document-plus-outline
          </v-icon>
          <h3 class="text-h5 font-weight-bold text-grey-darken-4">
            {{ $t('pages.settings.createTemplate') }}
          </h3>
          <v-spacer />
          <v-btn
            icon
            variant="flat"
            class="text-grey-darken-1"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-form ref="tempform" class="pa-6">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="template.templateTitle"
                autofocus
                :label="$t('common.title')"
                :rules="titleRequired"
                counter="200"
                maxlength="200"
                variant="outlined"
                density="comfortable"
                :placeholder="$t('TestDialog.template.title')"
                class="mb-4"
              />
              <v-textarea
                v-model="template.templateDescription"
                :label="$t('common.description')"
                variant="outlined"
                rows="4"
                density="comfortable"
                :placeholder="$t('TestDialog.template.description')"
                class="mb-4"
              />
              <v-checkbox
                v-model="template.isTemplatePublic"
                :label="$t('TestDialog.template.public')"
                color="primary"
                hide-details
                class="mt-0 pt-0"
              />
            </v-col>
          </v-row>
          <v-divider class="my-6" />
          <v-card-actions class="px-0 pt-0">
            <v-spacer />
            <v-btn
              class="text-none rounded-lg px-6"
              variant="outlined"
              color="grey-darken-2"
              height="44"
              @click="closeDialog()"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              :disabled="hasTemplate ? true : false"
              color="primary"
              height="44"
              class="text-none rounded-lg ml-3"
              @click="createTemplate()"
            >
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <div class="settings-layout">
      <div class="content-wrapper">
        <div class="left-column">
          <v-card class="info-card" elevation="0" height="auto">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div
                class="header-icon bg-grey-lighten-4 rounded-lg d-flex align-center justify-center"
              >
                <v-icon color="primary" size="20">
                  mdi-information-outline
                </v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
                  {{ $t('pages.settings.basic_information') }}
                </h3>
                <p class="text-caption text-grey-darken-1">
                  {{ $t('pages.settings.configure_test_details') }}
                </p>
              </div>
            </div>
            <v-card-text class="py-6">
              <FormTestDescription
                v-if="object"
                ref="form1"
                :test="object"
                :lock="true"
                @val-form="validate"
                @update:test="updateObject"
              />
            </v-card-text>
          </v-card>
        </div>

        <div class="right-column">
          <v-card class="advanced-card" elevation="0">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div
                class="header-icon bg-blue-lighten-5 rounded-lg d-flex align-center justify-center"
              >
                <v-icon color="secondary" size="20"> mdi-cog-outline </v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
                  {{ $t('pages.settings.advanced_settings') }}
                </h3>
                <p class="text-caption text-grey-darken-1">
                  {{ $t('pages.settings.fine_tune_configuration') }}
                </p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div class="d-flex flex-column ga-5">
                <div
                  class="pa-5 border rounded-lg bg-grey-lighten-5 position-relative"
                >
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon color="primary" size="18"> mdi-earth </v-icon>
                    <span
                      class="font-weight-semibold text-subtitle-2 text-grey-darken-4"
                      >{{ $t('pages.settings.public_access') }}</span
                    >
                  </div>
                  <p class="text-caption text-grey-darken-1 mb-4">
                    {{ $t('pages.settings.allow_users_view') }}
                  </p>
                  <v-switch
                    v-model="object.isPublic"
                    color="primary"
                    hide-details
                    inset
                    class="position-absolute"
                    style="top: 20px; right: 20px"
                    @update:model-value="
                      store.commit('SET_LOCAL_CHANGES', true)
                    "
                  />
                </div>
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon color="primary" size="18"> mdi-list-status </v-icon>
                    <span
                      class="font-weight-semibold text-subtitle-2 text-grey-darken-4"
                      >{{ $t('pages.settings.test_status') }}</span
                    >
                  </div>
                  <v-select
                    v-model="object.status"
                    :items="statusOptions"
                    :label="$t('pages.settings.select_status')"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    @update:model-value="
                      store.commit('SET_LOCAL_CHANGES', true)
                    "
                  />
                </div>
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon color="primary" size="18"> mdi-calendar </v-icon>
                    <span
                      class="font-weight-semibold text-subtitle-2 text-grey-darken-4"
                      >{{ $t('pages.settings.end_date') }}</span
                    >
                  </div>
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    max-width="290px"
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        :model-value="formattedEndDate"
                        :label="$t('pages.settings.select_end_date')"
                        variant="outlined"
                        density="comfortable"
                        readonly
                        clearable
                        hide-details
                        prepend-inner-icon="mdi-calendar"
                        v-bind="props"
                        @click:clear="clearEndDate"
                      />
                    </template>
                    <v-date-picker
                      v-model="datePickerModel"
                      @update:model-value="onDateChange"
                    />
                  </v-menu>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <v-card class="actions-card" elevation="0">
        <div class="d-flex align-start ga-3 pa-6 pb-0">
          <div
            class="header-icon bg-amber-lighten-5 rounded-lg d-flex align-center justify-center"
          >
            <v-icon color="amber-darken-2" size="20">
              mdi-lightning-bolt
            </v-icon>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
              {{ $t('pages.settings.quick_actions') }}
            </h3>
            <p class="text-caption text-grey-darken-1">
              {{ $t('pages.settings.perform_common_tasks') }}
            </p>
          </div>
        </div>
        <v-card-text class="py-6">
          <div class="d-flex ga-3 flex-wrap">
            <v-btn
              color="secondary"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="hasTemplate || !object"
              @click="tempDialog = true"
            >
              <v-icon start size="18"> mdi-file-document-plus-outline </v-icon>
              {{ $t('pages.settings.createTemplate') }}
            </v-btn>
            <v-btn
              color="orange-darken-1"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="!object"
              @click="duplicateStudy()"
            >
              <v-icon start size="18"> mdi-content-duplicate </v-icon>
              {{ $t('buttons.duplicateTest') }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="!object"
              @click="dialogDel = true"
            >
              <v-icon start size="18"> mdi-delete-outline </v-icon>
              {{ $t('pages.settings.deleteTest') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="dialogDel" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-start ga-4 pa-6 pb-0">
          <div
            class="dialog-icon bg-red-lighten-5 rounded-lg d-flex align-center justify-center"
          >
            <v-icon color="error" size="28"> mdi-alert-circle-outline </v-icon>
          </div>
          <div>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">
              {{ $t('pages.settings.confirm_deletion') }}
            </h3>
            <p class="text-subtitle-2 text-grey-darken-1">
              {{ $t('pages.settings.action_cannot_be_undone') }}
            </p>
          </div>
        </v-card-title>
        <v-card-text class="py-4 px-6">
          <p class="text-body-2 text-grey-darken-1">
            {{ dialogText }} {{ $t('pages.settings.delete_warning') }}
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-end ga-3">
          <v-btn
            variant="outlined"
            color="grey-darken-2"
            :disabled="loading"
            class="text-none rounded-lg px-6"
            height="44"
            @click="dialogDel = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="loading"
            class="text-none rounded-lg px-6"
            height="44"
            @click="deleteStudy(object)"
          >
            <v-icon start size="16"> mdi-delete </v-icon>
            {{ $t('pages.settings.delete_forever') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AccessNotAllowed v-if="!loadingPage && !object" />
  </PageWrapper>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
} from 'vue'
import { useStore } from 'vuex'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import FormTestDescription from '@/shared/components/FormTestDescription'
import Snackbar from '@/shared/components/Snackbar'
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert'
import AccessNotAllowed from '@/shared/views/AccessNotAllowed'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import TemplateHeader from '@/shared/models/TemplateHeader'
import TemplateAuthor from '@/shared/models/TemplateAuthor'
import TemplateBody from '@/shared/models/TemplateBody'
import Template from '@/shared/models/Template'
import { useI18n } from 'vue-i18n'
import { instantiateStudyByType } from '../constants/methodDefinitions'
import StudyAdmin from '@/shared/models/StudyAdmin'
import { showSuccess, showError, showWarning } from '@/shared/utils/toast'

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const template = ref({
  templateTitle: '',
  templateDescription: '',
  isTemplatePublic: false,
})
const object = ref({
  testTitle: '',
  testDescription: '',
  testType: 'MANUAL',
  status: 'draft',
  endDate: null,
  isPublic: false,
  websiteUrl: '',
  testAdmin: null,
  collaborators: {},
  configData: {},
  progress: {},
})
const valids = ref([false, true, true])
const dialogDel = ref(false)
const loading = ref(false)
const loadingPage = ref(true)
const tempDialog = ref(false)
const dateMenu = ref(false)
const form1 = ref(null)
const tempform = ref(null)

const statusOptions = computed(() => [
  { title: t('studyCreation.details.status.active'), value: 'active' },
  { title: t('studyCreation.details.status.pending'), value: 'pending' },
  { title: t('studyCreation.details.status.finished'), value: 'finished' },
  { title: t('studyCreation.details.status.upcoming'), value: 'upcoming' },
])

const titleRequired = [
  (v) => !!v.trim() || t('errors.fieldRequired'),
  (v) =>
    v.length <= 200 || t('studyCreation.details.validation.max200Characters'),
]

const localChanges = computed({
  get: () => store.state.localChanges,
  set: (value) => store.commit('SET_LOCAL_CHANGES', value),
})
const test = computed({
  get: () => store.getters.test,
  set: (val) => store.commit('SET_TEST', val),
})
const user = computed(() => store.getters.user)
// const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);
// const reports = computed(() => store.getters.reports || []);
// const cooperators = computed(() => store.getters.cooperators || {});
const dialogText = computed(() => {
  if (test.value) {
    return t('alerts.deleteTest', { testTitle: test.value.testTitle })
  }
  return t('alerts.deleteTest')
})
const hasTemplate = computed(() => {
  if (object.value && 'template' in object.value) {
    return object.value.template !== null
  }
  return false
})

const formattedEndDate = computed(() => {
  if (object.value?.endDate) {
    try {
      const date = new Date(object.value.endDate)

      if (Number.isNaN(date.getTime())) {
        return ''
      }
      return date.toLocaleDateString()
    } catch (error) {
      return error
    }
  }
  return ''
})

const datePickerModel = computed({
  get() {
    if (object.value?.endDate) {
      if (typeof object.value.endDate === 'number') {
        const date = new Date(object.value.endDate)
        if (!Number.isNaN(date.getTime())) {
          return date
        }
      }
      const date = new Date(object.value.endDate)
      if (!Number.isNaN(date.getTime())) {
        return date
      }
    }
    return null
  },
  set(newDate) {
    if (newDate && object.value) {
      object.value.endDate = newDate.getTime()
      store.commit('SET_LOCAL_CHANGES', true)
    }
  },
})

const createObjectFromTest = (testData) => {
  if (!testData) return null

  const isAccessibilityTest =
    testData.testType === 'AUTOMATIC' || testData.testType === 'MANUAL'

  if (isAccessibilityTest) {
    return {
      ...testData,
      testTitle: testData.title || testData.testTitle || testData.name || '',
      testDescription:
        testData.description || testData.testDescription || testData.desc || '',
      testType: testData.testType,
      status: testData.status || 'draft',
      endDate: testData.endDate || testData.end_date || null,
      isPublic:
        testData.isPublic !== undefined ? Boolean(testData.isPublic) : false,
      websiteUrl:
        testData.websiteUrl || testData.website_url || testData.url || '',
      testAdmin: testData.testAdmin || testData.admin || null,
      collaborators: testData.collaborators || testData.cooperators || {},
      configData: testData.configData || testData.config || {},
      progress: testData.progress || testData.progressData || {},
    }
  } else {
    return {
      ...testData,
    }
  }
}

watch(
  test,
  (newTest) => {
    if (newTest) {
      const mappedObject = createObjectFromTest(newTest)
      if (mappedObject) {
        object.value = mappedObject
      }
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (props.id) {
    try {
      await store.dispatch('getStudy', { id: props.id })

      const testData = store.getters.test
      if (!testData) {
        showError('errors.globalError')
      }
    } catch (error) {
      showError('errors.globalError')
      return error
    }
  } else {
    showError('errors.globalError')
  }

  loadingPage.value = false
})

onBeforeMount(() => {
  store.commit('SET_LOCAL_CHANGES', false)
  store.commit('SET_DIALOG_LEAVE', false)
  window.addEventListener('beforeunload', preventNav)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav)
})

onBeforeRouteLeave((to, _from) => {
  if (localChanges.value) {
    store.commit('SET_DIALOG_LEAVE', true)
    store.commit('SET_PATH_TO', to.name)
    return false
  }
  return true
})

const validate = (valid, index) => {
  valids.value[index] = valid
}

const onSubmit = async () => {
  await submit()
  store.commit('SET_LOCAL_CHANGES', false)
  store.commit('SET_DIALOG_LEAVE', false)
  router.push({ name: store.state.pathTo })
}

const submit = async () => {
  const title = object.value.testTitle
  if (title.length > 0 && title.length < 200) {
    loading.value = true
    try {
      const study = instantiateStudyByType(object.value.testType, object.value)
      await store.dispatch('updateStudy', study)
      await store.dispatch('getStudy', { id: props.id })
      store.commit('SET_LOCAL_CHANGES', false)
      showSuccess('alerts.savedChanges')
    } catch (error) {
      showError('errors.globalError')
      console.error('Error saving test:', error)
    } finally {
      loading.value = false
    }
  } else if (title.length >= 200) {
    showWarning('studyCreation.details.validation.max200Characters')
  } else {
    showWarning('studyCreation.details.validation.enterTitle')
  }
}

const preventNav = (event) => {
  if (!localChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

// function logCurrentState() {
//   // This function can be used for debugging if needed
// }

const deleteStudy = async (item) => {
  loading.value = true
  try {
    const auxUser = { ...user.value }
    delete auxUser.myTests[item.id]
    item.auxUser = auxUser
    await store.dispatch('deleteStudy', item)
    showSuccess('alerts.genericSuccess')
    router.push({ name: 'Admin' })
  } catch (error) {
    showError('errors.globalError')
  } finally {
    loading.value = false
    dialogDel.value = false
  }
}

const createTemplate = async () => {
  const { valid } = await tempform.value.validate()
  if (!valid) {
    showWarning('errors.fieldRequired')
    return
  }

  loading.value = true
  try {
    const tempHeader = new TemplateHeader({
      creationDate: Date.now(),
      updateDate: Date.now(),
      isTemplatePublic: template.value.isTemplatePublic,
      templateDescription: template.value.templateDescription,
      templateTitle: template.value.templateTitle,
      templateType: test.value.testType,
      templateSubType: test.value.subType || null,
      templateVersion: '1.0.0',
      templateAuthor: new TemplateAuthor({
        userEmail: test.value.testAdmin.email,
        userDocId: test.value.testAdmin.userDocId,
      }),
    })

    const tempBody = new TemplateBody(test.value)
    const templateObj = new Template({
      id: null,
      header: tempHeader,
      body: tempBody,
    })

    await store.dispatch('createTemplate', templateObj)
    showSuccess('alerts.genericSuccess')
    closeDialog()
  } catch (error) {
    showError('errors.globalError')
    return error
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  tempDialog.value = false
  if (tempform.value) {
    tempform.value.resetValidation()
  }
  template.value = {
    templateTitle: '',
    templateDescription: '',
    isTemplatePublic: false,
  }
}

const updateObject = (newObject) => {
  object.value = { ...newObject }
  store.commit('SET_LOCAL_CHANGES', true)
}

const onDateChange = (date) => {
  // console.log('Date picker changed to:', date);
  dateMenu.value = false
}

const clearEndDate = () => {
  if (object.value) {
    object.value.endDate = null
    store.commit('SET_LOCAL_CHANGES', true)
  }
}

const duplicateStudy = async () => {
  loading.value = true
  try {
    const rawData = {
      testTitle: t('buttons.duplicateTest') + ' ' + test.value.testTitle,
      testDescription: test.value.testDescription,
      testType: test.value.testType,
      subType: test.value.subType,
      testStructure: test.value.testStructure,
      testOptions: test.value.testOptions,
      id: null,
      testAdmin: new StudyAdmin({
        userDocId: user.value.id,
        email: user.value.email,
      }),
      creationDate: Date.now(),
      updateDate: Date.now(),
      status: test.value.status,
      endDate: test.value.endDate,
    }

    const study = instantiateStudyByType(rawData.testType, rawData)

    await store.dispatch('duplicateStudy', {
      test: study,
      answer: testAnswerDocument.value,
    })
    showSuccess('alerts.genericSuccess')
    router.push('/admin')
  } catch (error) {
    showError('errors.globalError')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem 0;
}

/* Content Layout */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Styles */
.info-card,
.advanced-card,
.actions-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.info-card:hover,
.advanced-card:hover,
.actions-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
}

/* Quick Actions Horizontal Layout */
.actions-card {
  width: 100%;
  margin-top: 24px;
}

.actions-card .d-flex {
  flex-direction: row;
  gap: 12px;
}

.actions-card .v-btn {
  flex: 1;
  min-width: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .actions-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .actions-card .d-flex {
    flex-direction: column;
    gap: 12px;
  }

  .actions-card .v-btn {
    flex: none;
    width: 100%;
  }

  .actions-card {
    width: 100%;
  }
}
</style>
