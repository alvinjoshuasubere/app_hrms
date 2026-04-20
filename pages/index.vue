<template>
  <div class="body">
    <main>
      <LoginForm />
    </main>
  </div>
</template>

<script>
import LoginForm from "@/components/Login/LoginForm";
export default {
  layout: "default",
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
