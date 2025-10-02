<template>
  <ShowInfo :title="testTitle + ' - ' + 'PosTest'">
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <div
          v-for="(item, i) in postTest"
          :key="i"
          class="mb-6"
        >
          <v-col
            cols="12"
            class="py-0"
          >
            <span class="text-subtitle-1 font-weight-bold text-secondary">{{ item.title }}</span>
            <br>
            <span
              v-if="item.description"
              class="text-body-2 text-grey-darken-1"
            >{{ item.description
            }}</span>
            <v-text-field
              v-if="item.textField"
              v-model="localAnswers[i].answer"
              :placeholder="item.title"
              variant="outlined"
              density="comfortable"
              class="mt-2"
              @update:model-value="updateAnswer(i, $event)"
            />
            <v-radio-group
              v-if="item.selectionField"
              v-model="localAnswers[i].answer"
              class="mt-2"
              @update:model-value="updateAnswer(i, $event)"
            >
              <v-radio
                v-for="(selection, j) in item.selectionFields"
                :key="j"
                :label="selection"
                :value="selection"
                density="compact"
              />
            </v-radio-group>
          </v-col>
        </div>
        <v-row
          justify="center"
          class="mt-4"
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-btn
              block
              color="primary"
              variant="flat"
              @click="$emit('done')"
            >
              Done
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
import { ref, watch } from 'vue';

const props = defineProps({
  testTitle: String,
  postTestTitle: String,
  postTest: Array,
  postTestAnswer: Array,
  postTestCompleted: Boolean,
});

const emit = defineEmits(['done', 'update:postTestAnswer']);

const localAnswers = ref([...props.postTestAnswer]);

const updateAnswer = (index, value) => {
  localAnswers.value[index].answer = value;
  emit('update:postTestAnswer', localAnswers.value);
};

watch(() => props.postTestAnswer, (newAnswers) => {
  if (newAnswers) {
    localAnswers.value = [...newAnswers];
  }
}, { deep: true, immediate: true });
</script>
