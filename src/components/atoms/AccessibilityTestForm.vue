<template>
    <v-form ref="form" @submit.prevent>
        <div class="form-container">
            <!-- Test Title -->
            <div class="input-group mb-6">
                <label for="test-title" class="input-label">Test Title</label>
                <v-text-field id="test-title" :model-value="test.title" :autofocus="true" label="Test Title"
                    :rules="titleRequired" counter="200" variant="outlined" density="comfortable"
                    placeholder="Enter a descriptive title for your accessibility test" hide-details="auto"
                    class="modern-input" @update:model-value="updateTitle($event)" />
            </div>

            <!-- Website URL -->
            <div class="input-group mb-6">
                <label for="website-url" class="input-label">Website URL</label>
                <v-text-field id="website-url" :model-value="test.websiteUrl" label="Website URL" :rules="urlRequired"
                    variant="outlined" density="comfortable" placeholder="Enter the URL of the website to test"
                    hide-details="auto" class="modern-input" @update:model-value="updateWebsiteUrl($event)">
                    <template v-slot:prepend-inner>
                        <v-icon size="18" color="grey-500">mdi-web</v-icon>
                    </template>
                </v-text-field>
            </div>

            <!-- Test Description -->
            <div class="input-group mb-6">
                <label for="test-description" class="input-label">Description</label>
                <v-textarea id="test-description" :model-value="test.description" label="Test Description"
                    variant="outlined" rows="4" density="comfortable"
                    placeholder="Provide a detailed description of what this accessibility test covers"
                    hide-details="auto" class="modern-input" @update:model-value="updateDescription($event)" />
            </div>

            <!-- Test Status -->
            <div class="input-group mb-6">
                <label for="test-status" class="input-label">Test Status</label>
                <v-select id="test-status" :model-value="test.status" :items="statusOptions" label="Test Status"
                    density="comfortable" variant="outlined" placeholder="Select the current status of this test"
                    hide-details="auto" class="modern-input" @update:model-value="updateStatus($event)">
                    <template v-slot:prepend-inner>
                        <v-icon size="18" :color="getStatusColor(test.status)">
                            {{ getStatusIcon(test.status) }}
                        </v-icon>
                    </template>
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :prepend-icon="getStatusIcon(item.value)">
                            <template v-slot:prepend>
                                <v-icon :color="getStatusColor(item.value)">
                                    {{ getStatusIcon(item.value) }}
                                </v-icon>
                            </template>
                        </v-list-item>
                    </template>
                </v-select>
            </div>

            <!-- WCAG Version -->
            <div class="input-group mb-6">
                <label for="wcag-version" class="input-label">WCAG Version</label>
                <v-select id="wcag-version" :model-value="test.version" :items="wcagVersions" label="WCAG Version"
                    density="comfortable" variant="outlined" placeholder="Select WCAG version for this test"
                    hide-details="auto" class="modern-input" @update:model-value="updateVersion($event)">
                    <template v-slot:prepend-inner>
                        <v-icon size="18" color="grey-500">mdi-format-list-numbered</v-icon>
                    </template>
                </v-select>
            </div>

            <!-- Test Progress Summary (Read-only) -->
            <div class="input-group mb-6" v-if="test.progress">
                <label class="input-label">Test Progress</label>
                <v-card variant="outlined" class="progress-card">
                    <v-card-text class="pa-4">
                        <div class="d-flex align-center justify-space-between mb-3">
                            <span class="text-subtitle-2 font-weight-medium">Overall Progress</span>
                            <v-chip :color="getProgressColor(test.progress.completed, test.progress.total)" size="small"
                                variant="flat">
                                {{ test.progress.completed }} / {{ test.progress.total }}
                            </v-chip>
                        </div>
                        <v-progress-linear
                            :model-value="getProgressPercentage(test.progress.completed, test.progress.total)"
                            :color="getProgressColor(test.progress.completed, test.progress.total)" height="8" rounded
                            class="mb-3" />
                        <div class="d-flex justify-space-between text-caption text-grey-600">
                            <span>Pass: {{ test.progress.byStatus.pass }}</span>
                            <span>Fail: {{ test.progress.byStatus.fail }}</span>
                            <span>N/A: {{ test.progress.byStatus.na }}</span>
                            <span>Untested: {{ test.progress.byStatus.untested }}</span>
                        </div>
                    </v-card-text>
                </v-card>
            </div>

            <!-- Timestamps (Read-only) -->
            <div class="d-flex ga-4 mb-6" v-if="test.createdAt || test.updatedAt">
                <div class="input-group flex-1" v-if="test.createdAt">
                    <label for="created-date" class="input-label">Created</label>
                    <v-text-field id="created-date" :model-value="formatDate(test.createdAt)" label="Created Date"
                        variant="outlined" density="comfortable" readonly hide-details class="modern-input">
                        <template v-slot:prepend-inner>
                            <v-icon size="18" color="grey-500">mdi-calendar-plus</v-icon>
                        </template>
                    </v-text-field>
                </div>
                <div class="input-group flex-1" v-if="test.updatedAt">
                    <label for="updated-date" class="input-label">Last Updated</label>
                    <v-text-field id="updated-date" :model-value="formatDate(test.updatedAt)" label="Updated Date"
                        variant="outlined" density="comfortable" readonly hide-details class="modern-input">
                        <template v-slot:prepend-inner>
                            <v-icon size="18" color="grey-500">mdi-calendar-edit</v-icon>
                        </template>
                    </v-text-field>
                </div>
            </div>
        </div>
    </v-form>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
    test: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:test', 'validate'])

