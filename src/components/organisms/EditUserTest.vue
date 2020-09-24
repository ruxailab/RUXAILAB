<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">Pre Test</v-tab>
    <v-tab @click="tabClicked(1)">Tasks</v-tab>
    <v-tab @click="tabClicked(2)">Post Test</v-tab>
  </v-tabs>

  <div v-else-if="type == 'content'">
    <v-card v-if="index == 0" style="background: #f5f7ff">
      <v-card-title class="subtitleView">Pre Test</v-card-title>
      <v-divider></v-divider>
      <v-row justify="space-around" v-if="object.preTest">
        <v-col cols="10">
          <FormPreTest
            :preTest="object.preTest"
            @valForm="emitValForm"
            :valIndex="0"
            @change="emitChange()"
          />
        </v-col>
      </v-row>
    </v-card>

    <ListTasks v-if="index == 1" :tasks="object.tasks" @change="emitChange()" />

    <v-card v-if="index == 2" style="background: #f5f7ff">
      <v-card-title class="subtitleView">Post Test</v-card-title>
      <v-divider></v-divider>
      <v-row justify="space-around">
        <v-col cols="12">
          <FormPostTest
            :postTest="object.postTest"
            :valIndex="1"
            @input="object.postTest = $event"
            @valForm="emitValForm"
            @change="emitChange()"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import FormPreTest from "@/components/atoms/FormPreTest";
import FormPostTest from "@/components/atoms/FormPostTest";
import ListTasks from "@/components/molecules/ListTasks";

export default {
  components: {
    FormPreTest,
    FormPostTest,
    ListTasks,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
    },
    object: {
      type: Object,
    },
  },
  data: () => ({}),
  methods: {
    tabClicked(index) {
      this.$emit("tabClicked", index);
    },
    emitChange() {
      this.$emit("change");
    },
    emitValForm(valid, index) {
      this.$emit("valForm", valid, index);
    },
  },
  mounted() {
    if (this.type !== "content" && this.type != "tabs")
      console.error(this.type + " type in EditUserTest.vue is not valid.");
  },
};
</script>

<style scoped>
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
</style>