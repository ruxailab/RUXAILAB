<template>
  <div>
    <VRow class="pa-0 ma-0" dense>
      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" :rail="mini" permanent color="#3F3D56">
        <!-- Navigation Header -->
        <div v-if="!mini" class="header">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <text-clamp class="titleText" :text="test.testTitle" :max-lines="2" />
              </v-col>
              <v-col>
                <v-progress-circular rotate="-90" :model-value="calculateProgress()" color="#fca326" :size="50"
                  class="mt-2">
                  {{ calculateProgress() }}%
                </v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <!-- Navigation Body -->
        <v-list class="nav-list" density="compact" max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px">
          <div v-for="item in items" :key="item.id">
            <!-- Pre Test -->
            <!-- <v-list-group v-if="item.id === 0"
              :class="{ 'disabled-group': localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted && !localTestAnswer.submitted }"
              :value="index === 0" @click="index = item.id">
              <template #appendIcon>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                  mdi-chevron-down
                </v-icon>
              </template>
<template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                      {{ localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted &&
                        !localTestAnswer.submitted ? 'mdi-lock' : item.icon }}
                    </v-icon>
                  </template>
<v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
  {{ item.title }}
</v-list-item-title>
</v-list-item>
</template>
<v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
  <template #activator="{ props }">
                  <v-list-item v-bind="props" link :disabled="isPreTestTaskDisabled(i)"
                    :class="{ 'disabled-group': isPreTestTaskDisabled(i) }" @click="taskIndex = i">
                    <template #prepend>
                      <v-icon :color="taskIndex === i ? '#ffffff' : '#fca326'">
                        {{ isPreTestTaskDisabled(i) ? 'mdi-lock' : task.icon }}
                      </v-icon>
                    </template>
  <v-list-item-title :style="taskIndex === i ? 'color: white' : 'color:#fca326'">
    {{ task.title }}
  </v-list-item-title>
  </v-list-item>
  </template>
  <span>{{ task.title }}</span>
