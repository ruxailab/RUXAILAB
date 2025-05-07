<template>
  <v-container v-if="true">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert />
    <LeaveAlert @submit="onSubmit" />

    <!-- Delete Alert Dialog -->
    <v-dialog
      v-model="dialogDel"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-error text-white"
          primary-title
        >
          {{ $t('alerts.deleteTest') }}
        </v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="dialogDel = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            :loading="loading"
            variant="text"
            @click="deleteTest(object)"
          >
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog
      v-model="tempDialog"
      max-width="80%"
    >
      <v-card>
        <p class="dialog-title ma-2 pa-2">
          Create Template
        </p>
        <v-divider />
        <v-form
          ref="tempform"
          class="px-5"
        >
          <v-row
            justify="space-around"
            class="pa-2"
          >
            <v-col cols="12">
              <v-text-field
                :model-value="template.templateTitle"
                autofocus
                label="Title"
                :rules="titleRequired"
                counter="200"
                variant="outlined"
                density="compact"
                @update:model-value="updateTemplateTitle($event)"
              />

              <v-textarea
                :model-value="template.templateDescription"
                label="Description"
                variant="outlined"
                density="compact"
                @update:model-value="updateTemplateDescription($event)"
              />

              <v-checkbox
                :value="template.isTemplatePublic"
                label="Make template public to all users"
                color="#F9A826"
                @input="updateTemplate({ isTemplatePublic: $event })"
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="bg-error"
              @click="closeDialog()"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              variant="text"
              :disabled="hasTemplate ? true : false"
              class="bg-success"
              @click="createTemplate()"
            >
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ShowInfo :title="$t('pages.settings.title')">
      <template #content>
        <div>
          <v-card style="background: #f5f7ff">
            <v-col class="mb-1 pa-4 pb-1">
              <p class="subtitleView">
                {{ $t('pages.settings.currentTest') }}
              </p>
            </v-col>

            <v-divider />
            <FormTestDescription
              v-if="object"
              ref="form1"
              :test="object"
              :lock="true"
              @val-form="validate"
              @update:test="updateObject"
            />

            <v-row
              justify="space-around"
              class="mx-4 mb-3"
            >
              <v-spacer />
              <v-btn
                style="margin-right: 25px"
                variant="outlined"
                color="green"
                :disabled="hasTemplate || !object ? true : false"
                @click="tempDialog = true"
              >
                {{ $t('pages.settings.createTemplate') }}
              </v-btn>

              <v-btn
                style="margin-right: 40px"
                variant="outlined"
                color="green"
                @click="duplicateTest()"
              >
                {{ $t('buttons.duplicateTest') }}
              </v-btn>
            </v-row>

            <v-divider class="my-3 mx-2" />

            <v-row
              justify="center"
              class="mt-3"
            >
              <v-btn
                color="#f26363"
                class="text-white mb-4"
                style="justify-self: center"
                @click="dialogDel = true"
              >
                <v-icon start>
                  mdi-trash-can-outline
                </v-icon>
                {{ $t('pages.settings.deleteTest') }}
              </v-btn>
            </v-row>
          </v-card>

          <v-tooltip
            v-if="localChanges"
            location="left"
          >
            <template #activator="{ props }">
              <v-btn
                v-if="localChanges"
                size="large"
                icon
                position='fixed'
                location="bottom right"
                color="#F9A826"
                v-bind="props"
                @click="submit()"
              >
                <v-icon size="large">
                  mdi-content-save
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('buttons.save') }}</span>
          </v-tooltip>
        </div>
      </template>
    </ShowInfo>
  </v-container>
  <v-overlay
    v-else-if="loadingPage"
    v-model="loadingPage"
    class="text-center"
  >
    <v-progress-circular
      indeterminate
      color="#fca326"
      size="50"
    />
    <div class="white-text mt-3">
      Loading Settings
    </div>
  </v-overlay>

  <AccessNotAllowed v-else />
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import FormTestDescription from '@/components/atoms/FormTestDescription';
import Snackbar from '@/components/atoms/Snackbar';
import ShowInfo from '@/components/organisms/ShowInfo';
import LeaveAlert from '@/components/atoms/LeaveAlert';
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed';
import Test from '@/models/Test';
import TemplateHeader from '@/models/TemplateHeader';
import TemplateAuthor from '@/models/TemplateAuthor';
import TemplateBody from '@/models/TemplateBody';
import Template from '@/models/Template';
import TestAdmin from '@/models/TestAdmin';
import { useI18n } from 'vue-i18n'
import { useToast } from "vue-toastification"

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast()

const props = defineProps(['id']);

const template = ref({
  templateTitle: '',
  templateDescription: '',
  isTemplatePublic: false,
});
const object = ref(null);
const valids = ref([false, true, true]);
const dialogAlert = ref(false);
const dialogDel = ref(false);
const loading = ref(false);
const loadingPage = ref(true);
const tempDialog = ref(false);
const showSettings = ref(false);
const localChanges = ref(false);
const auxUser = ref(null);
const form1 = ref(null);
const tempform = ref(null);

