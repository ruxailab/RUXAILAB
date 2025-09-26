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
          lg="10"
          xl="8"
        >
          <v-row>
            <!-- Basic Information Column -->
            <v-col
              cols="12"
              md="8"
            >
              <v-card
                class="custom-card"
                elevation="4"
              >
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
                        Basic Information
                      </h3>
                    </div>

                    <v-form
                      ref="form"
                      @submit.prevent="validate"
                    >
                      <v-text-field
                        v-model="test.title"
                        :rules="rules.title"
                        :label="testName"
                        placeholder="Enter a descriptive title for your study"
                        variant="outlined"
                        :counter="200"
                        prepend-inner-icon="mdi-format-title"
                        class="mb-4"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                      <v-textarea
                        v-model="test.description"
                        :rules="rules.description"
                        :label="testDescription"
                        placeholder="Describe the purpose and goals of your study"
                        variant="outlined"
                        :counter="600"
                        prepend-inner-icon="mdi-text"
                        class="mb-4"
                        @change="store.commit('SET_LOCAL_CHANGES', true)"
                      />
                      <div v-if="method == STUDY_TYPES.HEURISTIC">
                        <v-text-field
                          v-model="websiteDetails.siteName"
                          :rules="rules.siteName"
                          label="Website Name"
                          placeholder="Enter the website name"
                          variant="outlined"
                          :counter="200"
                          prepend-inner-icon="mdi-alpha-n-box"
                          class="mb-4"
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
                      </div>
                    </v-form>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Privacy Settings Column -->
            <v-col
              cols="12"
              md="4"
            >
              <v-card
                class="custom-card"
                elevation="4"
              >
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
                          Privacy Settings
                        </h3>
                        <p class="text-body-2 text-grey-darken-1 mt-1">
                          Control who can see your study
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
                          {{ test.isPublic ? 'Public Study' : 'Private Study' }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          {{ test.isPublic ? 'Visible to everyone' : 'Only invited users' }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      
                      <!-- Switch on separate row -->
                      <div class="d-flex justify-center">
                        <v-switch
                          v-model="test.isPublic"
                          color="primary"
                          hide-details
                          :label="test.isPublic ? 'Public' : 'Private'"
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
              <v-card
                class="custom-card"
                elevation="4"
              >
                <v-card-text class="pa-6">
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import StepperHeader from '@/features/ux_creation/StepperHeader.vue';
import SectionHeader from '@/features/ux_creation/SectionHeader.vue';
import BackButton from '@/features/ux_creation/components/BackButton.vue';
import { getMethodManagerView, instantiateStudyByType, STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';
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
    // Use unified submit function for accessibility tests too
    submitAccessibility();
  } else {
    submit();
  }
};

const submit = async () => {
  let testType = category.value == 'test' ? STUDY_TYPES.USER : STUDY_TYPES.HEURISTIC
  if (method.value === STUDY_TYPES.CARD_SORTING) testType = STUDY_TYPES.CARD_SORTING

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

  await store.dispatch('createStudy', newTest);
  isLoading.value = false;

  const testStore = store.getters.test;
  store.commit('RESET_STUDY_DETAILS');

  if (studyType.value === 'Accessibility') router.push('/sample');
  else {
    const methodView = getMethodManagerView(testType, newTest.subType)
    router.push({ name: methodView, params: { id: testStore } })
  }
};

const submitAccessibility = async () => {
  // Store the method value before it gets reset
  const selectedMethod = method.value;
  
  // Determine the test type based on method
  let testType = selectedMethod === 'AUTOMATIC' 
    ? STUDY_TYPES.ACCESSIBILITY_AUTOMATIC 
    : STUDY_TYPES.ACCESSIBILITY_MANUAL;

  isLoading.value = true;
  const user = store.getters.user;
  
  const rawData = {
    id: null,
    title: test.value.title,              // Use 'title' for accessibility tests
    description: test.value.description,  // Use 'description' for accessibility tests
    testType: testType,
    isPublic: test.value.isPublic || false, // Ensure isPublic is always set
    testAdmin: new StudyAdmin({
      userDocId: user.id,
      email: user.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
    status: 'draft',
    // Accessibility-specific properties
    websiteUrl: '',
    collaborators: {
      [user.id]: 'admin'
    }
  };

  try {
    const newTest = instantiateStudyByType(testType, rawData);
    const testId = await store.dispatch('createStudy', newTest);
    
    isLoading.value = false;
    store.commit('RESET_STUDY_DETAILS');
    
    console.log('Routing decision - selectedMethod:', selectedMethod);
    
    // Route to the appropriate accessibility page using the stored method value
    if (selectedMethod === 'AUTOMATIC') {
      router.push(`/accessibility/automatic/${testId}`);
    } else {
      router.push(`/accessibility/manual/${testId}`);
    }
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
