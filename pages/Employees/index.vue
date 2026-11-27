<template>
  <div class="hr-inner-page">
    <header class="hr-inner-heading"><h1>Employees</h1><p>Manage employee records and workforce information.</p></header>
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
