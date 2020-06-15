<template>
  <v-container fluid class="background-blob">
    <AboutTop />
    <AboutBottom />   
  </v-container>
</template>

<style scoped>
.background-blob {
  background-image: url('https://i.ibb.co/C7F8Vmq/blob.png');
  /* 'https://i.ibb.co/zZh2fwN/blob.png' */
  /* url(https://assets-global.website-files.com/5af97a9c84ec1bc79d81b5f4/5af9951ea9b84ec337b92251_Oval2.svg); */
  background-size: contain;
  background-position: center;
}
</style>

<script>
import AboutTop from '@/components/atoms/AboutTop';
import AboutBottom from '@/components/atoms/AboutBottom';

export default {
    data: () => ({}),
    components: {
      AboutTop,
      AboutBottom
    }
}
</script>