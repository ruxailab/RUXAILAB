<template>
  <div class="container h-screen py-8 flex gap-4">
    <div class="flex-shrink-0 h-screen mr-4" style="max-width: 35%; min-width: 350px;">
      <v-card class="profile-card h-full" elevation="0">
        <v-card-text class="text-center">
          <v-avatar size="128" class="mb-4">
            <v-img :src="userprofile.profileImage || 'https://picsum.photos/id/1005/400/300'" alt="Profile" />
          </v-avatar>
          <h2 class="text-h6 mb-2">{{ user.displayName || 'USER' }}</h2>
          <v-chip small class="mb-6" color="grey lighten-3">Author</v-chip>

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
          
          <v-btn color="primary" class="mt-4 mr-2 edit-button" @click="editProfile">Edit</v-btn>
          <v-btn color="error" class="mt-4 ml-2 suspend-button" @click="suspendAccount">Suspend</v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Right Navigation and Content Section (Flexible width) -->

      <v-card flat class="w-full" style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Tabs Section -->
        <v-tabs background-color="transparent" color="primary" style="min-width: 800px;">
          <v-tab>
            <v-icon small class="mr-2">mdi-account</v-icon>
            Account
          </v-tab>
          <v-tab>
            <v-icon small class="mr-2">mdi-shield-key</v-icon>
            Security
          </v-tab>
          <v-tab>
            <v-icon small class="mr-2">mdi-credit-card</v-icon>
            Billing & Plans
          </v-tab>
          <v-tab>
            <v-icon small class="mr-2">mdi-bell</v-icon>
            Notifications
          </v-tab>
          <v-tab>
            <v-icon small class="mr-2">mdi-link</v-icon>
            Connections
          </v-tab>
        </v-tabs>

        <!-- Change Password Section -->
        <div class="password-card">
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
        </div>
      </v-card>
  </div>
</template>

<script>
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc
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
      displayMissingInfo: 'INFO MISSING',
      loading:true,
      showDeleteModal: false,
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
      ]
    }
  },

  async created() {
    await this.fetchUserProfile()
  },
  
  computed: {
    user() {
      return this.$store.getters.user || { email: '' }
    },
  },

  methods: {
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
      }finally{
        this.loading = false;
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
            
            // Reset form
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

    editProfile() {
      this.$router.push('/editprofile');
      console.log("Edit profile clicked");
    },
    suspendAccount() {
      console.log("Suspend account clicked");
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
  margin-left: -120px !important;
}

.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
}

.v-text-field ::v-deep(.class-name) .v-input__slot,
.v-select ::v-deep .v-input__slot {
  min-height: 40px !important;
  box-shadow: none !important;
}

.form-section label {
  color: #666 !important;
}

/* Adjustments for the layout */
.profile-card {
  width: 100%;
  margin-bottom: 2rem;
  height: 100vh; /* Ensures the profile card covers the full screen height */
}

.v-tabs {
  margin-bottom: 2rem;
}

.v-tab {
  text-transform: none !important;
  letter-spacing: 0 !important;
}

.v-card {
  border-radius: 20px !important;
  margin-left: -200px;
  
}


.v-list-item {
  min-height: 40px !important;
}

.v-list-item__subtitle {
  color: #666 !important;
}

.v-btn.edit-button {
  background-color: #007bff; 
  color: white !important;
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  letter-spacing: 0.5px; 
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.3); 
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.v-btn.edit-button:hover {
  background-color: #0056b3; 
  box-shadow: 0 6px 10px rgba(0, 123, 255, 0.5); 
}

.v-btn.suspend-button {
  background-color: #dc3545;
  color: white !important;
  border-radius: 8px; 
  font-weight: 500;
  padding: 8px 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px rgba(220, 53, 69, 0.3);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.v-btn.suspend-button:hover {
  background-color: #c82333;
  box-shadow: 0 6px 10px rgba(220, 53, 69, 0.5); 
}

.password-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px; 
  padding: 20px; 
}

</style>
