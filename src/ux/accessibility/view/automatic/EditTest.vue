<template>
  <PageWrapper
    title="Website Analysis"
    subtitle="Analyze website accessibility using automated tools"
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Enter a website URL to run an automated accessibility test and get a
        detailed report.
      </p>
    </template>
    <v-row justify="center" class="min-height-screen">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <!-- Header Section -->
        <v-card class="header-card mb-8 text-center" elevation="0">
          <v-card-text class="pa-8">
            <div class="icon-wrapper mb-4">
              <v-icon size="64" color="white" class="header-icon">
                mdi-web-check
              </v-icon>
            </div>
            <h1 class="main-title mb-4">Website Accessibility Tester</h1>
            <p class="subtitle">
              Analyze your website's accessibility compliance and get actionable
              insights
            </p>
          </v-card-text>
        </v-card>

        <!-- Form Section -->
        <v-card class="form-card mb-6" elevation="8" rounded="xl">
          <v-card-text class="pa-8">
            <v-form @submit.prevent="runTest">
              <v-text-field
                v-model="url"
                label="Website URL"
                placeholder="https://example.com"
                type="url"
                required
                :disabled="isLoading"
                prepend-inner-icon="mdi-web"
                append-inner-icon="mdi-link"
                variant="outlined"
                color="primary"
                class="mb-4"
                :rules="[rules.required, rules.url]"
              />

              <v-btn
                type="submit"
                :disabled="isLoading || !url.trim()"
                :loading="isLoading"
                color="primary"
                size="large"
                block
                rounded="lg"
                class="text-none"
              >
                <template #prepend>
                  <v-icon v-if="!isLoading"> mdi-play </v-icon>
                </template>
                {{ isLoading ? 'Testing...' : 'Run Accessibility Test' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Loading Section -->
        <v-card
          v-if="isLoading"
          class="loading-card mb-6"
          elevation="8"
          rounded="xl"
        >
          <v-card-text class="pa-8 text-center">
            <v-progress-circular
              indeterminate
              size="64"
              width="4"
              color="primary"
              class="mb-4"
            />

            <h3 class="loading-title mb-2">Analyzing Accessibility</h3>
            <p class="loading-text mb-6">
              Running comprehensive tests on your website...
            </p>

            <div class="loading-steps">
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ 'step-active': currentStep >= index + 1 }"
                  class="step-item"
                >
                  <template #prepend>
                    <v-icon
                      :color="
                        currentStep >= index + 1 ? 'success' : 'grey-lighten-1'
                      "
                      size="20"
                    >
                      mdi-check-circle
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ step }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>

        <!-- Error Section -->
        <v-card
          v-if="error"
          class="error-card mb-6"
          elevation="8"
          rounded="xl"
          color="error"
          variant="tonal"
        >
          <v-card-text class="pa-8">
            <div class="error-header mb-4">
              <v-icon size="32" color="error" class="me-3">
                mdi-alert-circle
              </v-icon>
              <h3 class="error-title">Test Failed</h3>
            </div>

            <div class="error-content mb-6">
              <p class="error-message mb-4">
                {{ getErrorMessage() }}
              </p>

              <v-expansion-panels v-if="errorType" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="me-2"> mdi-information </v-icon>
                    Common Issues & Solutions
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list class="bg-transparent">
                      <v-list-item
                        v-for="solution in getSolutions()"
                        :key="solution.type"
                        class="pa-3"
                      >
                        <template #prepend>
                          <v-icon :color="solution.color" size="20">
                            {{ solution.icon }}
                          </v-icon>
                        </template>
                        <v-list-item-title class="font-weight-medium">
                          {{ solution.title }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ solution.description }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-alert
                type="info"
                variant="tonal"
                icon="mdi-lightbulb"
                class="mb-4"
              >
                <div class="font-weight-medium mb-2">Troubleshooting Tips:</div>
                <ul class="ma-0 pa-0 ms-4">
                  <li>Make sure the website is publicly accessible</li>
                  <li>Try testing a different page on the same domain</li>
                  <li>Check if the website requires authentication</li>
                  <li>Verify the URL is correct and complete</li>
                </ul>
              </v-alert>
            </div>

            <div class="error-actions">
              <v-btn
                variant="outlined"
                color="error"
                class="me-2"
                @click="clearError"
              >
                <template #prepend>
                  <v-icon>mdi-close</v-icon>
                </template>
                Dismiss
              </v-btn>
              <v-btn color="primary" variant="elevated" @click="retryTest">
                <template #prepend>
                  <v-icon>mdi-refresh</v-icon>
                </template>
                Try Again
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </PageWrapper>
</template>

