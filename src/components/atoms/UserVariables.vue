<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="8">
        <v-expansion-panels style="z-index: auto;">
          <v-expansion-panel v-for="(item, i) in items" :key="i">
            <v-expansion-panel-header>
              {{ items[i].title }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-form>
                <v-text-field
                  @click:append="log"
                  label="Description"
                ></v-text-field>
                <v-text-field
                  v-for="(field, index) in items[i].selectionFields"
                  :key="index"
                  append-icon="mdi-plus"
                  @click:append="newSelection(i)"
                  label="Selection"
                ></v-text-field>
              </v-form>
              <v-row>
                <v-col cols="6">
                  <v-checkbox
                    label="Selection field"
                    v-model="items[i].selectionField"
                    @click="selectField(i)"
                  ></v-checkbox>
                </v-col>
                <v-col cols="5">
                  <v-checkbox
                    label="Text field"
                    v-model="items[i].textField"
                    @click="selectText(i)"
                  ></v-checkbox>
                </v-col>
                <v-col>
                  <v-btn
                    class="mt-5"
                    icon
                    v-bind="attrs"
                    @click="deleteItem(i)"
                    v-on="on"
                  >
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-card
          @click="showModal"
          outlined
          elevation="0"
          color="grey lighten-2"
        >
          <p class="text-subtitle-1 text-center ma-1">
            Create a new variable
          </p>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="show" max-width="600">
      <v-card>
        <v-card-title>Create a new variable</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newItem"
            label="New Variable Name"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="saveNewItem">Save</v-btn>
          <v-btn @click="closeModal">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    newItem: '',
    items: [],
    show: false,
  }),
  methods: {
    log() {
      console.log('adicionar + 1')
    },
    showModal() {
      this.show = true
    },
    closeModal() {
      this.show = false
    },
    selectField(i) {
      if (this.items[i].selectionFields.length == 0) {
        this.items[i].selectionFields.push('')
      }
      this.items[i].textField = false
    },
    selectText(i) {
      if (this.items[i].selectionFields.length > 0) {
        this.items[i].selectionFields = []
      }
      this.items[i].selectionField = false
    },
    deleteItem(i) {
      this.items.splice(i, 1)
    },
    saveNewItem() {
      this.items.push({
        title: this.newItem,
        selectionFields: [],
        selectionField: false,
        textField: false,
      })
      this.newItem = ''
      this.show = false
    },
    newSelection(index) {
      this.$set(this.items, index, {
        ...this.items[index],
        selectionFields: [...this.items[index].selectionFields, ''],
      })
    },
  },
}
</script>

<style></style>
