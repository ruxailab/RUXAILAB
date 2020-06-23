<template>
  <div class="background"></div>
</template>

<script>
export default {};
</script>

<style>
.background {
  position: absolute;
  left: -323px;
  top: -725px;
  background: url(../../assets/BackgroundShape.png),
    url(../../assets/BackgroundShapeBottom.png);
  background-position: top left, bottom right;
  background-repeat: no-repeat;
  background-origin: border-box;
  background-size: cover;
}

</style>