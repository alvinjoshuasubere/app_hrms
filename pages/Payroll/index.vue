<template>
  <div class="hr-inner-page">
    <header class="hr-inner-heading"><h1>Payroll</h1><p>View payroll records, filter by office and export reports.</p></header>
    <main class="hr-inner-content">
      <PayrollTable />
    </main>
  </div>
</template>

<script>
import PayrollTable from "@/components/Employees/PayrollTable";
export default {
  // middleware: "pageValidator",
  components: {
    PayrollTable,
  },
  head() {
    return {
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Payroll",
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
