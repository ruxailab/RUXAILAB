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

  <v-col v-else-if="type == 'content'" cols="12">
    <v-card v-if="index == 0" style="background: #f5f7ff">
      <v-card-title class="subtitleView">
        Pre Test
      </v-card-title>

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
      <v-card-title class="subtitleView">
        Post Test
      </v-card-title>

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
      //initialize formData properties
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
    preTest() {
      return this.$store.state.Tests.Test.testStructure.preTest
    },
    postTest() {
      return this.$store.state.Tests.Test.testStructure.postTest
    },
  },
  mounted() {
    this.getForms()
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
    getForms() {
      // Get forms from Test and set to local variables
      this.$store.dispatch('setPostTest', this.postTest)
      this.formData.preTest.preTestUrl = this.preTest.preTestUrl
      this.formData.preTest.consentUrl = this.preTest.consentUrl
      this.formData.postTest.postTestUrl = this.postTest.postTestUrl
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
