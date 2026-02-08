<template>
  <div class="verify-email-container">
    <div class="verify-card">
      <!-- Header -->
      <div class="verify-header">
        <div class="icon-circle">
          <i class="fas fa-envelope"></i>
        </div>
        <h1>{{ $t('auth.verifyEmailTitle') }}</h1>
        <p class="subtitle">{{ $t('auth.verifyEmailSubtitle') }}</p>
      </div>

      <!-- Email Display -->
      <div class="email-display">
        <p class="label">{{ $t('auth.emailLabel') }}</p>
        <p class="email">{{ userEmail }}</p>
      </div>

      <!-- Status Messages -->
      <div v-if="isVerifying" class="status-message loading">
        <i class="fas fa-spinner fa-spin"></i>
        {{ $t('auth.verifyingEmail') }}
      </div>

      <div v-if="isVerified" class="status-message success">
        <i class="fas fa-check-circle"></i>
        {{ $t('auth.emailVerified') }}
      </div>

      <div v-if="error" class="status-message error">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>

      <!-- Instructions -->
      <div v-if="!isVerified && !isVerifying" class="instructions">
        <h3>{{ $t('auth.checkEmailTitle') }}</h3>
        <ol>
          <li>{{ $t('auth.checkEmailStep1') }}</li>
          <li>{{ $t('auth.checkEmailStep2') }}</li>
          <li>{{ $t('auth.checkEmailStep3') }}</li>
        </ol>
        <p class="spam-note">{{ $t('auth.checkSpamFolder') }}</p>
      </div>

      <!-- Actions -->
      <div v-if="!isVerified" class="actions">
        <button 
          @click="resendVerificationEmail" 
          :disabled="isResending || isVerifying"
          class="btn btn-secondary"
        >
          <i class="fas fa-redo"></i>
          {{ isResending ? $t('auth.resending') : $t('auth.resendEmail') }}
        </button>

        <button 
          @click="changeEmail" 
          :disabled="isVerifying"
          class="btn btn-tertiary"
        >
          <i class="fas fa-edit"></i>
          {{ $t('auth.changeEmail') }}
        </button>
      </div>

      <!-- Verified Actions -->
      <div v-if="isVerified" class="actions">
        <button 
          @click="goToDashboard" 
          class="btn btn-primary"
        >
          <i class="fas fa-arrow-right"></i>
          {{ $t('auth.continueToDashboard') }}
        </button>
      </div>

      <!-- Sign Out Link -->
      <div class="sign-out-link">
        <button @click="logout" class="link-btn">
          {{ $t('auth.signOut') }}
        </button>
      </div>
    </div>

    <!-- Change Email Modal -->
    <div v-if="showChangeEmailModal" class="modal-overlay" @click="showChangeEmailModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ $t('auth.changeEmail') }}</h2>
          <button @click="showChangeEmailModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>{{ $t('auth.newEmail') }}</label>
            <input 
              v-model="newEmail" 
              type="email" 
              :placeholder="$t('auth.enterNewEmail')"
              @keyup.enter="updateEmail"
            />
          </div>

          <p v-if="modalError" class="error-text">{{ modalError }}</p>
        </div>

        <div class="modal-footer">
          <button 
            @click="showChangeEmailModal = false" 
            class="btn btn-outline"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            @click="updateEmail" 
            :disabled="isUpdatingEmail || !newEmail"
            class="btn btn-primary"
          >
            {{ isUpdatingEmail ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { auth } from '@/app/plugins/firebase'
import { onAuthStateChanged, updateEmail } from 'firebase/auth'

export default {
  name: 'VerifyEmailView',
  data() {
    return {
      userEmail: '',
      isVerifying: false,
      isVerified: false,
      isResending: false,
      error: null,
      showChangeEmailModal: false,
      newEmail: '',
      modalError: null,
      isUpdatingEmail: false,
      verificationCheckInterval: null,
    }
  },
  computed: {
    ...mapState('Auth', ['currentUser']),
  },
  methods: {
    ...mapActions(['sendVerificationEmail', 'logout']),

    async checkEmailVerificationStatus() {
      try {
        this.isVerifying = true
        // Reload user to get updated verification status
        await auth.currentUser.reload()
        
        if (auth.currentUser.emailVerified) {
          this.isVerified = true
          this.isVerifying = false
          // Clear interval and redirect after 2 seconds
          clearInterval(this.verificationCheckInterval)
          setTimeout(() => {
            this.$router.push('/admin')
          }, 2000)
        }
      } catch (err) {
        console.error('Error checking verification status:', err)
        this.error = this.$t('auth.errorCheckingVerification')
      } finally {
        this.isVerifying = false
      }
    },

    async resendVerificationEmail() {
      try {
        this.isResending = true
        this.error = null
        
        const email = auth.currentUser.email
        const displayName = auth.currentUser.displayName || 'User'
        
        await this.sendVerificationEmail({ email, userName: displayName })
        
        // Show success message using Vuex toast
        this.$store.commit('SET_TOAST', {
          message: this.$t('auth.verificationEmailSent'),
          type: 'success',
        })
      } catch (err) {
        console.error('Error resending verification email:', err)
        this.error = this.$t('auth.errorResendingEmail')
      } finally {
        this.isResending = false
      }
    },

    changeEmail() {
      this.showChangeEmailModal = true
      this.newEmail = ''
      this.modalError = null
    },

    async updateEmail() {
      try {
        if (!this.newEmail || !this.newEmail.includes('@')) {
          this.modalError = this.$t('auth.invalidEmail')
          return
        }

        this.isUpdatingEmail = true
        this.modalError = null

        // Update email in Firebase
        await updateEmail(auth.currentUser, this.newEmail)
        
        // Send verification email to new address
        const displayName = auth.currentUser.displayName || 'User'
        await this.sendVerificationEmail({ email: this.newEmail, userName: displayName })

        this.userEmail = this.newEmail
        this.showChangeEmailModal = false

        this.$store.commit('SET_TOAST', {
          message: this.$t('auth.emailUpdatedVerification'),
          type: 'success',
        })
      } catch (err) {
        console.error('Error updating email:', err)
        this.modalError = err.message || this.$t('auth.errorUpdatingEmail')
      } finally {
        this.isUpdatingEmail = false
      }
    },

    goToDashboard() {
      this.$router.push('/admin')
    },

    async logout() {
      try {
        await this.logout()
        this.$router.push('/signin')
      } catch (err) {
        console.error('Error signing out:', err)
      }
    },

    initializeVerification() {
      const user = auth.currentUser
      if (user) {
        this.userEmail = user.email
        if (user.emailVerified) {
          this.isVerified = true
        } else {
          // Check verification status every 3 seconds
          this.verificationCheckInterval = setInterval(() => {
            this.checkEmailVerificationStatus()
          }, 3000)
        }
      }
    },
  },

  mounted() {
    // Ensure user is logged in
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.$router.push('/signin')
        return
      }
      this.initializeVerification()
    })
  },

  beforeUnmount() {
    if (this.verificationCheckInterval) {
      clearInterval(this.verificationCheckInterval)
    }
  },
}
</script>

