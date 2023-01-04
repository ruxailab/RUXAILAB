<template>
  <IntroComp
    :colors="['#32bde7', '#2488e0']"
    :title="'Analytics'"
    :image="'IntroAnalytics.svg'"
    :main="
      'Take a deep look into your test and see what people are saying about it.'
    "
    :link="'Invite evaluators to answer your test!'"
    @linkClicked="goToCoops()"
    :items="items"
    @callFunc="callFunc"
  ></IntroComp>
</template>

<script>
import IntroComp from "@/components/atoms/IntrosComponent";

export default {
  data: () => ({}),
  components: {
    IntroComp,
  },
  methods: {
    goToCoops() {
      this.$emit("goToCoops");
    },
    goToDoc() {
      this.$router.push("/analytics/documentation").catch(() => {});
    },
    goToDisc() {
      window.open("https://discord.gg/XHhnXBjgRh");
    },
    callFunc(func) {
      this[func]();
    },
  },
  computed: {
    items() {
      return [
        {
          iconColor: "#59b9d4",
          icon: "mdi-file-document",
          title: "Read documentation",
          subtitle:
            "Click to access the documentation on how to use the analytics page.",
          func: "goToDoc",
        },

        {
          iconColor: "#59b9d4",
          icon: "mdi-emoticon-happy",
          title: "Join the comunity!",
          subtitle: "You will find support on our discord server.",
          func: "goToDisc",
        },
      ];
    },
  },
};
</script>
