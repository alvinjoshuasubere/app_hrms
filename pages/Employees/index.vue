<template>
  <div class="body">
    <main>
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
          content: "DTR",
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
