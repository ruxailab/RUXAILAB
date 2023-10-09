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

  <v-col cols="12" v-else-if="type == 'content'">
      <v-card v-if="index == 0" style="background: #f5f7ff;">
        <v-card-title class="subtitleView">
          Pre Test
        </v-card-title>

        <v-divider />
        <FormPreTest
          :pre-test="object.preTest"
          :val-index="0"
          @valForm="emitValForm"
          @change="emitChange()"
        />
      </v-card>
    <ListTasks
      v-if="index == 1"
      :tasks="object.itemsTasks"
      @change="emitChange()"
    />

    <v-card v-if="index == 2" style="background: #f5f7ff">
      <v-card-title class="subtitleView">
        Post Test
      </v-card-title>

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
    // eslint-disable-next-line vue/require-default-prop
    index: {
      type: Number,
    },
    // eslint-disable-next-line vue/require-default-prop
    object: {
      type: Object,
    },
  },
  data: () => ({}),
  mounted() {
    if (this.type !== 'content' && this.type != 'tabs')
      console.error(this.type + ' type in EditUserTest.vue is not valid.')
  },

  methods: {
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
    emitChange() {
      this.$emit('change')
    },
    emitValForm(valid, index) {
      this.$emit('valForm', valid, index)
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
