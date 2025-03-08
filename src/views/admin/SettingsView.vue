<template>
  <v-container v-if="true" class="settings-container pa-0 pa-md-3">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert />

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card class="rounded-lg elevation-8 delete-dialog">
        <v-card-title class="headline error white--text py-4 px-5" primary-title>
          <v-icon left class="mr-2" size="28">mdi-alert-circle</v-icon>
          {{ $t('alerts.deleteTest') }}
        </v-card-title>

        <v-card-text class="py-5 px-5 text-body-1">{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn 
            class="grey lighten-3 px-6 py-2" 
            height="42" 
            elevation="0" 
            @click="dialogDel = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-4 px-6 py-2"
            height="42"
            :loading="loading"
            elevation="2"
            @click="deleteTest(object)"
          >
            <v-icon left small class="mr-1">mdi-trash-can-outline</v-icon>
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog v-model="tempDialog" max-width="80%" overlay-opacity="0.8">
      <v-card class="rounded-lg elevation-10 template-dialog">
        <v-card-title class="dialog-title ma-0 pa-5 grey lighten-4 d-flex align-center">
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
                class="rounded-lg template-field"
                dense
                @input="$emit('change')"
              />

              <v-textarea
                v-model="template.templateDescription"
                label="Description"
                outlined
                class="rounded-lg template-field mt-3"
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
              class="grey darken-1 white--text px-6 py-2" 
              height="42"
              elevation="1"
              @click="closeDialog()"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              :disabled="hasTemplate ? true : false"
              class="success px-6 py-2 ml-4"
              height="42"
              elevation="3"
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
        <v-card class="rounded-lg settings-card my-2" elevation="4">
          <div class="header-gradient px-5 py-4 d-flex align-center">
            <v-icon class="mr-3" color="white" size="28">mdi-cog-outline</v-icon>
            <h2 class="subtitleView font-weight-medium mb-0 white--text">
              {{ $t('pages.settings.currentTest') }}
            </h2>
          </div>

          <v-divider />
          
          <div class="form-container pa-4">
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

          <v-row justify="space-around" class="action-buttons mx-2 my-6 px-4">
            <v-col cols="12" md="6" class="d-flex justify-center justify-md-end px-2">
              <v-btn
                class="primary-btn px-5 py-2"
                height="42"
                color="green"
                outlined
                elevation="1"
                :disabled="hasTemplate || !object ? true : false"
                @click="tempDialog = true"
              >
                <v-icon left class="mr-2">mdi-content-copy</v-icon>
                {{ $t('pages.settings.createTemplate') }}
              </v-btn>
            </v-col>

            <v-col cols="12" md="6" class="d-flex justify-center justify-md-start px-2">
              <v-btn 
                class="primary-btn px-5 py-2" 
                height="42"
                color="green" 
                outlined 
                elevation="1" 
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
              class="white--text px-6 py-2 delete-btn"
              height="42"
              elevation="3"
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
              class="elevation-8 pulse-animation"
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
    <div class="loading-container">
      <v-progress-circular indeterminate color="#fca326" size="60" width="5" />
      <div class="white-text mt-4 text-h6 font-weight-medium">
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

      // await this.$store.dispatch("getAnswers", { id: this.test.answers });
      // await this.$store.dispatch("getReports", { id: this.test.reports });
      // delete this.object.id;
      // this.$store
      //   .dispatch("updateTest", {
      //     docId: this.id,
      //     data: this.object,
      //   })
      //   .then(() => {
      //     let element = this.myObject;
      //     //update attributes
      //     element.title = this.object.title;
      //     element.description = this.object.description;
      //     if ("template" in this.object)
      //       element = Object.assign(element, {
      //         template: this.object.template,
      //       });
      //     else if ("template" in this.myObject) {
      //       delete element.template;
      //     }
      //     this.$store.dispatch("updateMyTest", {
      //       docId: this.object.admin.id,
      //       element: element,
      //     });
      //     this.cooperators.cooperators.forEach((coop) => {
      //       let isAdmin = coop.accessLevel.value <= 1;
      //       if (isAdmin) {
      //         element = Object.assign(
      //           {},
      //           {
      //             id: this.id,
      //             title: this.object.title,
      //             type: this.object.type,
      //             reports: this.object.reports,
      //             answers: this.object.answers,
      //             cooperators: this.object.cooperators,
      //             accessLevel: coop.accessLevel,
      //           }
      //         );
      //       } else {
      // element = Object.assign(
      //   {},
      //   {
      //     id: this.id,
      //     title: this.object.title,
      //     type: this.object.type,
      //     reports: this.object.reports,
      //     answers: this.object.answers,
      //     cooperators: this.object.cooperators,
      //     accessLevel: coop.accessLevel,
      //     author: this.test.admin.email,
      //     answersSheet: this.test.answersSheet,
      //     date: new Date().toLocaleString("en-Us"),
      //   }
      // );
      //       }
      //       if ("template" in this.object && isAdmin)
      //         element = Object.assign(element, {
      //           template: this.object.template,
      //         });
      //       if (isAdmin)
      //         this.$store.dispatch("updateMyCoops", {
      //           docId: coop.id,
      //           element: element,
      //         });
      //       else
      //         this.$store.dispatch("updateMyAnswers", {
      //           docId: coop.id,
      //           element: element,
      //         });
      //     });
      //     this.answers.test.title = this.object.title;
      //     this.reports.test.title = this.object.title;
      //     this.cooperators.test.title = this.object.title;
      //     delete this.answers.id;
      //     delete this.reports.id;
      //     delete this.cooperators.id;
      //     this.$store.dispatch("updateTestAnswer", {
      //       docId: this.test.answers,
      //       data: this.answers,
      //     });
      //     this.$store.dispatch("updateTestReport", {
      //       docId: this.test.reports,
      //       data: this.reports,
      //     });
      //     this.$store.dispatch("updateTestCooperators", {
      //       docId: this.test.cooperators,
      //       data: this.cooperators,
      //     });
      //     this.$store.commit("setSuccess", "Test updated succesfully");
      //     this.change = false; //reset change
      //   })
      //   .catch((err) => {
      //     this.$store.commit("setError", err);
      //   });
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
/* Base Typography */
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.subtitleView {
  font-style: normal;
  font-weight: 300;
  font-size: 20px;
  line-height: 24px;
  align-items: flex-end;
  color: #ffffff;
  margin-bottom: 0px;
  padding-bottom: 0px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
}

.dialog-title {
  font-style: normal;
  font-weight: 400;
  font-size: 36px;
  line-height: 60px;
  display: flex;
  align-items: center;
  color: #333333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Enhanced Card Styling */
.settings-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.form-container {
  background-color: #fafbff;
  padding: 24px !important;
  border-radius: 0 0 12px 12px;
}

/* Gradient Header */
.header-gradient {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Enhanced Dialog Styling */
.template-dialog, .delete-dialog {
  overflow: hidden;
  border: none;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
}

.template-dialog .v-card__title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.delete-dialog .v-card__title {
  background: linear-gradient(45deg, #ff5252, #ff867f);
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.2);
}

/* Enhanced Form Elements */
.template-field .v-input__slot {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease;
  background-color: rgba(250, 250, 255, 0.8) !important;
}

.template-field .v-input__slot:hover {
  border-color: #F9A826 !important;
  background-color: rgba(250, 250, 255, 1) !important;
}

.template-field .v-input__slot:focus-within {
  border-color: #3a7bd5 !important;
  box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.1) !important;
}

/* Button Styling */
.v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.v-btn.success, .v-btn.error {
  font-weight: 500;
}

.v-btn::before {
  border-radius: 8px;
}

.primary-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.primary-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: all 0.7s ease;
  z-index: 0;
  opacity: 0;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.primary-btn:hover::after {
  transform: rotate(45deg) translate(150%, 150%);
  opacity: 1;
}

.delete-btn {
  box-shadow: 0 4px 12px rgba(242, 99, 99, 0.25);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.delete-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: all 0.7s ease;
  z-index: 0;
  opacity: 0;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(242, 99, 99, 0.35);
}

.delete-btn:hover::after {
  transform: rotate(45deg) translate(150%, 150%);
  opacity: 1;
}

/* Loading Animation */
.loading-container {
  background: rgba(0, 0, 0, 0.7);
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.white-text {
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Save Button Animation */
.pulse-animation {
  animation: pulse 2s infinite;
  box-shadow: 0 6px 16px rgba(249, 168, 38, 0.4);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(249, 168, 38, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(249, 168, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(249, 168, 38, 0);
  }
}

/* Action Buttons Container */
.action-buttons {
  margin: 40px 0 !important;
}

/* Dividers */
.v-divider {
  opacity: 0.7;
}

/* Responsive Adjustments */
@media screen and (max-width: 960px) {
  .settings-container {
    padding: 0;
  }
  
  .dialog-title {
    font-size: 28px;
    line-height: 40px;
    text-align: center;
    justify-content: center;
  }
  
  .subtitleView {
    font-size: 18px;
    text-align: center;
    justify-content: center;
    width: 100%;
  }
  
  .header-gradient {
    justify-content: center;
  }
  
  .v-btn {
    margin: 8px 0;
    width: 100%;
  }
  
  .primary-btn, .delete-btn {
    width: 90%;
    margin: 8px auto;
  }
  
  .settings-card {
    margin: 0;
    border-radius: 0;
  }
  
  .form-container {
    padding: 16px !important;
  }
}

/* More responsive details for smaller screens */
@media screen and (max-width: 600px) {
  .header-gradient {
    padding: 16px;
  }
  
  .dialog-title {
    font-size: 24px;
    line-height: 32px;
  }
  
  .v-card-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .v-card-actions .v-btn {
    margin: 5px 0 !important;
    width: 100%;
  }
  
  .v-dialog .v-card-actions .v-btn {
    margin: 5px 0 !important;
  }
  
  .action-buttons {
    margin: 24px 0 !important;
  }
  
  .pulse-animation {
    bottom: 16px !important;
    right: 16px !important;
  }
}

/* High-density screens */
@media screen and (min-width: 1920px) {
  .settings-container {
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .settings-card {
    max-width: 1400px;
    margin: 24px auto;
  }
}

/* Transition Animations */
.v-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.template-field .v-input__slot {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>