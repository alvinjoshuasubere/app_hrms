<template>
  <div class="login-page-modern">
    <div class="login-container-modern">
      <div class="login-header-modern">
        <img class="logo-modern" src="/city_logo.png" alt="City Logo" />
        <div class="login-title-section">
          <h1 class="login-main-title">Employee ID System</h1>
          <div class="version-badge-modern">
            <span class="version-text">v3.1.1</span>
            <div class="version-tooltip" v-show="isUpdateHovered">
              <div class="tooltip-header">
                <font-awesome-icon icon="circle-info" class="mr-2" />
                <strong>Latest Updates</strong>
              </div>
              <div class="updates-list">
                <div v-for="(update, index) in updates" :key="index" class="update-item">
                  <font-awesome-icon icon="check" class="update-icon" />
                  <span>{{ update }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="login-subtitle">
          Access your employee information with real-time biometric data
          <span class="realtime-badge">REAL-TIME</span>
        </p>
      </div>
      <div class="login-form-modern card-modern shadow-large">
        <form @submit.prevent="login" class="form-modern">
          <div class="form-grid-modern">
            <div class="form-group-modern">
              <label class="form-label-modern">Swipe ID</label>
              <div class="input-wrapper-modern">
                <font-awesome-icon icon="id-card" class="input-icon" />
                <b-input
                  v-model="user.swipe_id"
                  type="text"
                  placeholder="Enter your swipe ID"
                  required
                  class="form-input-modern form-control-modern"
                  @keyup.enter="login"
                />
              </div>
            </div>
            
            <div class="form-group-modern">
              <label class="form-label-modern">First Name</label>
              <div class="input-wrapper-modern">
                <font-awesome-icon icon="user" class="input-icon" />
                <b-input
                  v-model="user.firstname"
                  type="text"
                  placeholder="Enter your first name"
                  required
                  class="form-input-modern form-control-modern"
                  @keyup.enter="login"
                />
              </div>
            </div>
            
            <div class="form-group-modern">
              <label class="form-label-modern">Middle Name (Optional)</label>
              <div class="input-wrapper-modern">
                <font-awesome-icon icon="user" class="input-icon" />
                <b-input
                  v-model="user.middlename"
                  type="text"
                  placeholder="Enter your middle name"
                  class="form-input-modern form-control-modern"
                />
              </div>
            </div>
            
            <div class="form-group-modern">
              <label class="form-label-modern">Last Name</label>
              <div class="input-wrapper-modern">
                <font-awesome-icon icon="user" class="input-icon" />
                <b-input
                  v-model="user.lastname"
                  type="text"
                  placeholder="Enter your last name"
                  required
                  class="form-input-modern form-control-modern"
                  @keyup.enter="login"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" class="login-btn-modern btn-modern" :disabled="showLoading">
            <font-awesome-icon v-if="!showLoading" icon="sign-in-alt" class="mr-2" />
            <font-awesome-icon v-else icon="spinner" spin class="mr-2" />
            {{ showLoading ? 'Authenticating...' : 'Access System' }}
          </button>
        </form>
      </div>
      <div class="login-footer-modern">
        <div class="footer-content">
          <p class="copyright">© 2024 City Government of Koronadal</p>
          <div class="team-section">
            <div 
              class="team-trigger" 
              @mouseenter="isHovered = true" 
              @mouseleave="isHovered = false"
            >
              <font-awesome-icon icon="cog" class="settings-icon" />
            </div>
            <div class="team-tooltip" v-show="isHovered">
              <div class="tooltip-header">
                <font-awesome-icon icon="users" class="mr-2" />
                <strong>Development Team</strong>
              </div>
              <div class="team-grid">
                <div 
                  v-for="member in teamMembers" 
                  :key="member.id" 
                  class="team-member-card"
                >
                  <img :src="member.image" :alt="member.name" class="member-avatar" />
                  <span class="member-name">{{ member.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modern Alert -->
    <div class="alert-container-modern" v-if="alert.showAlert">
      <div :class="['alert-modern', `alert-${alert.variant}`, 'fade-in']">
        <div class="alert-content">
          <font-awesome-icon 
            :icon="alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'" 
            class="alert-icon" 
          />
          <span class="alert-message">{{ alert.message }}</span>
        </div>
        <button @click="alert.showAlert = 0" class="alert-close">
          <font-awesome-icon icon="times" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";
import moment from "moment";
export default {
  name: "LoginForm",
  layout: "loginLayout",
  components: {
    Loading,
  },
  data() {
    return {
      dismissSecs: 10,
      dismissCountDown: 0,
      alert: {
        showAlert: 0,
        variant: "",
        message: "",
      },
      user: {
        id_number: null,
        firstname: null,
        middlename: null,
        lastname: null,
      },
      errorMessage: "",
      test: "qweqwe",
      checked: true,
      showLoading: false,
      teamMembers: [
        { id: 1, name: "Alvin Subere", image: "alvin.jpg" },
        { id: 2, name: "Renz Vergara", image: "renz.jpg" },
        { id: 3, name: "Bernard Patosa", image: "bernard.jpg" },
        // Add more team members as needed
      ],
      updates: [
        "Version 3.1.1 released",
        "Added location where you have scanned your fingerprint",
        "Display Leave Summary",
      ],
      isHovered: false,
      isUpdateHovered: false,
    };
  },
  created() {
    localStorage.clear();
  },
  methods: {
    showTeamMembers(hovered) {
      this.isHovered = hovered;
    },
    async login() {
      try {
        this.showLoading = true;

        const res = await axios({
          method: "POST",
          url: `${this.$axios.defaults.baseURL}/employees/find`,
          data: {
            firstname: this.user.firstname,
            middlename: this.user.middlename,
            lastname: this.user.lastname,
            swipe_id: this.user.swipe_id,
          },
        });

        // Login
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          if (element.isseparated === false) {
            localStorage.swipe_id = parseInt(element.swipe_id);
            localStorage.empno = element.empno;
            localStorage.fullname = element.fullname;
            localStorage.department = element.deptdesc;
            localStorage.position = element.position_desc;
            localStorage.shift = element.shift_description;

            this.$router.push(`/dtr`);
            return;
          } else {
            this.showAlert("danger", this.errorMessage);
          }
        }
      } catch (e) {
        this.showLoading = false;
        this.errorMessage = e.response.data.error;
        this.showAlert("danger", this.errorMessage);
        return;
        // try {
        //   // JSON error
        //   const err = JSON.parse(e.response.data.error);
        //   this.errorMessage = err.msg;
        //   this.showAlert("danger",this.errorMessage);
        //   return;
        // } catch (er) {
        //   // not JSON
        //   this.errorMessage = e.response;
        //   this.showAlert("danger",this.errorMessage);
        //   return;
        // }
      }
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert(variant, message) {
      this.dismissCountDown = this.dismissSecs;
      this.alert = {
        showAlert: 10,
        variant,
        message,
      };
    },
  },
};
</script>

<style scoped>
/* Modern Login Page Layout */
.login-page-modern {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  position: relative;
}

.login-container-modern {
  width: 100%;
  max-width: 500px;
  position: relative;
}

/* Modern Header Styles */
.login-header-modern {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: var(--white-color);
}

.logo-modern {
  height: 80px;
  width: auto;
  margin-bottom: var(--spacing-lg);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.login-title-section {
  position: relative;
  display: inline-block;
  margin-bottom: var(--spacing-md);
}

.login-main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  font-family: font_B;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.version-badge-modern {
  position: absolute;
  top: -10px;
  right: -80px;
  cursor: pointer;
}

.version-text {
  background-color: var(--accent-color);
  color: var(--white-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.version-tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white-color);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 250px;
  z-index: 1000;
  margin-top: var(--spacing-sm);
}

.tooltip-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
}

.updates-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.update-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.update-icon {
  color: var(--success-color);
  font-size: 0.8rem;
}

.login-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.realtime-badge {
  background-color: var(--warning-color);
  color: var(--white-color);
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: var(--spacing-xs);
}

/* Modern Form Styles */
.login-form-modern {
  background-color: var(--white-color);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
}

.form-modern {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-grid-modern {
  display: grid;
  gap: var(--spacing-lg);
}

.form-group-modern {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label-modern {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-light);
  z-index: 1;
  font-size: 1rem;
}

.form-input-modern {
  padding-left: 2.5rem !important;
  border: 2px solid var(--border-color) !important;
  border-radius: var(--radius-lg) !important;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--bg-primary);
}

.form-input-modern:focus {
  border-color: var(--border-focus) !important;
  box-shadow: 0 0 0 3px var(--primary-light) !important;
  outline: none;
}

.form-input-modern::placeholder {
  color: var(--text-light);
}

.login-btn-modern {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
}

.login-btn-modern:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-btn-modern:active {
  transform: translateY(0);
}

.login-btn-modern:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modern Footer Styles */
.login-footer-modern {
  text-align: center;
  color: var(--white-color);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.8;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
}

.team-section {
  position: relative;
}

.team-trigger {
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.team-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.settings-icon {
  font-size: 1.2rem;
}

.team-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: var(--white-color);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 280px;
  z-index: 1000;
  margin-bottom: var(--spacing-sm);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.team-member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  transition: all 0.2s ease;
}

.team-member-card:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-2px);
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.member-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
}

/* Modern Alert Styles */
.alert-container-modern {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 9999;
  max-width: 400px;
}

.alert-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-sm);
}

.alert-success {
  background-color: var(--success-light);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.alert-danger {
  background-color: var(--danger-light);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.alert-warning {
  background-color: var(--warning-light);
  color: var(--warning-color);
  border: 1px solid var(--warning-color);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.alert-icon {
  font-size: 1.2rem;
}

.alert-message {
  font-weight: 500;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.alert-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-page-modern {
    padding: var(--spacing-md);
  }
  
  .login-main-title {
    font-size: 2rem;
  }
  
  .version-badge-modern {
    position: static;
    display: inline-block;
    margin-top: var(--spacing-sm);
  }
  
  .login-form-modern {
    padding: var(--spacing-xl);
  }
  
  .footer-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .alert-container-modern {
    top: var(--spacing-md);
    right: var(--spacing-md);
    left: var(--spacing-md);
    max-width: none;
  }
  
  .team-tooltip {
    right: -50px;
  }
}

@media (max-width: 480px) {
  .login-main-title {
    font-size: 1.8rem;
  }
  
  .login-form-modern {
    padding: var(--spacing-lg);
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>
