<template>
  <div class="hr-inner-page">
    <main class="hr-inner-content">
      <EmployeeTable />
    </main>
  </div>
</template>

<script>
import EmployeeTable from "@/components/Employees/EmployeeTable";
export default {
  // middleware: "pageValidator",
  components: {
    EmployeeTable,
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

<style></style>
