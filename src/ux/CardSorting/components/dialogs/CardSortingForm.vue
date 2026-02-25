<template>
  <v-dialog
    :model-value="dialog"
    width="70%"
    persistent
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="dataCard">
      <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
        {{ $t('CardSorting.newTask') }}
      </p>
      <v-divider />
      <v-card-text>
        <VForm ref="form">
          <VRow justify="space-around">
            <VCol class="mt-4" cols="5">
              <v-text-field
                v-model="localTask.title"
                :label="$t('common.name')"
                :rules="requiredRule"
                variant="outlined"
                density="compact"
              />
              <quill-editor
                v-if="options.category_description || options.card_description"
                v-model:value="localTask.description"
                class="mb-5"
                style="height: 40%"
              />
            </VCol>

            <!-- <VCol class="mt-4" cols="5" v-if="options.category_description">
              <quill-editor v-if="options.category_description" v-model:value="localTask.taskDescription" class="mb-5" style="height: 40%;" />
            </VCol> -->
          </VRow>
        </VForm>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="red-lighten-1"
          variant="text"
          @click="($emit('update:dialog', false), reset())"
        >
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn class="text-white bg-orange" @click="submit">
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  dialog: Boolean,
  task: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['update:dialog', 'save'])

// Variables
const form = ref(null)
const requiredRule = [(v) => !!v || 'Field Required']
const localTask = ref({})

// Methods
const submit = async () => {
  const valid = await form.value.validate()

  if (valid) {
    emit('save', { ...localTask.value })
    emit('update:dialog', false)
    reset()
  }
}

const reset = () => {
  form.value?.reset()
}

watch(
  () => props.task,
  (newTask) => {
    if (newTask && Object.keys(newTask).length > 0) {
      localTask.value = { ...newTask }
    } else {
      localTask.value = {}
    }
  },
  { immediate: true, deep: true },
)
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

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>
