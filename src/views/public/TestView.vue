<template >
  <!--<v-stepper v-model="el" alt-labels>
    <v-row align="center">
      <template v-for="(step,n) in steps">
        <v-stepper-step
          :key="`${n+1}-step`"
          :complete="el > n+1"
          :step="n+1"
          editable
        >{{ step.key }}</v-stepper-step>
        <v-divider v-if="n+1 !== steps.length" :key="n+1"></v-divider>
      </template>
    </v-row>
    <v-stepper-items>
      <v-stepper-content v-for="(step,n) in steps" :key="`${n+1}-content`" :step="n+1">
        <v-container v-if="step.key === 'Test Description'">
          <v-row>
            <v-col justify="center" align="center">
              <h1>{{step.value.title}}</h1>
              <h3>{{step.value.description}}</h3>
            </v-col>
          </v-row>
        </v-container>
        <v-container v-if="step.key === 'Pre Test'">
          <iframe
            v-if="!preTest"
            :src="step.value.consent"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>

          <iframe
            v-else
            :src="step.value.form"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </v-container>
        <v-container v-if="step.key === 'Tasks'">
          <v-row class="fill-height" align="center" justify="center">
            <v-btn color="success" @click="openPage(test.type)">Start Tasks</v-btn>
          </v-row>
        </v-container>
        <v-container v-if="step.key === 'Heuristics'">
          <v-row class="fill-height" align="center" justify="center">
            <v-btn color="success" @click="openPage(test.type)">Start Heuristics</v-btn>
          </v-row>
        </v-container>
        <v-container v-if="step.key === 'Post Test'">
          <iframe
            :src="step.value"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >Carregando…</iframe>
        </v-container>
      </v-stepper-content>
      <StepNavigation
        :step="el"
        :size="steps.length"
        v-on:backStep="backStep()"
        v-on:nextStep="nextStep()"
        v-on:submit="nextStep()"
      />
    </v-stepper-items>
  </v-stepper>-->
  <v-container v-if="test" class="pa-0 ma-0">
    <v-row v-if="test && start " class="background background-img pa-0 ma-0" align="center">
      <v-col cols="6" class="ml-5">
        <h1 class="titleView pb-1">{{test.title}}</h1>
        <p align="justify" class="subtitleView">{{test.description}}</p>
        <v-row justify="center" class>
          <v-btn color="white" outlined rounded @click="start=!start">Start Test</v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-else class="nav pa-0 ma-0" dense>
      <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        color="#3F3D56"
      >
        <div class="header" v-if="!mini">
          <v-list-item>
            <v-row dense>
              <v-col class="pa-0 ma-0">
                <div class="idText">{{test.id}}</div>
                <!--<v-overflow-btn
                  class="pa-0 ma-0"
                  dark
                  dense
                  v-model="selectedTest"
                  @change="pushToTest()"
                  item-value="id"
                  item-text="title"
                  :items="myTests"
                  :label="test.title"
                  background-color="#343344"
                ></v-overflow-btn>-->
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list flat dense>
          <v-list-item v-for="(item,n) in items" :key="n" link @click="index = n">
            <v-template>
              <v-row justify="center">
                <v-list-item-icon>
                  <v-icon :color="index ==n? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title
                    :style="index ==n? 'color: white': 'color:#fca326'"
                  >{{ item.title }}</v-list-item-title>
                </v-list-item-content>
              </v-row>
            </v-template>
          </v-list-item>
        </v-list>

        <div class="footer" v-if="!mini">
          <v-btn icon @click="go(`/settingsview/${id}`)" class="ml-3">
            <v-icon color="white">mdi-cog</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = !mini" class="mr-2">
            <v-icon color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </div>

        <div class="footer" style="height:16%" v-else>
          <v-list class="mt-0 pa-0">
            <v-list-item class="pt-0">
              <v-list-item-icon @click="go(`/settingsview/${id}`)">
                <v-icon color="white">mdi-cog</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon @click.stop="mini = !mini">
                <v-icon color="white">mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </div>
      </v-navigation-drawer>
      <v-col class="backgroundTest pa-0 ma-0">
        <v-container v-if="index==0">
          <v-row justify="space-around">
            <v-col cols="12" class="titleView">Pre Test</v-col>
            <v-col cols="12" class="pa-0 pl-3 ma-0">
              <v-row justify="end" dense>
                <v-tabs
                  background-color="transparent"
                  color="#FCA326"
                  class="tab-border-bottom pb-0 mb-0"
                >
                  <v-tab @click="idx = 0">Consent</v-tab>
                  <v-tab @click="idx = 1">Form</v-tab>
                </v-tabs>
              </v-row>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row justify="center">
            <v-col cols="10">
              <v-card class="dataCard">
                <iframe
                  :src="items[index].value.consent"
                  width="100%"
                  height="900"
                  frameborder="0"
                  marginheight="0"
                  marginwidth="0"
                >Carregando…</iframe>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <p v-if="index!=null">{{items[index].value}}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
//mdi-checkbox-marked-circle-outline
//mdi-checkbox-blank-circle-outline
//mdi-menu-right
//mdi-menu-down

export default {
  props: ["id"],
  data: () => ({
    drawer: true,
    start: false, //change to true
    mini: false,
    index: null,
    items: [],
    idx: 0
  }),
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined)
        await this.mappingSteps();
      this.el = 1;
    }
  },
  methods: {
    mappingSteps() {
      //PreTest
      if (
        this.validate(this.test.preTest.consent) &&
        this.validate(this.test.preTest.form)
      )
        this.items.push({
          title: "Pre Test",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.preTest,
          id: 0
        });
      //Tasks
      if (this.validate(this.test.tasks))
        this.items.push({
          title: "Tasks",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.tasks,
          id: 1
        });

      //Heuristics
      if (this.validate(this.test.heuristics))
        this.items.push({
          title: "Heuristics",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.heuristics.map(i => {
            return {
              title: i.title,
              icon: "mdi-checkbox-blank-circle-outline"
            };
          }),
          id: 2
        });

      //PostTest
      if (this.validate(this.test.postTest))
        this.items.push({
          title: "Post Test",
          icon: "mdi-checkbox-blank-circle-outline",
          value: this.test.postTest,
          id: 3
        });
    },
    validate(object) {
      return object !== null && object !== undefined;
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    }
  },
  created() {
    if (!this.$store.test) this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>

<style scoped>
.background {
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.backgroundTest {
  background-color: #e8eaf2;
  height: 94%;
  overflow: scroll;
}

.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}
.background-img:before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(../../assets/BackgroundTestView.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right 0px top -20px;
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
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
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>