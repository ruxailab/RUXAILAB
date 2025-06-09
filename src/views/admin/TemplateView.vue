<template>
  <v-container v-if="test">
    <SnackBar />

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
          Are you sure you want to delete this template?
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
            Cancel
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            :loading="loading"
            variant="text"
            @click="deleteTemplate(object), (loading = true), (change = false)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Leave Alert Dialog -->
    <v-dialog
      v-model="dialogAlert"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-red text-white"
          primary-title
        >
          Are you sure you want to leave?
        </v-card-title>

        <v-card-text>
          Are you sure you want to leave? All your changes will be discarded
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="dialogAlert = false"
          >
            Stay
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            variant="text"
            @click=";(change = false), $router.push(go)"
          >
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ShowInfo title="Template">
      <template #warning>
        <v-alert
          v-if="!test.template.upToDate"
          type="warning"
          density="compact"
        >
          Your template is not up to date with your test.
        </v-alert>
      </template>
      <template #content>
        <div>
          <v-card style="background: #f5f7ff">
            <v-col class="mb-1 pa-4 pb-1">
              <p class="subtitleView">
                Settings
              </p>
            </v-col>
            <v-divider />
            <v-form
              ref="tempform"
              class="px-5"
            >
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="template.header.title"
                    label="Title"
                    :rules="titleRequired"
                    counter="100"
                    variant="outlined"
                    density="compact"
                    @update:model-value="change = true"
                  />

                  <v-textarea
                    v-model="template.header.description"
                    label="Description"
                    variant="outlined"
                    density="compact"
                    @update:model-value="change = true"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="template.header.date"
                    label="Last Update"
                    variant="outlined"
                    density="compact"
                    disabled
                  />
                  <v-text-field
                    v-model="template.header.version"
                    label="Version"
                    variant="outlined"
                    density="compact"
                    @keypress="isNumber"
                    @update:model-value="change = true"
                  />
                  <v-checkbox
                    v-model="template.header.isPublic"
                    label="Make template public to all users"
                    class="ma-0"
                    color="#F9A826"
                    @update:model-value="change = true"
                  />
                  <v-row class="mx-1">
                    <v-btn
                      variant="outlined"
                      @click="dialogDetails = true"
                    >
                      Detailed information
                    </v-btn>
                    <v-spacer />

                    <v-tooltip location="bottom">
                      <template #activator="{ props }">
                        <v-btn
                          variant="outlined"
                          v-bind="props"
                          @click="updateTemplate(), (change = true)"
                        >
                          Update
                        </v-btn>
                      </template>
                      <span>Click to update your local template, click save to submit
                        it.</span>
                    </v-tooltip>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
            <v-divider />
            <v-row justify="center">
              <v-btn
                color="#f26363"
                class="text-white my-4"
                style="justify-self: center"
                @click="dialogDel = true"
              >
                <v-icon start>
                  mdi-trash-can-outline
                </v-icon>Delete template
              </v-btn>
            </v-row>
          </v-card>
        </div>
      </template>
    </ShowInfo>
    <v-tooltip
      v-if="change"
      location="left"
    >
      <template #activator="{ props }">
        <v-btn
          v-if="change"
          size="large"
          icon
          fixed
          location="bottom right"
          color="#F9A826"
          v-bind="props"
          @click="update"
        >
          <v-icon size="large">
            mdi-content-save
          </v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import SnackBar from '@/components/atoms/Snackbar.vue';

// const { proxy } = getCurrentInstance();
const store = useStore();
const router = useRouter();

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const change = ref(false);
const dialogDel = ref(false);
const dialogAlert = ref(false);
const dialogDetails = ref(false);
const loading = ref(false);
const object = ref(null);
const template = ref(null);
const updated = ref(false);
const go = ref('');
const tempform = ref(null);

// Rules for form validation
const titleRequired = [
  (v) => !!v || 'Field Required',
  (v) => v.length <= 100 || 'Max 100 characters',
];

const templateStore = computed(() => {
  if (store.getters.template) setTemplate();
  return store.getters.template;
});

const test = computed(() => store.getters.test);

const dialogText = computed(() => {
  if (object.value) {
    return "Are you sure you want to delete your template ? This action can't be undone";
  }
  return "Are you sure you want to delete this template? This action can't be undone";
});

