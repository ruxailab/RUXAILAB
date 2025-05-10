<template>
  <v-tabs
    v-if="type === 'tabs'"
    bg-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">
      Consent
    </v-tab>
    <v-tab @click="tabClicked(1)">
      Pre Form
    </v-tab>
    <v-tab @click="tabClicked(2)">
      Tasks
    </v-tab>
    <v-tab @click="tabClicked(3)">
      Post Form
    </v-tab>
  </v-tabs>

  <v-col
    v-else-if="type === 'content'"
    cols="12"
  >
    <v-card
      v-if="index === 0"
      rounded="xxl"
      style="background: #f5f7ff"
    >
      <v-card-title class="subtitleView">
        {{ $t('UserTestTable.titles.consentForm') }}
      </v-card-title>

      <v-divider />
      <v-row justify="space-around">
        <v-col cols="10">
          <UserConsent @input="updateData" />
        </v-col>
      </v-row>
    </v-card>

    <v-card
      v-if="index === 1"
      rounded="xxl"
      style="background: #f5f7ff"
    >
      <v-card-title class="subtitleView">
        {{ $t('UserTestTable.titles.userVariables') }}
      </v-card-title>

      <v-divider />
      <v-row justify="space-around">
        <v-col cols="12">
          <UserVariables @input="updateData" />
        </v-col>
      </v-row>
    </v-card>

    <ListTasks
      v-if="index === 2"
      :tasks="object.itemsTasks"
      @input="updateData"
    />

    <v-card
      v-if="index === 3"
      rounded="xxl"
      style="background: #f5f7ff"
    >
      <v-card-title class="subtitleView">
        {{ $t('UserTestTable.titles.postForm') }}
      </v-card-title>

      <v-divider />
      <v-row justify="space-around">
        <v-col cols="12">
          <FormPostTest @input="updateData" />
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ListTasks from '@/components/molecules/ListTasks.vue';
import FormPostTest from '@/components/atoms/FormPostTest.vue';
import UserVariables from '@/components/atoms/UserVariables.vue';
import UserConsent from '@/components/atoms/UserConsent.vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  object: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['tabClicked']);

const store = useStore();

const formData = ref({
  preTest: [],
  postTest: [],
});

const testStructure = computed(() => store.state.Tests.Test.testStructure);

onMounted(() => {
  if (props.type !== 'content' && props.type !== 'tabs') {
    console.error(`${props.type} type in EditUserTest.vue is not valid.`);
  }
  if (testStructure.value.postTest) {
    store.dispatch('setPostTest', testStructure.value.postTest);
  }
  if (testStructure.value.preTest) {
    store.dispatch('setPreTest', testStructure.value.preTest);
  }
  if (testStructure.value.consent) {
    store.dispatch('setConsent', testStructure.value.consent);
  }
});

const tabClicked = (index) => {
  emit('tabClicked', index);
};

const updateData = (data) => {
  if (props.index === 0) {
    store.dispatch('setPreTest', data);
  }
  if (props.index === 2) {
    store.dispatch('setPostTest', data);
  }
};
</script>

<style scoped>
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>