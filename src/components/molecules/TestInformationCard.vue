<template>
  <v-card class="test-info-card" elevation="0" variant="outlined">
    <!-- Header with gradient background -->
    <v-card-title class="header-gradient d-flex align-center pa-6">
      <div class="icon-container">
        <v-icon icon="mdi-information-outline" size="24"></v-icon>
      </div>
      <div class="ml-4">
        <h2 class="text-h5 font-weight-bold mb-1">Test Information</h2>
        <p class="text-body-2 opacity-90 mb-0">Accessibility assessment details</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn 
        v-if="showEditButton && !loading"
        color="white"
        variant="outlined"
        :to="{ name: 'EditAccessibilityTest', params: { testId: testId } }"
        prepend-icon="mdi-pencil"
        class="edit-btn">
        Edit Test
      </v-btn>
    </v-card-title>

    <!-- Loading state -->
    <v-card-text v-if="loading" class="pa-6">
      <div class="loading-container">
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="40"
          class="mb-4">
        </v-progress-circular>
        <p class="text-body-1 text-center">Loading test information...</p>
      </div>
    </v-card-text>

    <!-- Content when test data is available -->
    <v-card-text v-else-if="test" class="pa-0">
      <!-- Main content area -->
      <div class="content-area pa-6">
        <v-row>
          <!-- Left column - Basic Info -->
          <v-col cols="12" lg="6">
            <div class="info-section">
              <div class="section-header mb-4">
                <v-icon icon="mdi-file-document-outline" color="primary" class="me-2"></v-icon>
                <span class="text-h6 font-weight-medium">Basic Information</span>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-format-title" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Title</div>
                    <div class="info-value">{{ test.title }}</div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-text-box-outline" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Description</div>
                    <div class="info-value">
                      {{ test.description || 'No description provided' }}
                    </div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-web" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Website URL</div>
                    <div class="info-value">
                      <a 
                        v-if="test.websiteUrl" 
                        :href="test.websiteUrl" 
                        target="_blank"
                        class="website-link"
                        @click="handleLinkClick">
                        {{ test.websiteUrl }}
                        <v-icon icon="mdi-open-in-new" size="16" class="ml-1"></v-icon>
                      </a>
                      <span v-else class="text-grey">Not specified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right column - Metadata -->
          <v-col cols="12" lg="6">
            <div class="info-section">
              <div class="section-header mb-4">
                <v-icon icon="mdi-cog-outline" color="primary" class="me-2"></v-icon>
                <span class="text-h6 font-weight-medium">Metadata</span>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-account-circle-outline" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Created By</div>
                    <div class="info-value">
                      <div class="user-info">
                        <v-avatar size="24" color="primary" class="me-2">
                          <span class="text-caption">{{ getUserInitials(test.testAdmin?.email) }}</span>
                        </v-avatar>
                        {{ test.testAdmin?.email || 'Unknown' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-calendar-plus" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Created At</div>
                    <div class="info-value">
                      <div class="date-info">
                        {{ formatDate(test.createdAt) }}
                        <v-chip size="x-small" color="grey" variant="tonal" class="ml-2">
                          {{ getRelativeTime(test.createdAt) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-update" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Last Updated</div>
                    <div class="info-value">
                      <div class="date-info">
                        {{ formatDate(test.updatedAt) }}
                        <v-chip size="x-small" color="grey" variant="tonal" class="ml-2">
                          {{ getRelativeTime(test.updatedAt) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-shield-check-outline" color="primary" size="20"></v-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                      <v-chip 
                        :color="getStatusColor(test.status)" 
                        size="small" 
                        class="text-capitalize status-chip"
                        variant="tonal">
                        <v-icon :icon="getStatusIcon(test.status)" size="16" class="me-1"></v-icon>
                        {{ test.status }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Footer -->
      <v-divider></v-divider>
      <div class="footer-section pa-4">
        <div class="d-flex justify-space-between align-center">
          <div class="test-id-info">
            <v-icon icon="mdi-identifier" size="16" class="me-2 text-grey"></v-icon>
            <span class="text-caption text-grey">Test ID: {{ testId }}</span>
          </div>
          <v-tooltip text="Copy Test ID" location="top">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyTestId"
                class="copy-btn">
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-card-text>

    <!-- Error state -->
    <v-card-text v-else class="pa-6">
      <v-alert 
        type="error" 
        variant="tonal" 
        prominent
        icon="mdi-alert-circle"
        class="error-alert">
        <v-alert-title>Unable to Load Test Information</v-alert-title>
        <div class="mt-2">
          Failed to load test information. Please refresh the page or try again later.
        </div>
        <template v-slot:append>
          <v-btn 
            color="error" 
            variant="text"
            @click="$emit('retry')"
            prepend-icon="mdi-refresh">
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
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.test-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.edit-btn {
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.content-area {
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.info-section {
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(103, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-icon {
  background: rgba(103, 126, 234, 0.1);
  border-radius: 50%;
  padding: 8px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 400;
  color: #333;
  word-wrap: break-word;
  line-height: 1.5;
}

.website-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.website-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.user-info {
  display: flex;
  align-items: center;
}

.date-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.status-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.footer-section {
  background: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.test-id-info {
  display: flex;
  align-items: center;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background-color: rgba(103, 126, 234, 0.1);
  transform: scale(1.1);
}

.error-alert {
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .header-gradient {
    padding: 20px !important;
  }
  
  .content-area {
    padding: 20px !important;
  }
  
  .info-grid {
    gap: 16px;
  }
  
  .info-item {
    padding: 12px;
  }
  
  .date-info {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .content-area {
    background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  }
  
  .info-item {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .info-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(103, 126, 234, 0.3);
  }
  
  .footer-section {
    background: #1e1e1e;
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>