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
    <header>Drag & Drop to Upload File</header>
    <span>OR</span>
    <input
      type="file"
      name="my-image"
      id="image"
      accept="image/gif, image/jpeg, image/png"
      placeholder="If necessary, insert an image here."
    />
    <input type="file" hidden />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap');
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}
body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #5256ad;
}
.drag-area {
  background-color: rgb(142, 224, 218);
  border: 2px dashed #fff;
  height: 500px;
  width: 700px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.drag-area.active {
  border: 2px solid #fff;
}
.drag-area .icon {
  font-size: 100px;
  color: #fff;
}
.drag-area header {
  font-size: 30px;
  font-weight: 500;
  color: #fff;
}
.drag-area span {
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin: 10px 0 15px 0;
}
.drag-area button {
  padding: 10px 25px;
  font-size: 20px;
  font-weight: 500;
  border: none;
  outline: none;
  background: #fff;
  color: #5256ad;
  border-radius: 5px;
  cursor: pointer;
}
.drag-area img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 5px;
}
</style>
<script>
export default {
  data: () => ({}),
  methods: {},
  computed: {
    test() {
      return this.$store.state.Tests.Test
    },
  },
}
</script>