<script>
import axios from 'axios'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

export default {
  name: 'Home',
  components: {
    PageWrapper,
  },
  data() {
    return {
      url: '',
      isLoading: false,
      error: null,
      errorType: '',
      currentStep: 0,
      steps: [
        'Scanning page structure',
        'Checking color contrast',
        'Validating ARIA attributes',
        'Generating report',
      ],
      rules: {
        required: (value) => !!value || 'URL is required',
        url: (value) => {
          const pattern = /^https?:\/\/.+/
          return (
            pattern.test(value) ||
            'Must be a valid URL starting with http:// or https://'
          )
        },
      },
    }
  },
  methods: {
    async runTest() {
      if (!this.url.trim()) return

      this.isLoading = true
      this.error = null
      this.errorType = ''
      this.currentStep = 0

      try {
        // Simulate loading steps
        for (let i = 1; i <= this.steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          this.currentStep = i
        }

        // Get the testId from route or store
        const testId = this.$route.params.testId || this.testId

        // Use env variable for API endpoint
        const apiUrl = process.env.VUE_APP_ACCESSIBILITY_API
        const response = await axios.post(apiUrl, {
          url: this.url,
          testId: testId,
        })
        if (response) {
          // Done
        }
        // Redirect to the report page
        this.$router.push(`/answers/${testId}`)
      } catch (error) {
        this.error =
          error.response?.data?.error || 'Failed to run the accessibility test'
        this.errorType = this.determineErrorType(error)
      } finally {
        this.isLoading = false
        this.currentStep = 0
      }
    },

    determineErrorType(error) {
      if (!error.response) return 'network'
      if (error.response.status === 400) return 'invalid-url'
      if (error.response.status === 403) return 'blocked'
      if (error.response.status === 408) return 'timeout'
      return 'server'
    },

    getErrorMessage() {
      const messages = {
        network:
          'Unable to connect to the website. Please check your internet connection.',
        'invalid-url': 'The provided URL appears to be invalid or malformed.',
        blocked: 'Access to this website was blocked or restricted.',
        timeout:
          'The request timed out. The website may be slow or unresponsive.',
        server: 'Our accessibility testing service encountered an error.',
      }

      return (
        messages[this.errorType] ||
        this.error ||
        'An unexpected error occurred while testing the website.'
      )
    },

    getSolutions() {
      const solutions = {
        network: {
          type: 'network',
          icon: 'mdi-wifi-off',
          color: 'warning',
          title: 'Network Connection',
          description: 'Check your internet connection and try again',
        },
        'invalid-url': {
          type: 'invalid-url',
          icon: 'mdi-link-off',
          color: 'error',
          title: 'Invalid URL',
          description: 'Ensure the URL starts with http:// or https://',
        },
        blocked: {
          type: 'blocked',
          icon: 'mdi-shield-off',
          color: 'warning',
          title: 'Access Blocked',
          description: 'The website may be blocking automated requests',
        },
        timeout: {
          type: 'timeout',
          icon: 'mdi-clock-alert',
          color: 'info',
          title: 'Request Timeout',
          description: 'The website took too long to respond',
        },
        server: {
          type: 'server',
          icon: 'mdi-server-off',
          color: 'error',
          title: 'Server Error',
          description: 'There was an issue with our testing service',
        },
      }

      return this.errorType ? [solutions[this.errorType]] : []
    },

    clearError() {
      this.error = null
      this.errorType = ''
    },

    retryTest() {
      this.clearError()
      this.runTest()
    },
  },
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: white;
  padding: 2rem 1rem;
}

.min-height-screen {
  min-height: 100vh;
}

.header-card {
  backdrop-filter: blur(10px);
  background: #f5f5f5;
}

.header-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.form-card {
  background: white;
  backdrop-filter: blur(10px);
}

.loading-card {
  background: white;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.loading-text {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.loading-steps {
  text-align: left;
}

.step-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.step-active {
  background-color: rgb(var(--v-theme-primary-container));
  color: rgb(var(--v-theme-on-primary-container));
}

.error-card {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.error-header {
  display: flex;
  align-items: center;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-error));
  margin: 0;
}

.error-message {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.6;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 600px) {
  .home-container {
    padding: 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .error-actions {
    justify-content: stretch;
  }

  .error-actions .v-btn {
    flex: 1;
  }
}
</style>
