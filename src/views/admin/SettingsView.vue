<template>
  <v-container v-if="true" class="pa-0 pa-md-3">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert />

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="headline error white--text py-4 px-5" primary-title>
          <v-icon left class="mr-2" size="28">mdi-alert-circle</v-icon>
          {{ $t('alerts.deleteTest') }}
        </v-card-title>

        <v-card-text class="py-5 px-5 text-body-1">{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn 
            class="grey lighten-3 px-6" 
            height="42" 
            @click="dialogDel = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-4 px-6"
            height="42"
            :loading="loading"
            @click="deleteTest(object)"
          >
            <v-icon left small class="mr-1">mdi-trash-can-outline</v-icon>
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog v-model="tempDialog" max-width="80%">
      <v-card class="rounded-lg">
        <v-card-title class="grey lighten-4 pa-5 d-flex align-center">
          <v-icon left class="mr-3" color="#F9A826" size="32">mdi-file-document-outline</v-icon>
          Create Template
        </v-card-title>
        <v-divider />
        <v-form ref="tempform" class="px-6 py-4">
          <v-row justify="space-around" class="pa-2">
            <v-col cols="12">
              <v-text-field
                v-model="template.templateTitle"
                autofocus
                label="Title"
                :rules="titleRequired"
                counter="200"
                outlined
                dense
                @input="$emit('change')"
              />

              <v-textarea
                v-model="template.templateDescription"
                label="Description"
                outlined
                class="mt-3"
                dense
                @input="$emit('change')"
              />

              <v-checkbox
                v-model="template.isTemplatePublic"
                label="Make template public to all users"
                color="#F9A826"
                hide-details
                class="mt-4"
              />
            </v-col>
          </v-row>
          <v-divider class="mt-6" />
          <v-card-actions class="pa-5">
            <v-spacer />
            <v-btn 
              class="grey darken-1 white--text px-6" 
              height="42"
              @click="closeDialog()"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              :disabled="hasTemplate ? true : false"
              class="success px-6 ml-4"
              height="42"
              @click="createTemplate()"
            >
              <v-icon left small class="mr-1">mdi-content-save-outline</v-icon>
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ShowInfo :title="$t('pages.settings.title')">
      <div slot="content">
        <v-card class="rounded-lg my-2">
          <div class="primary px-5 py-4 d-flex align-center">
            <v-icon class="mr-3" color="white" size="28">mdi-cog-outline</v-icon>
            <h2 class="mb-0 white--text font-weight-medium">
              {{ $t('pages.settings.currentTest') }}
            </h2>
          </div>

          <v-divider />
          
          <div class="pa-4">
            <FormTestDescription
              v-if="object"
              ref="form1"
              :test="object"
              :lock="true"
              @valForm="validate"
              @change="change = true"
            />
          </div>

          <v-divider class="mx-4" />

          <v-row justify="space-around" class="mx-2 my-6 px-4">
            <v-col cols="12" md="6" class="d-flex justify-center justify-md-end px-2">
              <v-btn
                class="px-5"
                height="42"
                color="green"
                outlined
                :disabled="hasTemplate || !object ? true : false"
                @click="tempDialog = true"
              >
                <v-icon left class="mr-2">mdi-content-copy</v-icon>
                {{ $t('pages.settings.createTemplate') }}
              </v-btn>
            </v-col>

            <v-col cols="12" md="6" class="d-flex justify-center justify-md-start px-2">
              <v-btn 
                class="px-5" 
                height="42"
                color="green" 
                outlined 
                @click="duplicateTest()"
              >
                <v-icon left class="mr-2">mdi-content-duplicate</v-icon>
                Duplicate test
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="mx-4" />

          <v-row justify="center" class="py-6">
            <v-btn
              color="#f26363"
              class="white--text px-6"
              height="42"
              @click="dialogDel = true"
            >
              <v-icon left class="mr-2">
                mdi-trash-can-outline
              </v-icon>
              {{ $t('pages.settings.deleteTest') }}
            </v-btn>
          </v-row>
        </v-card>

        <v-tooltip v-if="change" left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="change"
              large
              dark
              fab
              fixed
              bottom
              right
              color="#F9A826"
              v-bind="attrs"
              @click="submit()"
              v-on="on"
            >
              <v-icon large>
                mdi-content-save
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('buttons.save') }}</span>
        </v-tooltip>
      </div>
    </ShowInfo>
  </v-container>
  <v-overlay v-else-if="loadingPage" v-model="loadingPage" class="text-center">
    <div>
      <v-progress-circular indeterminate color="#fca326" size="60" width="5" />
      <div class="white--text mt-4 text-h6 font-weight-medium">
        Loading Settings
      </div>
    </div>
  </v-overlay>
  <AccessNotAllowed v-else />
</template>

<script>
import FormTestDescription from '@/components/atoms/FormTestDescription'
import Snackbar from '@/components/atoms/Snackbar'
import ShowInfo from '@/components/organisms/ShowInfo'
import LeaveAlert from '@/components/atoms/LeaveAlert'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed'
import Test from '@/models/Test'
import TemplateHeader from '@/models/TemplateHeader'
import TemplateAuthor from '@/models/TemplateAuthor'
import TemplateBody from '@/models/TemplateBody'
import Template from '@/models/Template'
import i18n from '@/i18n'
import TestAdmin from '@/models/TestAdmin'

