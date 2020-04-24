<template>
  <v-stepper v-model="step">
    {{test}}
    <v-stepper-header>
      <v-stepper-step step="1">Test Start</v-stepper-step>
      <v-divider></v-divider>
      <template v-if="test.preTest !== null || test.preTest !== undefined">
        <template v-if="test.preTest.content !== null || test.preTest.content !== undefined ">
          <v-stepper-step :step="pretest+1">Pre-test</v-stepper-step>
          <v-divider></v-divider>
        </template>
        <template v-if="test.preTest.form !== null || test.preTest.content !== undefined ">
          <v-stepper-step :step="pretest+2">Pre-test</v-stepper-step>
          <v-divider></v-divider>
        </template>
      </template>
      <!--<template v-for="n in test.tasks.length">
        <v-stepper-step :key="`${n}-step`" :complete="step > n" :step="n" editable>Task {{ n }}</v-stepper-step>

        <v-divider v-if="n !== test.tasks.length" :key="n"></v-divider>
      </template>-->
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card class="mb-12" color="grey lighten-1" height="200px">
          <v-card-title>{{test.title}}</v-card-title>
          <v-card-text>{{test.discription}}</v-card-text>
        </v-card>
        <v-btn color="primary" @click="step++">Start</v-btn>
        <v-btn text>Cancel</v-btn>
      </v-stepper-content>

      <template v-if="test.preTest !== null" full-heigh full-width>
        <v-stepper-content v-if="test.preTest.consent !== null" :step="pretest+1">
          <v-row justify="center">
            <v-col cols="12">
              <iframe
                :src="test.preTest.consent"
                width="100%"
                height="900"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
              >Carregando…</iframe>
            </v-col>
          </v-row>
          <v-row>
            <v-btn color="primary" @click="step++">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-row>
        </v-stepper-content>

        <v-stepper-content v-if="test.preTest.form !== null" :step="pretest+2">
          <v-row justify="center">
            <v-col cols="12">
              <iframe
                :src="test.preTest.form"
                width="100%"
                height="900"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
                justify="center"
              >Carregando…</iframe>
            </v-col>
          </v-row>
          <v-row>
            <v-btn color="primary" @click="step++">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-row>
        </v-stepper-content>
      </template>
      <!--<v-stepper-content v-for="n in  test.tasks.length" :key="`${n}-content`" :step="n">
        <v-card class="mb-12" color="grey lighten-1" height="200px">
            <v-card-title></v-card-title>    
        </v-card>
        <v-btn color="primary" @click="nextStep(n)">Continue</v-btn>
        <v-btn text>Cancel</v-btn>
      </v-stepper-content>-->
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    step: 1,
    pretest: 1,
    steps: 2
  }),
  watch: {
    steps(val) {
      if (this.step > val) {
        this.step = val;
      }
    }
  },

  methods: {
    nextStep(n) {
      if (n === this.test.tasks.length) {
        this.step = 1;
      } else {
        this.step = n + 1;
      }
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    }
  },
  created() {
    this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>