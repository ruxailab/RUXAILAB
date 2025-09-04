<template>
  <v-card class="rounded-xl pa-6" elevation="2">
    <v-card-title class="text-h6 font-weight-bold mb-4">
      <v-icon start color="primary">mdi-account-details</v-icon>
      {{ $t('profile.personalInfo') }}
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="userprofile.username"
              :label="$t('SIGNIN.username')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-account"
              readonly
              class="input-field-transition"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="user.email"
              :label="$t('SIGNIN.email')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-email"
              readonly
              class="input-field-transition"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="userprofile.contactNo"
              :label="$t('SIGNIN.contact')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-phone"
              readonly
              class="input-field-transition"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="userprofile.country"
              :label="$t('profile.country')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-map-marker"
              readonly
              class="input-field-transition"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-btn
        color="primary"
        variant="flat"
        class="mt-4 text-capitalize"
        @click="showEditForm = true"
      >
        <v-icon start>
          mdi-pencil
        </v-icon>
        {{ $t('profile.editDetails') }}
      </v-btn>
      <div v-if="showEditForm" class="mt-6">
        <v-form ref="editProfileForm" v-model="editProfileValid">
          <v-text-field
            v-model="editProfileData.username"
            :label="$t('SIGNIN.username')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-account"
            :rules="usernameRules"
            class="mb-4 input-field-transition"
          />
          <v-text-field
            v-model="editProfileData.contactNo"
            :label="$t('SIGNIN.contact')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-phone"
            :rules="contactRules"
            :hint="$t('Enter a valid No.')"
            persistent-hint
            class="mb-4 input-field-transition"
          />
          <v-autocomplete
            v-model="editProfileData.country"
            :label="$t('profile.country')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-map-marker"
            :rules="countryRules"
            :items="countries"
            item-title="name"
            item-value="name"
            :custom-filter="countryFilter"
            clearable
            :menu-props="{ maxHeight: '400px' }"
            class="input-field-transition"
          >
            <template #selection="{ item }">
              {{ item.raw.emoji }} {{ item.raw.name }}
            </template>
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title>
                  {{ item.raw.emoji }} {{ item.raw.name }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
          <v-btn
            color="primary"
            variant="flat"
            class="mt-4 text-capitalize"
            :disabled="!editProfileValid"
            @click="saveProfile"
          >
            <v-icon start>
              mdi-content-save
            </v-icon>
            {{ $t('profile.saveChanges') }}
          </v-btn>
          <v-btn
            variant="text"
            class="mt-4 text-capitalize"
            @click="showEditForm = false"
          >
            {{ $t('common.cancel') }}
          </v-btn>
        </v-form>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  userprofile: Object,
  user: Object,
  showEditForm: Boolean,
  editProfileData: Object,
  editProfileValid: Boolean,
  usernameRules: Array,
  contactRules: Array,
  countryRules: Array,
  countries: Array,
  countryFilter: Function,
  saveProfile: Function,
  editProfileForm: Object,
});
</script>
