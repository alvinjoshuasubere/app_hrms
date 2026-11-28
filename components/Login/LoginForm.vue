<template>
  <div class="login-page">

    <!-- ── LEFT PANEL — white with illustration ── -->
    <div class="left-panel">
      <div class="illustration-wrap">
        <img class="vectorImage" src="/office.jpg" alt="">
        <div class="illustration-label">
          <span>Human Resource Management System</span>
          <span class="illustration-sub">City Government of Koronadal</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="left-footer">
        <p class="copyright-text">© {{ new Date().getFullYear() }} City Government of Koronadal. All rights reserved.</p>
        <div class="dev-team" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
          <font-awesome-icon icon="cog" class="dev-icon" />
          <div class="team-popup" v-show="isHovered">
            <div class="popup-title">
              <font-awesome-icon icon="users" /> Development Team
            </div>
            <div class="team-grid">
              <div v-for="member in teamMembers" :key="member.id" class="team-member">
                <img :src="member.image" :alt="member.name" class="member-avatar" />
                <span>{{ member.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">

      <div class="login-card">

        <!-- Logo + title -->
        <div class="card-header">
          <img src="/city_logo.png" alt="City Logo" class="card-logo" align="center" />
          <h1 class="card-title">Welcome back</h1>
          <p class="card-subtitle">Sign in to your HRMS account.</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="login" class="card-form">

          <label class="login-field-label" for="hr-login-user">Username</label>
          <div class="field-wrap">
            <font-awesome-icon icon="user" class="field-icon" />
            <b-input
              id="hr-login-user" autocomplete="username" v-model="user.username"
              type="text"
              placeholder="Username"
              required
              class="field-input"
            />
          </div>

          <label class="login-field-label" for="hr-login-password">Password</label>
          <div class="field-wrap">
            <font-awesome-icon icon="lock" class="field-icon" />
            <b-input
              id="hr-login-password" autocomplete="current-password" v-model="user.password"
              type="password"
              placeholder="Password"
              required
              class="field-input"
            />
          </div>

          <button type="submit" class="login-btn" :disabled="showLoading">
            <font-awesome-icon v-if="showLoading" icon="spinner" spin class="mr-2" />
            {{ showLoading ? 'Authenticating...' : 'Sign in' }}
          </button>

        </form>

        <!-- Updates link -->
        <div class="card-footer-link" @mouseenter="isUpdateHovered = true" @mouseleave="isUpdateHovered = false">
          <span class="updates-trigger">
            <font-awesome-icon icon="circle-info" /> What's new?
          </span>
          <div class="updates-popup" v-show="isUpdateHovered">
            <div class="popup-title">
              <font-awesome-icon icon="circle-info" /> Latest Updates
            </div>
            <div v-for="(update, i) in updates" :key="i" class="update-row">
              <font-awesome-icon icon="check" class="update-check" />
              <span>{{ update }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Alert -->
    <div class="alert-wrap" v-if="alert.showAlert">
      <div :class="['alert-box', `alert-${alert.variant}`]">
        <font-awesome-icon :icon="alert.variant === 'success' ? 'check-circle' : 'triangle-exclamation'" class="mr-2"/>
        {{ alert.message }}
        <button @click="alert.showAlert = 0" class="alert-x">
          <font-awesome-icon icon="times" />
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";
export default {
  name: "LoginForm",
  layout: "loginLayout",
  components: { Loading },
  data() {
    return {
      alert: { showAlert: 0, variant: "", message: "" },
      user: { username: null, password: null },
      showLoading: false,
      isHovered: false,
      isUpdateHovered: false,
      teamMembers: [
        { id: 1, name: "Alvin Subere",   image: "alvin.jpg"   },
        { id: 2, name: "Renz Vergara",   image: "renz.jpg"    },
        { id: 3, name: "Bernard Patosa", image: "bernard.jpg" },
      ],
      updates: [
        "Version 3.1.1 released",
        "Added location where you scanned fingerprint",
        "Display Leave Summary",
      ],
    };
  },
  created() { const dashboardHistory = localStorage.getItem("hrms-dashboard-daily-v1");
      localStorage.clear();
      if (dashboardHistory !== null) localStorage.setItem("hrms-dashboard-daily-v1", dashboardHistory); },
  methods: {
    async login() {
      try {
        this.showLoading = true;
        const res = await axios({
          method: "POST",
          url: `${this.$axios.defaults.baseURL}/employees/find`,
          data: {
            firstname:  this.user.firstname,
            middlename: this.user.middlename,
            lastname:   this.user.lastname,
            swipe_id:   this.user.swipe_id,
          },
        });
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          if (element.isseparated === false) {
            localStorage.swipe_id   = parseInt(element.swipe_id);
            localStorage.empno      = element.empno;
            localStorage.fullname   = element.fullname;
            localStorage.department = element.deptdesc;
            localStorage.position   = element.position_desc;
            localStorage.shift      = element.shift_description;
            this.$router.push(`/dtr`);
            return;
          } else {
            this.showAlert("danger", "Account is separated.");
          }
        }
      } catch (e) {
        this.showLoading = false;
        const msg = e?.response?.data?.error || "Login failed. Please try again.";
        this.showAlert("danger", msg);
      }
    },
    showAlert(variant, message) {
      this.alert = { showAlert: 10, variant, message };
    },
  },
};
</script>

<style>
.login-page{min-height:100vh;min-height:100dvh;height:auto!important;width:100%!important;overflow:visible!important;background:#f8fafc;font-family:Inter,Arial,sans-serif}
.login-page .left-panel{flex:1 1 50%;min-width:0;background:linear-gradient(145deg,#0f172a,#1e3a8a);padding:64px 48px 90px;min-height:100vh}
.login-page .illustration-wrap{width:100%;max-width:520px;gap:28px}
.login-page .vectorImage{width:100%;max-width:420px;max-height:300px;object-fit:cover;border-radius:16px;border:1px solid #93c5fd}
.login-page .illustration-label span:first-child{font-size:clamp(26px,3vw,42px);line-height:1.2;color:#fff;font-weight:700}
.login-page .illustration-sub,.login-page .copyright-text,.login-page .dev-icon{color:#dbeafe}
.login-page .left-footer{left:24px;right:24px;gap:12px;text-align:center}
.login-page .right-panel{flex:1 1 50%;width:auto;background:#f8fafc;border-radius:0;padding:48px 28px;min-width:0}
.login-page .login-card{max-width:440px;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 12px 40px rgba(15,23,42,.08);padding:36px}
.login-page .card-header{background:transparent;border:0;padding:0;margin-bottom:28px;text-align:left}
.login-page .card-logo{height:72px;margin:0 0 24px}
.login-page .card-title{color:#000;font-size:30px;line-height:1.2}
.login-page .card-subtitle{color:#475569}
.login-page .card-form{gap:10px}
.login-page .login-field-label{color:#000;font-size:13px;font-weight:600;margin:0}
.login-page .field-wrap{margin-bottom:8px}
.login-page .field-input{background:#fff!important;color:#000!important;border-radius:8px!important}
.login-page .field-icon{color:#475569}
.login-page .login-btn{border-radius:8px;background:#1d4ed8;margin-top:8px}
.login-page .updates-popup{top:auto;bottom:calc(100% + 8px)}
@media(max-width:900px){.login-page .left-panel{min-height:auto;padding:32px 24px 64px}.login-page .vectorImage{display:none}.login-page .illustration-label span:first-child{font-size:25px}.login-page .right-panel{width:100%;padding:28px 16px;flex:1}.login-page .login-card{padding:28px 24px}.login-page .left-footer{bottom:12px}}
</style>