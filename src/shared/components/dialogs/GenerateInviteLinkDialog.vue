<template>
  <v-dialog
    :model-value="show"
    max-width="550"
    @update:model-value="$emit('update:show', $event)"
  >
    <v-card class="rounded-lg">
      <v-card-title class="bg-primary text-white rounded-top-lg">
        <v-icon class="mr-2" color="white"> mdi-link-variant </v-icon>

        {{ t('cooperators.inviteLink.title') }}
      </v-card-title>

      <v-card-text class="pt-5">
        <v-alert type="info" variant="tonal" class="mb-5">
          {{
            preDefinedRole
              ? t('Participants.invite.description')
              : t('cooperators.inviteLink.description')
          }}
        </v-alert>

        <v-select
          v-if="!preDefinedRole"
          v-model="selectedRole"
          :items="roleOptions"
          :label="t('cooperators.invite.role')"
          variant="outlined"
          density="comfortable"
          :disabled="loading"
        />

        <v-text-field
          v-if="inviteLink"
          v-model="inviteLink"
          class="mt-4"
          variant="outlined"
          readonly
          prepend-inner-icon="mdi-link-variant"
        >
          <template #append-inner>
            <v-btn icon="mdi-content-copy" variant="text" @click="copyLink" />
          </template>
        </v-text-field>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn variant="outlined" color="red" @click="close">
          {{ t('common.close') }}
        </v-btn>

        <v-btn color="primary" :loading="loading" @click="generateLink">
          {{
            inviteLink
              ? t('cooperators.inviteLink.generateNew')
              : t('cooperators.inviteLink.generate')
          }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import InviteController from '@/shared/controllers/InviteController'
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
import { showSuccess } from '@/shared/utils/toast'

const { t } = useI18n()
const { roleOptions } = useCooperatorUtils()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  studyId: {
    type: String,
    required: true,
  },
  studyTitle: {
    type: String,
    required: true,
  },
  requiredLogin: {
    type: String,
    required: true,
  },
  preDefinedRole: {
    type: Array,
    default: null,
  },
  membershipType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:show', 'generated'])

const selectedRole = ref(1)
const inviteLink = ref('')
const loading = ref(false)

const generateLink = async () => {
  try {
    loading.value = true

    const result = await InviteController.generateInvitationLink({
      studyId: props.studyId,
      studyTitle: props.studyTitle,
      accessLevel: selectedRole.value,
      requiredLogin: props.requiredLogin,
      toEmail: null, // No email provided for public invites
      isPublic: true,
      membershipType: props.membershipType,
    })

    inviteLink.value = result.inviteLink

    emit('generated', result.inviteLink)
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  await navigator.clipboard.writeText(inviteLink.value)

  showSuccess(t('cooperators.inviteLink.copied'))
}

const close = () => {
  emit('update:show', false)
}

watch(
  () => props.show,
  (opened) => {
    if (!opened) {
      inviteLink.value = ''
      selectedRole.value = props.preDefinedRole ?? 1
      loading.value = false
    }
  },
)

watch(
  () => props.preDefinedRole,
  (predefinedRole) => {
    if (predefinedRole) selectedRole.value = predefinedRole
  },
)
</script>

<style scoped>
.v-card {
  border-radius: 20px !important;
}

.v-btn {
  text-transform: none !important;
  font-weight: 600;
}

:deep(.v-btn) {
  border-radius: 12px;
}
</style>
