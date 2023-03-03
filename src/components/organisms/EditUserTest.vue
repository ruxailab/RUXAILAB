<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">
      Pre Test
    </v-tab>
    <v-tab @click="tabClicked(1)">
      Tasks
    </v-tab>
    <v-tab @click="tabClicked(2)">
      Post Test
    </v-tab>
  </v-tabs>

  <div v-else-if="type == 'content'">
    <v-card v-if="index == 0" style="background: #f5f7ff">
      <v-card-title class="subtitleView">
        Pre Test
      </v-card-title>

      <v-card-text class="subtitleView">
        A consent form is a document used to obtain permission from an individual before they participate in a particular activity or before their personal data is collected, processed, or shared.
      </v-card-text>

      <v-card-actions class="subtitleView">
        <a :href="urlPreTest" target="_blank">Click here to complete the consent form!</a>
      </v-card-actions>
      

      <v-divider />
      <v-row v-if="object.preTest" justify="space-around">
        <v-col cols="10">
          <FormPreTest
            :pre-test="object.preTest"
            :val-index="0"
            @valForm="emitValForm"
            @change="emitChange()"
          />
        </v-col>
      </v-row>
    </v-card>

    <ListTasks v-if="index == 1" :tasks="object.tasks" @change="emitChange()" />

    <v-card v-if="index == 2" style="background: #f5f7ff">
      <v-card-title class="subtitleView">
        Post Test
      </v-card-title>

      <v-card-text class="subtitleView">
        The purpose of this form is to collect user feedback on the usability of the service after user testing. The responses can help identify areas for improvement for the service and guide future design decisions.
      </v-card-text>

      <v-card-actions class="subtitleView">
        <a :href="urlPosTest" target="_blank">Click here to complete the form!</a>
      </v-card-actions>


      <v-divider />
      <v-row justify="space-around">
        <v-col cols="12">
          <FormPostTest
            :post-test="object.postTest"
            :val-index="1"
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
import FormPreTest from "@/components/atoms/FormPreTest"
import FormPostTest from "@/components/atoms/FormPostTest"
import ListTasks from "@/components/molecules/ListTasks"

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
    // eslint-disable-next-line vue/require-default-prop
    index: {
      type: Number,
    },
    // eslint-disable-next-line vue/require-default-prop
    object: {
      type: Object,
    },

  },
  data: () => ({
    urlPreTest: 'https://forms.gle/EZJFb7Qbw1xNtck9A',
    urlPosTest: 'https://forms.gle/VEUGMHh2DfNPceBk6'
  }),
  mounted() {
    if (this.type !== "content" && this.type != "tabs")
      console.error(this.type + " type in EditUserTest.vue is not valid.")
  },
  // link(){
  //   return{
  //     link: 'https://docs.google.com/forms/d/e/1FAIpQLSfEyOVr9Mf8pk9waTY4xtkr_o_iWUoQUvWTTkhXiFT2iS5B4A/viewform'
  //   }
  // },
  
  

  methods: {
    tabClicked(index) {
      this.$emit("tabClicked", index)
    },
    emitChange() {
      this.$emit("change")
    },
    emitValForm(valid, index) {
      this.$emit("valForm", valid, index)
    },
  },
}
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