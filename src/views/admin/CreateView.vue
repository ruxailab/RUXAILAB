<template>
  <div style="height: 93vh; background-color: #f9f5f0;">
    <v-col cols="12" />
    <span class="Title mb-14 mt-8" style="display: flex; justify-content: center;">
      {{ $t('pages.createTest.title') }}
    </span>

    <v-row
      justify="center"
      style="padding: 0px 30px;"
    >
      <v-row
        style="max-width: 90%"
        justify="center"
      >
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            hover
            class="card"
            :ripple="false"
            @click="$router.push('/choose')"
          >
            <v-row align="center">
              <v-col
                cols="12"
                md="5"
              >
                <v-img
                  cover
                  :src="require('@/assets/createView/blankCanvas.svg')"
                  max-height="200"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
                class="card-text"
              >
                <div class="card-title">
                  {{ $t('pages.createTest.blanckTitle') }}
                </div>
                <div>
                  {{ $t('pages.createTest.blanckSubtitle') }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            hover
            class="card"
            :ripple="false"
            @click="pushToFromTemplate"
          >
            <v-row align="center">
              <v-col
                cols="12"
                md="5"
              >
                <v-img
                  cover
                  :src="require('@/assets/createView/createFromTemplate.svg')"
                  max-height="200"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
                class="card-text-box"
              >
                <div class="card-title">
                  {{ $t('pages.createTest.templateTitle') }}
                </div>
                <div>
                  {{ $t('pages.createTest.templateSubtitle') }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import TestAdmin from '@/models/TestAdmin';
import Test from '@/models/Test';

const store = useStore();
const router = useRouter();

const dialog = ref(false);
const object = ref({});
const test = ref({
  title: '',
  description: '',
  type: '',
});
const testID = ref(null);
const form = ref(null); // Reference to the form component

const user = computed(() => store.getters.user);

watch(dialog, (newVal) => {
  test.value = {
    title: '',
    description: '',
    type: '',
  };
  object.value = {};

  if (!newVal && form.value) {
    form.value.resetVal();
    dialog.value = false;
  }
});

const pushToFromTemplate = () => {
  router.push('/fromtemplate');
};

const submit = async () => {
  const newTest = new Test({
    ...test.value,
    id: null,
    testAdmin: new TestAdmin({
      userDocId: user.value.id,
      email: user.value.email,
    }),
    creationDate: Date.now(),
    updateDate: Date.now(),
  });

  const testId = await store.dispatch('createNewTest', newTest);
  sendManager(testId);
};

const sendManager = (id) => {
  router.push(`/managerview/${id}`);
};

const validate = () => {
  if (form.value?.valida()) {
    submit();
  }
};
</script>

<style scoped>
.page-container {
  height: 93vh;
  background-color: #f9f5f0;
  /* fundo padrão para desktop/tablet */
}

dialog-title {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.Title {
  font-size: 38px;
  font-style: normal;
  text-align: center;
  font-weight: 600;
  line-height: initial;
  background: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.responsive-row {
  padding: 0px 30px;
}

.card {
  border-radius: 20px;
  padding: 30px;
  height: 250px;
}

.card-title {
  font-size: 25px;
  color: #f9a826;
  margin: 0 0 10px 0;
}

.card-text-box {
  margin: 0 0 0 30px;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }

  .card-text-box {
    margin: 20px 0 0 0;
  }

  .card {
    height: auto;
  }
}
</style>
