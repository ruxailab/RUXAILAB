<template>
  <IntroComp
    :colors="['#eff31a', '#eecf22']"
    :title="'Cooperators'"
    :image="'IntroCoops.svg'"
    :main="'Add cooperators who can help you improve your project and gather data for your studies.'"
    :link="'Get started!'"
    @linkClicked="closeIntro()"
    :items="items"
    @callFunc="callFunc"
  >
  </IntroComp>
  <!-- <v-container style="display:contents; background-color:#f4b700; height:300px">
    <div class="background-gradient">
      <v-row class="ml-0" align="center" justify="center" style="height: 100%">
        <div class="text-div">
          <div
            class="display-3mb-4 white--text mobile-center"
            style="font-size: 60px; font-weight: 500"
          >Cooperators</div>
          <v-img class="hidden-md-and-up" style="margin: 0px 30px" contain src="@/assets/manager/IntroCoops.svg"></v-img>
          <div
            style="font-size: 22px"
            class="white--text mb-4 mobile-center"
          >Add cooperators who can help you improve your project and gather data for your studies.</div>
          <span
            class="white--text mobile-center mb-4"
            style="cursor: pointer"
            @click="closeIntro()"
          >
            <u>Get started!</u>
          </span>
        </div>

        <v-img
          class="hidden-sm-and-down"
          contain
          max-width="40%"
          max-height="400"
          src="@/assets/manager/IntroCoops.svg"
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
  </v-container> -->
</template>

<script>
import IntroComp from "@/components/atoms/IntrosComponent";

export default {
  data: () => ({}),
  components: {
    IntroComp
  },
  methods: {
    goToDoc() {
      this.$router.push("/cooperators/documentation");
    },
    closeIntro() {
      this.$emit("closeIntro");
    },
    callFunc(func) {
      this[func]();
    },
  },
  computed: {
    items() {
      return [
        {
          iconColor: "#daf01a",
          icon: "mdi-file-document",
          title: "Read documentation",
          subtitle:
            "Click to access the documentation on how to use the cooperators page.",
          func: 'goToDoc',
        },
      ];
    },
  },
};
</script>