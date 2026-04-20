<template>
  <div class="body overflow-hidden">
    <nuxt />
  </div>
</template>

<script>
export default {
  created(){
    if(localStorage.length !== 0){
      this.$router.push("");
    }
  }


};
</script>

<style>



</style>
