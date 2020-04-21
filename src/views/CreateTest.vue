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
                <v-textarea label="Description" v-model="test.description"></v-textarea>
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
              <v-row v-for="n in qtdtask" v-bind:key="n">
                <v-card-text>
                  <v-text-field label="Name" v-model="task.name"></v-text-field>
                  <v-textarea label="Description" v-model="task.description"></v-textarea>
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
              <v-btn class="mr-4" color="success">submit</v-btn>
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
    test:{
        title:'',
        discription:''
    },
    preTest:{
        consent:'',
        form:''
    },
    task:{
        name:'',
        decription:'',
        tip:'',
        postTest:'',
        timer:false
    },
    postTest:''
  }),
  methods:{
      addTask:function(){
        this.qtdtask++
      },
      removeTask:function(){
          if(this.qtdtask>1)
            this.qtdtask--
      },
  }
};
</script>