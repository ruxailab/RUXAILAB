<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="80%"
      v-if="template.header"
      persistent
    >
      <v-stepper v-model="step" style="background-color: #e8eaf2">
        <v-stepper-header>
          <v-stepper-step color="#F9A826" :complete="step > 1" step="1"
            >Template Info</v-stepper-step
          >

          <v-divider></v-divider>

          <v-stepper-step color="#F9A826" step="2" v-if="allowCreate"
            >Create From Template</v-stepper-step
          >
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-row align="center" justify="space-between">
              <v-col cols="10" v-if="template.header">
                <p class="dialog-title ma-0">
                  {{ template.header.title }}
                </p>
                <div class="caption ma-0">
                  Created by {{ author }}
                  {{
                    template.header.version == "1.0.0"
                      ? ` on ${template.header.date}`
                      : ` - Last updated: ${template.header.date}`
                  }}
                  (Version: {{ template.header.version }})
                </div>
              </v-col>

              <v-col cols="1" v-if="showDetails">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="detailsDialog = true"
                    >
                      <v-icon>mdi-information-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Detailed information</span>
                </v-tooltip>
              </v-col>
            </v-row>

            <v-divider class="my-2"></v-divider>

            <div
              style="margin: 0px 0px 30px 0px"
              v-if="template.header.description"
            >
              {{
                template.header.description
                  ? template.header.description
                  : "Template has no description."
              }}
            </div>

            <v-row justify="end" class="ma-0 pa-0">
              <v-btn class="error mr-2" @click="reset()">
                {{ allowCreate ? "Cancel" : "Close" }}</v-btn
              >
              <v-btn
                class="success"
                color="primary"
                @click="step = 2"
                v-if="allowCreate"
                >Continue</v-btn
              >
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="2">
            <p class="dialog-title ma-0">Create Test</p>
            <v-divider class="my-2"></v-divider>
            <!-- TODO: CHECK HERE -->
            <FormTestDescription
              style="margin: 0px 0px 20px 0px"
              :test="mountTest"
              ref="form"
              :lock="true"
            />
            <v-row justify="end" class="ma-0 pa-0">
              <v-btn
                @click="step = 1"
                class="warning"
                style="position: absolute; left: 24px"
                >Go Back</v-btn
              >

              <v-btn class="error mr-2" @click="reset()">Cancel</v-btn>
              <v-btn class="success" color="primary" @click="validate()"
                >Create</v-btn
              >
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>

    <TempDetails
      v-if="showDetails"
      :dialog="detailsDialog"
      :template="template"
      @close="detailsDialog = false"
    />
  </div>
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";
import TempDetails from "@/components/atoms/TemplateDetailsDialog";

export default {
  components: {
    FormTestDescription,
    TempDetails,
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
    showDetails: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({
    step: 1,
    detailsDialog: false,
  }),
  methods: {
    reset() {
      this.$emit("close");
      this.$refs.form.resetVal();
      this.step = 1;
    },
    validate() {
      if (this.$refs.form.valida()) {
        this.$emit("submitTemplate");
      }
    },
  },
  computed: {
    mountTest() {
      const test = this.template.header;
      if (!test.type) {
        test.type = this.template.body.type;
      }
      return test
    },
    author() {
      return this.template?.header?.author?.email || "";
    },
    title() {
      return this.template?.header?.title || "";
    },
  },
};
</script>
