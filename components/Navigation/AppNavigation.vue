<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">👥</span>
          <span class="brand-text">HRMS</span>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <div class="nav-items">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item-active': isActive(item.path) }"
          >
            <font-awesome-icon :icon="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>
      </div>
      
      <div class="nav-actions">
        <div class="user-menu" v-if="isLoggedIn">
          <div class="user-info" @click="toggleUserMenu">
            <div class="user-avatar">
              <font-awesome-icon icon="user-circle" />
            </div>
            <span class="user-name">{{ userName }}</span>
            <font-awesome-icon icon="chevron-down" class="dropdown-icon" />
          </div>
          
          <div class="user-dropdown" v-show="showUserMenu">
            <div class="dropdown-item">
              <font-awesome-icon icon="user" class="dropdown-icon" />
              <span>Profile</span>
            </div>
            <div class="dropdown-item">
              <font-awesome-icon icon="cog" class="dropdown-icon" />
              <span>Settings</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout-item" @click="logout">
              <font-awesome-icon icon="sign-out-alt" class="dropdown-icon" />
              <span>Logout</span>
            </div>
          </div>
        </div>
        
        <router-link v-else to="/" class="login-btn btn-modern">
          <font-awesome-icon icon="sign-in-alt" class="mr-2" />
          Login
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavigation',
  data() {
    return {
      showUserMenu: false,
      navItems: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: 'tachometer-alt'
        },
        {
          name: 'Employees',
          path: '/employees',
          icon: 'users'
        },
        {
          name: 'DTR',
          path: '/dtr',
          icon: 'clock'
        },
        {
          name: 'Reports',
          path: '/reports',
          icon: 'chart-bar'
        }
      ]
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('fullname');
    },
    userName() {
      return localStorage.getItem('fullname') || 'User';
    },
    currentPath() {
      return this.$route.path;
    }
  },
  methods: {
    isActive(path) {
      if (path === '/') {
        return this.currentPath === '/';
      }
      return this.currentPath.startsWith(path);
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    logout() {
      localStorage.clear();
      this.$router.push('/');
      this.showUserMenu = false;
    },
    closeUserMenu() {
      this.showUserMenu = false;
    }
  },
  mounted() {
    document.addEventListener('click', this.closeUserMenu);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeUserMenu);
  }
}
</script>

<style scoped>
.app-navigation {
  background-color: var(--white-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.5rem;
  font-family: font_B;
  transition: opacity 0.2s ease;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 1.8rem;
  margin-right: var(--spacing-sm);
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-items {
  display: flex;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-weight: 500;
  gap: var(--spacing-sm);
}

.nav-item:hover {
  color: var(--primary-color);
  background-color: var(--primary-light);
}

.nav-item-active {
  color: var(--primary-color);
  background-color: var(--primary-light);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
}

.nav-text {
  white-space: nowrap;
}

.nav-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: var(--bg-secondary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-icon {
  color: var(--text-light);
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 1001;
  margin-top: var(--spacing-xs);
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.dropdown-item.logout-item {
  color: var(--danger-color);
}

.dropdown-item.logout-item:hover {
  background-color: var(--danger-light);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
}

.login-btn {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  color: var(--white-color);
  background-color: var(--primary-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 var(--spacing-md);
  }
  
  .nav-menu {
    display: none;
  }
  
  .nav-text {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .nav-items {
    gap: var(--spacing-xs);
  }
  
  .nav-item {
    padding: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 var(--spacing-sm);
  }
  
  .brand-text {
    font-size: 1.2rem;
  }
  
  .brand-icon {
    font-size: 1.5rem;
  }
}
</style>
