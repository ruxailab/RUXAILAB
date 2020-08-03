<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="white--text"
      small
      @click="$emit('dialog', true)"
    >Add a new Option</v-btn>

    <v-dialog width="500" v-model="dialog" persistent>
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">Add a new Option</p>
        <v-divider></v-divider>
        <v-row justify="center" class="ma-0">
          <v-col cols="11">
            <v-form ref="form">
              <v-row justify="center" align="center">
                <v-col cols="9">
                  <v-text-field maxLength="100" counter="100" v-model="option.text" label="Text" :rules="textRequired"></v-text-field>
                </v-col>

                <v-col cols="2">
                  <v-text-field
                    v-model.number="option.value"
                    label="Value"
                    :disabled="!hasValue"
                    type="number"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-checkbox v-model="hasValue" label="Has Value"></v-checkbox>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="$emit('dialog', false), resetVal()"
            small
            text
            color="red lighten-1 white--text"
          >Cancel</v-btn>

          <v-btn @click="validate()" small color="#f9a826" class="white--text">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["option", "dialog", "hasValue"],
  data: () => ({
    id: 0,
    textRequired: [v => !!v || "Text is required"]
  }),
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        if (this.hasValue && this.option.value == null) {
          alert("Please enter a value for this option.");
        } else {
          if (!this.hasValue) {
            this.option.value = null;
          }

          this.$emit("dialog", false);
          this.$emit("addOption");
          this.$emit("change");
          this.resetVal();
        }
      }
    },
    resetVal() {
      this.$refs.form.resetValidation();
    }
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.hasValue = true;
      }
    }
  }
};
</script>

<style scoped>
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>