watch(test, async () => {
  if (test.value !== null && test.value !== undefined) {
    object.value = await Object.assign({}, test.value);
  }
});

watch(templateStore, async () => {
  if (templateStore.value !== null && templateStore.value !== undefined) {
    template.value = await Object.assign({}, templateStore.value);
  }
});

const update = () => {
  template.value.header.date = new Date().toDateString();

  store
    .dispatch('updateTemplate', {
      docId: props.id,
      data: template.value,
    })
    .then(() => {
      change.value = false;
      if (updated.value) {
        store.dispatch('setUpToDate', {
          docId: test.value.id,
          data: true,
        });
      }

      store
        .dispatch('updateMyTemps', {
          docId: template.value.header.author.id,
          element: Object.assign(template.value.header, {
            type: template.value.body.type,
            id: props.id,
          }),
        })
        .then(() => store.commit('setSuccess', 'Template successfully updated'));
    })
    .catch((err) =>
      store.commit('setError', {
        errorCode: 'templateError',
        message: err,
      })
    );
};

const deleteTemplate = () => {
  store
    .dispatch('deleteTemplate', {
      id: props.id,
    })
    .then(() => {
      store
        .dispatch('removeMyTemps', {
          docId: template.value.header.author.id,
          element: {
            id: props.id,
            title: template.value.header.title,
            type: template.value.body.type,
          },
          param: 'myTemps',
        })
        .then(() => {
          delete object.value.template;
          submit();
          loading.value = false;
          dialogDel.value = false;
          router.push(`/managerview/${object.value.id}`).catch(() => {});
        });
    });
};

const submit = async () => {
  await store.dispatch('getAnswers', { id: test.value.answers });
  await store.dispatch('getReports', { id: test.value.reports });

  store
    .dispatch('updateTest', {
      docId: object.value.id,
      data: object.value,
    })
    .then(() => {
      store.dispatch('updateMyTest', {
        docId: object.value.admin.id,
        element: {
          id: object.value.id,
          title: object.value.title,
          type: object.value.type,
          reports: object.value.reports,
          answers: object.value.answers,
          cooperators: object.value.cooperators,
          template: object.value.template,
          accessLevel: 0,
        },
      });

      object.value.cooperators.cooperators.forEach((coop) => {
        store.dispatch('updateMyCoops', {
          docId: coop.id,
          element: {
            id: object.value.id,
            title: object.value.title,
            type: object.value.type,
            reports: object.value.reports,
            answers: object.value.answers,
            cooperators: object.value.cooperators,
            template: object.value.template,
            accessLevel: coop.accessLevel,
          },
        });
      });

      const answers = store.getters.answers;
      const reports = store.getters.reports;
      const cooperators = store.getters.cooperators;

      answers.test.title = object.value.title;
      reports.test.title = object.value.title;
      cooperators.test.title = object.value.title;

      store.dispatch('updateTestAnswer', {
        docId: test.value.answers,
        data: answers,
      });

      store.dispatch('updateTestReport', {
        docId: test.value.reports,
        data: reports,
      });

      store.dispatch('updateTestCooperators', {
        docId: test.value.cooperators,
        data: cooperators,
      });

      store.commit('setSuccess', 'Template successfully deleted');
    })
    .catch((err) => {
      store.commit('setError', {
        errorCode: 'templateError',
        message: err,
      });
    });
};

const setTemplate = () => {
  template.value = store.getters.template;
};

const updateTemplate = () => {
  updated.value = true;
  Object.keys(template.value.body).forEach((key) => {
    template.value.body[key] = test.value[key];
  });
};

const isNumber = (evt) => {
  evt = evt ? evt : window.event;
  const charCode = evt.which ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
    evt.preventDefault();
  } else {
    return true;
  }
};

onBeforeMount(() => {
  window.addEventListener('beforeunload', preventNav);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav);
});

// Navigation guard
onBeforeRouteLeave((to, from) => {
  if (change.value) {
    dialogAlert.value = true;
    go.value = to.path;
    return false;
  }
  return true;
});

const initialize = async () => {
  await store.dispatch('getTemplate', { id: props.id });
  await store.dispatch('getTest', { id: template.value?.testId });
};
initialize();

// Prevent navigation
const preventNav = (event) => {
  if (change.value) {
    event.preventDefault();
    event.returnValue = '';
  }
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

.list-scroll {
  height: 508px;
  overflow: auto;
}

/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}

/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>