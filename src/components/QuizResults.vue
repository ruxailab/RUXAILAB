<template>
    <div>
        <v-tabs :model-value="tab" bg-color="primary" color="white" grow @update:model-value="onTabChange">
            <v-tab value="0">
                <v-icon start>
                    mdi-check-circle
                </v-icon>
                Conformance Assessment
            </v-tab>
            <v-tab value="1">
                <v-icon start>
                    mdi-chart-bar
                </v-icon>
                Level Results
            </v-tab>
            <v-tab value="2">
                <v-icon start>
                    mdi-file-document
                </v-icon>
                Detailed Report
            </v-tab>
        </v-tabs>
        <v-window :model-value="tab" @update:model-value="onTabChange">
            <v-window-item value="0">
                <slot name="conformance" />
            </v-window-item>
            <v-window-item value="1">
                <slot name="level" />
            </v-window-item>
            <v-window-item value="2">
                <slot name="detailed" />
            </v-window-item>
        </v-window>
        <slot name="actions" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
    activeTab: Number
})
const emit = defineEmits(['update:activeTab'])
const tab = ref(props.activeTab || 0)
watch(() => props.activeTab, (val) => {
    if (val !== tab.value) tab.value = val
})
function onTabChange(val) {
    tab.value = val
    emit('update:activeTab', val)
}
</script>
