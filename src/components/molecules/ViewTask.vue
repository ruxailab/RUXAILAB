<template>
  <v-container>
    <v-row v-if="!postTest" class="fill-height" align="center" justify="center">
      <v-col cols="12">
        <v-row justify="center">
          <h1>{{ item.name }}</h1>
        </v-row>
        <v-spacer></v-spacer>
        <v-row justify="end" v-if="item.tip !== null">
          <TipButton :task="item"></TipButton>
        </v-row>
        <v-spacer></v-spacer>
        <v-row justify="center">
          <p class="paragraph">{{ item.description }}</p>
        </v-row>
        <v-spacer></v-spacer>
        <v-row justify="center">
          <v-btn v-if="item.timer === true" color="success">
            <v-icon left>mdi-timer</v-icon>Start
          </v-btn>
        </v-row>
        <v-spacer></v-spacer>
        <v-row class="paragraph" justify="space-around">
          {{item}}
          <v-col v-if="item.answer === 'textArea'">
            <v-textarea
              :id="'id-'+item.name"
              outlined
              label="answer"
              v-model="res"
              @change="updated"
            ></v-textarea>
          </v-col>
          <v-col>
            <v-textarea
              :id="'id-'+item.name"
              outlined
              label="observation (optional)"
              v-model="obs"
              @change="updated"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-else class="fill-height" align="center" justify="center">
      <iframe
        :src="item.postTest"
        width="100%"
        height="900"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        >Carregando…</iframe
      >
    </v-row>
  </v-container>
</template>

<script>
import TipButton from "../atoms/TipButton";
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    postTest: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    TipButton,
  },
  data() {
    return {
      obs: null,
      res: null,
    };
  },
  created() {
    this.obs = `${this.item.obs ?? ''}`;
    this.res = `${this.item.res ?? ''}`;
  },
  methods: {
    updated() {
      this.item.obs = `${this.obs}`
      this.item.res = `${this.res}`
      this.$emit("updatedAnswer", this.item);
    },
  },
};
</script>
