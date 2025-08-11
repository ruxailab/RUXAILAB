<template>
    <v-card elevation="2" rounded="lg" class="upcoming-webinar-card">
        <!-- Hero Image Section -->
        <v-img class="align-end text-white" height="200" src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" cover>
            <v-card-title>Some Text</v-card-title>
        </v-img>


        <v-card-text class="pa-6">
            <!-- Webinar Title -->
            <h2 class="webinar-title text-h5 font-weight-bold">
                {{ webinar.title }}
            </h2>

            <!-- Webinar Description -->
            <p class="webinar-description text-body-1 text-grey-darken-1 mb-4">
                {{ webinar.description }}
            </p>

            <!-- Date and Duration Info -->
            <v-row class="info-row mb-4" no-gutters>
                <v-col cols="6" class="pr-2">
                    <div class="info-item">
                        <div class="info-icon-wrapper">
                            <v-icon icon="mdi-calendar" size="24" color="primary"></v-icon>
                        </div>
                        <div class="info-content">
                            <div class="info-value">{{ webinar.date }}</div>
                            <div>Fecha</div>
                        </div>
                    </div>
                </v-col>
                <v-col cols="6" class="">
                    <div class="info-item">
                        <div class="info-icon-wrapper">
                            <v-icon icon="mdi-clock-outline" size="24" color="primary"></v-icon>
                        </div>
                        <div class="info-content">
                            <div class="info-value">{{ webinar.duration }}</div>
                            <div>Hora</div>
                        </div>
                    </div>
                </v-col>
            </v-row>

            <!-- Join Button -->
            <v-btn color="primary" variant="flat" size="large" block rounded="lg" class="join-button"
                prepend-icon="mdi-video">
                Join the event
            </v-btn>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    webinarData: {
        type: Object,
        default: () => ({})
    }
})

const webinar = computed(() => {
    if (Object.keys(props.webinarData).length > 0) {
        return props.webinarData
    }

    // Default webinar data
    return {
        title: 'Upcoming Office Hours',
        description: 'Next Generation conversation will happen on Discord.',
        date: '17 Nov 23',
        duration: '18:00 UTC'
    }
})
</script>

<style scoped>
.webinar-hero {
    background: linear-gradient(135deg, #e8e3ff 0%, #d4c5ff 100%);
    height: 200px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}



.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.info-icon-wrapper {
    background-color: rgb(var(--v-theme-primary), 0.1);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
}

.info-content {
    flex: 1;
}

.info-value {
    font-size: 1rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
}

.info-label {
    font-size: 0.875rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 2px;
}

.join-button {
    font-weight: 600;
    height: 48px;
    font-size: 1rem;
    text-transform: none;
    letter-spacing: 0.25px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .webinar-hero {
        height: 160px;
        padding: 16px;
    }

    .character-avatar {
        width: 100px !important;
        height: 100px !important;
    }

    .webinar-title {
        font-size: 1.25rem;
    }
}
</style>
