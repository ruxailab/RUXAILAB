<template>
  <div>
    <!-- Navigation Tabs -->
    <v-tabs
      v-if="type === 'tabs'"
      background-color="transparent"
      color="#FCA326"
      class="pb-0 mb-0"
    >
      <v-tab @click="tabClicked(0)">Consent</v-tab>
      <v-tab @click="tabClicked(1)">Pre Form</v-tab>
      <v-tab @click="tabClicked(2)">Tasks</v-tab>
      <v-tab @click="tabClicked(3)">Post Form</v-tab>
    </v-tabs>

    <!-- Main Content -->
    <v-container class="flow-container" fluid>
      <v-progress-linear
        v-if="type === 'content'"
        :value="progress"
        height="8"
        color="#FCA326"
        class="mb-6"
        rounded
        striped
      />
      <v-col v-else-if="type === 'content'" cols="12">
        <!-- Consent Form -->
        <v-card v-if="index === 0" rounded="xl" class="pa-6" color="white">
          <v-card-title class="subtitleView">
            {{ $t('UserTestTable.titles.consentForm') }}
          </v-card-title>
          <v-divider class="mb-4" />
          <v-row justify="center">
            <v-col cols="10" class="text-center">
              <v-btn
                :href="consentFormLink"
                target="_blank"
                color="#FCA326"
                outlined
              >
                {{ $t('UserTestTable.links.openConsentForm') || 'Open Consent Form' }}
              </v-btn>

              <v-alert type="info" dense class="mt-4">
                💡 Tip: Please open the form in a new tab and complete it before continuing.
              </v-alert>
            </v-col>
          </v-row>
        </v-card>

        <!-- Pre Form -->
        <v-card v-if="index === 1" rounded="xxl" style="background: #f5f7ff">
          <v-card-title class="subtitleView">
            {{ $t('UserTestTable.titles.userVariables') }}
          </v-card-title>
          <v-divider />
          <v-row justify="space-around">
            <v-col cols="12">
              <UserVariables @input="updateData" />
            </v-col>
          </v-row>
        </v-card>

        <!-- Tasks -->
        <ListTasks
          v-if="index === 2"
          :tasks="object.itemsTasks"
          @input="updateData"
          hide-timer
        />

        <!-- Post Form -->
        <v-card v-if="index === 3" rounded="xxl" style="background: #f5f7ff">
          <v-card-title class="subtitleView">
            {{ $t('UserTestTable.titles.postForm') }}
          </v-card-title>
          <v-divider />
          <v-row justify="space-around">
            <v-col cols="12">
              <FormPostTest @input="updateData" />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-container>
  </div>
</template>

<script>
import ListTasks from '@/components/molecules/ListTasks'
import FormPostTest from '@/components/atoms/FormPostTest'
import UserVariables from '@/components/atoms/UserVariables'

export default {
  components: {
    ListTasks,
    UserVariables,
    FormPostTest,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    object: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      consentFormLink: 'https://forms.gle/ytxjVsHZ2hmXGGs98', // dynamic if needed
    }
  },
  computed: {
    progress() {
      return (this.index + 1) * 25
    },
  },
  methods: {
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
    updateData(data) {
      switch (this.index) {
        case 0:
          this.$store.dispatch('setConsent', data)
          break
        case 1:
          this.$store.dispatch('setPreTest', data)
          break
        case 2:
          this.$store.dispatch('setTaskData', data)
          break
        case 3:
          this.$store.dispatch('setPostTest', data)
          break
      }
    },
  },
}
</script>

<style scoped>
.flow-container {
  min-height: 100vh;
  background-color: #f5f7ff;
  padding-top: 24px;
}
.subtitleView {
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
