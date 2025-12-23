<template>
    <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="500">
        <v-card class="rounded-lg">
            <v-card-title style="color: white;" class="bg-primary rounded-top-lg">
                <v-icon color="white" class="mr-2">
                    mdi-account-plus
                </v-icon>
                {{ title || 'Send Invitation' }}
            </v-card-title>
            <v-card-text class="pt-4">
                <v-combobox 
                    :key="comboboxKey" 
                    ref="combobox" 
                    v-model="comboboxModel" 
                    :items="filteredUsers" 
                    item-title="email"
                    :label="selectLabel || 'Select cooperator'" 
                    multiple 
                    variant="outlined" 
                    density="comfortable"
                    chips
                    closable-chips
                    @update:model-value="onComboboxChange"
                    @keydown.enter="handleEnterKey"
                    clearable
                >
                    <template #no-data>
                        {{ noDataText || 'Type email address and press Enter to add any email' }}
                    </template>
                </v-combobox>

                <div class="mt-3">
                    <v-chip 
                        v-for="(coop, i) in selectedCoops" 
                        :key="i" 
                        closable 
                        @click:close="removeSelectedCoop(i)"
                        class="ml-1 mr-1 mt-2"
                    >
                        {{ getCoopEmail(coop) }}
                    </v-chip>
                </div>

                <v-select v-model="selectedRole" :items="roleOptions" :label="roleLabel || 'Role'" variant="outlined"
                    density="comfortable" class="mt-4" />

                <!-- Date/Time Selection (only for accessibility tests) -->
                <v-row v-if="showDateTimeSelection" class="mt-4">
                    <v-col cols="6">
                        <v-menu offset="26" :close-on-content-click="false" transition="scale-transition"
                            min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field v-model="date" readonly color="primary" v-bind="props" variant="outlined"
                                    density="compact" label="Date" prepend-inner-icon="mdi-calendar" />
                            </template>
                            <v-date-picker v-model="date"
                                :min="new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10)"
                                show-adjacent-months color="primary" />
                        </v-menu>
                    </v-col>
                    <v-col cols="6">
                        <v-menu :close-on-content-click="false" offset="40" transition="scale-transition"
                            min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field v-model="hour" prepend-inner-icon="mdi-clock-time-four-outline"
                                    density="compact" color="primary" variant="outlined" label="Time" readonly
                                    v-bind="props" />
                            </template>
                            <v-time-picker v-model="hour" :min="minTime" format="24hr" color="primary" scrollable />
                        </v-menu>
                    </v-col>
                </v-row>

                <v-textarea v-if="showInviteMessage" v-model="inviteMessage" color="primary"
                    :label="messageLabel || 'Invitation Message'"
                    :placeholder="messagePlaceholder || 'Enter your invitation message'" variant="outlined"
                    class="mt-4" />
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <v-spacer />
                <v-btn color="red" variant="outlined" class="rounded-lg" @click="onCancel">
                    {{ cancelText || 'Cancel' }}
                </v-btn>
                <v-btn color="primary" class="rounded-lg" :disabled="selectedCoops.length === 0" @click="onSend">
                    {{ sendText || 'Send' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils';
import { useToast } from 'vue-toastification';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    users: {
        type: Array,
        default: () => []
    },
    showDateTimeSelection: {
        type: Boolean,
        default: false
    },
    showInviteMessage: {
        type: Boolean,
        default: true
    },
    // Text customization props
    title: String,
    selectLabel: String,
    noDataText: String,
    roleLabel: String,
    messageLabel: String,
    messagePlaceholder: String,
    cancelText: String,
    sendText: String
});

const emit = defineEmits([
    'update:show',
    'send-invitations'
]);

const toast = useToast();

// Use composables
const {
    roleOptions,
    validateEmail: isValidEmail
} = useCooperatorUtils();

// Local state
const selectedCoops = ref([]);
const comboboxModel = ref([]);
const comboboxKey = ref(0);
const selectedRole = ref(1);
const inviteMessage = ref('');
const combobox = ref(null);
const pendingEmailInput = ref(''); // Track what user is currently typing

