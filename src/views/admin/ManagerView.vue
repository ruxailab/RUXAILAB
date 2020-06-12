<template>
  <v-card>
    <v-row>
      <v-col cols="12">
        <v-toolbar>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          <v-breadcrumbs large :items="items" divider="-"></v-breadcrumbs>
        </v-toolbar>
        <v-row justify="center" v-if="items.length < 2">
          <h1>{{test.title}}</h1>
        </v-row>
        <router-view />
      </v-col>
    </v-row>
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list nav dense>
        <v-list-item-group v-model="group" active-class="deep-purple--text text--accent-4">
          <v-list-item @click="setReport()">
            <v-list-item-title>Reports</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="setAnswer()">Answers</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    items: [],
    drawer: false,
    group: null,
    test: null
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
    }
  },
  watch: {
    group() {
      this.drawer = false;
    }
  },

  created() {
    this.test = Object.assign({},this.$store.state.auth.user.myTests.find(
      test => (test.id == this.id)
    ));

    this.items.push({
      text: "Test",
      disabled: false,
      href: `/managerView/${this.id}`
    });
  }
};
</script>

<style>
</style>