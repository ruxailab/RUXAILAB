<template>
  <v-card
    class="test-info-card"
    elevation="2"
    variant="outlined"
  >
    <!-- Header -->
    <v-card-title class="header-section d-flex align-center pa-4">
      <v-icon
        icon="mdi-information-outline"
        size="20"
        color="primary"
        class="mr-3"
      />
      <div>
        <h3 class="text-h6 font-weight-bold mb-0">
          Test Information
        </h3>
        <p class="text-caption text-medium-emphasis mb-0">
          Accessibility assessment details
        </p>
      </div>
      <v-spacer />
      <v-btn 
        v-if="showEditButton && !loading"
        color="primary"
        variant="outlined"
        :to="{ name: 'EditAccessibilityTest', params: { testId: testId } }"
        prepend-icon="mdi-pencil"
        size="small"
        class="edit-btn"
      >
        Edit
      </v-btn>
    </v-card-title>

    <!-- Loading state -->
    <v-card-text
      v-if="loading"
      class="pa-4"
    >
      <div class="d-flex align-center justify-center">
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="24"
          class="mr-3"
        />
        <span class="text-body-2">Loading test information...</span>
      </div>
    </v-card-text>

    <!-- Content when test data is available -->
    <v-card-text
      v-else-if="test"
      class="pa-0"
    >
      <div class="content-area pa-4">
        <v-row dense>
          <!-- Left column - Basic Info -->
          <v-col
            cols="12"
            md="6"
          >
            <div class="section-title mb-3">
              <v-icon
                icon="mdi-file-document-outline"
                color="primary"
                size="16"
                class="mr-2"
              />
              <span class="text-subtitle-2 font-weight-medium">Basic Information</span>
            </div>
            
            <div class="info-list">
              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-format-title"
                    size="14"
                    class="mr-2"
                  />
                  Title
                </div>
                <div class="info-value">
                  {{ test.title }}
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-text-box-outline"
                    size="14"
                    class="mr-2"
                  />
                  Description
                </div>
                <div class="info-value">
                  {{ test.description || 'No description provided' }}
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-web"
                    size="14"
                    class="mr-2"
                  />
                  Website URL
                </div>
                <div class="info-value">
                  <a 
                    v-if="test.websiteUrl" 
                    :href="test.websiteUrl" 
                    target="_blank"
                    class="website-link text-body-2"
                    @click="handleLinkClick"
                  >
                    {{ test.websiteUrl }}
                    <v-icon
                      icon="mdi-open-in-new"
                      size="12"
                      class="ml-1"
                    />
                  </a>
                  <span
                    v-else
                    class="text-grey"
                  >Not specified</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right column - Metadata -->
          <v-col
            cols="12"
            md="6"
          >
            <div class="section-title mb-3">
              <v-icon
                icon="mdi-cog-outline"
                color="primary"
                size="16"
                class="mr-2"
              />
              <span class="text-subtitle-2 font-weight-medium">Metadata</span>
            </div>
            
            <div class="info-list">
              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-account-circle-outline"
                    size="14"
                    class="mr-2"
                  />
                  Created By
                </div>
                <div class="info-value">
                  <div class="d-flex align-center">
                    <v-avatar
                      size="20"
                      color="primary"
                      class="mr-2"
                    >
                      <span class="text-caption">{{ getUserInitials(test.testAdmin?.email) }}</span>
                    </v-avatar>
                    <span class="text-body-2">{{ test.testAdmin?.email || 'Unknown' }}</span>
                  </div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-calendar-plus"
                    size="14"
                    class="mr-2"
                  />
                  Created At
                </div>
                <div class="info-value">
                  <span class="text-body-2">{{ formatDate(test.createdAt) }}</span>
                  <v-chip
                    size="x-small"
                    color="grey"
                    variant="tonal"
                    class="ml-1"
                  >
                    {{ getRelativeTime(test.createdAt) }}
                  </v-chip>
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-update"
                    size="14"
                    class="mr-2"
                  />
                  Last Updated
                </div>
                <div class="info-value">
                  <span class="text-body-2">{{ formatDate(test.updatedAt) }}</span>
                  <v-chip
                    size="x-small"
                    color="grey"
                    variant="tonal"
                    class="ml-1"
                  >
                    {{ getRelativeTime(test.updatedAt) }}
                  </v-chip>
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">
                  <v-icon
                    icon="mdi-shield-check-outline"
                    size="14"
                    class="mr-2"
                  />
                  Status
                </div>
                <div class="info-value">
                  <v-chip 
                    :color="getStatusColor(test.status)" 
                    size="small" 
                    class="text-capitalize"
                    variant="tonal"
                  >
                    <v-icon
                      :icon="getStatusIcon(test.status)"
                      size="14"
                      class="mr-1"
                    />
                    {{ test.status }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Footer -->
      <v-divider />
      <div class="footer-section pa-3">
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-identifier"
              size="14"
              class="mr-2 text-grey"
            />
            <span class="text-caption text-grey">Test ID: {{ testId }}</span>
          </div>
          <v-btn 
            icon="mdi-content-copy"
            size="x-small"
            variant="text"
            class="copy-btn"
            @click="copyTestId"
          >
            <v-icon size="14" />
            <v-tooltip
              activator="parent"
              location="top"
            >
              Copy Test ID
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- Error state -->
    <v-card-text
      v-else
      class="pa-4"
    >
      <v-alert 
        type="error" 
        variant="tonal" 
        density="compact"
        icon="mdi-alert-circle"
      >
        <v-alert-title>Unable to Load Test Information</v-alert-title>
        <div class="text-body-2 mt-1">
          Failed to load test information. Please refresh the page or try again later.
        </div>
        <template #append>
          <v-btn 
            color="error" 
            variant="text"
            size="small"
            prepend-icon="mdi-refresh"
            @click="$emit('retry')"
          >
            Retry
          </v-btn>
        </template>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  test: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  testId: {
    type: String,
    required: true
  },
  showEditButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['retry']);
