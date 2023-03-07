<template>
  <div class="drag-area">
    <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
    <input
      class="custom-file-input"
      type="file"
      name="my-image"
      id="image"
      accept="image/gif, image/jpeg, image/png"
      @change="uploadFile()"
    />
    <!-- <input type="text" v-model="text" />
    <button @click="downloadImage()">download</button>
    <img id="imagem" /> -->
  </div>
</template>

<script>
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  data: () => ({}),
  methods: {
    async uploadFile() {
      const fileInput = document.getElementById('image')
      const storage = getStorage()

      var file = fileInput.files[0]
      console.log(file)

      const storageRef = ref(storage, 'tests/' + file.name) //file.name precisa ser substituído por test.id e é necessário acrescentar o número da heurística
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
.drag-area {
  background-color: rgb(134, 146, 145);
  padding: 10px;
  height: fit-content;
  width: fit-content;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.custom-file-input {
  color: transparent;
}
.custom-file-input::-webkit-file-upload-button {
  visibility: hidden;
}
.custom-file-input::before {
  content: 'Select some files';
  color: black;
  display: inline-block;
  background: -webkit-linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}
.custom-file-input:hover::before {
  border-color: black;
}
.custom-file-input:active {
  outline: 0;
}
.custom-file-input:active::before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}
</style>
