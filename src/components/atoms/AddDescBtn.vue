<template>
  <div>
    <v-btn rounded color="#f9a826" class="white--text" small @click="dialog = true">Add a new Description</v-btn>

    <v-dialog width="700" v-model="dialog" persistent>
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">Add a new Description</p>
        <v-divider></v-divider>
        <v-row justify="center" class="ma-0">
          <v-col cols="11">
            <v-form ref="form">
              <v-row justify="center">
                <v-col cols="12">
                  <v-text-field :rules="rule" v-model="desc.title" dense outlined label="Title"></v-text-field>

                  <div>Description:</div>
                  <TextBox @updateHtml="updateText" ref="textbox" />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="reset()"
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
import TextBox from '@/components/atoms/TextBox';

export default {
  props:["question"],

  components: {
    TextBox
  },  
  data: () => ({
    dialog: false,
    desc: {
      title: '',
      text: ''
    },
    rule: [
      v => !!v || "Title Required",
    ]
  }),
  methods: {
      validate() {
        let valid = this.$refs.form.validate();
        if(valid && this.desc.text.length > 0) {
          this.question.descriptions.push(this.desc);
          this.reset();
          console.log(this.question.descriptions)
        } else if(valid && this.desc.text.length == 0) {
          alert('Please add a descritpion');
        }
      },
      reset() {
          this.dialog = false,
          this.$refs.form.resetValidation(),
          this.$refs.textbox.resetContent(),
          this.desc = {
            title: '',
            text: ''
          }
      },
      updateText(html) {
        this.desc.text = html;
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