<template>
  <div>
    <v-dialog
      v-if="template.header"
      v-model="dialog"
      max-width="80%"
      persistent
    >
      <v-stepper v-model="step" style="background-color: #e8eaf2">
        <v-stepper-header>
          <v-stepper-step color="#F9A826" :complete="step > 1" step="1">
            {{ $t('pages.createTest.templateInfo') }}
          </v-stepper-step>

          <v-divider />

          <v-stepper-step v-if="allowCreate" color="#F9A826" step="2">
            {{ $t('pages.createTest.templateTitle') }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-row align="center" justify="space-between">
              <v-col v-if="template.header" cols="10">
                <p class="dialog-title ma-0">
                  {{ template.header.templateTitle }}
                </p>
                <div class="caption ma-0">
                  {{ $t('pages.listTests.createdBy') }} {{ author }}
                  {{
                    template.header.templateVersion == '1.0.0'
                      ? ` on ${getFormattedDate(template.header.creationDate)}`
                      : ` - Last updated: ${getFormattedDate(
                        template.header.updateDate,
                      )}`
                  }}
                  ({{ $t('pages.listTests.version') + ' ' + template.header.templateVersion }})
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-2" />

            <div style="margin: 0px 0px 30px 0px">
              {{
                template.header.templateDescription
                  ? template.header.templateDescription
                  : $t('pages.createTest.noDescription')
              }}
            </div>

            <v-row justify="space-between" class="ma-0 pa-0">
              <v-btn
                v-if="!allowCreate && isMyTemplate"
                color="error"
                outlined
                @click="deleteTemplate()"
              >
                {{ $t('pages.createTests.deleteTemplate') }}
                <v-icon right>
                  mdi-delete
                </v-icon>
              </v-btn>
              <v-btn
                :class="`${allowCreate ? 'error' : 'primary'} mr-2`"
                @click="reset()"
              >
                {{ allowCreate ? $t('buttons.cancel') : $t('buttons.close') }}
              </v-btn>
              <v-btn
                v-if="allowCreate"
                class="success"
                color="primary"
                @click="step = 2"
              >
                {{ $t('buttons.next') }}
              </v-btn>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <p class="dialog-title ma-0">
              {{ $t('pages.createTest.create') }}
            </p>
            <v-divider class="my-2" />
            <!-- TODO: CHECK HERE -->
            <FormTestDescription
              ref="form"
              style="margin: 0px 0px 20px 0px"
              :test="mountTest"
              :lock="true"
            />
            <v-row justify="end" class="ma-0 pa-0">
              <v-btn
                class="warning"
                style="position: absolute; left: 24px"
                @click="step = 1"
              >
                {{ $t('buttons.previous') }}
              </v-btn>

              <v-btn class="error mr-2" @click="reset()">
                {{ $t('buttons.cancel') }}
              </v-btn>
              <v-btn class="success" color="primary" @click="validate()">
                {{ $t('buttons.create') }}
              </v-btn>
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
  </div>
</template>

<script>
import FormTestDescription from '@/components/atoms/FormTestDescription'
import i18n from '@/i18n'

export default {
  components: {
    FormTestDescription,
  },

  props: {
    dialog: {
      type: Boolean,
      required: true,
      default: false,
    },

    template: {
      type: Object,
      required: true,
      default: () => {},
    },

    allowCreate: {
      type: Boolean,
      default: () => false,
    },
  },

  data: () => ({
    step: 1,
    isMyTemplate: false,
  }),

  computed: {
    mountTest() {
      const test = this.template.body
      if (!test.testType) {
        test.testType = this.template.body.testType
      }
      return test
    },

    author() {
      return this.template?.header?.templateAuthor.userEmail || ''
    },

    title() {
      return this.template?.header?.templateTitle || ''
    },

    user() {
      return this.$store.state.Auth.user
    },
  },

  watch: {
    template() {
      this.isMyTemplate =
        this.template?.header?.templateAuthor?.userDocId === this.user.id
          ? true
          : false
    },
  },

  methods: {
    async deleteTemplate() {
      if (!confirm( i18n.t('alerts.deleteTest'))) return

      await this.$store.dispatch('deleteTemplate', this.template.id)
      this.reset()
    },

    reset() {
      this.$emit('close')
      this.$refs.form.resetVal()
      this.step = 1
      this.$emit('reloadTemplates')
    },

    validate() {
      if (this.$refs.form.valida()) {
        this.$emit('submitTemplate')
      }
    },

    getFormattedDate(date) {
      const d = new Date(date)
      return d.toLocaleString()
    },
  },
}
</script>
