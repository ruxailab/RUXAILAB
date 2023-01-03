<template
  ><div>
    <IntroComp
      :colors="['#d128c9', '#9a1aab']"
      :title="'Edit Test'"
      :image="'IntroEdit.svg'"
      :main="
        'Create and customize your tasks and heuristics for your research needs.'
      "
      :link="'Get started!'"
      @linkClicked="closeIntro()"
      :items="items"
      @callFunc="callFunc"
    ></IntroComp>
  </div>
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
      this.$router.push("/edit/documentation").catch(() => {});
    },
    goToDisc() {
      window.open("https://discord.gg/XHhnXBjgRh");
    },
    closeIntro() {
      this.$emit("closeIntro");
    },
    callFunc(func) {
      this[func](); //call item function
    },
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
          func: "goToDoc",
        },

        {
          iconColor: "#D128C9",
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
