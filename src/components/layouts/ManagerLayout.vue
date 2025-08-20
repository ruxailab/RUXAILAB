<template>
    <v-container class="pa-0 ma-0" fluid>
        <!-- Loading overlay -->
        <v-overlay v-if="showLoading && loading" :model-value="loading" class="text-center">
            <v-progress-circular indeterminate color="#fca326" size="50" />
            <div class="white-text mt-3">
                {{ $t('common.loading') }}
            </div>
        </v-overlay>

        <!-- Optional dialog slot for specific views -->
        <slot name="dialog" />

        <!-- Optional drawer slot -->
        <slot name="drawer" />

        <!-- Main content wrapper -->
        <v-container fluid :class="['background pa-0 ma-0', contentClass]" style="min-height: 100vh; overflow-y: auto">
            <!-- Header Section -->
            <v-row align="center" justify="center" class="manager-bg back-gradient pa-6">
                <!-- Text Column -->
                <v-col cols="12" md="6" class="text-white text-center text-md-left">
                    <p class="font-weight-medium text-h4 text-md-h2">
                        {{ headerTitle }}
                    </p>
                    <p class="text-subtitle-1 text-md-subtitle-1">
                        {{ headerSubtitle }}
                    </p>
                </v-col>

                <!-- Image Column -->
                <v-col cols="12" md="6" class="d-flex justify-center">
                    <v-img :src="require('@/assets/manager/IntroManager.svg')" max-height="300" max-width="100%" />
                </v-col>
            </v-row>

            <!-- Cards Section -->
            <v-container class="card-container pt-6 pb-10">
                <!-- Cards content slot -->
                <slot name="cards" />
            </v-container>

            <!-- Additional content slot -->
            <slot name="content" />
        </v-container>
    </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
    headerTitle: {
        type: String,
        required: true
    },
    headerSubtitle: {
        type: String,
        default: ''
    },
    showLoading: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    contentClass: {
        type: String,
        default: ''
    }
})
</script>

<style scoped>
.background {
    background-color: #ffffff;
    height: 100%;
    overflow: scroll;
}

.background::-webkit-scrollbar {
    display: none;
}

.presentation-text {
    color: rgb(87, 84, 100);
    font-weight: 700;
    font-size: 22px;
    margin-bottom: 20px;
}

.back-gradient {
    height: 60vh;
    background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
}

.manager-bg {
    height: 100%;
    margin: 0 !important;
}

.card-container {
    width: 80%;
}

@media screen and (max-width: 960px) {
    .presentation-text {
        display: flex;
        text-align: center;
        justify-content: center;
    }

    .card-container {
        width: 85%;
    }

    .back-gradient {
        height: 100%;
    }
}
</style>
