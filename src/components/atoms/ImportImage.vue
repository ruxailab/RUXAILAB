<template>
<div><input type="file" name="my-image" id="image" accept="image/gif, image/jpeg, image/png" /></div>
</template>

<style>

</style>
<script>
export default {
  data: () => ({
  }),
  methods: {
   
  },
  computed: {
    test() {
      return this.$store.state.Tests.Test;
    },
  
  }
};
</script>

