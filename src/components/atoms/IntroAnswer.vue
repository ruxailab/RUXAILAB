<template>
  <v-container style="display:contents; background-color:#f4b700; height:300px">
    <div class="back-gradient">
      <v-row class="ml-0" align="center" justify="center" style="height: 100%">
        <div class="text-div">
          <div class="display-3mb-4 white--text mobile-center" style="font-size: 60px; font-weight: 500">Answers</div>
          <div
            style="font-size: 22px"
            class="white--text mb-4 mobile-center"
          >Quickly get feedback on you project by analyzing data from other users' answers.</div>
          <span
            class="white--text mobile-center"
            style="cursor: pointer"
            @click="goToCoops()"
          >
            <u>Invite testers to answer your test!</u>
          </span>
        </div>

        <v-img
          class="hidden-sm-and-down"
          contain
          max-width="40%"
          max-height="400"
          src="@/assets/manager/AnswerStart.svg"
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
                  link
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
  data: () => ({
    items: [
      {
        iconColor: "#4bbdaf",
        icon: "mdi-cog",
        title: "askjdakjs",
        subtitle: "asjdkjas",
      },
      {
        iconColor: "#009676",
        icon: "mdi-information",
        title: "askjdakjs",
        subtitle: "asjdkjas",
      },
      {
        iconColor: "#92c730",
        icon: "mdi-emoticon-happy-outline",
        title: "askjdakjs",
        subtitle: "asjdkjas",
      },
    ],
  }),
  methods: {
<<<<<<< HEAD
    goToCoops() {
      this.$emit('goToCoops')
=======
    go() {
      this.$emit('goToCoops');
    },
    func() {

>>>>>>> fixes
    }
  },
};
</script>

<style scoped>
.back-gradient {
  height: 400px;
  background-image: radial-gradient(circle at top right, #9ac94f, #7eb543);
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