<template>
  <v-container v-if="true">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert />

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          {{ $t('alerts.deleteTest') }}
        </v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialogDel = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            :loading="loading"
            text
            @click="deleteTest(object)"
          >
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog v-model="tempDialog" max-width="80%">
      <v-card>
        <p class="dialog-title ma-2 pa-2">
          Create Template
        </p>
        <v-divider />
        <v-form ref="tempform" class="px-5">
          <v-row justify="space-around" class="pa-2">
            <v-col cols="12">
              <v-text-field
                v-model="template.templateTitle"
                autofocus
                label="Title"
                :rules="titleRequired"
                counter="100"
                outlined
                dense
                @input="$emit('change')"
              />

              <v-textarea
                v-model="template.templateDescription"
                label="Description"
                outlined
                dense
                @input="$emit('change')"
              />

              <v-checkbox
                v-model="template.isTemplatePublic"
                label="Make template public to all users"
                color="#F9A826"
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn class="error" @click="closeDialog()">
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              text
              :disabled="hasTemplate ? true : false"
              class="success"
              @click="createTemplate()"
            >
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ShowInfo :title="$t('pages.settings.title')">
      <div slot="content">
        <v-card style="background: #f5f7ff">
          <v-col class="mb-1 pa-4 pb-1">
            <p class="subtitleView">
              {{ $t('pages.settings.currentTest') }}
            </p>
          </v-col>

          <v-divider />
          <FormTestDescription
            v-if="object"
            ref="form1"
            :test="object"
            :lock="true"
            @valForm="validate"
            @change="change = true"
          />

          <v-row class="mx-3">
            <v-spacer />
            <v-btn
              style="margin-right: 40px"
              outlined
              color="green"
              :disabled="hasTemplate || !object ? true : false"
              @click="tempDialog = true"
            >
            {{ $t('pages.settings.createTemplate') }}
            </v-btn>
          </v-row>
          <v-divider class="my-3 mx-2" />

          <v-row justify="center">
            <v-btn
              color="#f26363"
              class="white--text mb-4"
              style="justify-self: center"
              @click="dialogDel = true"
            >
              <v-icon left>
                mdi-trash-can-outline
              </v-icon> {{ $t('pages.settings.deleteTest') }}
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
    <v-progress-circular indeterminate color="#fca326" size="50" />
    <div class="white-text mt-3">
      Loading Settings
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
      (v) => v.length <= 100 || 'Max 100 characters',
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
    reports() {
      return this.$store.getters.reports || []
    },
    cooperators() {
      return this.$store.getters.cooperators || {}
    },
    dialogText() {
      if (this.test)
        return `Are you sure you want to delete your test "${this.test.testTitle}"? This action can't be undone.`

      return 'Are you sure you want to delete this test? This action can\'t be undone' //in case object isnt loaded
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
      await this.$store.dispatch('updateTest', new Test(this.object))
      this.$store.commit('SET_LOCAL_CHANGES', false)
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

      await this.$store.dispatch('createTemplate', template)
      this.closeDialog()
    },
    closeDialog() {
      this.tempDialog = false
      this.$refs.tempform.resetValidation()
      this.templateTitle = ''
      this.templateDescription = ''
    },
    setLeavingAlert() {
      this.$store.commit('SET_DIALOG_LEAVE', true)
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
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
.dialog-title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 40px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
