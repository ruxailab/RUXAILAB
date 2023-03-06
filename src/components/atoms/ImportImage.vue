<template>
  <!-- <div>
        <input 
        type="file" 
        name="my-image" 
        id="image" 
        accept="image/gif, image/jpeg, image/png" 
        placeholder="If necessary, insert an image here." 
        />
    </div> -->
  <div class="drag-area">
    <div class="icon"><i class="fas fa-cloud-upload-alt"></i></div>
    <input
      class="description-input"
      type="file"
      name="my-image"
      id="image"
      accept="image/gif, image/jpeg, image/png"
      placeholder="If necessary, insert an image here."
    />
    <button @click="uploadImage()">UPLOAD</button>
  </div>
</template>

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
<script>
export default {
  data: () => ({}),
  methods: {
    uploadImage() {},
  },
  computed: {
    test() {
      return this.$store.state.Tests.Test
    },
  },
}
</script>
