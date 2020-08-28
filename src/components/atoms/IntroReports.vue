<template>
  <v-container style="display:contents; background-color:#f4b700; height:300px">
    <div class="back-gradient">
      <v-row class="ml-0" align="center" justify="center" style="height: 100%">
        <div class="text-div">
          <div
            class="display-3mb-4 white--text mobile-center"
            style="font-size: 60px; font-weight: 500"
          >Reports</div>
          <div
            style="font-size: 22px"
            class="white--text mb-4 mobile-center"
          >Keep track of your evaluators progress and answering status while they complete your test.</div>
          <span class="white--text mobile-center" style="cursor: pointer" @click="goToCoops()">
            <u>Invite new evaluators!</u>
          </span>
        </div>

        <v-img
          class="hidden-sm-and-down"
          contain
          max-width="40%"
          max-height="400"
          src="@/assets/manager/IntroReports.svg"
        ></v-img>
      </v-row>
    </div>

    <v-col>
      <v-row justify="center" class="ml-0">
        <v-col cols="8">
          <div class="learn-text">Learn More</div>
          <v-card elevation="4" class="ma-0 pa-0" style="border-radius: 10px!important">
            <v-list class="ma-0 pa-0">
              <div v-for="(item, i) in items" :key="i">
                <v-list-item
                  class="py-5"
                  @click="item.func"
                  :ripple="false"
                  style="border-radius: 10px!important"
                >
                  <v-list-item-avatar size="50" :color="item.iconColor">
                    <v-icon dark size="35" v-text="item.icon" />
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title style="font-size: 25px;" v-text="item.title" />
                    <v-list-item-subtitle v-text="item.subtitle" />
                  </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>
              </div>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
export default {
  data: () => ({}),
  methods: {
    goToDoc() {
      this.$router.push("/reports/documentation")
    },
    goToCoops() {
        this.$emit('goToCoops');
    }
  },
  computed: {
    items() {
      return [
        {
          iconColor: "#ff6224",
          icon: "mdi-file-document",
          title: "Read documentation",
          subtitle:
            "Click to access the documentation on how to use the reports page.",
          func: this.goToDoc
        },
      ];
    },
  },
};
</script>

<style scoped>
.back-gradient {
  height: 400px;
  background-image: radial-gradient(circle at top right, #ec6618, #f54e42);
}
.learn-text {
  color: rgb(87, 84, 100);
  font-weight: 700;
  font-size: 22px;
  margin-top: 30px;
  margin-bottom: 30px;
}
.text-div {
  max-width: 45%;
}
@media screen and (max-width: 960px) {
  .text-div {
    max-width: 100%;
    margin: 0px 10px;
    text-justify: center;
  }
  .image-back {
    height: 300px;
  }
  .mobile-center {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>