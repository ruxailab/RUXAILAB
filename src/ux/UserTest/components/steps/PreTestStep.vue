<template>
  <ShowInfo :title="testTitle + ' - ' + 'PreTest'">
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <div
          v-for="(item, i) in preTest"
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
            >{{ item.description }}</span>

            <!-- text field -->
            <v-text-field
              v-if="item.textField"
              v-model="localAnswers[i].answer"
              :placeholder="item.title"
              variant="outlined"
              density="comfortable"
              class="mt-2"
              @update:model-value="updateAnswer(i, $event)"
            />

            <!-- radio group -->
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
import { ref, watch } from "vue";
import ShowInfo from "@/shared/components/ShowInfo.vue";

const props = defineProps({
  testTitle: String,
  preTest: Array,
  preTestAnswer: Array,
  preTestCompleted: Boolean,
});

const emit = defineEmits(["done", "update:preTestAnswer"]);

const localAnswers = ref([...props.preTestAnswer]);

watch(
  () => props.preTestAnswer,
  (newVal) => {
    localAnswers.value = [...newVal];
  },
  { deep: true }
);

function updateAnswer(index, value) {
  localAnswers.value[index].answer = value;
  emit("update:preTestAnswer", localAnswers.value);
}
</script>
