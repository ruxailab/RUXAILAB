<template>
  <v-dialog
    :model-value="dialog"
    max-width="850"
    @click:outside="$emit('update:dialog', false)"
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="rounded-xxl elevation-8">
      <v-card-title
        class="bg-gradient-primary text-white pa-6 rounded-top-lg d-flex align-center"
      >
        <v-icon class="mr-3" size="28"> mdi-email-fast-outline </v-icon>

        <div>
          <h2 class="text-h5 font-weight-bold mb-1">
            {{ $t('Sessions.send.title') }}
          </h2>

          <p class="text-body-2 mb-0 opacity-90">
            {{ $t('Sessions.send.description') }}
          </p>
        </div>
      </v-card-title>

      <v-card-text class="pa-8">
        <v-form ref="form" v-model="valid" validate-on="input">
          <v-row>
            <!-- LEFT -->
            <v-col cols="12" md="6">
              <!-- RECIPIENT -->

              <div class="field-group">
                <div class="field-label">
                  <v-icon class="mr-2"> mdi-account-multiple-outline </v-icon>

                  {{ $t('Sessions.send.recipient') }}
                </div>

                <p class="field-description">
                  {{ $t('Sessions.send.recipientDescription') }}
                </p>

                <v-radio-group v-model="recipientType" color="primary">
                  <v-radio value="STAFF" :label="$t('Sessions.send.staff')" />

                  <v-radio
                    value="PARTICIPANTS"
                    :label="$t('Sessions.send.participants')"
                  />

                  <v-radio value="ALL" :label="$t('Sessions.send.all')" />

                  <v-radio
                    value="SPECIFIC"
                    :label="$t('Sessions.send.specific')"
                  />
                </v-radio-group>
              </div>

              <!-- SPECIFIC EMAIL -->

              <div v-if="recipientType === 'SPECIFIC'" class="field-group">
                <div class="field-label">
                  <v-icon class="mr-2"> mdi-email-outline </v-icon>

                  {{ $t('Sessions.send.email') }}
                </div>

                <v-autocomplete
                  v-model="selectedMembers"
                  :items="sessionMembers"
                  item-title="email"
                  return-object
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-search-outline"
                  :placeholder="$t('Sessions.send.emailRequired')"
                  clearable
                  :rules="[
                    (v) =>
                      recipientType !== 'SPECIFIC' ||
                      v.length > 0 ||
                      $t('Sessions.send.emailRequired'),
                  ]"
                />
              </div>

              <!-- MESSAGE -->

              <div class="field-group">
                <div class="field-label">
                  <v-icon class="mr-2"> mdi-message-text-outline </v-icon>

                  {{ $t('Sessions.send.message') }}
                </div>

                <p class="field-description">
                  {{ $t('Sessions.send.messageDescription') }}
                </p>

                <v-textarea
                  v-model="message"
                  rows="6"
                  auto-grow
                  counter
                  maxlength="1000"
                  variant="outlined"
                  :placeholder="$t('Sessions.send.placeholder')"
                  :rules="[
                    (v) => !!v || $t('Sessions.send.messageRequired'),
                    (v) => !v || v.length <= 1000,
                  ]"
                />
              </div>
            </v-col>

            <!-- RIGHT -->

            <v-col cols="12" md="6">
              <div class="preview-section">
                <div class="preview-header mb-4">
                  <v-icon class="mr-2" color="primary">
                    mdi-eye-outline
                  </v-icon>

                  <h3 class="text-h6">
                    {{ $t('Sessions.preview.title') }}
                  </h3>
                </div>

                <v-card border class="invitation-preview">
                  <v-card-title class="bg-grey-lighten-4">
                    <v-icon color="primary" class="mr-2">
                      mdi-email-fast-outline
                    </v-icon>

                    {{ $t('Sessions.send.preview') }}
                  </v-card-title>

                  <v-card-text>
                    <div class="my-4">
                      <strong>
                        {{ $t('Sessions.send.recipient') }}
                      </strong>

                      <div class="mt-2">
                        <v-chip color="primary" variant="tonal">
                          {{
                            recipientType === 'STAFF'
                              ? $t('Sessions.send.staff')
                              : recipientType === 'PARTICIPANTS'
                                ? $t('Sessions.send.participants')
                                : recipientType === 'ALL'
                                  ? $t('Sessions.send.all')
                                  : $t('Sessions.send.specific')
                          }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="mb-4">
                      <strong>
                        {{ $t('Sessions.send.email') }}
                      </strong>

                      <div class="mt-2 d-flex flex-wrap ga-2">
                        <v-chip
                          v-for="member in previewRecipients"
                          :key="member.email"
                          color="primary"
                          variant="tonal"
                          size="small"
                        >
                          {{ member.email }}
                        </v-chip>

                        <span v-if="!previewRecipients.length">-</span>
                      </div>
                    </div>

                    <div class="mb-4">
                      <strong>
                        {{ $t('Sessions.headers.title') }}
                      </strong>

                      <div class="mt-2">
                        {{ session?.title || '-' }}
                      </div>
                    </div>

                    <div class="mb-4">
                      <strong>
                        {{ $t('Sessions.headers.start') }}
                      </strong>

                      <div class="mt-2">
                        {{ formattedSessionDate }}
                      </div>
                    </div>

                    <div>
                      <strong>
                        {{ $t('Sessions.send.message') }}
                      </strong>

                      <div
                        class="mt-2 pa-3 bg-grey-lighten-5 rounded"
                        style="min-height: 120px"
                      >
                        {{ message || $t('Sessions.send.noMessage') }}
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <v-alert
                  class="mt-6"
                  type="info"
                  variant="tonal"
                  icon="mdi-information-outline"
                >
                  <v-alert-title>
                    {{ $t('Sessions.info.title') }}
                  </v-alert-title>

                  <div class="text-body-2 mt-2">
                    {{ $t('Sessions.send.info') }}
                  </div>
                </v-alert>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="d-flex justify-end ga-3">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              @click="$emit('update:dialog', false)"
            >
              {{ $t('Sessions.actions.cancel') }}
            </v-btn>

            <v-btn
              color="primary"
              prepend-icon="mdi-send"
              :loading="loading"
              :disabled="!valid"
              @click="sendMessage"
            >
              {{ $t('Sessions.send.send') }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import { showError, showSuccess } from '@/shared/utils/toast'

const props = defineProps({
  dialog: Boolean,

  session: {
    type: Object,
    default: null,
  },

  study: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:dialog'])

const { t } = useI18n()

const store = useStore()

const form = ref(null)

const valid = ref(false)

const loading = ref(false)

const recipientType = ref('ALL')

const selectedMembers = ref([])

const message = ref('')

const sessionMembers = computed(() => {
  const members = [
    ...(props.session?.staff || []),
    ...(props.session?.participants || []),
  ]

  return members.filter(
    (member, index, array) =>
      array.findIndex((item) => item.email === member.email) === index,
  )
})

const previewRecipients = computed(() => {
  if (!props.session) return []

  let members = []

  switch (recipientType.value) {
    case 'STAFF':
      members = props.session.staff || []
      break

    case 'PARTICIPANTS':
      members = props.session.participants || []
      break

    case 'ALL':
      members = [
        ...(props.session.staff || []),
        ...(props.session.participants || []),
      ]
      break

    case 'SPECIFIC':
      members = selectedMembers.value
      break

    default:
      members = []
  }

  return members.filter(
    (member, index, array) =>
      array.findIndex((item) => item.email === member.email) === index,
  )
})

const formattedSessionDate = computed(() => {
  if (!props.session?.startDate) {
    return '-'
  }

  let date = props.session.startDate

  if (date?.toDate) {
    date = date.toDate()
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
})

const sendMessage = async () => {
  const { valid: isValid } = await form.value.validate()

  if (!isValid) return

  try {
    loading.value = true

    await store.dispatch('sendMessageSessionMembers', {
      studyId: props.study.id,
      sessionId: props.session.id,
      recipientType: recipientType.value,
      members: selectedMembers.value,
      message: message.value,
    })

    showSuccess(t('Sessions.success.messageSent'))

    resetForm()

    emit('update:dialog', false)
  } catch {
    showError(t('Sessions.error.sendMessageFailed'))
  } finally {
    loading.value = false
  }
}
function resetForm() {
  recipientType.value = 'ALL'

  selectedMembers.value = []

  message.value = ''

  form.value?.resetValidation()
}

watch(
  () => props.dialog,
  (opened) => {
    if (opened) {
      resetForm()
    }
  },
)
</script>

<style scoped>
.v-dialog {
  border-radius: 20px !important;
}

.bg-gradient-primary {
  background: #00213f;
}

.v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-section {
  height: 100%;
}

.field-group {
  margin-bottom: 28px;
}

.field-label {
  display: flex;
  align-items: center;

  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;

  margin-bottom: 8px;
}

.field-description {
  color: #64748b;

  font-size: 14px;
  line-height: 1.4;

  margin-bottom: 12px;
}

.preview-section {
  height: 100%;

  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;

  padding-bottom: 16px;

  border-bottom: 2px solid #f1f5f9;
}

.invitation-preview {
  border-radius: 12px;

  border: 1px solid #e2e8f0;

  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.invitation-preview:hover {
  transform: translateY(-2px);

  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.info-section {
  margin-top: auto;
}

:deep(.v-text-field .v-field),
:deep(.v-textarea .v-field),
:deep(.v-select .v-field),
:deep(.v-autocomplete .v-field) {
  border-radius: 12px;
}

:deep(.v-radio-group) {
  margin-top: 8px;
}

:deep(.v-selection-control) {
  min-height: 40px;
}

:deep(.v-btn) {
  border-radius: 12px;

  text-transform: none;

  font-weight: 600;

  letter-spacing: 0.02em;
}

:deep(.v-chip) {
  margin: 2px;
}

@media (max-width: 960px) {
  .preview-section {
    margin-top: 32px;
  }

  .field-group {
    margin-bottom: 22px;
  }
}
</style>
