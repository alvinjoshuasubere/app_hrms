<template>
  <div class="hrms-layout">
    <!-- Main Global Navbar -->
    <b-navbar
      toggleable="lg"
      type="dark"
      variant="dark"
      fixed="top"
      class="employee-navbar"
    >
      <b-navbar-brand to="/dashboard" class="font-weight-bold">
        <img src="/city_logo.png" alt="Logo" class="navbar-logo mr-2" />
        HRMS
      </b-navbar-brand>

      <b-navbar-toggle target="main-nav-collapse"></b-navbar-toggle>

      <b-collapse id="main-nav-collapse" is-nav>
        <b-navbar-nav class="ml-3">
          <b-nav-item to="/employees" active-class="active">
            <font-awesome-icon icon="users" class="mr-1" /> Employees
          </b-nav-item>
          <b-nav-item to="/payroll" active-class="active">
            <font-awesome-icon icon="file-invoice-dollar" class="mr-1" />
            Payroll
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-button
            variant="outline-light"
            size="sm"
            @click="logout"
            class="ml-2"
          >
            <font-awesome-icon icon="power-off" class="editIcon mr-2" small />
            Logout
          </b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <div class="page-container">
      <nuxt />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.main-header {
  background-color: #1a1d21 !important;
  height: 60px;
  z-index: 1070;
}

.navbar-logo {
  height: 32px;
  width: auto;
}

.page-container {
  margin-top: 60px;
}

::v-deep .nav-link.active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-weight: 600;
}
</style>
