<template>
  <ShowInfo :title="testTitle + ' - ' + preTestTitle">
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
            >{{ item.description
            }}</span>
            <v-text-field
              v-if="item.textField"
              v-model="preTestAnswer[i].answer"
              :disabled="preTestCompleted"
              :placeholder="item.title"
              variant="outlined"
              density="comfortable"
              class="mt-2"
            />
            <v-radio-group
              v-if="item.selectionField"
              v-model="preTestAnswer[i].answer"
              :disabled="preTestCompleted"
              class="mt-2"
            >
              <v-radio
                v-for="(selection, j) in item.selectionFields"
                :key="j"
                :label="selection"
                :value="selection"
                :disabled="preTestCompleted"
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
              :disabled="preTestCompleted"
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
import ShowInfo from '@/components/organisms/ShowInfo.vue';
const props = defineProps({
    testTitle: String,
    preTestTitle: String,
    preTest: Array,
    preTestAnswer: Array,
    preTestCompleted: Boolean
});
const emit = defineEmits(['done']);
</script>
