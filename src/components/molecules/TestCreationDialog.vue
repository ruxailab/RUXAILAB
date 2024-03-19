<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card color="#f9f5f0">
      <v-row>
        <v-btn
          icon
          dark
          fab
          color="red"
          fixed
          right
          class="mt-6 mr-2"
          @click="handleClose"
        >
          <v-icon x-large>mdi-arrow-u-left-bottom</v-icon>
        </v-btn>
        <v-col cols="1"></v-col>
        <v-col cols="10" class="mt-16 ml-11">
          <span class="Titles ml-5">Test Creation</span>
          <br />
          <span class="cardSubtitle ml-5">Add a name to your test!</span>
        </v-col>
        <v-col cols="1"></v-col>
        <v-col cols="5" class="ml-10">
          <v-card
            color="white"
            style="border-radius: 20px !important;"
            height="480"
          >
            <v-col cols="11">
              <div class="mt-4">
                <span class="cardInternTitles ml-6">Test Name</span>
              </div>
              <v-text-field
                v-model="test.testTitle"
                class="ml-6 mt-3"
                label="Test Name"
                outlined
                color="orange"
                @change="$store.commit('SET_LOCAL_CHANGES', true)"
              ></v-text-field>
              <span class="cardInternTitles ml-6">Test Description</span>
              <v-textarea
                outlined
                v-model="test.testDescription"
                color="orange"
                class="ml-6 mt-3"
                label="Test Description"
                @change="$store.commit('SET_LOCAL_CHANGES', true)"
              ></v-textarea>
              <v-row>
                <v-checkbox
                  v-model="test.isPublic"
                  class="ml-10 mt-8"
                  color="orange"
                  label="Turn this test public to all users"
                >
                </v-checkbox>
                <v-btn
                  dark
                  fab
                  large
                  color="orange"
                  class="ml-auto mt-4 mr-2"
                  @click="handleValidate"
                >
                  <v-icon x-large>mdi-arrow-right</v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-card>
        </v-col>
        <v-col cols="5">
          <img
            height="500"
            draggable="false"
            src="../../../public/createSVG.svg"
            alt="Test Creation image"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      test: {
        testTitle: '',
        testDescription: '',
        isPublic: false,
      },
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleValidate() {
      if (this.test.testTitle.trim() === '') {
        this.$toast.warning('Please enter a title')
        return
      }
      this.$emit('validate')
    },
  },
}
</script>
