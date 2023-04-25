<template>
  <div class="input">
    <v-file-input
      class="ml-2 "
      type="file"
      name="my-image"
      id="image"
      accept="image/gif, image/jpeg, image/png"
      placeholder="Input an image of your choice referent to the asking question."
      @change="uploadFile()"
    ></v-file-input>
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
  data: () => ({}),

  methods: {
    async uploadFile() {
      console.log(this.heuristicId)
      const fileInput = document.getElementById('image')
      const storage = getStorage()

      var file = fileInput.files[0]
      console.log(file)

      const storageRef = ref(
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
      ) //file.name precisa ser substituído por test.id e é necessário acrescentar o número da heurística
      uploadBytes(storageRef, file).then((snapshot) => {
        console.log('Uploaded file!', snapshot)
      })
    },
    async downloadImage() {
      // Create a reference to the file we want to download
      const storage = getStorage()
      const starsRef = ref(storage, 'tests/' + this.text)
      // Get the download URL
      getDownloadURL(starsRef)
        .then((url) => {
          // Insert url into an <img> tag to "download"
          console.log(url)
          const image = document.getElementById('imagem')
          image.src = url
          // document.image.appendChild(image)
        })
        .catch((error) => {
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              break
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break
            case 'storage/canceled':
              // User canceled the upload
              break
            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break
          }
        })
    },
  },
  computed: {
    test() {
      return this.$store.state.Tests.Test
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
  width: 90%;
}
</style>
