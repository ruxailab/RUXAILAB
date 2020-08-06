<template>
  <div class="ma-0 pa-0">
    <v-data-table
      height="420px"
      style="background: #f5f7ff;"
      :headers="headers"
      :items="options"
      :items-per-page="5"
    >
      <template v-slot:top>
        <v-row class>
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">Current Options</p>
          </v-col>
          <v-col class="mr-2 mb-1 pb-0 pa-4">
            <v-row justify="end" class="ma-0 pa-0">
              <AddOptionBtn
                :option="option"
                :dialog="dialog"
                :hasValue="hasValue"
                @addOption="updateOptions"
                @dialog="changeDialog"
                @change="emitChange()"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="mb-4"></v-divider>
      </template>

      <template v-slot:item.actions="{ item }">
        <!-- table actions -->
        <v-row justify="end" class="pr-1">
          <v-btn icon small class="mr-2" @click="editItem(item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteItem(item)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>


<script>
import AddOptionBtn from "../atoms/AddOptionBtn";

export default {
  props: ["options"],
  data: () => ({
    headers: [
      {
        text: "Text",
        align: "start",
        value: "text",
      },
      { text: "Value", align: "end", value: "value" },
      { text: "Edit/Delete", value: "actions", align: "end", sortable: false },
    ],
    option: {
      text: "",
      value: null,
    },
    dialog: false,
    editIndex: -1,
    hasValue: true
  }),
  methods: {
    updateOptions() {
      if (this.editIndex == -1) {
        this.options.push(this.option);
      } else {
        Object.assign(this.options[this.editIndex], this.option);
        this.editIndex = -1;
      }

      this.option = {
        text: "",
        value: null,
      };
      this.hasValue = true;
    },
    changeDialog(payload) {
      this.dialog = payload;
    },
    deleteItem(item) {
      this.options.splice(this.options.indexOf(item), 1);
    },
    editItem(item) {
      this.editIndex = this.options.indexOf(item);
      this.option.text = this.options[this.editIndex].text;
      this.option.value = this.options[this.editIndex].value;

      if (this.option.value == null) this.hasValue = false;
      else this.hasValue = true;
      this.dialog = true;
    },
    emitChange() {
      this.$emit("change");
    },
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.option = {
          text: "",
          value: null,
        };
        this.hasValue = true;
      }
    },
    options() {
      this.$emit("change");
    },
  },
  components: {
    AddOptionBtn,
  },
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
</style>