</v-tooltip>
</v-list-group> -->

            <!-- Tasks -->
            <!-- <v-list-group v-if="item.id === 1"
              :class="{ 'disabled-group': !localTestAnswer.consentCompelted || !localTestAnswer.preTestCompleted || (allTasksCompleted && !localTestAnswer.submitted) }"
              :value="index === 1" @click="index = item.id">
              <template #appendIcon>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                  mdi-chevron-down
                </v-icon>
              </template>
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                      {{ (!localTestAnswer.consentCompleted || !localTestAnswer.preTestCompleted || (allTasksCompleted
                        && !localTestAnswer.submitted)) ? 'mdi-lock' : item.icon }}
                    </v-icon>
                  </template>
                  <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" link :disabled="isTaskDisabled(i) && !localTestAnswer.submitted"
                    :class="{ 'disabled-group': isTaskDisabled(i) && !localTestAnswer.submitted }"
                    @click="taskIndex = i; startTimer()">
                    <template #prepend>
                      <v-icon :color="taskIndex === i ? '#ffffff' : '#fca326'">
                        {{ isTaskDisabled(i) && !localTestAnswer.submitted ? 'mdi-lock' : task.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title :style="taskIndex === i ? 'color: white' : 'color:#fca326'">
                      {{ task.title }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group> -->

            <!-- Post Test -->
            <!-- <v-list-item v-if="item.id === 2" :disabled="!allTasksCompleted && !localTestAnswer.submitted"
              :class="{ 'disabled-group': !allTasksCompleted && !localTestAnswer.submitted }" @click="index = item.id">
              <template #prepend>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                  {{ !allTasksCompleted && !localTestAnswer.submitted ? 'mdi-lock' : item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item> -->
          </div>
        </v-list>

        <!-- <div class="footer">
            <v-spacer />
            <v-btn icon class="mr-2 bg-orange" @click.stop="mini = !mini">
              <v-icon v-if="mini" color="white" icon="mdi-chevron-right" />
              <v-icon v-else color="white" icon="mdi-chevron-left" />
            </v-btn>
          </div> -->
      </v-navigation-drawer>

      <!-- Right View -->
      <VCol ref="rightView" class="pa-0 ma-0 right-view">
        <!-- Consent -->
        <!-- <ShowInfo v-if="index === 0 && taskIndex === 0" :title="$t('UserTestView.titles.preTestConsent')">
          <template #content>
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} - {{ $t('UserTestView.titles.preTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />
            <v-row>
              <v-col cols="8" class="mx-auto py-0">
                <div class="rich-text mb-6" v-html="test.testStructure.consent"></div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="mx-auto">
                <v-text-field v-model="fullName" label="Full Name" variant="outlined" density="compact"
                  :rules="[v => !!v || 'Name is required']" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="mx-auto">
                <v-radio-group v-model="localTestAnswer.consentCompleted" direction="horizontal">
                  <v-radio label="I accept the consent terms" :value="true" :disabled="!fullName" />
                  <v-radio label="I do not accept the consent terms" :value="false" />
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="mx-auto text-center">
                <v-btn color="primary" :disabled="!localTestAnswer.consentCompleted || !fullName"
                  @click="completeStep(taskIndex, 'consent'); taskIndex = 1">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </ShowInfo> -->

        <!-- Tasks -->
        <CardSortingTask v-if="index === 1" :test="test" />
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import CardSortingTask from '../components/CardSortingTask.vue';
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer';

// Props
const props = defineProps({
  test: {
    type: Object,
    required: true
  },
})

// Stores
const store = useStore();

// Variables
const drawer = ref(true);
const mini = ref(false);

const rightView = ref(null);
const index = ref(1);
const taskIndex = ref(null);
const fullName = ref('');
const items = ref([]);

const localTestAnswer = reactive(new UserStudyEvaluatorAnswer());

// Methods
const completeStep = (id, type, userCompleted = true) => { }

const mappingSteps = async () => {
  try {
    items.value = [];

    items.value.push({
      title: 'Tasks',
      icon: 'mdi-checkbox-blank-circle-outline',
      value: {
        title: 'Card Sorting',
        icon: 'mdi-checkbox-blank-circle-outline',
        id: 0,
      },
      id: 1,
    });

  } catch (error) {
    console.error('Error mapping steps:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to initialize test data. Please try again.' });
  }
}

const isTaskDisabled = (taskIndex) => {
  if (!Array.isArray(localTestAnswer.tasks)) return true;
  for (let i = 0; i < taskIndex; i++) {
    if (!localTestAnswer.tasks[i]?.completed) {
      return true;
    }
  }
  return false;
};

const calculateProgress = () => {
  try {
    if (!localTestAnswer) return 0
    const totalSteps = 4
    let completedSteps = 0

    if (localTestAnswer.preTestCompleted) completedSteps++
    if (localTestAnswer.consentCompleted) completedSteps++

    let tasksCompleted = 0
    if (items.value[1]?.value && Array.isArray(localTestAnswer.tasks)) {
      for (let i = 0; i < items.value[1].value.length; i++) {
        if (localTestAnswer.tasks[i]?.completed) {
          tasksCompleted++;
        }
      }
      if (tasksCompleted === items.value[1].value.length) {
        completedSteps++
      }
    }

    if (localTestAnswer.postTestCompleted) completedSteps++

    const progressPercentage = (completedSteps / totalSteps) * 100
    localTestAnswer.progress = progressPercentage
    return progressPercentage
  } catch (error) {
    console.error('Error in calculateProgress:', error)
    return 0
  }
};

const isPreTestTaskDisabled = (taskIndex) => {
  if (taskIndex === 0) return localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted && !localTestAnswer.submitted;
  return !localTestAnswer.consentCompleted || (localTestAnswer.preTestCompleted && !localTestAnswer.submitted);
};

// Lifecycle Hooks
onMounted(async () => {
  await mappingSteps();
})
</script>

<style scoped>
.right-view::-webkit-scrollbar {
  width: 9px;
}

.right-view::-webkit-scrollbar-track {
  background: none;
}

.right-view::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}

.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>
