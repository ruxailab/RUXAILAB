<template>
  <v-dialog v-model="dialog" max-width="80%">
    <v-stepper v-model="step" style="background-color: #e8eaf2">
      <v-stepper-header>
        <v-stepper-step color="#F9A826" :complete="step > 1" step="1"
          >Template Info</v-stepper-step
        >

        <v-divider></v-divider>

        <v-stepper-step color="#F9A826" step="2"
          >Create From Template</v-stepper-step
        >
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <p class="dialog-title ma-0">{{ template.title }}</p>
          <div class="caption ma-0">
            Created by {{ template.author }}
            {{
              template.version == "1.0.0"
                ? ` on ${template.date}`
                : ` - Last updated: ${template.date}`
            }}
            (Version: {{ template.version }})
          </div>
          <v-divider class="my-2"></v-divider>

          <div style="margin: 0px 0px 30px 0px">
            {{
              template.description
                ? template.description
                : "Template has no description."
            }}
          </div>

          <v-row justify="end" class="ma-0 pa-0">
            <v-btn class="error mr-2" @click="dialog = false">Cancel</v-btn>
            <v-btn class="success" color="primary" @click="step = 2"
              >Continue</v-btn
            >
          </v-row>
        </v-stepper-content>

        <v-stepper-content step="2">
          <p class="dialog-title ma-0">Create Test</p>
          <v-divider class="my-2"></v-divider>
          <FormTestDescription
            style="margin: 0px 0px 20px 0px"
            :test="template"
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
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";

export default {
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
  },
  components: {
    FormTestDescription,
  },
  data: () => ({
    step: 1,
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
};
</script>