const toast = useToast();

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

// Get relative time (e.g., "2 days ago")
const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (e) {
    console.log(e)
    return '';
  }
};

// Get user initials from email
const getUserInitials = (email) => {
  if (!email) return '?';
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email[0].toUpperCase();
};

// Get color based on status
const getStatusColor = (status) => {
  const statusColors = {
    draft: 'grey',
    active: 'success',
    completed: 'primary',
    archived: 'warning',
    deleted: 'error'
  };
  return statusColors[status?.toLowerCase()] || 'secondary';
};

// Get icon based on status
const getStatusIcon = (status) => {
  const statusIcons = {
    draft: 'mdi-file-edit-outline',
    active: 'mdi-play-circle-outline',
    completed: 'mdi-check-circle-outline',
    archived: 'mdi-archive-outline',
    deleted: 'mdi-delete-outline'
  };
  return statusIcons[status?.toLowerCase()] || 'mdi-help-circle-outline';
};

// Handle link click with analytics
const handleLinkClick = () => {
  // Add any analytics tracking here if needed
  console.log('Website link clicked:', props.test.websiteUrl);
};

// Copy test ID to clipboard
const copyTestId = async () => {
  try {
    await navigator.clipboard.writeText(props.testId);
    toast.success('Test ID copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy test ID:', err);
    toast.error('Failed to copy test ID');
  }
};
</script>

<style scoped>
.test-info-card {
  border-radius: 8px;
  overflow: hidden;
}

.header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fafafa;
}

.edit-btn {
  height: 32px;
}

.content-area {
  background-color: #fff;
}

.section-title {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  color: #333;
  word-wrap: break-word;
  line-height: 1.4;
  padding-left: 20px;
}

.website-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.website-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

.footer-section {
  background-color: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.copy-btn {
  transition: transform 0.2s ease;
}

.copy-btn:hover {
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .info-value {
    padding-left: 16px;
  }
  
  .section-title {
    margin-bottom: 8px;
  }
  
  .info-list {
    gap: 8px;
  }
}
</style>