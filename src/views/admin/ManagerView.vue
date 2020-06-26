<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-row class="background" dense>
      <v-navigation-drawer
        class="nav"
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        color="#3F3D56"
      >
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
          </v-list-item-avatar>

          <v-list-item-title>John Leider</v-list-item-title>

          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-item v-for="item in items" :key="item.title" link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-col class="pa-0 ma-0">
        <div class="background-top"></div>
      </v-col>
    </v-row>
  </v-container>
  <!-- <div class="fill-height background">
    <v-container>
      <v-row class="fill-height" justify="center" align="center" dense>
        <v-col cols="4" v-for="(card,index) in cards" :key="index">
          <v-row justify="center">
            <CardManager :item="card" />
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>-->
</template>

<script>
// import CardManager from "@/components/atoms/CardManager";

export default {
  props: ["id"],
  data: () => ({
    drawer: true,
    items: [
      { title: "Home", icon: "mdi-home-city" },
      { title: "My Account", icon: "mdi-account" },
      { title: "Users", icon: "mdi-account-group-outline" }
    ],
    mini: true
  }),

  created() {
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.id == this.id)
    );

    this.cards = [
      {
        title: "Preview",
        url: "Preview.svg",
        path: `/testview/${this.test.id}`
      },
      {
        title: "Reports",
        url: "Reports.svg",
        path: `/reportview/${this.test.reports}`
      },
      {
        title: "Answers",
        url: "Answers.svg",
        path: `/answerview/${this.test.answers}`
      },
      {
        title: "Cooperators",
        url: "Coops.svg",
        path: `/coopsview/${this.test.id}`
      },
      { title: "Edit", url: "Edit.svg", path: `/edittest/${this.test.id}` }
    ];
  },
  components: {
    // CardManager
  }
};
</script>

<style>
.background-top {
  background-color: #fca326;
  height: 45%;
  width: 100%;
}
.background {
  background-color: #e8eaf2;
  height: 100vh;
}
.nav {
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: none;
}
</style>