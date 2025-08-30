<template>
  <PageWrapper
    :title="title"
    :loading="loadingPage"
    loading-text="Loading Test Settings"
    :side-gap="true"
  >
    <!-- Actions Slot for Save Button -->
    <template #actions>
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="text-none font-weight-semibold rounded-s px-6"
        :loading="loading"
        :disabled="!localChanges"
        @click="submit()"
      >
        <v-icon
          start
          size="18"
        >
          mdi-check
        </v-icon>
        Save Changes
      </v-btn>
    </template>

    <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ subtitle }}
      </p>
    </template>

    <!-- Main Content -->
    <Snackbar />
    <LeaveAlert @submit="onSubmit" />

    <!-- Template Creation Dialog -->
    <v-dialog
      v-model="tempDialog"
      max-width="800"
    >
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center px-6 py-4">
          <v-icon
            color="primary"
            size="28"
            class="mr-3"
          >
            mdi-file-document-plus-outline
          </v-icon>
          <h3 class="text-h5 font-weight-bold text-grey-darken-4">
            Create Template
          </h3>
          <v-spacer />
          <v-btn
            icon
            variant="flat"
            class="text-grey-darken-1"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-form
          ref="tempform"
          class="pa-6"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="template.templateTitle"
                autofocus
                label="Title"
                :rules="titleRequired"
                counter="200"
                variant="outlined"
                density="comfortable"
                placeholder="Enter a title for your template"
                class="mb-4"
              />
              <v-textarea
                v-model="template.templateDescription"
                label="Description"
                variant="outlined"
                rows="4"
                density="comfortable"
                placeholder="Provide a description for your template"
                class="mb-4"
              />
              <v-checkbox
                v-model="template.isTemplatePublic"
                label="Make template public to all users"
                color="primary"
                hide-details
                class="mt-0 pt-0"
              />
            </v-col>
          </v-row>
          <v-divider class="my-6" />
          <v-card-actions class="px-0 pt-0">
            <v-spacer />
            <v-btn
              class="text-none rounded-lg px-6"
              variant="outlined"
              color="grey-darken-2"
              height="44"
              @click="closeDialog()"
            >
              Cancel
            </v-btn>
            <v-btn
              variant="flat"
              :disabled="hasTemplate ? true : false"
              color="primary"
              height="44"
              class="text-none rounded-lg ml-3"
              @click="createTemplate()"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <div class="settings-layout">
      <div class="content-wrapper">
        <div class="left-column">
          <v-card
            class="info-card"
            elevation="0"
            height="auto"
          >
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-grey-lighten-4 rounded-lg d-flex align-center justify-center">
                <v-icon
                  :color="iconColor"
                  size="20"
                >
                  {{ testIcon }}
                </v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
                  Test Information
                </h3>
                <p class="text-caption text-grey-darken-1">
                  Basic test settings and description
                </p>
              </div>
            </div>
            <v-card-text class="py-6">
              <FormTestDescription
                v-if="object"
                ref="form1"
                :test="object"
                :lock="false"
                :disable-type="true"
                @val-form="validate"
                @update:test="updateObject"
              />
              
              <!-- Website URL - moved here to be with basic test info -->
              <div class="input-group mt-6">
                <v-text-field
                  id="website-url-input"
                  v-model="object.websiteUrl"
                  label="Website URL"
                  variant="outlined"
                  density="comfortable"
                  placeholder="https://example.com"
                  hide-details="auto"
                  class="modern-input"
                  @update:model-value="updateWebsiteUrl"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>

        <div class="right-column">
          <v-card
            class="advanced-card"
            elevation="0"
          >
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-blue-lighten-5 rounded-lg d-flex align-center justify-center">
                <v-icon
                  color="blue-darken-2"
                  size="20"
                >
                  mdi-cog-outline
                </v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
                  Advanced Settings
                </h3>
                <p class="text-caption text-grey-darken-1">
                  {{ advancedDescription }}
                </p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div 
                v-if="object" 
                class="d-flex flex-column ga-5"
              >
                <!-- Status Selection -->
                <v-select
                  v-model="object.status"
                  :items="statusOptions"
                  label="Test Status"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="updateObject(object)"
                >
                  <template #selection="{ item }">
                    <v-chip
                      :color="getStatusColor(item.value)"
                      size="small"
                      variant="flat"
                    >
                      {{ item.title }}
                    </v-chip>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-chip
                          :color="getStatusColor(item.value)"
                          size="small"
                          variant="flat"
                        >
                          {{ item.title }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>

                <!-- Slot for test-specific advanced settings -->
                <slot name="advanced-settings" :object="object" :update-object="updateObject" />

                <!-- Public Test -->
                <v-checkbox
                  v-model="object.isPublic"
                  label="Make test publicly viewable"
                  color="primary"
                  hide-details
                  @update:model-value="updateObject(object)"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <v-card
        class="actions-card"
        elevation="0"
      >
        <div class="d-flex align-start ga-3 pa-6 pb-0">
          <div class="header-icon bg-amber-lighten-5 rounded-lg d-flex align-center justify-center">
            <v-icon
              color="amber-darken-2"
              size="20"
            >
              mdi-lightning-bolt
            </v-icon>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">
              Quick Actions
            </h3>
            <p class="text-caption text-grey-darken-1">
              Perform common tasks instantly
            </p>
          </div>
        </div>
        <v-card-text class="py-6">
          <div class="d-flex ga-3 flex-wrap">
            <v-btn
              color="secondary"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="hasTemplate || !object"
              @click="tempDialog = true"
            >
              <v-icon
                start
                size="18"
              >
                mdi-file-document-plus-outline
              </v-icon>
              Create Template
            </v-btn>
            <v-btn
              color="orange-darken-1"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="!object"
              @click="duplicateTest()"
            >
              <v-icon
                start
                size="18"
              >
                mdi-content-copy
              </v-icon>
              Duplicate Test
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-none font-weight-semibold rounded-s py-3"
              height="48"
              :disabled="!object"
              @click="dialogDel = true"
            >
              <v-icon
                start
                size="18"
              >
                mdi-delete
              </v-icon>
              Delete Test
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="dialogDel"
      max-width="500"
      persistent
    >
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-start ga-4 pa-6 pb-0">
          <div class="dialog-icon bg-red-lighten-5 rounded-lg d-flex align-center justify-center">
            <v-icon
              color="error"
              size="28"
            >
              mdi-alert-circle-outline
            </v-icon>
          </div>
          <div>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">
              Confirm Deletion
            </h3>
            <p class="text-subtitle-2 text-grey-darken-1">
              This action cannot be undone
            </p>
          </div>
        </v-card-title>
        <v-card-text class="py-4 px-6">
          <p class="text-body-2 text-grey-darken-1">
            {{ dialogText }} All associated data, results, and configurations will be lost forever.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-end ga-3">
          <v-btn
            variant="outlined"
            color="grey-darken-2"
            :disabled="loading"
            class="text-none rounded-lg px-6"
            height="44"
            @click="dialogDel = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="loading"
            class="text-none rounded-lg px-6"
            height="44"
            @click="deleteTest(object)"
          >
            <v-icon
              start
              size="16"
            >
              mdi-delete
            </v-icon>
            Delete Forever
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AccessNotAllowed v-if="!loadingPage && !object" />
  </PageWrapper>
</template>

<script setup>
import FormTestDescription from '@/shared/components/FormTestDescription'
import Snackbar from '@/shared/components/Snackbar'
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert'
import AccessNotAllowed from '@/shared/views/AccessNotAllowed'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  testIcon: {
    type: String,
    default: 'mdi-eye-check-outline'
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  advancedDescription: {
    type: String,
    default: 'Test configuration and options'
  },
  // Configuration for the composable
  composableConfig: {
    type: Object,
    required: true
  }
})

