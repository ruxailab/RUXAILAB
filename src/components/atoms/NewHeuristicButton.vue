<template>
  <div>
    <v-btn
      rounded
      color="green "
      class="white--text"
      small
      @click="$emit('dialog', true)"
    >Add new Heuristic</v-btn>

    <v-dialog width="500" v-model="dialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>Add new Heuristic</v-card-title>

        <v-form>
          <v-text-field label="Title" class="mx-3" v-model="heuris.title"></v-text-field>

          <v-row
            align="center"
            justify="space-around"
            class="mx-1"
            v-for="(n, i) in heuris.questions"
            :key="i"
          >
            <v-col cols="11">
              <v-text-field v-model="heuris.questions[i].text" :label="'Question ' + (i + 1)"></v-text-field>
            </v-col>

            <v-col cols="1">
              <v-btn small icon>
                <v-icon small @click="removeQuestion(i)">mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-btn color="primary" text class="ma-3" @click="addQuestion()">+ Add Question</v-btn>
        </v-form>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="$emit('dialog', false)" small color="red lighten-1 white--text">Cancel</v-btn>

          <v-btn
            @click="$emit('dialog', false), $emit('addHeuris')"
            small
            color="green lighten-1 white--text"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["heuris", "dialog"],
  data: () => ({
    id: 0,
  }),
  methods: {
    addQuestion() {
      if(this.heuris.questions.length > 0)
         this.id = this.heuris.questions[this.heuris.questions.length -1].id + 1 
      else
        this.id = 0;
      this.heuris.questions.push({ id: this.id, text: "" });
    },
    removeQuestion(i) {
      this.heuris.questions.splice(i, 1);
    }
  }
};
</script>