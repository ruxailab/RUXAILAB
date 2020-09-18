<template>
  <v-container style="display:contents; background-color:#f4b700">
    <div class="background-gradient">
      <v-row class="ml-0" align="center" justify="center" style="height: 100%">
        <div class="text-div">
          <div
            class="display-3mb-4 white--text mobile-center"
            style="font-size: 60px; font-weight: 500"
          >Edit Test</div>
          <v-img class="hidden-md-and-up" contain src="@/assets/manager/IntroEdit.svg"></v-img>
          <div
            style="font-size: 22px"
            class="white--text mb-4 mobile-center"
          >Create and customize your tasks and heuristics for your research needs.</div>
          <v-btn
            class="mobile-center mb-4"
            style="cursor: pointer  "
            @click="closeIntro()"
          >Get started!</v-btn>
        </div>

        <v-img
          class="hidden-sm-and-down"
          contain
          max-width="40%"
          max-height="400"
          src="@/assets/manager/IntroEdit.svg"
        ></v-img>
      </v-row>
    </div>

    <v-col>
      <v-row justify="center" class="ml-0">
        <v-col cols="12" md="8">
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
      this.$router.push("/edit/documentation");
    },
    closeIntro() {
      this.$emit("closeIntro");
    }
  },
  computed: {
    items() {
      return [
        {
          iconColor: "#D128C9",
          icon: "mdi-file-document",
          title: "Read documentation",
          subtitle:
            "Click to access the documentation on how to use the edit page.",
          func: this.goToDoc
        }
      ];
    }
  }
};
</script>

<style scoped>
.background-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #d128c9, #9a1aab);
  /* background-image: radial-gradient(circle at top right, #ffe53b, #f1c515);   */
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
.page-title {
  font-size: 60px;
  font-weight: 500;
}
/* sm */
@media screen and (max-width: 960px) {
  .text-div {
    max-width: 100%;
    margin: 0px 10px;
    text-justify: center;
  }
  .mobile-center {
    display: flex;
    text-align: center;
    justify-content: center;
    margin: 0px 20px;
  }
  .page-title {
    font-size: 40px;
  }
  .background-gradient {
    height: 100%;
  }
}
</style>