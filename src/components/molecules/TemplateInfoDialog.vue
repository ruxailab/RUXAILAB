<template>
  <div>
    <v-dialog
      v-if="template?.header"
      :model-value="dialog"
      max-width="80%"
      persistent
      @update:model-value="$emit('update:dialog', $event)"
    >
      <v-stepper
        v-model="step"
        style="background-color: #e8eaf2"
      >
        <v-stepper-header>
          <v-stepper-step
            color="#F9A826"
            :complete="step > 1"
            step="1"
          >
            {{ $t('pages.createTest.templateInfo') }}
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            v-if="allowCreate"
            color="#F9A826"
            step="2"
          >
            {{ $t('pages.createTest.templateTitle') }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-row
              align="center"
              justify="space-between"
            >
              <v-col
                v-if="template.header"
                cols="10"
              >
                <p class="dialog-title ma-0">
                  {{ template.header.templateTitle }}
                </p>
                <div class="text-caption ma-0">
                  {{ $t('pages.listTests.createdBy') }} {{ author }}
                  {{
                    template.header.templateVersion === '1.0.0'
                      ? ` on ${getFormattedDate(template.header.creationDate)}`
                      : ` - Last updated: ${getFormattedDate(
                          template.header.updateDate
                        )}`
                  }}
                  ({{
                    $t('pages.listTests.version') +
                    ' ' +
                    template.header.templateVersion
                  }})
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-2" />

            <div style="margin: 0px 0px 30px 0px">
              {{
                template.header.templateDescription
                  ? template.header.templateDescription
                  : $t('pages.createTest.noDescription')
              }}
            </div>

            <v-row
              justify="end"
              class="ma-0 pa-0"
            >
              <v-btn
                v-if="isMyTemplate"
                color="error"
                variant="outlined"
                style="position: absolute; left: 24px"
                @click="deleteTemplate"
              >
                {{ $t('buttons.delete') }}
                <v-icon end>mdi-delete</v-icon>
              </v-btn>

              <v-btn
                class="bg-error mr-2"
                @click="reset"
              >
                {{ $t('buttons.close') }}
              </v-btn>

              <v-btn
                v-if="allowCreate"
                class="bg-success"
                color="primary"
                @click="step = 2"
              >
                {{ $t('buttons.next') }}
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <p class="dialog-title ma-0">
              {{ $t('pages.createTest.create') }}
            </p>
            <v-divider class="my-2" />
            <FormTestDescription
              ref="formRef"
              style="margin: 0px 0px 20px 0px"
              :test="localTest"
              :lock="true"
              @update:test="updateLocalTest"
              @val-form="handleValForm"
            />
            <v-row
              justify="end"
              class="ma-0 pa-0"
            >
              <v-btn
                class="bg-warning"
                style="position: absolute; left: 24px"
                @click="step = 1"
              >
                {{ $t('buttons.previous') }}
              </v-btn>

              <v-btn
                class="bg-error mr-2"
                @click="reset"
              >
                {{ $t('buttons.cancel') }}
              </v-btn>
              <v-btn
                class="bg-success"
                color="primary"
                @click="validate"
              >
                {{ $t('buttons.create') }}
              </v-btn>
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FormTestDescription from '@/components/atoms/FormTestDescription.vue';
import Test from '@/models/Test';
import TestAdmin from '@/models/TestAdmin';

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
const { t } = useI18n();

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

const title = computed(() => {
  return props.template?.header?.templateTitle || '';
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
  if (!formRef.value?.valida()) {
    return;
  }

  if (!localTest.value) {
    console.error('localTest is not initialized');
    return;
  }

  try {
    const test = new Test({
      ...localTest.value,
      id: null,
      testAdmin: new TestAdmin({
        userDocId: user.value.id,
        email: user.value.email,
      }),
      templateDoc: props.template.id,
      creationDate: Date.now(),
      updateDate: Date.now(),
    });

    const testId = await store.dispatch('createNewTest', test);
    await router.push(`/managerview/${testId}`);
  } catch (error) {
    console.error('Error creating test:', error);
  }
};

const getFormattedDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>