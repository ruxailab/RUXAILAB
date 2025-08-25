<template>
    <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="500">
        <v-card class="rounded-lg">
            <v-card-title style="color: white;" class="bg-primary rounded-top-lg">
                <v-icon color="white" class="mr-2">
                    mdi-email
                </v-icon>
                {{ title || 'Send a Message' }}
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="messageTitle" required :label="titleLabel || 'Title'"
                    :hint="titleHint || 'Type a title for your message'" variant="outlined" class="rounded-lg mt-4" />
                <v-textarea v-model="messageContent" required :label="contentLabel || 'Content'"
                    :hint="contentHint || 'Type the content of your message'" variant="outlined" class="rounded-lg" />
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn color="red" variant="outlined" class="rounded-lg" @click="onCancel">
                    {{ cancelText || 'Cancel' }}
                </v-btn>
                <v-btn color="orange" class="rounded-lg" :disabled="!messageTitle.trim() || !messageContent.trim()"
                    @click="onSend">
                    {{ sendText || 'Send' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    selectedUser: {
        type: Object,
        default: () => ({})
    },
    // Text customization props
    title: String,
    titleLabel: String,
    titleHint: String,
    contentLabel: String,
    contentHint: String,
    cancelText: String,
    sendText: String
});

const emit = defineEmits([
    'update:show',
    'send-message'
]);

// Local state
const messageTitle = ref('');
const messageContent = ref('');

// Methods
const onCancel = () => {
    emit('update:show', false);
    resetForm();
};

const onSend = () => {
    emit('send-message', {
        user: props.selectedUser,
        title: messageTitle.value,
        content: messageContent.value
    });
    resetForm();
};

const resetForm = () => {
    messageTitle.value = '';
    messageContent.value = '';
};

// Watch for dialog visibility to reset form
watch(() => props.show, (newVal) => {
    if (!newVal) {
        resetForm();
    }
});
</script>

<style scoped>
.v-card {
    border-radius: 20px !important;
}

.v-btn {
    font-weight: 600;
    text-transform: unset !important;
}
</style>
