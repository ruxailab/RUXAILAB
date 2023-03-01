<template>
  <v-container v-if="true">
    <Snackbar />

    <!-- Leave Alert Dialog -->
    <LeaveAlert></LeaveAlert>

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title
          >Are you sure you want to delete this test?</v-card-title
        >

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="grey lighten-3" text @click="dialogDel = false"
            >Cancel</v-btn
          >
          <v-btn
            class="red white--text ml-1"
            :loading="loading"
            text
            @click="deleteTest(object)"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Template Dialog -->
    <v-dialog v-model="tempDialog" max-width="80%">
      <v-card>
        <p class="dialog-title ma-2 pa-2">Create Template</p>
        <v-divider></v-divider>
        <v-form ref="tempform" class="px-5">
          <v-row justify="space-around" class="pa-2">
            <v-col cols="12">
              <v-text-field
                autofocus
                v-model="template.templateTitle"
                label="Title"
                :rules="titleRequired"
                counter="100"
                outlined
                @input="$emit('change')"
                dense
              ></v-text-field>

              <v-textarea
                v-model="template.templateDescription"
                label="Description"
                outlined
                dense
                @input="$emit('change')"
              ></v-textarea>

              <v-checkbox
                label="Make template public to all users"
                v-model="template.isTemplatePublic"
                color="#F9A826"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="error" @click="closeDialog()">Cancel</v-btn>
            <v-btn
              @click="createTemplate()"
              text
              :disabled="hasTemplate ? true : false"
              class="success"
              >Create</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ShowInfo title="Settings">
      <div slot="content">
        <v-card style="background: #f5f7ff">
          <v-col class="mb-1 pa-4 pb-1">
            <p class="subtitleView">Current Test</p>
          </v-col>

          <v-divider></v-divider>
          <FormTestDescription
            v-if="object"
            :test="object"
            @valForm="validate"
            ref="form1"
            :lock="true"
            @change="change = true"
          />

          <v-row class="mx-3">
            <v-spacer></v-spacer>
            <v-btn
              style="margin-right: 40px"
              outlined
              color="green"
              @click="tempDialog = true"
              :disabled="hasTemplate || !object ? true : false"
              >Create template</v-btn
            >
          </v-row>
          <v-divider class="my-3 mx-2"></v-divider>

          <v-row justify="center">
            <v-btn
              color="#f26363"
              class="white--text mb-4"
              style="justify-self: center"
              @click="dialogDel = true"
            >
              <v-icon left>mdi-trash-can-outline</v-icon>Delete Test
            </v-btn>
          </v-row>
        </v-card>

        <v-tooltip left v-if="change">
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
              @click="submit()"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon large>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
      </div>
    </ShowInfo>
  </v-container>
  <v-overlay class="text-center" v-model="loadingPage" v-else-if="loadingPage">
    <v-progress-circular
      indeterminate
      color="#fca326"
      size="50"
    ></v-progress-circular>
    <div class="white-text mt-3">Loading Settings</div>
  </v-overlay>
  <AccessNotAllowed v-else />
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";
import Snackbar from "@/components/atoms/Snackbar";
import ShowInfo from "@/components/organisms/ShowInfo";
import LeaveAlert from "@/components/atoms/LeaveAlert";
import AccessNotAllowed from "@/components/atoms/AccessNotAllowed";
import Test from "@/models/Test";
import TemplateHeader from "@/models/TemplateHeader";
import TemplateAuthor from "@/models/TemplateAuthor";
import TemplateBody from "@/models/TemplateBody";
import Template from "@/models/Template";

export default {
  props: ["id"],
  components: {
    FormTestDescription,
    Snackbar,
    ShowInfo,
    LeaveAlert,
    AccessNotAllowed,
  },
  data: () => ({
    template: {
      title: "",
      description: "",
      isPublic: false,
    },
    object: null,
    valids: [false, true, true],
    dialogAlert: false,
    dialogDel: false,
    loading: false,
    loadingPage: true,
    templateTitle: "",
    templateDescription: "",
    tempDialog: false,
    titleRequired: [
      (v) => !!v || "Field Required",
      (v) => v.length <= 100 || "Max 100 characters",
    ],
    showSettings: false,
    publicTemplate: true,
  }),
  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },
    async submit() {
      console.log(this.object);
      await this.$store.dispatch("updateTest", new Test(this.object));
      this.$store.commit("SET_LOCAL_CHANGES", false);
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
      //             author: this.test.admin.email,
      //             answersSheet: this.test.answersSheet,
      //             date: new Date().toLocaleString("en-Us"),
      //           }
      //         );
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
      if (!this.change) return;
      event.preventDefault();
      event.returnValue = "";
    },
    async deleteTest(item) {
      await this.$store.dispatch("deleteTest", item);
      this.$router.push({ name: "TestList" });
    },
    async createTemplate() {
      let tempHeader = new TemplateHeader({
        creationDate: Date.now(),
        updateDate: Date.now(),
        isTemplatePublic: this.template.isTemplatePublic,
        templateDescription: this.template.templateDescription,
        templateTitle: this.template.templateTitle,
        templateType: this.test.testType,
        templateVersion: "1.0.0",
        templateAuthor: new TemplateAuthor({
          userEmail: this.test.testAdmin.email,
          userDocId: this.test.testAdmin.userDocId,
        }),
      });

      let tempBody = new TemplateBody(this.test);
      const template = new Template({
        id: null,
        header: tempHeader,
        body: tempBody,
      });

      await this.$store.dispatch("createTemplate", template);
      this.closeDialog()
    },
    closeDialog() {
      this.tempDialog = false;
      this.$refs.tempform.resetValidation();
      this.templateTitle = "";
      this.templateDescription = "";
    },
    setLeavingAlert() {
      this.$store.commit("SET_DIALOG_LEAVE", true);
    },
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
      }
    },
  },
  computed: {
    change() {
      return this.$store.state.localChanges;
    },
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
    answers() {
      return this.$store.getters.answers || [];
    },
    reports() {
      return this.$store.getters.reports || [];
    },
    cooperators() {
      return this.$store.getters.cooperators || {};
    },
    dialogText() {
      if (this.test)
        return `Are you sure you want to delete your test "${this.test.testTitle}"? This action can't be undone.`;

      return `Are you sure you want to delete this test? This action can't be undone`; //in case object isnt loaded
    },
    hasTemplate() {
      if (this.object)
        if ("template" in this.object) {
          if (this.object.template !== null) return true;
        }

      return false;
    },
    myObject() {
      if (this.user) {
        let myObject;
        myObject = this.user.myTests.find((test) => test.id === this.id); //look for myTest

        if (!myObject)
          //if not found
          myObject = this.user.myCoops.find((test) => test.id === this.id); //look for my coop

        return myObject;
      }

      return null;
    },
  },
  async created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      await this.$store.dispatch("getTest", { id: this.id });
    }
  },

  beforeRouteLeave(to, from, next) {
    if (this.$store.getters.localChanges) {
      this.$store.commit("SET_DIALOG_LEAVE", true);
      this.$store.commit("SET_PATH_TO", to.name);
    } else {
      next();
    }
  },
  beforeMount() {
    window.addEventListener("beforeunload", this.preventNav);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.preventNav);
  },
};
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
