<template>
  <div class="body">
    <main>
      <DTR />
    </main>
  </div>
</template>

<script>
import DTR from "@/components/Dtr/DTR";
export default {
  // middleware: "pageValidator",
  components: {
    DTR,
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
