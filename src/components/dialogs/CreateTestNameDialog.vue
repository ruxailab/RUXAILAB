<template>
  <div>
    <v-dialog
      :model-value="isOpen"
      fullscreen
      persistent
      transition="dialog-bottom-transition"
      @update:model-value="$emit('update:isOpen', $event)"
    >
      <v-card color="#f9f5f0"> 
        <v-row
          align="center"
          justify="center"
          class="cardRow ma-0 pa-0"
        >
          <v-col
            md="8"
            lg="9"
            class="mx-auto pl-6"
          >
            <p class="titles ml-5">
              {{ heading }}
            </p>
            <p class="cardSubtitle ml-5">
              {{ subHeading }}
            </p>
          </v-col>
          <ButtonBack @click="$emit('close')" />
        </v-row>

        <v-row
          align="center"
          justify="center"
          class="cardRow ma-0 pa-0"
        >
          <v-col
            class="ml-auto mr-auto"
            sm="10"
            md="8"
            lg="4"
          >
            <v-card
              color="white"
              class="pb-5"
              style="border-radius: 20px !important"
            >
              <v-col
                cols="11"
                class="ml-6"
              >
                <p class="cardInternTitles mt-4">
                  {{ testName }}
                </p>
                <v-text-field
                  v-model="test.title"
                  class="mt-3"
                  :label="testName"
                  variant="outlined"
                  color="orange"
                  @change="store.commit('SET_LOCAL_CHANGES', true)"
                />

                <p class="cardInternTitles">
                  {{ testDescription }}
                </p>
                <v-textarea
                  v-model="test.description"
                  variant="outlined"
                  color="orange"
                  class="mt-3"
                  :label="testDescription"
                  @change="store.commit('SET_LOCAL_CHANGES', true)"
                />

                <v-row
                  class="d-flex align-center"
                  no-gutters
                >
                  <v-col
                    cols="9"
                    class="d-flex align-center"
                  >
                    <v-checkbox
                      v-model="test.isPublic"
                      class="ml-2"
                      color="orange"
                      :label="testLabel"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    class="d-flex justify-end"
                  >
                    <v-btn
                      color="orange"
                      variant="flat"
                      class="mr-2 circleOrange"
                      @click="validate"
                    >
                      <v-icon size="x-large">
                        mdi-arrow-right
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-card>
          </v-col>

          <v-col
            v-if="!isMobile"
            cols="5"
            class="imageColumn"
          >
            <img
              height="500"
              src="../../../public/createSVG.svg"
              alt="Test Creation image"
            >
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <CreateTestUserDialog
      :is-open="userDialog"
      @set-user="handleSetUser($event)"
      @close="userDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Test from '@/models/Test';
import TestAdmin from '@/models/TestAdmin';
import ButtonBack from '@/components/atoms/ButtonBack.vue';
import CreateTestUserDialog from '@/components/dialogs/CreateTestUserDialog.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
    required: true,
  },
  testType: {
    type: String,
    default: '',
    required: true,
  },
  heading: {
    type: String,
    default: '',
    required: true,
  },
  subHeading: {
    type: String,
    default: '',
    required: true,
  },
  testName: {
    type: String,
    default: '',
    required: true,
  },
  testDescription: {
    type: String,
    default: '',
    required: true,
  },
  testLabel: {
    type: String,
    default: '',
    required: true,
  },
});

defineEmits(['update:isOpen', 'close']);

const { mdAndDown } = useDisplay();
const store = useStore();
const router = useRouter();
const toast = useToast();

const userDialog = ref(false);
const test = ref({
  title: '',
  description: '',
  isPublic: false,
  userTestType: '',
  userTestStatus: {},
});

const user = computed(() => store.getters.user);
const isMobile = computed(() => mdAndDown.value);

watch(
  () => props.isOpen,
  (val) => {
    if (!val) {
      test.value = {
        title: '',
        description: '',
        isPublic: false,
        userTestType: '',
        userTestStatus: {},
      };
    }
  }
);

const validate = () => {
  if (test.value.title.length === 0) {
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
  if (props.testType === 'User') {
    userDialog.value = true;
    return;
  }
  if (['HEURISTICS', 'Accessibility'].includes(props.testType)) {
    submit();
  }
};

const handleSetUser = (event) => {
  test.value = { ...test.value, ...event };
  userDialog.value = false;
  submit();
};

const submit = async () => {
  const newTest = new Test({
    id: null,
    testTitle: test.value.title,
    testDescription: test.value.description,
    testType: props.testType,
    isPublic: test.value.isPublic,
    userTestType: test.value.userTestType,
    userTestStatus: test.value.userTestStatus,
    testAdmin: new TestAdmin({
      userDocId: user.value.id,
      email: user.value.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
  });

  const testId = await store.dispatch('createNewTest', newTest);

  if (props.testType === 'Accessibility') {
    router.push('/sample');
  } else {
    router.push(`/managerview/${testId}`);
  }
};
</script>

<style scoped>
.titles {
  font-size: 38px;
  font-weight: 600;
  color: #f99726;
}

.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-weight: 600;
}

.cardRow {
  display: flex;
  flex-wrap: wrap;
}

.cardInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.imageColumn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  padding-right: 30vh;
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px;
  }

  .cardSubtitle {
    font-size: 15px;
  }

  .cardRow {
    flex-direction: column;
    align-items: center;
  }

  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }

  .circleOrange {
    margin-top: 10px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .titles {
    font-size: 32px;
  }

  .cardRow {
    flex-direction: column;
    align-items: center;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px;
  }
}
</style>