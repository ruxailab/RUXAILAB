<template>
  <div class="container h-screen py-8 flex flex-col md:flex-row gap-4">
    <!-- Left Section: Profile Details -->
    <div class="flex-shrink-0 w-full md:w-auto" style="max-width: 100%; min-width: 350px;">
      <v-card class="profile-card h-full" elevation="0">
        <v-card-text class="text-center">
          <v-avatar size="128" class="mb-4">
            <v-img :src="userprofile.profileImage || 'https://picsum.photos/id/1005/400/300'" alt="Profile" />
          </v-avatar>
          <h2 class="text-h6 mb-2">{{ user.displayName || 'USER' }}</h2>
          <v-chip small class="mb-6" color="grey lighten-3">Admin</v-chip>

          <div class="text-left">
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Username:</v-list-item-subtitle>
                  <v-list-item-title v-if="!loading" :class="{'missing-info': !userprofile.username}">
                    {{ userprofile.username || displayMissingInfo }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Email:</v-list-item-subtitle>
                  <v-list-item-title v-if="!loading" :class="{'missing-info': !user.email}">
                    {{ user.email || displayMissingInfo }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Contact No:</v-list-item-subtitle>
                  <v-list-item-title v-if="!loading" :class="{'missing-info': !userprofile.contactNo}">
                    {{ userprofile.contactNo || displayMissingInfo }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Country:</v-list-item-subtitle>
                  <v-list-item-title v-if="!loading" :class="{'missing-info': !userprofile.country}">
                    {{ userprofile.country || displayMissingInfo }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Right Section: Tabs and Content -->
    <div class="flex-grow-1 w-full">
      <v-card flat class="w-full">
        <!-- Tabs Section -->
        <v-tabs background-color="transparent" color="primary" v-if="!isSmallScreen">
          <v-tab>
            <v-icon small class="mr-2">mdi-account</v-icon>
            Account
          </v-tab>
        </v-tabs>

        <!-- Change Password Section -->
        <v-card class="password-card mt-4">
          <v-card-title>Change Password</v-card-title>
          <v-card-text>
            <v-alert type="warning" colored-border border="left" class="mb-4">
              <div class="text-h6 font-weight-medium">Ensure that these requirements are met</div>
              <div class="text-body-2">Minimum 8 characters long, uppercase & symbol</div>
            </v-alert>

            <v-form ref="passwordForm" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newPassword"
                    :rules="passwordRules"
                    label="New Password"
                    type="password"
                    outlined
                    dense
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="confirmPassword"
                    :rules="confirmPasswordRules"
                    label="Confirm New Password"
                    type="password"
                    outlined
                    dense
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn color="primary" class="mt-4" @click="changePassword" :disabled="!valid">
                Change Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Edit Details and Delete Account Buttons -->
        <div class="mt-4 d-flex justify-space-between flex-wrap">
          <v-btn color="primary" @click="openEditProfileDialog" class="mb-2">
            <v-icon left>mdi-pencil</v-icon>
            Edit Details
          </v-btn>
          <v-btn color="error" @click="deleteAccountDialog = true" class="mb-2">
            <v-icon left>mdi-delete</v-icon>
            Delete Account
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Edit Details Dialog -->
    <v-dialog v-model="editProfileDialog" max-width="600">
      <v-card>
        <v-card-title>Edit Profile Details</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="editProfileData.username" label="Username"></v-text-field>
            <v-text-field v-model="editProfileData.contactNo" label="Contact No"></v-text-field>
            <v-text-field v-model="editProfileData.country" label="Country"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveProfile">Save</v-btn>
          <v-btn color="error" @click="editProfileDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account Dialog -->
    <v-dialog v-model="deleteAccountDialog" max-width="500">
      <v-card>
        <v-card-title>Delete Account</v-card-title>
        <v-card-text>
          Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove your data from our servers.
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="deleteAccount">Delete Account</v-btn>
          <v-btn color="primary" @click="deleteAccountDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore'

export default {
  name: 'SecurityProfile',
  
  data() {
    return {
      userprofile: {
        profileImage: '',
        username: null,
        contactNo: null,
        country: null
      },
      editProfileData: {
        username: null,
        contactNo: null,
        country: null
      },
      displayMissingInfo: 'INFO MISSING',
      loading: true,
      valid: false,
      newPassword: '',
      confirmPassword: '',
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 8 || 'Password must be at least 8 characters',
        v => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
        v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Must contain a symbol'
      ],
      confirmPasswordRules: [
        v => !!v || 'Confirm password is required',
        v => v === this.newPassword || 'Passwords must match'
      ],
      editProfileDialog: false,
      deleteAccountDialog: false,
      isSmallScreen: false
    }
  },

  async created() {
    await this.fetchUserProfile()
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize)
  },

  computed: {
    user() {
      return this.$store.getters.user || { email: '' }
    },
  },

  methods: {
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 960 // Adjust breakpoint as needed
    },

    async fetchUserProfile() {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        
        if (user) {
          const db = getFirestore()
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            this.userprofile = {
              profileImage: data.profileImage || '',
              username: data.username || null,
              contactNo: data.contactNo || null,
              country: data.country || null
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.$toast.error('Failed to load profile data')
      } finally {
        this.loading = false
      }
    },

    openEditProfileDialog() {
      this.editProfileData = {
        username: this.userprofile.username,
        contactNo: this.userprofile.contactNo,
        country: this.userprofile.country
      }
      this.editProfileDialog = true
    },

    async saveProfile() {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        
        if (user) {
          const db = getFirestore()
          const userDocRef = doc(db, 'users', user.uid)
          await updateDoc(userDocRef, {
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country
          })
          this.userprofile = {
            ...this.userprofile,
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country
          }
          this.$toast.success('Profile updated successfully')
          this.editProfileDialog = false
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        this.$toast.error('Failed to update profile')
      }
    },

    async changePassword() {
      if (this.$refs.passwordForm.validate()) {
        try {
          const auth = getAuth()
          const user = auth.currentUser

          if (user) {
            await updatePassword(user, this.newPassword)
            this.$toast.success('Password changed successfully')
            
            this.newPassword = ''
            this.confirmPassword = ''
            this.$refs.passwordForm.reset()
          }
        } catch (error) {
          this.$toast.error('Failed to change password: ' + error.message)
        }
      }
    },

    async deleteAccount() {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        try {
          const email = user.email
          const password = prompt('Please enter your password to confirm deletion:')
          if (!password) {
            alert('Password is required to delete your account.')
            return
          }

          const credential = EmailAuthProvider.credential(email, password)
          await reauthenticateWithCredential(user, credential)

          const db = getFirestore()
          const userDocId = user.uid

          const testsCollectionRef = collection(db, 'tests')
          const testsQuery = query(testsCollectionRef, where('testAdmin.userDocId', '==', userDocId))
          const testsSnapshot = await getDocs(testsQuery)

          if (!testsSnapshot.empty) {
            for (const testDoc of testsSnapshot.docs) {
              const testData = testDoc.data()
              const answersDocId = testData.answersDocId

              if (answersDocId) {
                const answersDocRef = doc(db, 'answers', answersDocId)
                await deleteDoc(answersDocRef)
              }

              const testDocRef = doc(db, 'tests', testDoc.id)
              await deleteDoc(testDocRef)
            }
          }

          const userDocRef = doc(db, 'users', userDocId)
          await deleteDoc(userDocRef)

          await user.delete()
          console.log('Account and related data deleted successfully.')

          this.signOut()
        } catch (error) {
          console.error('Error during account deletion:', error.message)
          alert('Failed to delete account. Please try again.')
        }
      } else {
        console.error('No user is signed in.')
      }
    },

    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router
          .push('/')
          .catch((error) => {console.log(error)})
      })
    },
  },
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-card {
  background-color: #f8f9fe !important;
  border-radius: 8px !important;
  height: 100%;
}

.password-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
}

.v-text-field ::v-deep(.v-input__slot),
.v-select ::v-deep .v-input__slot {
  min-height: 40px !important;
  box-shadow: none !important;
}

.v-list-item {
  min-height: 40px !important;
}

.v-list-item__subtitle {
  color: #666 !important;
}

.missing-info {
  color: #ff5252 !important;
  font-style: italic;
}

@media (max-width: 960px) {
  .container {
    flex-direction: column;
  }

  .profile-card {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>