<template>
  <div class="login-page">

    <!-- ── LEFT PANEL — white with illustration ── -->
    <div class="left-panel">
      <div class="illustration-wrap">
        <img class="vectorImage" src="office.jpg" alt="">
        <div class="illustration-label">
          <span >Employee ID System</span>
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
          <h1 class="card-title">Hello!</h1>
          <p class="card-subtitle">Sign in to access the system</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="login" class="card-form">

          <div class="field-wrap">
            <font-awesome-icon icon="user" class="field-icon" />
            <b-input
              v-model="user.username"
              type="text"
              placeholder="Username"
              required
              class="field-input"
              @keyup.enter="login"
            />
          </div>

          <div class="field-wrap">
            <font-awesome-icon icon="lock" class="field-icon" />
            <b-input
              v-model="user.password"
              type="password"
              placeholder="Password"
              required
              class="field-input"
              @keyup.enter="login"
            />
          </div>

          <button type="submit" class="login-btn" :disabled="showLoading">
            <font-awesome-icon v-if="showLoading" icon="spinner" spin class="mr-2" />
            {{ showLoading ? 'Authenticating...' : 'Login' }}
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
        <font-awesome-icon :icon="alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'" class="mr-2"/>
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
  created() { localStorage.clear(); },
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
</style>