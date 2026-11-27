<template>
  <div class="hr-ref-layout">
    <div class="hr-ref-app-shell">
      <aside class="hr-ref-sidebar">
        <nuxt-link to="/dashboard" class="hr-ref-brand"><img src="/city_logo.png" alt="City of Koronadal logo"/><span><strong>HRMS</strong><small>City of Koronadal</small></span></nuxt-link>
        <div class="hr-ref-nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <nuxt-link to="/dashboard" class="hr-ref-nav-link"><font-awesome-icon icon="chart-line"/><span>Dashboard</span></nuxt-link>
          <nuxt-link to="/employees" class="hr-ref-nav-link"><font-awesome-icon icon="users"/><span>Employees</span></nuxt-link>
          <nuxt-link to="/payroll" class="hr-ref-nav-link"><font-awesome-icon icon="briefcase"/><span>Payroll</span></nuxt-link>
        </nav>
        <div class="hr-ref-sidebar-spacer"></div>
        <div class="hr-ref-nav-caption">ACCOUNT</div>
        <button type="button" class="hr-ref-nav-link hr-ref-logout" @click="logout"><font-awesome-icon icon="power-off"/><span>Log out</span></button>
        <div class="hr-ref-sidebar-footer"><span class="hr-ref-profile-icon">HR</span><span><strong>HR Workspace</strong><small>Human Resources</small></span></div>
      </aside>
      <main class="hr-ref-main"><nuxt/></main>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push("/");
    }
  }
};
</script>