export default {
  components: {
    FormTestDescription,
    Snackbar,
    ShowInfo,
    LeaveAlert,
    AccessNotAllowed,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['id'],
  data: () => ({
    template: {
      title: '',
      description: '',
      isPublic: false,
    },
    object: null,
    valids: [false, true, true],
    dialogAlert: false,
    dialogDel: false,
    loading: false,
    loadingPage: true,
    templateTitle: '',
    templateDescription: '',
    tempDialog: false,
    titleRequired: [
      (v) => !!v || i18n.t('errors.fieldRequired'),
      (v) => v.length <= 200 || 'Max 200 characters',
    ],
    showSettings: false,
    publicTemplate: true,
  }),
  computed: {
    change() {
      return this.$store.state.localChanges
    },
    test() {
      return this.$store.getters.test
    },
    user() {
      return this.$store.getters.user
    },
    answers() {
      return this.$store.getters.answers || []
    },
    testandorespostas() {
      return this.$store.state.answer(this.test.answersDocId)
    },
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
    answersNew() {
      if (this.testAnswerDocument) {
        return Object.values(this.testAnswerDocument.heuristicAnswers)
      }
      return []
    },
    reports() {
      return this.$store.getters.reports || []
    },
    cooperators() {
      return this.$store.getters.cooperators || {}
    },
    dialogText() {
      if (this.test)
        return `Are you sure you want to delete your test "${this.test.testTitle}"? This action can't be undone.`

      return "Are you sure you want to delete this test? This action can't be undone" //in case object isnt loaded
    },
    hasTemplate() {
      if (this.object)
        if ('template' in this.object) {
          if (this.object.template !== null) return true
        }

      return false
    },
    myObject() {
      if (this.user) {
        let myObject
        myObject = this.user.myTests.find((test) => test.id === this.id) //look for myTest

        if (!myObject)
          //if not found
          myObject = this.user.myCoops.find((test) => test.id === this.id) //look for my coop

        return myObject
      }

      return null
    },
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test)
      }
    },
  },
  async created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      await this.$store.dispatch('getTest', { id: this.id })
    }
  },
  beforeMount() {
    window.addEventListener('beforeunload', this.preventNav)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.preventNav)
  },
  methods: {
    validate(valid, index) {
      this.valids[index] = valid
    },
    async submit() {
      const element = this.object.testTitle
      if (element.length > 0 && element.length < 200) {
        await this.$store.dispatch('updateTest', new Test(this.object))
        this.$store.commit('SET_LOCAL_CHANGES', false)
        console.log('changes Saved')
        this.$toast.success('Changes Saved')
      } else if (element.length >= 200) {
        this.$toast.warning('Title must not exceed 200 characters.')
      } else {
        this.$toast.warning('Test must contain a title.')
      }
    },
    preventNav(event) {
      if (!this.change) return
      event.preventDefault()
      event.returnValue = ''
    },
    async deleteTest(item) {
      this.auxUser = { ...this.user } // Create a copy of user object

      // Remove the test with the given ID from auxUser.myTests
      delete this.auxUser.myTests[item.id]

      item.auxUser = this.auxUser
      await this.$store.dispatch('deleteTest', item)

      this.$router.push({ name: 'TestList' })
    },
    async createTemplate() {
      const tempHeader = new TemplateHeader({
        creationDate: Date.now(),
        updateDate: Date.now(),
        isTemplatePublic: this.template.isTemplatePublic,
        templateDescription: this.template.templateDescription,
        templateTitle: this.template.templateTitle,
        templateType: this.test.testType,
        templateVersion: '1.0.0',
        templateAuthor: new TemplateAuthor({
          userEmail: this.test.testAdmin.email,
          userDocId: this.test.testAdmin.userDocId,
        }),
      })

      const tempBody = new TemplateBody(this.test)
      const template = new Template({
        id: null,
        header: tempHeader,
        body: tempBody,
      })
      if (this.template.templateTitle.trim() !== '') {
        await this.$store.dispatch('createTemplate', template)
        this.closeDialog()
      } else {
        this.$refs.tempform.validate()
      }
    },
    closeDialog() {
      this.tempDialog = false
      this.$refs.tempform.resetValidation()
      this.template.templateTitle = ''
      this.template.templateDescription = ''
    },
    setLeavingAlert() {
      this.$store.commit('SET_DIALOG_LEAVE', true)
    },

    async duplicateTest() {
      const test = new Test({
        testTitle: 'Copy of ' + this.test.testTitle,
        testDescription: this.test.testDescription,
        testType: this.test.testType,
        userTestType: this.test.userTestType,
        testStructure: this.test.testStructure,
        testOptions: this.test.testOptions,
        userTestStatus: {},
        id: null,
        testAdmin: new TestAdmin({
          userDocId: this.user.id,
          email: this.user.email,
        }),
        creationDate: Date.now(),
        updateDate: Date.now(),
      })

      await this.$store.dispatch('duplicateTest', {
        test: test,
        answer: this.testAnswerDocument,
      })

      this.$router.push('/testslist')
    },
  },

  beforeRouteLeave(to, from, next) {
    if (this.$store.getters.localChanges) {
      this.$store.commit('SET_DIALOG_LEAVE', true)
      this.$store.commit('SET_PATH_TO', to.name)
    } else {
      next()
    }
  },
}
</script>

<style scoped>
.white--text {
  color: white;
}
</style>