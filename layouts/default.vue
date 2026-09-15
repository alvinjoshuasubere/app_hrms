<template>
  <div class="hrms-layout">
    <header class="portal-header">
      <div class="portal-brand-row">
        <div class="portal-brand">
          <div class="portal-logo-wrap">
            <img src="/city_logo.png" alt="City Logo" class="portal-logo" />
          </div>
          <div class="portal-brand-copy">
            <div class="portal-title">HR PORTAL</div>
            <div class="portal-subtitle">HUMAN RESOURCE MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <div class="portal-date">
          <font-awesome-icon icon="shield-alt" />
          <span>Secure HR Workspace</span>
        </div>
      </div>

      <div class="portal-nav-shell">
        <b-navbar toggleable="lg" type="dark" class="portal-navbar">
          <b-navbar-brand to="/dashboard" class="portal-nav-brand">
            <span class="brand-mark">HR</span>
            <span>HRMS</span>
          </b-navbar-brand>

          <b-navbar-toggle target="main-nav-collapse"></b-navbar-toggle>

          <b-collapse id="main-nav-collapse" is-nav>
            <b-navbar-nav class="portal-nav-links">
              <b-nav-item to="/dashboard" active-class="active">
                <font-awesome-icon icon="chart-pie" />
                Dashboard
              </b-nav-item>
              <b-nav-item to="/employees" active-class="active">
                <font-awesome-icon icon="users" />
                Employees
              </b-nav-item>
              <b-nav-item to="/payroll" active-class="active">
                <font-awesome-icon icon="money-check-alt" />
                Payroll
              </b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto portal-nav-actions">
              <b-nav-item class="portal-icon-action" title="Notifications">
                <font-awesome-icon icon="bell" />
              </b-nav-item>
              <b-button variant="outline-light" size="sm" @click="logout" class="portal-logout">
                <font-awesome-icon icon="power-off" class="mr-2" />
                Logout
              </b-button>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </div>
    </header>

    <main class="page-container">
      <nuxt />
    </main>

    <footer class="portal-footer">
      <span>HRMS Portal</span>
      <span class="footer-dot"></span>
      <span>Human Resource Management</span>
    </footer>
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
.hrms-layout {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 8%, rgba(96, 165, 250, 0.22), transparent 28%),
    radial-gradient(circle at 92% 16%, rgba(59, 130, 246, 0.24), transparent 26%),
    linear-gradient(135deg, #102f72 0%, #1749a5 48%, #3159ef 100%);
  color: #172033;
  padding-bottom: 24px;
}

.portal-header {
  position: relative;
  padding: 28px 30px 0;
}

.portal-brand-row {
  max-width: 1500px;
  min-height: 112px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.portal-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.portal-logo-wrap {
  width: 62px;
  height: 62px;
  padding: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 16px;
  background: rgba(255,255,255,.13);
  box-shadow: 0 12px 30px rgba(5, 20, 65, .18);
  backdrop-filter: blur(12px);
}

.portal-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.portal-title {
  font-size: clamp(2rem, 4vw, 3.15rem);
  line-height: .95;
  font-weight: 300;
  letter-spacing: .015em;
}

.portal-subtitle {
  margin-top: 9px;
  color: rgba(255,255,255,.78);
  font-size: .68rem;
  font-weight: 750;
  letter-spacing: .18em;
}

.portal-date {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 10px;
  background: rgba(255,255,255,.09);
  color: rgba(255,255,255,.88);
  font-size: .7rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.portal-nav-shell {
  max-width: 1500px;
  margin: 0 auto;
  position: relative;
  z-index: 20;
}

.portal-navbar {
  min-height: 58px;
  padding: 0 10px;
  border-radius: 12px;
  background: rgba(12, 18, 31, .97) !important;
  box-shadow: 0 14px 35px rgba(3, 12, 35, .25);
}

.portal-nav-brand {
  display: inline-flex !important;
  align-items: center;
  gap: 9px;
  padding: 8px 14px !important;
  color: #fff !important;
  font-size: .76rem;
  font-weight: 800;
  letter-spacing: .05em;
}

.brand-mark {
  width: 27px;
  height: 27px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  font-size: .57rem;
  font-weight: 900;
}

.portal-nav-links .nav-link,
.portal-nav-actions .nav-link {
  min-height: 58px;
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  padding: 0 15px !important;
  color: rgba(255,255,255,.62) !important;
  font-size: .68rem;
  font-weight: 650;
  transition: all .18s ease;
}

.portal-nav-links .nav-link:hover,
.portal-nav-actions .nav-link:hover {
  color: #fff !important;
}

.portal-nav-links .nav-link.active {
  color: #fff !important;
  background: rgba(37, 99, 235, .3) !important;
  box-shadow: inset 0 -2px 0 #60a5fa;
}

.portal-nav-links .nav-link svg,
.portal-icon-action .nav-link svg {
  color: #7fb0ff;
}

.portal-logout {
  margin: 0 8px 0 12px;
  border-color: rgba(255,255,255,.2) !important;
  border-radius: 8px !important;
  color: rgba(255,255,255,.86) !important;
  font-size: .67rem;
}

.page-container {
  width: calc(100% - 60px);
  max-width: 1500px;
  min-height: calc(100vh - 210px);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.68);
  border-radius: 0 0 18px 18px;
  background: #f5f8fd;
  box-shadow: 0 24px 60px rgba(4, 20, 60, .22);
}

.portal-footer {
  max-width: 1500px;
  margin: 15px auto 0;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,.55);
  font-size: .62rem;
  font-weight: 600;
}

.footer-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,.4);
}

@media (max-width: 900px) {
  .portal-header { padding: 18px 16px 0; }
  .portal-brand-row { min-height: 96px; }
  .portal-date { display: none; }
  .portal-title { font-size: 2rem; }
  .portal-subtitle { font-size: .56rem; letter-spacing: .1em; }
  .portal-logo-wrap { width: 50px; height: 50px; border-radius: 12px; }
  .page-container { width: calc(100% - 28px); }
  .portal-footer { padding: 0 14px; }
}

@media (max-width: 575px) {
  .portal-brand { gap: 10px; }
  .portal-logo-wrap { width: 43px; height: 43px; padding: 5px; }
  .portal-title { font-size: 1.55rem; }
  .portal-subtitle { margin-top: 5px; font-size: .48rem; }
  .portal-navbar { border-radius: 10px; }
  .portal-nav-links .nav-link { min-height: 44px; }
  .portal-nav-actions .nav-link { min-height: 44px; }
  .portal-logout { margin: 8px 12px; }
}

::v-deep .dashboard,
::v-deep .employee-page {
  min-height: calc(100vh - 210px) !important;
}
</style>
