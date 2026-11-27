<template>
  <LoginForm />
</template>

<script>
import LoginForm from "@/components/Login/LoginForm";
export default {
  layout: "loginLayout",
  components: {
    LoginForm,
  },
  head() {
    return {
      // meta: [
      //   {
      //     hid: "description",
      //     name: "description",
      //     content: "DTR",
      //   },
      // ],
    };
  },
  data() {
    return {};
  },
};
</script>

<style></style>