const titleRequired = [
  v => !!v || t('errors.fieldRequired'),
  v => v.length <= 200 || 'Max 200 characters',
];

// Computed properties
const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);
const answers = computed(() => store.getters.answers || []);
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);
const answersNew = computed(() => {
  if (testAnswerDocument.value) {
    return Object.values(testAnswerDocument.value.heuristicAnswers);
  }
  return [];
});
const reports = computed(() => store.getters.reports || []);
const cooperators = computed(() => store.getters.cooperators || {});
const dialogText = computed(() => {
  if (test.value) {
    return `Are you sure you want to delete your test "${test.value.testTitle}"? This action can't be undone.`;
  }
  return "Are you sure you want to delete this test? This action can't be undone";
});
const hasTemplate = computed(() => {
  if (object.value && 'template' in object.value) {
    return object.value.template !== null;
  }
  return false;
});
const myObject = computed(() => {
  if (user.value) {
    let myObject = user.value.myTests.find(test => test.id === props.id);
    if (!myObject) {
      myObject = user.value.myCoops.find(test => test.id === props.id);
    }
    return myObject;
  }
  return null;
});

// Watch
watch(
  test,
  newTest => {
    if (newTest !== null && newTest !== undefined) {
      object.value = { ...newTest };
    }
  },
  { immediate: true }
);

// Lifecycle hooks
onMounted(async () => {
  if (!store.getters.test && props.id) {
    await store.dispatch('getTest', { id: props.id });
  }
  loadingPage.value = false;
});

onBeforeMount(() => {
  window.addEventListener('beforeunload', preventNav);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav);
});

// Navigation guard
onBeforeRouteLeave((to, from) => {
  if (localChanges.value) {
    store.commit('SET_DIALOG_LEAVE', true);
    store.commit('SET_PATH_TO', to.name);
    return false;
  }
  return true;
});

const validate = (valid, index) => {
  valids.value[index] = valid;
};

const onSubmit = async () => {
  await submit();
  localChanges.value = false;
  router.push({ name: store.state.pathTo });
};

const submit = async () => {
  const title = object.value.testTitle;
  if (title.length > 0 && title.length < 200) {
    await store.dispatch('updateTest', new Test(object.value));
    localChanges.value = false;
    toast.success(t('alerts.savedChanges'));
  } else if (title.length >= 200) {
    toast.warning('Title must not exceed 200 characters.');
  } else {
    toast.warning('Test must contain a title.');
  }
};

const preventNav = event => {
  if (!localChanges.value) return;
  event.preventDefault();
  event.returnValue = '';
};

const deleteTest = async item => {
  auxUser.value = { ...user.value };
  delete auxUser.value.myTests[item.id];
  item.auxUser = auxUser.value;
  await store.dispatch('deleteTest', item);
  router.push({ name: 'TestList' });
};

const createTemplate = async () => {
  const tempHeader = new TemplateHeader({
    creationDate: Date.now(),
    updateDate: Date.now(),
    isTemplatePublic: template.value.isTemplatePublic,
    templateDescription: template.value.templateDescription,
    templateTitle: template.value.templateTitle,
    templateType: test.value.testType,
    templateVersion: '1.0.0',
    templateAuthor: new TemplateAuthor({
      userEmail: test.value.testAdmin.email,
      userDocId: test.value.testAdmin.userDocId,
    }),
  });

  const tempBody = new TemplateBody(test.value);
  const templateObj = new Template({
    id: null,
    header: tempHeader,
    body: tempBody,
  });

  if (template.value.templateTitle.trim() !== '') {
    await store.dispatch('createTemplate', templateObj);
    closeDialog();
  } else {
    tempform.value.validate();
  }
};

const closeDialog = () => {
  tempDialog.value = false;
  tempform.value.resetValidation();
  template.value = {
    templateTitle: '',
    templateDescription: '',
    isTemplatePublic: false,
  };
};

const updateTemplate = updates => {
  template.value = { ...template.value, ...updates };
};

const updateTemplateTitle = value => {
  updateTemplate({ templateTitle: value });
  localChanges.value = true;
};

const updateTemplateDescription = value => {
  updateTemplate({ templateDescription: value });
  localChanges.value = true;
};

const updateObject = newObject => {
  object.value = { ...newObject };
  localChanges.value = true;
};

const duplicateTest = async () => {
  const testObj = new Test({
    testTitle: 'Copy of ' + test.value.testTitle,
    testDescription: test.value.testDescription,
    testType: test.value.testType,
    userTestType: test.value.userTestType,
    testStructure: test.value.testStructure,
    testOptions: test.value.testOptions,
    userTestStatus: {},
    id: null,
    testAdmin: new TestAdmin({
      userDocId: user.value.id,
      email: user.value.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
  });

  await store.dispatch('duplicateTest', {
    test: testObj,
    answer: testAnswerDocument.value,
  });

  router.push('/testslist');
};
</script>

<style scoped>
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
.dialog-title {
  font-style: normal;
  font-weight: 300;
  font-size: 40px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
