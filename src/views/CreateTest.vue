<template>
  <v-container jusrify="center">
    <v-container>
      <v-card>
        <v-row justify="center">
          <v-col cols="10">
            <v-form>
              <v-card-title>Test</v-card-title>
              <v-card-text>
                <v-text-field label="Title" v-model="test.title"></v-text-field>
                <v-text-field label="Type" v-model="test.type"></v-text-field>
                <v-textarea label="Description" v-model="test.discription"></v-textarea>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-title>Pre-test</v-card-title>
              <v-card-text>
                <v-text-field label="Consent" v-model="preTest.consent"></v-text-field>
                <v-text-field label="Form" v-model="preTest.form"></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-row align="center">
                <v-card-title>Tasks</v-card-title>
                <v-btn @click="addTask(qtdtask)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn @click="removeTask">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
              </v-row>
              <v-row v-for="task in tasks" v-bind:key="task.id">
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
              </v-row>
              <v-card-title>Post-test</v-card-title>
              <v-card-text>
                <v-text-field label="Form" v-model="postTest"></v-text-field>
              </v-card-text>
              <v-btn class="mr-4" color="success" @click="submit">submit</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-container>
</template>


<script>
export default {
  data: () => ({
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
        this.qtdtask--;
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
    }
  }
};
</script>