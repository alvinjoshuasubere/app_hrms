<template>
  <div class="body">
    <main>
      <Dashboard />
    </main>
  </div>
</template>

<script>
import Dashboard from "@/components/Employees/Dashboard";
export default {
  // middleware: "pageValidator",
  components: {
    Dashboard,
  },
  head() {
    return {
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Employees",
        },
      ],
    };
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
.body, .body main {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