// Date and time for scheduling (accessibility tests)
const date = ref(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10)
);
const hour = ref(
    new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
);

const minTime = computed(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    const selectedDate = new Date(date.value);

    if (
        selectedDate.toLocaleDateString() === currentDate.toLocaleDateString() &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear()
    ) {
        return `${currentDate.getHours()}:${currentDate.getMinutes()}`;
    } else {
        return '00:00';
    }
});

const filteredUsers = computed(() => {
    return props.users.filter(user => user?.email != null);
});

// Helper methods
const getCoopEmail = (coop) => {
    return typeof coop === 'object' ? coop.email : coop;
};

const getEmailFromItem = (item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.email) return item.email;
    return null;
};

const isCoopAlreadySelected = (emailToCheck) => {
    return selectedCoops.value.some(
        coop => getCoopEmail(coop) === emailToCheck
    );
};

const addCoop = (item) => {
    const email = getEmailFromItem(item);
    
    if (!email) {
        toast.error('Invalid email');
        return false;
    }

    // Validate email format for string inputs
    if (typeof item === 'string' && !isValidEmail(email)) {
        toast.error('Invalid email format');
        return false;
    }

    // Check if already selected
    if (isCoopAlreadySelected(email)) {
        toast.warning(`${email} is already selected`);
        return false;
    }

    // Add to selected coops
    selectedCoops.value.push(item);
    return true;
};

const handleEnterKey = async (event) => {
    // Prevent default to avoid form submission if inside a form
    event.preventDefault();
    
    // Get the current input value from combobox
    const inputElement = combobox.value?.$el?.querySelector('input');
    if (inputElement) {
        const inputValue = inputElement.value.trim();
        
        if (inputValue) {
            // Check if input matches an existing user
            const existingUser = filteredUsers.value.find(user => 
                user.email.toLowerCase() === inputValue.toLowerCase()
            );
            
            const itemToAdd = existingUser || inputValue;
            
            if (addCoop(itemToAdd)) {
                // Clear the input
                comboboxModel.value = [];
                pendingEmailInput.value = '';
                comboboxKey.value++;
                
                // Focus back on input for next entry
                await nextTick();
                inputElement.focus();
            }
        }
    }
};

const onComboboxChange = (newValue) => {
    // When user selects from dropdown or chips are removed
    if (Array.isArray(newValue)) {
        const lastItem = newValue[newValue.length - 1];
        
        // If something was added
        if (lastItem && !isCoopAlreadySelected(getEmailFromItem(lastItem))) {
            addCoop(lastItem);
        }
        
        // Always clear the combobox model to show placeholder
        comboboxModel.value = [];
        comboboxKey.value++;
    }
};

const removeSelectedCoop = (index) => {
    selectedCoops.value.splice(index, 1);
};

const onCancel = () => {
    emit('update:show', false);
    resetForm();
};

const onSend = () => {
    const invitationData = {
        selectedCoops: selectedCoops.value,
        selectedRole: selectedRole.value,
        inviteMessage: inviteMessage.value
    };

    if (props.showDateTimeSelection) {
        invitationData.date = date.value;
        invitationData.hour = hour.value;
    }

    emit('send-invitations', invitationData);
    resetForm();
};

const resetForm = () => {
    selectedCoops.value = [];
    comboboxModel.value = [];
    inviteMessage.value = '';
    selectedRole.value = 1;
    pendingEmailInput.value = '';
    comboboxKey.value++;
    combobox.value?.blur();
};

// Watch for dialog visibility to reset form
watch(() => props.show, (newVal) => {
    if (!newVal) {
        resetForm();
    } else {
        // When dialog opens, focus the combobox
        nextTick(() => {
            const input = combobox.value?.$el?.querySelector('input');
            if (input) {
                input.focus();
            }
        });
    }
});
</script>

<style scoped>
.v-card {
    border-radius: 20px !important;
}

.v-combobox {
    border-radius: 10px !important;
}

.v-btn {
    font-weight: 600;
    text-transform: unset !important;
}
</style>
