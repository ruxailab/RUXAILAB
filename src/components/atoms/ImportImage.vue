<template>
  <div class="drag-area">
    <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
    <input
      class="description-input"
      type="file"
      name="my-image"
      id="image"
      accept="image/gif, image/jpeg, image/png"
      @change="uploadFile(file)"
    />
    <button @click="uploadImage()">UPLOAD</button>
  </div>
</template>

<script>
import { file } from 'babel-types'
import { getStorage, ref, uploadBytes } from 'firebase/storage'

export default {
  data: () => ({}),
  methods: {
    async uploadFile(file) {
      // console.log(storage)
      // const file = event.target.files[0]
      // const storageRef = storage.ref()
      // console.log(storage)
      // const fileRef = storageRef.child(file.name)
      // await fileRef.put(file)
      // console.log('File uploaded')
      // const downloadURL = await fileRef.getDownloadURL()
      // console.log('File URL:', downloadURL)
      const storage = getStorage()
      const storageRef = ref(storage, '/tests/' + file.name)

      // 'file' comes from the Blob or File API
      uploadBytes(storageRef, file).then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot)
      })
    },
    // uploadImage(img) {
    //   // Create a reference to 'image.jpg'
    //   const imageRef = ref(storage, img)

    //   // Create a reference to 'images/mountains.jpg'
    //   const imagesRef = ref(storage, 'tests/' + img)

    //   // While the file names are the same, the references point to different files
    //   imageRef.name === imagesRef.name // true
    //   imageRef.fullPath === imagesRef.fullPath // false
    //   uploadBytes(storageRef, file).then((snapshot) => {
    //     console.log('Uploaded a blob or file!')
    //   })
    // },
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
</style>
