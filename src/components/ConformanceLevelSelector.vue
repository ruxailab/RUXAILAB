<template>
    <v-card class="selection-card" elevation="3">
        <v-card-title class="justify-center text-h5 bg-primary text-white py-4">
            Select Conformance Level
        </v-card-title>
        <v-card-text class="pa-6">
            <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
                Choose the WCAG conformance level you want to evaluate against:
            </p>
            <v-radio-group :model-value="localValue" class="mt-4" @update:model-value="onChange">
                <v-radio label="Level A (Minimum level of conformance)" value="A" />
                <v-radio label="Level AA (Addresses the major barriers)" value="AA" />
                <v-radio label="Level AAA (Highest level of conformance)" value="AAA" />
            </v-radio-group>
            <div class="d-flex justify-center mt-6">
                <v-btn color="primary" size="large" min-width="200" elevation="2" @click="$emit('start')">
                    Start Assessment
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
    modelValue: String
})
const emit = defineEmits(['update:modelValue', 'start'])
const localValue = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
    if (val !== localValue.value) localValue.value = val
})
function onChange(val) {
    localValue.value = val
    emit('update:modelValue', val)
}
</script>
