<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">
      User Variables
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
        User Variables
      </v-card-title>

      <v-divider />
      <v-row justify="space-around">
        <v-col cols="12">
          <UserVariables :object="formData" @input="updateData" />
        </v-col>
      </v-row>
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
import FormPostTest from '@/components/atoms/FormPostTest'
import ListTasks from '@/components/molecules/ListTasks'
import UserVariables from '@/components/atoms/UserVariables'

export default {
  components: {
    FormPostTest,
    ListTasks,
    UserVariables
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    object: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      formData: {
        preTest: [],
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
