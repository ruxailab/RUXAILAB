<template>
  <v-container>
    <v-row justify="center">
      <v-text-field
        v-if="type === 'textField'"
        v-model="internalValue"
        variant="outlined"
        color="orange"
        class="mx-3"
        :label="label"
        @change="$emit('change', internalValue)"
      />

      <v-textarea
        v-else
        v-model="internalValue"
        :rows="rows"
        variant="outlined"
        color="orange"
        class="mx-3"
        :label="label"
        @change="$emit('change', internalValue)"
      />
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    },

    type: {
      type: String,
      default: 'textArea'
    },

    label: {
      type: String,
      default: ''
    },

    rows: {
      type: Number,
      default: 1
    },
  },

  emits: ['change', 'input'],

  computed: {
    internalValue: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      }
    }
  }
}
</script>

<style scoped>
.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