const form = ref(null)

// Validation rules
const titleRequired = [
    v => !!v?.trim() || 'Title is required',
    v => (v?.length || 0) <= 200 || 'Title must not exceed 200 characters',
    v => (v?.length || 0) >= 3 || 'Title must be at least 3 characters'
]

const urlRequired = [
    v => !!v?.trim() || 'Website URL is required',
    v => {
        try {
            new URL(v)
            return true
        } catch {
            return 'Please enter a valid URL'
        }
    }
]

// Options
const statusOptions = [
    { title: 'Draft', value: 'draft' },
    { title: 'In Progress', value: 'in-progress' },
    { title: 'Completed', value: 'completed' },
    { title: 'Archived', value: 'archived' }
]

const wcagVersions = [
    { title: 'WCAG 2.1', value: '2.1' },
    { title: 'WCAG 2.2', value: '2.2' }
]

// Methods
const updateTitle = (value) => {
    emit('update:test', { ...props.test, title: value })
    validateForm()
}

const updateWebsiteUrl = (value) => {
    emit('update:test', { ...props.test, websiteUrl: value })
    validateForm()
}

const updateDescription = (value) => {
    emit('update:test', { ...props.test, description: value })
    validateForm()
}

const updateStatus = (value) => {
    emit('update:test', { ...props.test, status: value })
    validateForm()
}

const updateVersion = (value) => {
    emit('update:test', { ...props.test, version: value })
    validateForm()
}

const validateForm = async () => {
    await nextTick()
    if (form.value) {
        const { valid } = await form.value.validate()
        emit('validate', valid)
    }
}

const getStatusColor = (status) => {
    const colors = {
        draft: 'grey',
        'in-progress': 'warning',
        completed: 'success',
        archived: 'error'
    }
    return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
    const icons = {
        draft: 'mdi-file-document-outline',
        'in-progress': 'mdi-clock-outline',
        completed: 'mdi-check-circle-outline',
        archived: 'mdi-archive-outline'
    }
    return icons[status] || 'mdi-file-document-outline'
}

const getProgressPercentage = (completed, total) => {
    if (!total || total === 0) return 0
    return Math.round((completed / total) * 100)
}

const getProgressColor = (completed, total) => {
    const percentage = getProgressPercentage(completed, total)
    if (percentage === 0) return 'grey'
    if (percentage < 30) return 'error'
    if (percentage < 70) return 'warning'
    return 'success'
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (e) {
        console.error('Error formatting date:', e)
        return 'Invalid date'
    }
}

// Watch for test changes to validate
watch(() => props.test, () => {
    validateForm()
}, { deep: true, immediate: true })
</script>

<style scoped>
.form-container {
    padding: 0;
}

.input-group {
    margin-bottom: 24px;
}

.input-label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    font-size: 0.875rem;
}

.modern-input :deep(.v-field) {
    border-radius: 12px;
    transition: all 0.2s ease;
}

.modern-input :deep(.v-field--focused) {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.modern-input :deep(.v-field__input) {
    padding: 12px 16px;
}

.progress-card {
    border-radius: 12px;
    background: #f8f9fa;
}

.progress-card :deep(.v-card-text) {
    background: transparent;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .input-group {
        margin-bottom: 20px;
    }

    .d-flex.ga-4 {
        flex-direction: column;
        gap: 0 !important;
    }

    .d-flex.ga-4 .input-group {
        margin-bottom: 20px;
    }
}
</style>
