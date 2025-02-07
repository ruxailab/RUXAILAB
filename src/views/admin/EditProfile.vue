<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6" elevation="10" outlined>
          <v-form ref="form" @submit.prevent="saveProfile" v-model="isFormValid">
            
            
            <div class="text-center mb-4">
              <v-avatar size="100">
                <img v-if="formData.profileImage" :src="formData.profileImage" alt="Profile Image">
                <v-icon v-else size="50">mdi-account</v-icon>
              </v-avatar>
            </div>

            <v-text-field
              v-model="formData.username"
              label="Username"
              outlined
              color="orange"
              class="mb-4"
              :rules="requiredRule"
            />

            
                
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              outlined
              color="orange"
              class="mb-4"
              :rules="emailRules"
              disabled
            />
            <v-text-field
              v-model="formData.contactNo"
              label="Contact Number"
              outlined
              color="orange"
              class="mb-4"
              :rules="requiredRule"
            />
            <v-select
              v-model="formData.country"
              :items="countries"
              label="Country"
              outlined
              color="orange"
              class="mb-6"
              :rules="requiredRule"
            />
            <v-file-input
                label="Upload Profile Picture"
                outlined
                color="orange"
                accept="image/*"
                @change="handleFileUpload"
                disabled
            />
            <v-btn
              type="submit"
              color="orange"
              block
              large
              :loading="isSaving"
              :disabled="!isFormValid"
            >
              <v-icon left>mdi-content-save</v-icon>
              Save Changes
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default {
  data() {
    return {
      formData: {
        username: '',
        email: '',
        contactNo: '',
        country: '',
        profileImage: '' 
      },
      countries: ['India', 'USA', 'Canada', 'UK'],
      isSaving: false,
      isFormValid: false,
      requiredRule: [v => !!v || 'This field is required'],
      emailRules: [
        v => !!v || 'Email is required',
        v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'Email must be valid'
    ]
    }
  },

  async mounted() {
    await this.loadProfileData()
  },

  methods: {
    async loadProfileData() {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) throw new Error('No user logged in')

        const db = getFirestore()
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (userDoc.exists()) {
          const data = userDoc.data()
          this.formData = {
            username: data.username || '',
            email: data.email || user.email || '',
            contactNo: data.contactNo || '',
            country: data.country || '',
            profileImage: data.profileImage || '' 
          }
        } else {
          this.formData.email = user.email || ''
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        this.$toast.error('Failed to load profile data')
      }
    },

    async saveProfile() {
        if (!this.$refs.form.validate()) return;

        try {
            this.isSaving = true;
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            const db = getFirestore();
            const userRef = doc(db, 'users', user.uid);
            
            await setDoc(userRef, {
                username: this.formData.username,
                contactNo: this.formData.contactNo,
                country: this.formData.country,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            this.$toast.success('Profile updated successfully!');
            this.$router.push('/profile');
        } catch (error) {
            console.error('Profile update error:', error);
            this.$toast.error('Failed to update profile');
        } finally {
            this.isSaving = false;
        }
    }
  }
}
</script>

<style scoped>
.v-card {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
</style>