<template>
  <div class="hr-ref-layout hr-top-layout">
    <div class="hr-ref-app-shell">
      <header class="hr-topbar">
        <nuxt-link to="/dashboard" class="hr-ref-brand"><img src="/city_logo.png" alt="City of Koronadal logo"/><span><strong>HRMS</strong><small>City of Koronadal</small></span></nuxt-link>
        <nav class="hr-top-links" aria-label="Main navigation">
          <nuxt-link to="/dashboard" class="hr-ref-nav-link"><font-awesome-icon icon="chart-line"/><span>Dashboard</span></nuxt-link>
          <nuxt-link to="/employees" class="hr-ref-nav-link"><font-awesome-icon icon="users"/><span>Employees</span></nuxt-link>
          <nuxt-link to="/payroll" class="hr-ref-nav-link"><font-awesome-icon icon="briefcase"/><span>Payroll</span></nuxt-link>
        </nav>
        <button type="button" class="hr-ref-nav-link hr-top-logout" @click="logout"><font-awesome-icon icon="power-off"/><span>Log out</span></button>
      </header>
      <main class="hr-ref-main"><nuxt/></main>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    logout() {
      localStorage.clear();
      this.$router.replace("/");
    }
  }
};
</script>
<style scoped>
.hr-top-layout .hr-ref-app-shell{display:block!important;width:100%!important;max-width:none!important}
.hr-topbar{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:28px;padding:10px 24px;background:white;border-bottom:1px solid #ececf3;min-height:66px}
.hr-topbar .hr-ref-brand{padding:0!important;flex-shrink:0}
.hr-top-links{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.hr-topbar .hr-ref-nav-link{width:auto;white-space:nowrap;min-height:40px}
.hr-topbar .hr-ref-nav-link.nuxt-link-active{background:#f0eaff;color:#6925e8!important}
.hr-top-logout{margin-left:auto;flex-shrink:0}
.hr-top-layout .hr-ref-main{width:100%!important;min-height:calc(100vh - 66px)!important}
@media(max-width:740px){.hr-topbar{flex-wrap:wrap;gap:8px;padding:10px 16px}.hr-top-links{order:3;flex:0 0 100%;overflow-x:auto}.hr-topbar .hr-ref-nav-link{padding:0 10px}.hr-top-logout{margin-left:auto}}
</style>
