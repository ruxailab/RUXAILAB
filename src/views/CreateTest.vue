<template>
  <v-container justify="center">
    <v-card>
      <v-stepper v-model="el">
        <v-stepper-header editable>
          <v-stepper-step step="1"></v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2"></v-stepper-step>
          <v-divider></v-divider>
          <v-row v-for="(task,index) in tasks" v-bind:key="task.id">
            <v-stepper-step :step="init+index"></v-stepper-step>
            <v-divider></v-divider>
          </v-row>
          <v-stepper-step :step="init+tasks.length"></v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-form>
            <v-stepper-content step="1">
              <v-container>
                <v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-card-title>Test</v-card-title>
                      <v-card-text>
                        <v-text-field label="Title" v-model="test.title"></v-text-field>
                        <v-text-field label="Type" v-model="test.type"></v-text-field>
                        <v-textarea label="Description" v-model="test.discription"></v-textarea>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn color="primary" @click="nextStep(1)">Continue</v-btn>
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
                      <v-card-title>Pre-test</v-card-title>
                      <v-card-text>
                        <v-text-field label="Consent" v-model="preTest.consent"></v-text-field>
                        <v-text-field label="Form" v-model="preTest.form"></v-text-field>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn color="primary" @click="nextStep(2)">Continue</v-btn>
                    <v-btn text @click="el=1">Cancel</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-content>
            <v-row v-for="(task,index) in tasks" v-bind:key="task.id">
              <v-stepper-content :step="init+index">
                <v-container>
                  <v-row>
                    <v-row>
                      <v-col>
                        <v-row align="center">
                          <v-card-title>Tasks</v-card-title>
                          <v-btn @click="addTask(qtdtask)">
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <v-btn @click="removeTask">
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                        </v-row>

                        <v-card-text>
                          <v-text-field label="Name" v-model="task.name"></v-text-field>
                          <v-textarea label="Description" v-model="task.discription"></v-textarea>
                          <v-text-field label="Tip" v-model="task.tip"></v-text-field>
                          <v-text-field label="Post-test" v-model="task.postTest"></v-text-field>
                          <v-row align="center" cols="2">
                            <v-col>Timer:</v-col>
                            <v-col>
                              <v-switch v-model="task.timer"></v-switch>
                            </v-col>
                          </v-row>
                          <v-divider></v-divider>
                        </v-card-text>
                      </v-col>
                    </v-row>
                    <v-col cols="12">
                      <v-btn color="primary" @click="nextStep(init+index)">Continue</v-btn>
                      <v-btn text @click="el=init-1">Cancel</v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
            </v-row>
            <v-stepper-content :step="init+tasks.length">
              <v-container>
                <v-row>
                  <v-row>
                    <v-col>
                      <v-card-title>Post-test</v-card-title>
                      <v-card-text>
                        <v-text-field label="Form" v-model="postTest"></v-text-field>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-col cols="12">
                    <v-btn class="mr-4" color="success" @click="submit">submit</v-btn>
                    <v-btn text @click="el=init+tasks.length-1">Cancel</v-btn>
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
    init: 3,
    qtdtask: 1,
    test: {
      title: "",
      discription: "",
      type: ""
    },
    preTest: {
      consent: "",
      form: ""
    },
    tasks: [
      {
        id: 1,
        name: "",
        discription: "",
        tip: "",
        postTest: "",
        timer: false
      }
    ],
    postTest: "",
    object: {
      title: "",
      type: "",
      discription: "",
      preTest: {
        consent: "",
        form: ""
      },
      tasks: [],
      postTest: ""
    }
  }),
  methods: {
    addTask: function() {
      this.qtdtask++;
      this.tasks.push({
        id: this.qtdtask,
        name: "",
        discription: "",
        tip: "",
        postTest: "",
        timer: false
      });
    },
    removeTask: function() {
      if (this.tasks.length > 1) {
        this.el--;
        this.tasks.pop();
      }
    },
    submit: function() {
      //Make object test
      this.object.title = this.test.title;
      this.object.type = this.test.type;
      this.object.discription = this.test.discription;

      this.object.preTest.consent = this.preTest.consent;
      this.object.preTest.form = this.preTest.form;

      this.tasks.forEach(task => {
        this.object.tasks.push(task);
      });

      this.object.postTest = this.postTest;

      //Send db
      this.$store.dispatch("createTest", {
        collection: "test",
        data: this.object
      });
    },
    nextStep(n) {
      this.el = n + 1;
    }
  }
};
</script>