<style scoped>
.verify-email-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.verify-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
}

.verify-header {
  background: #1e3a8a;
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
}

.verify-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.email-display {
  padding: 30px;
  border-bottom: 1px solid #eee;
}

.email-display .label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.email-display .email {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  word-break: break-all;
}

.status-message {
  margin: 20px 30px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.status-message i {
  font-size: 18px;
}

.status-message.loading {
  background: #eff6ff;
  color: #1e3a8a;
  border-left: 4px solid #1e3a8a;
}

.status-message.success {
  background: #e8f5e9;
  color: #388e3c;
  border-left: 4px solid #388e3c;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.instructions {
  padding: 30px;
  background: #f9f9f9;
}

.instructions h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.instructions ol {
  margin-left: 20px;
  color: #666;
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 10px;
}

.spam-note {
  margin-top: 15px;
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1e3a8a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(30, 58, 138, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8e8e8;
}

.btn-tertiary {
  background: white;
  color: #1e3a8a;
  border: 2px solid #1e3a8a;
}

.btn-tertiary:hover:not(:disabled) {
  background: #f0f4ff;
}

.sign-out-link {
  padding: 20px 30px;
  text-align: center;
  border-top: 1px solid #eee;
}

.link-btn {
  background: none;
  border: none;
  color: #1e3a8a;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  padding: 0;
  transition: color 0.3s;
}

.link-btn:hover {
  color: #0f172a;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  margin: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-text {
  color: #c62828;
  font-size: 13px;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 30px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.btn-outline {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
}

/* Responsive */
@media (max-width: 600px) {
  .verify-header {
    padding: 30px 20px;
  }

  .verify-header h1 {
    font-size: 22px;
  }

  .email-display,
  .instructions,
  .actions,
  .sign-out-link {
    padding: 20px;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
}
</style>