// Import and use the composable directly
import { useAccessibilityTestSettings } from '@/shared/composables/useAccessibilityTestSettings'

const {
  template,
  object,
  valids,
  dialogDel,
  loading,
  loadingPage,
  tempDialog,
  form1,
  tempform,
  statusOptions,
  titleRequired,
  localChanges,
  user,
  dialogText,
  hasTemplate,
  getStatusColor,
  validate,
  onSubmit,
  submit,
  deleteTest,
  createTemplate,
  closeDialog,
  updateObject,
  updateWebsiteUrl,
  duplicateTest,
} = useAccessibilityTestSettings(props.composableConfig)
</script>

<style scoped>
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem 0;
}

/* Content Layout */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Styles */
.info-card,
.advanced-card,
.actions-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.info-card:hover,
.advanced-card:hover,
.actions-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
}

.dialog-icon {
  width: 56px;
  height: 56px;
}

/* Input Styles for consistency with FormTestDescription */
.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.modern-input :deep(.v-field) {
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.modern-input :deep(.v-field__outline) {
  border-color: #e5e7eb;
}

.modern-input :deep(.v-field--focused .v-field__outline) {
  border-color: #3b82f6;
  border-width: 2px;
}

.modern-input :deep(.v-field:hover .v-field__outline) {
  border-color: #d1d5db;
}

.modern-input :deep(.v-field__input) {
  font-size: 0.875rem;
  padding: 16px;
}

/* Quick Actions Horizontal Layout */
.actions-card {
  width: 100%;
  margin-top: 24px;
}

.actions-card .d-flex {
  flex-direction: row;
  gap: 12px;
}

.actions-card .v-btn {
  flex: 1;
  min-width: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .actions-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .actions-card .d-flex {
    flex-direction: column;
    gap: 12px;
  }

  .actions-card .v-btn {
    flex: none;
    width: 100%;
  }

  .actions-card {
    width: 100%;
  }
}
</style>
