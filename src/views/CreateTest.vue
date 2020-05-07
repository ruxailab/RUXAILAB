<template>
  <v-container justify="center">
    <v-card>
      <v-stepper v-model="el" alt-labels non-linear>
        <v-stepper-header>
          <v-stepper-step step="1" editable>Test Description</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2" editable>
            Pre Test
            <small>Optional</small>
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3" editable>Tasks</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="4" editable>
            Post Test
            <small>Optional</small>
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-form>
            <v-stepper-content step="1">
              <v-container>
                <v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-card-text>
                        <v-text-field label="Title" v-model="test.title" :rules="requiredRule"></v-text-field>
                        <v-text-field label="Type" v-model="test.type"></v-text-field>
                        <v-textarea label="Description" v-model="test.description"></v-textarea>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn color="primary" @click="nextStep(1)">Next</v-btn>
                    <v-btn text>Cancel</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-container>
                <v-row>
                  <v-row>
                    <v-col>
                      <v-card-text>
                        <v-text-field
                          prepend-inner-icon="mdi-link-variant"
                          label="Consent"
                          v-model="preTest.consent"
                          :rules="googleLinkRules"
                        ></v-text-field>
                        <v-text-field
                          prepend-inner-icon="mdi-link-variant"
                          label="Form"
                          v-model="preTest.form"
                          :rules="googleLinkRules"
                        ></v-text-field>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn color="primary" @click="nextStep(2)">Next</v-btn>
                    <v-btn text @click="backStep(2)">Back</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-container>
                <v-row>
                  <v-col>
                    <v-data-table
                      :headers="headers"
                      :items="tasks"
                      :items-per-page="5"
                      class="elevation-1"
                    >
                      <template v-slot:top>
                        <v-toolbar flat color="white">
                          <v-row justify="end ">
                            <v-dialog v-model="dialog" width="70%">
                              <template v-slot:activator="{ on }">
                                <v-btn color="success" dark v-on="on">Add new task</v-btn>
                              </template>
                              <v-card>
                                <v-toolbar>
                                  <v-toolbar-title>New task</v-toolbar-title>
                                </v-toolbar>
                                <v-card-text>
                                  <v-row justify="space-around">
                                    <v-col cols="5">
                                      <v-text-field label="Name" v-model="task.name" :rules="requiredRule"></v-text-field>
                                      <v-textarea label="Description" v-model="task.description"></v-textarea>
                                    </v-col>
                                    <v-col cols="5">
                                      <v-text-field label="Tip" v-model="task.tip"></v-text-field>
                                      <v-text-field label="Post-test" v-model="task.postTest"></v-text-field>
                                      <v-row align="center" cols="2">
                                        <v-col>Timer:</v-col>
                                        <v-col>
                                          <v-switch v-model="task.timer"></v-switch>
                                        </v-col>
                                      </v-row>
                                    </v-col>
                                  </v-row>
                                </v-card-text>
                                <v-card-actions>
                                  <v-row justify="center">
                                    <v-col>
                                      <v-btn
                                        color="success"
                                        @click="dialog = false,addTask()"
                                      >Save</v-btn>
                                      <v-btn color="error" text @click="dialog = false">Cancel</v-btn>
                                    </v-col>
                                  </v-row>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>
                          </v-row>
                        </v-toolbar>
                      </template>
                      <template v-slot:item.timer="{ item }">
                        <v-simple-checkbox v-model="item.timer" disabled></v-simple-checkbox>
                      </template>
                      <template v-slot:item.postTest="{ item }">
                        <v-simple-checkbox v-model="item.postTest" disabled></v-simple-checkbox>
                      </template>
                      <template v-slot:item.tip="{ item }">
                        <v-simple-checkbox v-model="item.tip" disabled></v-simple-checkbox>
                      </template>
                      <template v-slot:item.description="{ item }">
                        <v-simple-checkbox v-model="item.description" disabled></v-simple-checkbox>
                      </template>
                      <template v-slot:item.actions="{ item }">
                        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn color="primary" @click="nextStep(3)">Next</v-btn>
                    <v-btn text @click="backStep(3)">Back</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>
            <v-stepper-content step="4">
              <v-container>
                <v-row>
                  <v-row>
                    <v-col>
                      <v-card-text>
                        <v-text-field
                          prepend-inner-icon="mdi-link-variant"
                          label="Form"
                          v-model="postTest"
                          :rules="googleLinkRules"
                        ></v-text-field>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn class="mr-4" color="success" @click="submit">submit</v-btn>
                    <v-btn text @click="backStep(4)">Back</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>
          </v-form>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-container>
</template>


<script>
export default {
  data: () => ({
    el: 1,
    editedItem: -1,
    test: {
      title: "",
      description: "",
      type: ""
    },
    preTest: {
      consent: "",
      form: ""
    },
    tasks: [],
    task: {
      name: "",
      description: null,
      tip: null,
      postTest: null,
      timer: false
    },
    postTest: "",
    object: {
      title: "",
      type: "",
      description: "",
      preTest: {
        consent: "",
        form: ""
      },
      tasks: [],
      postTest: ""
    },
    headers: [
      {
        text: "Name",
        align: "start",
        sortable: false,
        value: "name"
      },
      { text: "Description", value: "description" },
      { text: "Tip", value: "tip" },
      { text: "Post Test", value: "postTest" },
      { text: "Timer", value: "timer" },
      { text: "Actions", value: "actions", sortable: false }
    ],
    dialog: false,
    requiredRule: [
      v => !!v || 'Field Required'
    ],
    googleLinkRules: [
      v => v == "" || (v.indexOf("https://docs.google.com/forms/") == 0) || (v.indexOf("docs.google.com/forms/") == 0) || 'Google forms link required' //link precisa ter "https://docs.google.com/forms/" no indice 0 ou nao é um link valido
    ]
  }),
  methods: {
    addTask: function() {
      if (this.editedIndex > -1) {
        Object.assign(this.tasks[this.editedIndex], this.task);
      } else {
        this.tasks.push(this.task);
      }
      this.task = {
          name: "",
          description: null,
          tip: null,
          postTest: null,
          timer: false
        };
    },
    submit: function() {
      //Make object test
      this.object.title = this.test.title;
      this.object.type = this.test.type;
      this.object.description = this.test.description;

      this.object.preTest.consent = this.preTest.consent === "" ? null:this.preTest.consent;
      this.object.preTest.form = this.preTest.form === "" ? null: this.preTest.form;

      if(this.object.preTest.form === null && this.object.preTest.consent === null){
        this.object.preTest = null
      }

      this.tasks.forEach(task => {
        this.object.tasks.push(task);
      });

      this.object.postTest = this.postTest === "" ? null:this.postTest;

      //Send db
      this.$store.dispatch("createTest", {
        collection: "test",
        data: this.object
      });
    },
    nextStep(n) {
      this.el = n + 1;
    },
    backStep(n) {
      this.el = n - 1;
    },
    editItem(item) {
      this.editedIndex = this.tasks.indexOf(item);
      this.task = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.tasks.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.tasks.splice(index, 1);
    }
  }
};
</script>