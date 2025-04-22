<template>
  <div>
    <v-dialog
      v-if="template?.header"
      :model-value="dialog"
      max-width="80%"
      persistent
      @update:model-value="$emit('update:dialog', $event)"
    >
      <v-stepper
        v-model="step"
        style="background-color: #e8eaf2"
      >
        <v-stepper-header>
          <v-stepper-step
            color="#F9A826"
            :complete="step > 1"
            step="1"
          >
            {{ $t('pages.createTest.templateInfo') }}
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            v-if="allowCreate"
            color="#F9A826"
            step="2"
          >
            {{ $t('pages.createTest.templateTitle') }}
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-row
              align="center"
              justify="space-between"
            >
              <v-col
                v-if="template.header"
                cols="10"
              >
                <p class="dialog-title ma-0">
                  {{ template.header.templateTitle }}
                </p>
                <div class="text-caption ma-0">
                  {{ $t('pages.listTests.createdBy') }} {{ author }}
                  {{
                    template.header.templateVersion == '1.0.0'
                      ? ` on ${getFormattedDate(template.header.creationDate)}`
                      : ` - Last updated: ${getFormattedDate(
                        template.header.updateDate,
                      )}`
                  }}
                  ({{
                    $t('pages.listTests.version') +
                    ' ' +
                    template.header.templateVersion
                  }})
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

            <v-row
              justify="end"
              class="ma-0 pa-0"
            >
              <v-btn
                v-if="isMyTemplate"
                color="error"
                variant="outlined"
                style="position: absolute; left: 24px"
                @click="deleteTemplate()"
              >
                {{ $t('buttons.delete') }}
                <v-icon end>
                  mdi-delete
                </v-icon>
              </v-btn>

              <v-btn
                class="bg-error mr-2"
                @click="reset()"
              >
                {{ $t('buttons.close') }}
              </v-btn>

              <v-btn
                v-if="allowCreate"
                class="bg-success"
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
            <FormTestDescription
              ref="form"
              style="margin: 0px 0px 20px 0px"
              :test="localTest"
              :lock="true"
              @update:test="updateLocalTest"
              @val-form="handleValForm"
            />
            <v-row
              justify="end"
              class="ma-0 pa-0"
            >
              <v-btn
                class="bg-warning"
                style="position: absolute; left: 24px"
                @click="step = 1"
              >
                {{ $t('buttons.previous') }}
              </v-btn>

              <v-btn
                class="bg-error mr-2"
                @click="reset()"
              >
                {{ $t('buttons.cancel') }}
              </v-btn>
              <v-btn
                class="bg-success"
                color="primary"
                @click="validate()"
              >
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
import Test from '@/models/Test'
import TestAdmin from '@/models/TestAdmin'
import FormTestDescription from '@/components/atoms/FormTestDescription'

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
      default: () => ({}),
    },

    allowCreate: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:dialog', 'close'],
  data: () => ({
    step: 1,
    isMyTemplate: false,
    localTest: null,
  }),

  computed: {
    mountTest() {
      // Defensive check for template.body
      if (!this.template?.body) {
        console.warn('Template body is undefined:', this.template);
        return {};
      }

      const test = { ...this.template.body };
      if (!test.testType && this.template.body.testType) {
        test.testType = this.template.body.testType;
      }
      return test;
    },

    author() {
      return this.template?.header?.templateAuthor?.userEmail || '';
    },

    title() {
      return this.template?.header?.templateTitle || '';
    },

    user() {
      return this.$store.state.Auth.user;
    },
  },

  watch: {
    template: {
      handler() {
        this.isMyTemplate =
          this.template?.header?.templateAuthor?.userDocId === this.user?.id;
        // Only set localTest if mountTest is valid
        this.localTest = this.mountTest ? { ...this.mountTest } : null;
      },
      immediate: true,
    },
  },

  methods: {
    async deleteTemplate() {
      if (!confirm('Are you sure you want to delete the template?')) return;

      await this.$store.dispatch('deleteTemplate', this.template.id);
      this.reset();
    },

    reset() {
      this.$emit('close');
      this.$refs.form?.resetVal();
      this.step = 1;
      this.localTest = null;
    },

    updateLocalTest(newTest) {
      this.localTest = { ...newTest }; // Update local state with changes
    },

    handleValForm(valid) {
      // Handle valForm event if needed (e.g., store validation state)
      this.formValid = valid;
    },

    async validate() {
      if (!this.$refs.form?.valida()) return;

      if (!this.localTest) {
        console.error('localTest is not initialized');
        return;
      }

      const test = new Test({
        ...this.localTest, // Use localTest for latest changes
        id: null,
        testAdmin: new TestAdmin({
          userDocId: this.user.id,
          email: this.user.email,
        }),
        templateDoc: this.template.id,
        creationDate: Date.now(),
        updateDate: Date.now(),
      });

      const testId = await this.$store.dispatch('createNewTest', test);
      this.$router.push(`/managerview/${testId}`).catch(() => {});
    },

    getFormattedDate(date) {
      return new Date(date).toLocaleString();
    },
  },
}
</script>