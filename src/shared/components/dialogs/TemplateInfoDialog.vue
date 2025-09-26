<template>
  <div>
    <v-dialog
      v-if="template?.header"
      :model-value="dialog"
      max-width="700px"
      persistent
      @update:model-value="$emit('update:dialog', $event)"
    >
      <v-card
        class="pa-6"
        rounded="xl"
        elevation="6"
      >
        <v-card-title class="text-h5 font-weight-bold pa-0 mb-4">
          {{ step === 1 ? $t('pages.createTest.templateInfo') : $t('pages.createTest.create') }}
        </v-card-title>

        <!-- Step Navigation -->
        <v-row
          v-if="allowCreate"
          class="mb-4"
          justify="center"
        >
          <v-btn-toggle
            v-model="step"
            mandatory
            divided
            color="primary"
            variant="outlined"
            class="rounded-lg"
          >
            <v-btn
              :value="1"
              class="text-capitalize"
              width="200px"
            >
              {{ $t('pages.createTest.templateInfo') }}
            </v-btn>
            <v-btn
              :value="2"
              class="text-capitalize"
              width="200px"
            >
              {{ $t('pages.createTest.templateTitle') }}
            </v-btn>
          </v-btn-toggle>
        </v-row>

        <!-- Step Content -->
        <v-card-text class="pa-0">
          <div
            v-if="step === 1"
            class="px-4"
          >
            <v-row
              align="center"
              justify="space-between"
            >
              <v-col cols="12">
                <h3 class="text-h6 font-weight-bold mb-2">
                  {{ template.header.templateTitle }}
                </h3>
                <p class="text-body-2 text-grey-darken-2 mb-0">
                  {{ $t('pages.listTests.createdBy') }} {{ author }}
                  {{
                    template.header.templateVersion === '1.0.0'
                      ? ` on ${getFormattedDate(template.header.creationDate)}`
                      : ` - Last updated: ${getFormattedDate(template.header.updateDate)}`
                  }}
                  ({{ $t('pages.listTests.version') + ' ' + template.header.templateVersion }})
                </p>
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <p class="text-body-1 mb-6">
              {{
                template.header.templateDescription
                  ? template.header.templateDescription
                  : $t('pages.createTest.noDescription')
              }}
            </p>

            <v-row
              justify="space-between"
              class="ma-0"
            >
              <v-btn
                v-if="isMyTemplate"
                color="error"
                variant="text"
                class="text-capitalize"
                @click="deleteTemplate"
              >
                <v-icon
                  start
                  size="small"
                >
                  mdi-delete
                </v-icon>
                {{ $t('buttons.delete') }}
              </v-btn>

              <div
                class="d-flex"
                style="gap: 12px"
              >
                <v-btn
                  color="grey-darken-2"
                  variant="outlined"
                  class="text-capitalize flex-grow-1"
                  @click="reset"
                >
                  {{ $t('buttons.close') }}
                </v-btn>
                <v-btn
                  v-if="allowCreate"
                  color="primary"
                  variant="flat"
                  class="text-capitalize flex-grow-1"
                  @click="step = 2"
                >
                  {{ $t('buttons.next') }}
                  <v-icon
                    end
                    size="small"
                  >
                    mdi-arrow-right
                  </v-icon>
                </v-btn>
              </div>
            </v-row>
          </div>

          <div
            v-if="step === 2"
            class="px-4"
          >
            <FormTestDescription
              ref="formRef"
              class="mb-6"
              :test="localTest"
              :lock="true"
              @update:test="updateLocalTest"
              @val-form="handleValForm"
            />

            <v-row
              justify="space-between"
              class="ma-0"
            >
              <v-btn
                color="grey-darken-2"
                variant="text"
                class="text-capitalize"
                @click="step = 1"
              >
                <v-icon
                  start
                  size="small"
                >
                  mdi-arrow-left
                </v-icon>
                {{ $t('buttons.previous') }}
              </v-btn>

              <div
                class="d-flex"
                style="gap: 12px"
              >
                <v-btn
                  color="grey-darken-2"
                  variant="outlined"
                  class="text-capitalize flex-grow-1"
                  @click="reset"
                >
                  {{ $t('buttons.cancel') }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  class="text-capitalize flex-grow-1"
                  @click="validate"
                >
                  {{ $t('buttons.create') }}
                  <v-icon
                    end
                    size="small"
                  >
                    mdi-check
                  </v-icon>
                </v-btn>
              </div>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FormTestDescription from '@/shared/components/FormTestDescription.vue';
import { getMethodManagerView, instantiateStudyByType } from '@/shared/constants/methodDefinitions';
import StudyAdmin from '@/shared/models/StudyAdmin';

const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
    default: false,
  },
  template: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  allowCreate: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:dialog', 'close']);

const store = useStore();
const router = useRouter();

const step = ref(1);
const isMyTemplate = ref(false);
const localTest = ref(null);
const formRef = ref(null);
const formValid = ref(false);

const mountTest = computed(() => {
  if (!props.template?.body) {
    console.warn('Template body is undefined:', props.template);
    return {};
  }

  const test = { ...props.template.body };
  if (!test.testType && props.template.body.testType) {
    test.testType = props.template.body.testType;
  }
  return test;
});

const author = computed(() => {
  return props.template?.header?.templateAuthor?.userEmail || '';
});

const user = computed(() => {
  return store.state.Auth.user;
});

watch(
  () => props.template,
  (newTemplate) => {
    isMyTemplate.value =
      newTemplate?.header?.templateAuthor?.userDocId === user.value?.id;
    localTest.value = mountTest.value ? { ...mountTest.value } : null;
  },
  { immediate: true, deep: true }
);

const deleteTemplate = async () => {
  if (!window.confirm('Are you sure you want to delete the template?')) return;

  try {
    await store.dispatch('deleteTemplate', props.template.id);
    reset();
  } catch (error) {
    console.error('Error deleting template:', error);
  }
};

const reset = () => {
  emit('close');
  if (formRef.value?.resetVal) {
    formRef.value.resetVal();
  }
  step.value = 1;
  localTest.value = null;
};

const updateLocalTest = (newTest) => {
  localTest.value = { ...newTest };
};

const handleValForm = (valid) => {
  formValid.value = valid;
};

const validate = async () => {
  if (!formRef.value?.validate()) {
    return;
  }

  if (!localTest.value) {
    console.error('localTest is not initialized');
    return;
  }

  try {
    const rawData = {
      ...localTest.value,
      id: null,
      testAdmin: new StudyAdmin({
        userDocId: user.value.id,
        email: user.value.email,
      }),
      templateDoc: props.template.id,
      creationDate: Date.now(),
      updateDate: Date.now(),
    };

    const study = instantiateStudyByType(rawData.testType ,rawData)
    const testId = await store.dispatch('createStudy', study);

    const methodView = getMethodManagerView(rawData.testType, rawData.subType)
    await router.push({ name: methodView, params: { id: testId } });
  } catch (error) {
    console.error('Error creating test:', error);
  }
};

const getFormattedDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>
