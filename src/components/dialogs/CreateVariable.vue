<template>
  <v-dialog
    :model-value="dialog"
    persistent
    max-width="600"
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card>
      <v-card-title class="text-h6 mb-2">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <InputTextEditTest 
          v-model="item.title"
          type="textField"
          :label="$t('UserTestTable.inputs.variableName')"
        />

        <InputTextEditTest 
          v-model="item.description"
          :rows="3"
          label="Variable Description"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="red"
          class="ml-auto"
          @click="$emit('close')"
        >
          <v-icon class="mr-1">
            mdi-close
          </v-icon>
          {{ $t('buttons.close') }}
        </v-btn>
        <v-btn
          color="orange"
          @click="saveItem"
        >
          <v-icon class="mr-1">
            mdi-content-save
          </v-icon>
          {{ $t('buttons.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import InputTextEditTest from '@/components/atoms/InputTextEditTest'

export default {
  components: {
    InputTextEditTest,
  },

  props: {
    title: {
      type: String,
      default: '', // Fixed typo: 'defualt' to 'default' and provided a default value
      required: true, // Fixed typo: 'require' to 'required'
    },

    dialog: {
      type: Boolean,
      default: false,
      required: true, // Fixed typo: 'require' to 'required'
    },
  },

  emits: ['update:dialog', 'close', 'save'],

  data: () => ({
    item: {
      title: '',
      description: '',
    },
  }),

  methods: {
    saveItem() {
      if (this.item.title.trim() === '') return
      this.$emit('save', this.item)
      this.item = { title: '', description: '' }
    },
  },
}
</script>