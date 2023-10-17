<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)"> Pre Test </v-tab>
    <v-tab @click="tabClicked(1)"> Tasks </v-tab>
    <v-tab @click="tabClicked(2)"> Post Test </v-tab>
  </v-tabs>

  <v-col cols="12" v-else-if="type == 'content'">
    <v-card v-if="index == 0" style="background: #f5f7ff">
      <v-card-title class="subtitleView"> Pre Test </v-card-title>

      <v-divider />
      <FormPreTest :object="formData" @input="updateData" />
    </v-card>

    <ListTasks
      v-if="index == 1"
      :tasks="object.itemsTasks"
      @change="emitChange()"
      @input="updateData"
    />

    <v-card v-if="index == 2" style="background: #f5f7ff">
      <v-card-title class="subtitleView"> Post Test </v-card-title>

      <v-divider />
      <v-row justify="space-around">
        <v-col cols="12">
          <FormPostTest :object="formData" @input="updateData" />
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script>
import FormPreTest from '@/components/atoms/FormPreTest'
import FormPostTest from '@/components/atoms/FormPostTest'
import ListTasks from '@/components/molecules/ListTasks'

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
  data() {
    return {
      formData: {
        preTest: {
          preTestUrl: '',
          consentUrl: '',
        },
        postTest: {
          postTestUrl: '',
        },
      },
    }
  },
  computed: {
    testStructure() {
      return this.$store.state.Tests.Test.testStructure
    },
  },
  mounted() {
    this.$store.dispatch(
      'setPostTest',
      this.$store.state.Tests.Test.testStructure.postTest,
    )
    this.formData.preTest.preTestUrl = this.testStructure.preTest.preTestUrl
    this.formData.preTest.consentUrl = this.testStructure.preTest.consentUrl
    this.formData.postTest.postTestUrl = this.testStructure.postTest.postTestUrl
    if (this.type !== 'content' && this.type != 'tabs')
      console.error(this.type + ' type in EditUserTest.vue is not valid.')
  },

  methods: {
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
    updateData(data) {
      if (this.index == 0) {
        this.$store.dispatch('setPreTest', data)
      }
      if (this.index == 2) {
        this.$store.dispatch('setPostTest', data)
      }
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
