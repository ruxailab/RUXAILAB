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
    >
      <TextareaForm
        v-model="consent"
        :title="$t('ModeratedTest.consentForm')"
        subtitle="Edit the consent text for the test. Changes are saved when you click the Save button."
        @update:value="saveState('consent', $event)"
      />
    </v-card>

    <v-card
      v-if="index === 1"
      rounded="xxl"
    >
      <UserVariables
        type="pre-test"
        @update="saveState('preTest', $event)"
      />
    </v-card>

    <ListTasks
      v-if="index === 2"
    />

    <v-card
      v-if="index === 3"
      rounded="xxl"
    >
      <UserVariables
        type="post-test"
        @update="saveState('postTest', $event)"
      />
    </v-card>
  </v-col>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ListTasks from '@/components/molecules/ListTasks.vue';
import UserVariables from '@/components/atoms/UserVariables.vue';
import TextareaForm from '@/components/atoms/TextareaForm.vue';

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

const consent = ref('');

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

const saveState = async (type, value) => {
  const states = {
    'consent': 'setConsent',
    'preTest': 'setPreTest',
    'postTest': 'setPostTest',
  }

  if (states[type]) store.dispatch(states[type], value)
}

const getConsent = () => {
  consent.value = testStructure.value.consent || ''
  saveState('consent', consent)
}

// Lifecycle
onMounted(() => {
  getConsent()
})
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
