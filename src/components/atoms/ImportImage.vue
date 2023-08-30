<template>
  <div class="input">
    <v-file-input
      class="ml-2"
      type="file"
      name="my-image"
      :id="`${this.heuristicId.id}${this.questionId}`"
      accept="image/gif, image/jpeg, image/png"
      placeholder="Input an image of your choice referent to the topic."
      @change="uploadFile()"
    ></v-file-input>
    <!-- Add the image field to display the inputted image -->
    <v-row justify="center">
      <v-img
        max-height="225"
        :src="this.url"
        v-if="imageUploaded"
        contain
      ></v-img>
    </v-row>
  </div>
</template>

<script>
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  props: {
    heuristicId: { required: true },
    questionId: { required: true },
    testId: { required: true },
  },
  data: () => ({
    url: {},
    object: {},
    imageUploaded: false,
  }),

  mounted() {
      this.url = this.currentUserTestAnswer.heuristicQuestions[this.heuristicId.id].heuristicQuestions[this.questionId].answerImageUrl
      console.log(this.url);
  },
  methods: {
    async uploadFile() {
      let fileInput = document.getElementById(
        `${this.heuristicId.id}${this.questionId}`,
      )

      let storage = getStorage()

      let file = fileInput.files[0]

      let storageRef = ref(
        storage,
        'tests/' +
          this.testId +
          '/' +
          'heuristic_' +
          this.heuristicId.id +
          '/' +
          this.questionId +
          '/' +
          file.name,
      )

      await uploadBytes(storageRef, file)

      this.url = await getDownloadURL(storageRef)
      console.log(this.testId)
      console.log("URL:  ", this.url);
      // Update the imageUrl for the corresponding heuristicId and questionId
      this.$store.commit('updateCurrentImageUrl', this.url)

      // Update the imageUrl for the corresponding heuristicId and questionId
      this.imageUploaded = true
      this.$emit('imageUploaded')
    },
  },
  computed: {
    test() {
      return this.$store.state.Tests.Test
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

.input {
  width: 100%;
}
.image-container {
  width: 100%;
  height: 100%;
}
</style>
