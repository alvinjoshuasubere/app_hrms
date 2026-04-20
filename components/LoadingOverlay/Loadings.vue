<template>
  <div class="bg">
    <div class="loader">
      <div class="ring"></div>
      <div class="logo"></div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped lang="scss">
.bg {
  z-index: 9999;
  position: fixed;
  left: 0;
  top: 0;
  background: #00000080;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s;
}

.loader {
  position: relative;
  width: 100px;
  height: 100px;
}

.ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  border: 8px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 0.5s linear infinite;
}

.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-image: url("/city_logo.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
