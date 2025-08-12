<template>
    <v-card :class="['pa-6', 'elevation-3', 'rounded-xl', 'h-100', 'ux-metric-card']">
        <div class="d-flex align-center mb-4">
            <v-avatar :color="color" size="56" class="me-4">
                <v-icon color="white" size="28">
                    {{ icon }}
                </v-icon>
            </v-avatar>
            <div>
                <div :class="['text-h4', 'font-weight-bold', `text-${color}`]">
                    <slot name="value">
                        {{ value }}
                    </slot>
                </div>
                <p class="text-body-1 font-weight-medium mb-0">
                    <slot name="label">
                        {{ label }}
                    </slot>
                </p>
            </div>
        </div>
        <p class="text-body-2 text-medium-emphasis">
            <slot name="description">
                {{ description }}
            </slot>
        </p>
        <v-progress-linear :model-value="progress" :color="color" height="8" rounded class="mt-3" />
    </v-card>
</template>

<script setup>
const props = defineProps({
    value: { type: [String, Number], required: true },
    label: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, default: '' },
    progress: { type: Number, default: 0 },
});
</script>

<style scoped></style>
