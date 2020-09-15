<template>
  <IntroComp
    :colors="['#ec6618', '#f54e42']"
    :title="'Reports'"
    :image="'IntroReports.svg'"
    :main="'Keep track of your evaluators progress and answering status while they complete your test.'"
    :link="'Invite new evaluators!'"
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
    goToDoc() {
      this.$router.push("/reports/documentation");
    },
    goToCoops() {
      this.$emit("goToCoops");
    },
    callFunc(func) {
      this[func](); //call item function
    },
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
          func: "goToDoc",
        },
      ];
    },
  },
};
</script>