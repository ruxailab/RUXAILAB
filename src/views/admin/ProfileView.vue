<template>
  <v-card class="profile-card mx-auto my-8" max-width="800" elevation="0">
    <v-card-title class="text-h5 pb-6">
      {{ $t('buttons.profile') }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <div class="form-section mb-6">
        <label class="text-subtitle-1 text-medium-emphasis mb-2 d-block">
          Profile Image
        </label>
        <v-avatar size="120" class="mb-4">
          <v-img
            :src="userprofile.profileImage || 'https://via.placeholder.com/120'"
            alt="Profile"
          ></v-img>
        </v-avatar>
      </div>

      <div class="form-section mb-6">
        <label class="text-subtitle-1 text-medium-emphasis mb-2 d-block">
          {{ $t('SIGNIN.email') }}
        </label>
        <v-text-field
          v-model="user.email"
          tonal
          dense
          readonly
          background-color="white"
          hide-details
        ></v-text-field>
      </div>

      <div class="d-flex justify-space-between mt-8">
        <v-btn
          color="error"
          tonal
          class="px-6"
          height="40"
          @click="showDeleteModal = true"
        >
          {{ $t('buttons.deleteAccount') }}
        </v-btn>
      </div>
    </v-card-text>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="showDeleteModal" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="headline error white--text" primary-title>
          {{ $t('buttons.deleteAccount') }}
        </v-card-title>
        <v-card-text class="pa-0 mb-6">
          {{ $t('alerts.deleteAccount') }}
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer></v-spacer>
          <v-btn
            tonal
            class="mr-3 grey lighten-3"
            @click="showDeleteModal = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn color="error" tonal @click="deleteAccount">
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'

export default {
  data() {
    return {
      userprofile: {
        profileImage: 'https://picsum.photos/id/1005/400/300',
      },
      showDeleteModal: false,
    }
  },
  methods: {
    // deleteAccount() {
    //   // Placeholder for actual delete account logic
    //   console.log('Account deleted')
    //   this.showDeleteModal = false
    //   this.$router.push('/')
    // },
    deleteAccount() {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        // Prompt the user for their password
        const email = user.email
        const password = prompt(
          'Please enter your password to confirm deletion:',
        )

        if (password) {
          const credential = EmailAuthProvider.credential(email, password)

          // Reauthenticate the user
          reauthenticateWithCredential(user, credential)
            .then(() => {
              // Proceeding to delete the account after a verify
              return user.delete()
            })
            .then(() => {
              console.log('Account deleted successfully.')
              window.location.reload()
              this.$router.push('/') // Redirect after successful deletion
            })
            .catch((error) => {
              console.error(
                'Error during reauthentication or account deletion:',
                error.message,
              )
              alert('Failed to delete account. Please try again.')
            })
        } else {
          alert('Password is required to delete your account.')
        }
      } else {
        console.error('No user is signed in.')
      }
    },
  },
  computed: {
    user() {
      return this.$store.getters.user || { email: '' } // Fallback if user is undefined
    },
  },
}
</script>

<style scoped>
.profile-card {
  background-color: #f8f9fe !important;
  border-radius: 8px !important;
}

.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
}

.v-text-field ::v-deep .v-input__slot,
.v-select ::v-deep .v-input__slot {
  min-height: 40px !important;
  box-shadow: none !important;
}

.form-section label {
  color: #666 !important;
}
</style>
