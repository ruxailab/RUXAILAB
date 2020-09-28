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
      this.$router.push("/cooperators/documentation").catch(() => {});
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