<template>
  <v-container v-if="true">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert />
    <LeaveAlert @submit="onSubmit" />

    <!-- Delete Alert Dialog -->
    <v-dialog
      v-model="dialogDel"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-error text-white"
          primary-title
        >
          {{ $t('alerts.deleteTest') }}
        </v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="dialogDel = false"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            :loading="loading"
            variant="text"
            @click="deleteTest(object)"
          >
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog
      v-model="tempDialog"
      max-width="80%"
    >
      <v-card>
        <p class="ma-2 pa-2">
          Create Template
        </p>
        <v-divider />
        <v-form
          ref="tempform"
          class="px-5"
        >
          <v-row
            justify="space-around"
            class="pa-2"
          >
            <v-col cols="12">
              <v-text-field
                :model-value="template.templateTitle"
                autofocus
                label="Title"
                :rules="titleRequired"
                counter="200"
                variant="outlined"
                density="compact"
                @update:model-value="updateTemplateTitle($event)"
              />

              <v-textarea
                :model-value="template.templateDescription"
                label="Description"
                variant="outlined"
                density="compact"
                @update:model-value="updateTemplateDescription($event)"
              />

              <v-checkbox
                :value="template.isTemplatePublic"
                label="Make template public to all users"
                color="#F9A826"
                @input="updateTemplate({ isTemplatePublic: $event })"
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="bg-error"
              @click="closeDialog()"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn
              variant="text"
              :disabled="hasTemplate ? true : false"
              class="bg-success"
              @click="createTemplate()"
            >
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ShowInfo :title="$t('pages.settings.title')">
      <template #content>
        <div>
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
              @val-form="validate"
              @update:test="updateObject"
            />

            <v-row
              justify="space-around"
              class="mx-4 mb-3"
            >
              <v-spacer />
              <v-btn
                style="margin-right: 25px"
                variant="outlined"
                color="green"
                :disabled="hasTemplate || !object ? true : false"
                @click="tempDialog = true"
              >
                {{ $t('pages.settings.createTemplate') }}
              </v-btn>

              <v-btn
                style="margin-right: 40px"
                variant="outlined"
                color="green"
                @click="duplicateTest()"
              >
                {{ $t('buttons.duplicateTest') }}
              </v-btn>
            </v-row>

            <v-divider class="my-3 mx-2" />

            <v-row
              justify="center"
              class="mt-3"
            >
              <v-btn
                color="#f26363"
                class="text-white mb-4"
                style="justify-self: center"
                @click="dialogDel = true"
              >
                <v-icon start>
                  mdi-trash-can-outline
                </v-icon>
                {{ $t('pages.settings.deleteTest') }}
              </v-btn>
            </v-row>
          </v-card>

          <v-tooltip
            v-if="localChanges"
            location="left"
          >
            <template #activator="{ props }">
              <v-btn
                v-if="localChanges"
                size="large"
                icon
                fixed
                location="bottom right"
                color="#F9A826"
                v-bind="props"
                @click="submit()"
              >
                <v-icon size="large">
                  mdi-content-save
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('buttons.save') }}</span>
          </v-tooltip>
        </div>
      </template>
    </ShowInfo>
  </v-container>
  <v-overlay
    v-else-if="loadingPage"
    v-model="loadingPage"
    class="text-center"
  >
    <v-progress-circular
      indeterminate
      color="#fca326"
      size="50"
    />
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

  beforeRouteLeave(to, from, next) {
    if (this.localChanges) {
      this.$store.commit('SET_DIALOG_LEAVE', true);
      this.$store.commit('SET_PATH_TO', to.name);
    } else {
      next();
    }
  },

  props: ['id'],

  data: () => ({
    template: {
      templateTitle: '',
      templateDescription: '',
      isTemplatePublic: false,
    },
    object: null,
    valids: [false, true, true],
    dialogDel: false,
    loading: false,
    loadingPage: true,
    tempDialog: false,
    titleRequired: [
      (v) => !!v.trim() || i18n.t('errors.fieldRequired'),
      (v) => v.length <= 200 || 'Max 200 characters',
    ],
    showSettings: false,
    localChanges: false,
  }),

  computed: {
    test() {
      return this.$store.getters.test;
    },

    user() {
      return this.$store.getters.user;
    },
    answers() {
      return this.$store.getters.answers || [];
    },
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument;
    },
    answersNew() {
      if (this.testAnswerDocument) {
        return Object.values(this.testAnswerDocument.heuristicAnswers);
      }
      return [];
    },
    reports() {
      return this.$store.getters.reports || [];
    },

    cooperators() {
      return this.$store.getters.cooperators || {};
    },

    dialogText() {
      if (this.test) {
        return `Are you sure you want to delete your test "${this.test.testTitle}"? This action can't be undone.`;
      }
      return "Are you sure you want to delete this test? This action can't be undone";
    },

    hasTemplate() {
      if (this.object && 'template' in this.object) {
        return this.object.template !== null;
      }
      return false;
    },
    myObject() {
      if (this.user) {
        let myObject = this.user.myTests.find((test) => test.id === this.id);
        if (!myObject) {
          myObject = this.user.myCoops.find((test) => test.id === this.id);
        }
        return myObject;
      }
      return null;
    },
  },

  watch: {
    test: {
      handler(newTest) {
        if (newTest !== null && newTest !== undefined) {
          this.object = { ...newTest };
        }
      },
      immediate: true,
    },
  },

  async created() {
    if (!this.$store.getters.test && this.id) {
      await this.$store.dispatch('getTest', { id: this.id });
    }
    this.loadingPage = false;
  },

  beforeMount() {
    window.addEventListener('beforeunload', this.preventNav);
  },

  beforeUnmount() {
    window.removeEventListener('beforeunload', this.preventNav);
  },

  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },

    async onSubmit() {
      await this.submit();
      this.localChanges = false;
      this.$router.push({ name: this.$store.state.pathTo });
    },

    async submit() {
      const title = this.object.testTitle;
      if (title.length > 0 && title.length < 200) {
        await this.$store.dispatch('updateTest', new Test(this.object));
        this.localChanges = false;
        this.$toast.success(this.$t('alerts.savedChanges'));
      } else if (title.length >= 200) {
        this.$toast.warning('Title must not exceed 200 characters.');
      } else {
        this.$toast.warning('Test must contain a title.');
      }
    },

    preventNav(event) {
      if (!this.localChanges) return;
      event.preventDefault();
      event.returnValue = '';
    },

    async deleteTest(item) {
      this.auxUser = { ...this.user };
      delete this.auxUser.myTests[item.id];
      item.auxUser = this.auxUser;
      await this.$store.dispatch('deleteTest', item);
      this.$router.push({ name: 'TestList' });
    },

    async createTemplate() {
      const tempHeader = new TemplateHeader({
        creationDate: Date.now(),
        updateDate: Date.now(),
        isTemplatePublic: this.template.isPublic,
        templateDescription: this.template.description,
        templateTitle: this.template.title,
        templateType: this.test.testType,
        templateVersion: '1.0.0',
        templateAuthor: new TemplateAuthor({
          userEmail: this.test.testAdmin.email,
          userDocId: this.test.testAdmin.userDocId,
        }),
      });

      const tempBody = new TemplateBody(this.test);
      const template = new Template({
        id: null,
        header: tempHeader,
        body: tempBody,
      });

      if (this.template.templateTitle.trim() !== '') {
        await this.$store.dispatch('createTemplate', template);
        this.closeDialog();
      } else {
        this.$refs.tempform.validate();
      }
    },

    closeDialog() {
      this.tempDialog = false;
      this.$refs.tempform.resetValidation();
      this.template = {
        templateTitle: '',
        templateDescription: '',
        isTemplatePublic: false,
      };
    },

    updateTemplate(updates) {
      this.template = { ...this.template, ...updates };
    },

    updateTemplateTitle(value) {
      this.updateTemplate({ templateTitle: value });
      this.localChanges = true;
    },

    updateTemplateDescription(value) {
      this.updateTemplate({ templateDescription: value });
      this.localChanges = true;
    },

    updateObject(newObject) {
      this.object = { ...newObject };
      this.localChanges = true;
    },

    async duplicateTest() {
      const test = new Test({
        ...this.test,
        id: null,
        testTitle: 'Copy of ' + this.test.testTitle,
        userTestStatus: {},
        id: null,
        creationDate: Date.now(),
        updateDate: Date.now(),
      });

      await this.$store.dispatch('duplicateTest', {
        test: test,
        answer: this.testAnswerDocument,
      });

      this.$router.push('/testslist');
    },
  },
}
</script>

<style scoped>
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
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
.dialog-title {
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
