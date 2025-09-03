<template>
  <v-container
    fluid
    class="create-study-view"
  >
    <v-container class="py-6">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="4"
        :steps="steps"
      />

      <!-- Page Header -->
      <SectionHeader
        :title="heading"
        :subtitle="subHeading"
      />

      <!-- Main Content -->
      <v-row
        justify="center"
        class="mb-6"
      >
        <v-col
          cols="12"
          lg="8"
          xl="6"
        >
          <v-card
            class="custom-card"
            elevation="4"
          >
            <v-card-text class="pa-8">
              <!-- Basic Information -->
              <div class="mb-8">
                <div class="d-flex align-center mb-6">
                  <v-icon
                    icon="mdi-form-textbox"
                    class="mr-3"
                    color="primary"
                  />
                  <h3 class="text-h5 font-weight-medium">
                    Basic Information
                  </h3>
                </div>

                <v-form
                  ref="form"
                  @submit.prevent="validate"
                >
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="test.title"
                        :rules="rules.title"
                        :label="testName"
                        placeholder="Enter a descriptive title for your study"
                        variant="outlined"
                        :counter="200"
                        prepend-inner-icon="mdi-format-title"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="test.description"
                        :rules="rules.description"
                        :label="testDescription"
                        placeholder="Describe the purpose and goals of your study"
                        variant="outlined"
                        :counter="600"
                        prepend-inner-icon="mdi-text"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                    </v-col>
                    <v-col
                      v-if="method == STUDY_TYPES.HEURISTIC"
                      cols="12"
                    >
                      <v-text-field
                        v-model="websiteDetails.siteName"
                        :rules="rules.siteName"
                        label="Website Name"
                        placeholder="Enter the website name"
                        variant="outlined"
                        :counter="200"
                        prepend-inner-icon="mdi-alpha-n-box"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                      <v-text-field
                        v-model="websiteDetails.siteURL"
                        :rules="rules.siteUrl"
                        label="Website URL (optional)"
                        placeholder="Enter the website URL"
                        variant="outlined"
                        :counter="200"
                        prepend-inner-icon="mdi-link-variant"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </div>

              <v-divider class="mb-8" />

              <!-- Privacy Settings -->
              <div class="mb-8">
                <div class="d-flex align-center mb-6">
                  <v-icon
                    icon="mdi-shield-account"
                    class="mr-2"
                    color="primary"
                  />
                  <div>
                    <h3 class="text-h5 font-weight-medium">
                      Privacy Settings
                    </h3>
                    <p class="text-body-2 text-grey-darken-1 mt-1">
                      Control who can see your study
                    </p>
                  </div>
                </div>

                <v-list class="bg-transparent pa-0">
                  <v-list-item class="pa-0">
                    <template #prepend>
                      <v-icon
                        :icon="test.isPublic ? 'mdi-earth' : 'mdi-lock'"
                        :color="test.isPublic ? 'success' : 'warning'"
                        class="mr-4"
                      />
                    </template>

                    <v-list-item-title class="font-weight-medium">
                      {{ test.isPublic ? 'Public Study' : 'Private Study' }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      {{ test.isPublic ? 'Anyone can view and participate in this study' : 'Only you and invited participants can access this study' }}
                    </v-list-item-subtitle>

                    <template #append>
                      <v-switch
                        v-model="test.isPublic"
                        color="primary"
                        class="mr-4"
                        hide-details
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <v-divider class="mb-8" />

              <!-- Summary -->
              <div class="mb-8">
                <div class="d-flex align-center mb-6">
                  <v-icon
                    icon="mdi-clipboard-list"
                    class="mr-3"
                    color="primary"
                  />
                  <h3 class="text-h5 font-weight-medium">
                    Study Summary
                  </h3>
                </div>
                <v-card
                  variant="tonal"
                  color="primary"
                  class="pa-4"
                >
                  <v-list
                    class="bg-transparent pa-0"
                    density="compact"
                  >
                    <v-list-item class="pa-0 mb-2">
                      <v-list-item-title class="font-weight-medium">
                        Category:
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-capitalize">
                        {{ category }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="pa-0 mb-2">
                      <v-list-item-title class="font-weight-medium">
                        Method:
                      </v-list-item-title>
                      <v-list-item-subtitle>{{ method }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="pa-0">
                      <v-list-item-title class="font-weight-medium">
                        Type:
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ studyType === 'blank' ? 'Blank Study' : 'Template'
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>

              <div class="d-flex justify-space-between align-center">
                <BackButton
                  label="Back to Study Type"
                  adjust="start"
                  @back="goBack"
                />
                <v-btn
                  color="success"
                  size="large"
                  :loading="isLoading"
                  prepend-icon="mdi-plus"
                  class="px-8"
                  @click="validate"
                >
                  Create Study
                </v-btn>
              </div>
              <!-- ...existing code... -->
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import ManualAccessibilityTest from '@/ux/accessibility/models/ManualAccessibilityTest';
import AutomaticAccessibilityTest from '@/ux/accessibility/models/AutomaticAccessibilityTest';
import StepperHeader from '@/features/ux_creation/StepperHeader.vue';
import SectionHeader from '@/features/ux_creation/SectionHeader.vue';
import BackButton from '@/features/ux_creation/components/BackButton.vue';
import { instantiateStudyByType, STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';
import StudyAdmin from '@/shared/models/StudyAdmin';

const router = useRouter();
const store = useStore();
const toast = useToast();

const test = ref({
  title: '',
  description: '',
  isPublic: false,
  subType: '',
});

const websiteDetails = ref({
  siteName: '',
  siteURL: ''
})

const category = computed(() => store.state.Tests.studyCategory)
const method = computed(() => store.state.Tests.studyMethod)
const studyType = computed(() => store.state.Tests.studyType)

const rules = {
  title: [(v) => !!v || 'Enter a Title', (v) => v.length <= 200 || 'Max 200 characters'],
  description: [(v) => v.length <= 600 || 'Max 600 characters'],
  siteName: [(v) => !!v || 'Enter website name', (v) => v.length <= 200 || 'Max 200 characters'],
  siteUrl: [
    (v) => !!v || 'Enter website URL',
    (v) => {
      try {
        if (!v) return true;
        const url = new URL(v);
        return ['http:', 'https:'].includes(url.protocol) || 'URL must start with http:// or https://';
      } catch {
        return 'Enter a valid URL (e.g., https://example.com)';
      }
    }
  ],
};

const heading = 'Study Details';
const subHeading = 'Provide basic information about your study';
const testName = 'Study Title';
const testDescription = 'Study Description';
const isLoading = ref(false);

const steps = [
  { value: 1, title: 'Category', complete: true },
  { value: 2, title: 'Methods', complete: true },
  { value: 3, title: 'Study Type', complete: true },
  { value: 4, title: 'Details', complete: false }
];

const validate = () => {
  if (!test.value.title) {
    toast.warning('Enter a Title');
    return;
  }
  if (test.value.title.length > 200) {
    toast.warning('Title cannot exceed 200 characters');
    return;
  }
  if (test.value.description.length > 600) {
    toast.warning('Description cannot exceed 600 characters');
    return;
  }
  handleTestType();
};

const handleTestType = () => {
  const testCategory = category.value;
  if (testCategory === 'test') {
    const extraDetails = {}
    const testMethod = method.value;
    extraDetails.subType = testMethod
    test.value = { ...test.value, ...extraDetails };
    submit();
  } else if (testCategory === 'accessibility') {
    if (method.value === 'AUTOMATIC') {
      submitAutomaticAccessibility();
    } else if (method.value === 'MANUAL') {
      submitManualAccessibility();
    }
  } else {
    submit();
  }
};

const submit = async () => {
  let testType = category.value == 'test' ? STUDY_TYPES.USER : STUDY_TYPES.HEURISTIC
  if (method.value === 'CardSorting') {
    testType = STUDY_TYPES.CARD_SORTING
  }

  isLoading.value = true;
  const user = store.getters.user;
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

  const testId = await store.dispatch('createNewTest', newTest);
  isLoading.value = false;

  store.commit('RESET_STUDY_DETAILS');

  if (studyType.value === 'Accessibility') {
    router.push('/sample');
  } else {
    if (testType === STUDY_TYPES.CARD_SORTING) {
      return router.push(`/cardSorting/manager/${testId}`);
    } else if (testType === STUDY_TYPES.HEURISTIC) {
      return router.push(`/heuristic/manager/${testId}`);
    } else if (testType === STUDY_TYPES.USER) {
      if (test.value.subType === USER_STUDY_SUBTYPES.MODERATED) {
        return router.push(`/usertest/moderated/manager/${testId}`);
      } else if (test.value.subType === USER_STUDY_SUBTYPES.UNMODERATED) {
        return router.push(`/usertest/unmoderated/manager/${testId}`);
      }
    }
  }
};

const submitAutomaticAccessibility = async () => {
  isLoading.value = true;
  const user = store.getters.user;
  const newTest = new AutomaticAccessibilityTest({
    title: test.value.title,
    description: test.value.description,
    isPublic: test.value.isPublic || false,
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    status: 'draft',
    websiteUrl: '',
    collaborators: {
      [user.id]: 'admin'
    },
    type: 'AUTOMATIC'
  });
  try {
    const createdTest = await store.dispatch('automaticAccessibility/addTest', newTest);
    isLoading.value = false;
    store.commit('RESET_STUDY_DETAILS');
    router.push(`/accessibility/automatic/${createdTest.id}`);
  } catch (error) {
    isLoading.value = false;
    toast.error(error.message);
  }
};

const submitManualAccessibility = async () => {
  isLoading.value = true;
  const user = store.getters.user;
  const newTest = new ManualAccessibilityTest({
    title: test.value.title,
    description: test.value.description,
    isPublic: test.value.isPublic || false,
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    status: 'draft',
    websiteUrl: '',
    collaborators: {
      [user.id]: 'admin'
    }
  });
  try {
    const createdTest = await store.dispatch('manualAccessibility/createTest', newTest);
    isLoading.value = false;
    store.commit('RESET_STUDY_DETAILS');
    router.push(`/accessibility/manual/${createdTest.id}`);
  } catch (error) {
    isLoading.value = false;
    toast.error(error.message);
  }
};


const goBack = () => {
  router.push({ name: 'study-create-step3' })
};
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
