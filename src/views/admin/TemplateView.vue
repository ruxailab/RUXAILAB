<template>
  <v-container v-if="test">
    <SnackBar />

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          Are you sure you want to delete this template?
        </v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialogDel = false">
            Cancel
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            :loading="loading"
            text
            @click="deleteTemplate(object), (loading = true), (change = false)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialogAlert" width="600" persistent>
      <v-card>
        <v-card-title class="headline error accent-4 white--text" primary-title>
          Are you sure you want to leave?
        </v-card-title>

        <v-card-text>
          Are you sure you want to leave? All your changes will be
          discarded
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialogAlert = false">
            Stay
          </v-btn>
          <v-btn
            class="error accent-4 white--text ml-1"
            text
            @click="(change = false), $router.push(go)"
          >
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ShowInfo title="Template">
      <v-alert
        v-if="!test.template.upToDate"
        slot="warning"
        type="warning"
        dense
      >
        Your template is not up to date with your test.
      </v-alert>
      <div slot="content">
        <v-card style="background: #f5f7ff">
          <v-col class="mb-1 pa-4 pb-1">
            <p class="subtitleView">
              Settings
            </p>
          </v-col>
          <v-divider />
          <v-form ref="tempform" class="px-5">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="template.header.title"
                  label="Title"
                  :rules="titleRequired"
                  counter="100"
                  outlined
                  dense
                  @input="change = true"
                />

                <v-textarea
                  v-model="template.header.description"
                  label="Description"
                  outlined
                  dense
                  @input="change = true"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="template.header.date"
                  label="Last Update"
                  outlined
                  dense
                  disabled
                />
                <v-text-field
                  v-model="template.header.version"
                  label="Version"
                  outlined
                  dense
                  @keypress="isNumber(event)"
                  @input="change = true"
                />
                <v-checkbox
                  v-model="template.header.isPublic"
                  label="Make template public to all users"
                  class="ma-0"
                  color="#F9A826"
                  @change="change = true"
                />
                <v-row class="mx-1">
                  <v-btn outlined @click="dialogDetails = true">
                    Detailed information
                  </v-btn>
                  <v-spacer />

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        outlined
                        v-bind="attrs"
                        @click="updateTemplate(), (change = true)"
                        v-on="on"
                      >
                        Update
                      </v-btn>
                    </template>
                    <span>Click to update your local template, click save to submit
                      it.</span>
                  </v-tooltip>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
          <v-divider />
          <v-row justify="center">
            <v-btn
              color="#f26363"
              class="white--text my-4"
              style="justify-self: center"
              @click="dialogDel = true"
            >
              <v-icon left>
                mdi-trash-can-outline
              </v-icon>Delete template
            </v-btn>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>
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
          @click="update()"
          v-on="on"
        >
          <v-icon large>
            mdi-content-save
          </v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>
  </v-container>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo'
import SnackBar from '@/components/atoms/Snackbar'

export default {
  components: {
    ShowInfo,
    SnackBar,
  },
  props: ['id'],
  data: () => ({
    change: false,
    dialogDel: false,
    dialogAlert: false,
    dialogDetails: false,
    loading: false,
    object: null,
    template: null,
    titleRequired: [
      (v) => !!v || 'Field Required',
      (v) => v.length <= 100 || 'Max 100 characters',
    ],
    updated: false,
  }),
  computed: {
    templateStore() {
      if (this.$store.getters.template) this.setTemplate()
      return this.$store.getters.template
    },
    test() {
      return this.$store.getters.test
    },
    dialogText() {
      if (this.object)
        return 'Are you sure you want to delete your template ? This action can\'t be undone'

      return 'Are you sure you want to delete this template? This action can\'t be undone' //in case object isnt loaded
    },
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test)
      }
    },
    templateStore: async function() {
      if (this.templateStore !== null && this.templateStore !== undefined) {
        this.template = await Object.assign({}, this.templateStore)
      }
    },
  },
  async created() {
    await this.$store.dispatch('getTemplate', { id: this.id })

    await this.$store.dispatch('getTest', {
      id: this.template.testId,
    })
  },
  beforeMount() {
    window.addEventListener('beforeunload', this.preventNav)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.preventNav)
  },
  methods: {
    update() {
      this.template.header.date = new Date().toDateString()

      this.$store
        .dispatch('updateTemplate', {
          docId: this.id,
          data: this.template,
        })
        .then(() => {
          this.change = false
          if (this.updated)
            this.$store.dispatch('setUpToDate', {
              docId: this.test.id,
              data: true,
            })

          this.$store
            .dispatch('updateMyTemps', {
              docId: this.template.header.author.id,
              element: Object.assign(this.template.header, {
                type: this.template.body.type,
                id: this.id,
              }),
            })
            .then(() =>
              this.$store.commit('setSuccess', 'Template succesfully updated'),
            )
        })
        .catch((err) => this.$store.commit('setError', err))
    },
    deleteTemplate() {
      this.$store
        .dispatch('deteleTemplate', {
          id: this.id,
        })
        .then(() => {
          this.$store
            .dispatch('removeMyTemps', {
              docId: this.template.header.author.id,
              element: {
                id: this.id,
                title: this.template.header.title,
                type: this.template.body.type,
              },
              param: 'myTemps',
            })
            .then(() => {
              delete this.object.template
              this.submit()
              this.loading = false
              this.dialogDel = false
              this.$router
                .push(`/managerview/${this.object.id}`)
                .catch(() => {})
            })
        })
    },
    async submit() {
      await this.$store.dispatch('getAnswers', { id: this.test.answers })
      await this.$store.dispatch('getReports', { id: this.test.reports })

      this.$store
        .dispatch('updateTest', {
          docId: this.object.id,
          data: this.object,
        })
        .then(() => {
          this.$store.dispatch('updateMyTest', {
            docId: this.object.admin.id,
            element: {
              id: this.object.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              cooperators: this.object.cooperators,
              template: this.object.template,
              accessLevel: 0,
            },
          })

          this.cooperators.cooperators.forEach((coop) => {
            this.$store.dispatch('updateMyCoops', {
              docId: coop.id,
              element: {
                id: this.object.id,
                title: this.object.title,
                type: this.object.type,
                reports: this.object.reports,
                answers: this.object.answers,
                cooperators: this.object.cooperators,
                template: this.object.template,
                accessLevel: coop.accessLevel,
              },
            })
          })

          this.answers.test.title = this.object.title
          this.reports.test.title = this.object.title
          this.cooperators.test.title = this.object.title

          this.$store.dispatch('updateTestAnswer', {
            docId: this.test.answers,
            data: this.answers,
          })

          this.$store.dispatch('updateTestReport', {
            docId: this.test.reports,
            data: this.reports,
          })

          this.$store.dispatch('updateTestCooperators', {
            docId: this.test.cooperators,
            data: this.cooperators,
          })

          this.$store.commit('setSuccess', 'Template succesfully deleted')
        })
        .catch((err) => {
          this.$store.commit('setError', err)
        })
    },
    setTemplate() {
      this.template = this.$store.getters.template
    },
    updateTemplate() {
      this.updated = true

      Object.keys(this.template.body).forEach((key) => {
        this.template.body[key] = this.test[key]
      })
    },
    isNumber: function(evt) {
      evt = evt ? evt : window.event
      var charCode = evt.which ? evt.which : evt.keyCode
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault()
      } else {
        return true
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialogAlert = true
      this.go = to.path
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

.list-scroll {
  height: 508px;
  overflow: auto;
}
/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}
/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}
/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
  /* background: #515069; */
}
</style>
