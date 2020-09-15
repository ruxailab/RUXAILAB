<template>
  <IntroComp
    :colors="['#9ac94f', '#7eb543']"
    :title="'Answers'"
    :image="'IntroAnswer.svg'"
    :main="'Quickly get feedback on you project by analyzing data from other users\' answers.'"
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
      this.$router.push("/answers/documentation");
    },
    callFunc(func) {
      this[func]();
    },
  },
  computed: {
    items() {
      return [
        {
          iconColor: "#4bbdaf",
          icon: "mdi-file-document",
          title: "Read documentation",
          subtitle:
            "Click to access the documentation on how to use the answers page.",
          func: "goToDoc",
        },
      ];
    },
  },
};
</script>