<template>
  <div class="background">
   <!-- <v-tabs v-model="tab" centered grow>
      <v-tab @click="setTest()">Test</v-tab>
      <v-tab @click="setReport()">Reports</v-tab>
      <v-tab @click="setAnswer()">Answer</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-row justify="center" align="center">
          <h1>{{test.title}}</h1>
        </v-row>
      </v-tab-item>
      <v-tab-item>
        <router-view />
      </v-tab-item>
      <v-tab-item>
        <router-view />
      </v-tab-item>
    </v-tabs-items>-->
    <CardManager :imgName="'Preview.svg'" />
    
  </div>
</template>

<script>
import CardManager from '@/components/atoms/CardManager'

export default {
  props: ["id"],
  data: () => ({
    items: [],
    drawer: false,
    group: null,
    test: null,
    tab: null
  }),
  methods: {
    setReport() {
      if (this.items.length > 1) this.items.pop();
      this.items.push({
        text: "Report",
        disabled: true,
        href: `/reportview/${this.test.reports}`
      });
      this.$router.push("/reportview/" + this.test.reports);
    },
    setAnswer() {
      if (this.items.length > 1) this.items.pop();
      this.items.push({
        text: "Answer",
        disabled: true,
        href: `/answerview/${this.test.answers}`
      });
      this.$router.push("/answerview/" + this.test.answers);
    },
    setTest() {
      if (this.items.length > 1) this.items.pop();
      this.items.push({
        text: "Test",
        disabled: true,
        href: `/managerView/${this.id}`
      });
      this.$router.push(`/managerView/${this.id}`);
    }
  },
  watch: {
    group() {
      this.drawer = false;
    }
  },

  created() {
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.id == this.id)
    );

    this.items.push({
      text: "Test",
      disabled: false,
      href: `/managerView/${this.id}`
    });
  },
  components: {
    CardManager
  }
};
</script>

<style>
.background {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 0%;

  background: url(../../assets/BackgroundShape.png),#DFDFDF;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  
}
</style>