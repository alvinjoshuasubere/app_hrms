<template>
  <div id="requests-view" class="error-page">
    <!-- <h1 class="error_title">404</h1> -->
    <div class="errContainer">
      <img class="bfi" src="/city_logo.png">
      <img class="server" style="height: 100px;" src="/serverdown.svg" alt="server down image">
      <h4>Something went wrong!</h4>
      <h6>This may be caused by your slow internet or the page you're looking for doesn't exist anymore.</h6>
      <!-- <h6>or the page you're looking for</h6> -->
      <h1 @click="reload()" class="refresh mt-5"><i class="fas fa-sync-alt hover-spin"></i></h1>
      <div class="inst">Click the refresh icon to refresh the page or &nbsp;<p class="link" @click="logout()">back</p><p>.</p></div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: "Error - DTR",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "DTR"
        }
      ]
    };
  },
  layout:"default",
  data() {
    return {
      myInterval:null,
    }
  },
  computed: {
    reload() {
      window.location.reload()
    },
  },
  methods:{
    logout() {
      // stop the interval to emit to socket;
      clearInterval(this.myInterval);
      localStorage.clear();
      this.$router.push(`/`);
    },
  }
}
</script>

<style lang="scss" scoped>
.errContainer{
  display: flex;
  // justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10rem;
  h6{
    text-align: center;
  }
}

.error-page{
  height: 100vh;
  background: #eeeeee;
}
img{
  height: 100px;
  width: 180px;
}
.bfi{
  height: 180px;
  position: relative;
  top: .5rem;
}
.server{
  margin-bottom: 1rem;
}
h1, h4, h6, p, a, .inst{
  padding: 0;
  margin: 0;
  color:var(--transGray)
}
.link{
  text-decoration: underline;
  &:hover{
    cursor:pointer;
    text-decoration: underline;
  }
}
.inst, p{
  font-size:14px;
}
.inst{
  display:flex;
}
.refresh{
  color: var(--transGray);
  &:hover{
    cursor: pointer;
  }
}
.hover-spin{
  &:hover{
      animation: spin 1.4s linear infinite;
  }
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes spin2 {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin2 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@-webkit-keyframes vrotate {
  0% {
    opacity: 20%;
  }
  50% {
    opacity: 100%;
  }
  100% {
    opacity: 20%;
  }
}

@keyframes vrotate {
  0% {
    opacity: 20%;
  }
  50% {
    opacity: 100%;
  }
  100% {
    opacity: 20%;
  }
}
</style>
