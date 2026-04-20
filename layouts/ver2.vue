<template>
  <div class="wrapperBody">
    <nav class="navbar">
      <ul class="navbar-nav">
        <li class="nav-item" v-for="(link, index) in activelinks" :key="index">
          <router-link class="nav-link" :id="'sb1-' + index" :to="link.path">
            <div class="item1">
              <font-awesome-icon :icon="link.icon" />
            </div>
            <div class="item2">{{ link.description }}</div>
          </router-link>
        </li>
      </ul>
    </nav>
    <!-- <footer class="footerStyle">
      Copyright &copy; 2021 Biotech FARMS Inc.
    </footer> -->
    <!-- HEADER NAVIGATION BAR-->

    <div class="right mr-3">
      <b-row class="ml-3">
        <span
          v-if="role == 'supervisor'"
          style="
              margin-top: 0.75rem;
              background-color: #00803e;
              border-radius: 16px;
            "
        >
          <b-row class="ml-1">
            <b-col style="color: white" cols="1">
              <b-badge variant="danger" style="color: white; font-size: 15px">{{
                requestCounter
              }}</b-badge>
            </b-col>
            <b-col>
              <span style="color: white; font-size: 15px">
                <b>&nbsp;pending requests left</b>
              </span>
            </b-col>
          </b-row>
        </span>
        <!-- notif bell -->
        <span style="margin-top: 2px; position: relative">
          <b-badge
            v-if="notifCounter > 0"
            variant="danger"
            style="position: relative; left: 65px; top: -10px; z-index: 10000"
            >{{ notifCounter }}</b-badge
          >
          <b-dropdown
            class="notiBell"
            size="lg"
            variant="link"
            toggle-class="text-decoration-none"
            no-caret
            right
            ref="ndropdown"
          >
            <template v-slot:button-content>
              <font-awesome-icon
                title="Notifications"
                style="margin-top: 3px; color: black; height: 25px; width: 25px"
                class="noti"
                icon="bell"
              />
            </template>

            <span class="ml-2">
              <b>Notifications</b>
            </span>

            <!-- <b-dropdown-divider></b-dropdown-divider> -->

            <ul class="noti-body mt-2">
              <li v-if="notifs.length == 0" class="noti-text-read">
                You have no notifications this day.
              </li>

              <li
                v-for="(notif, index) in notifs"
                :key="index"
                :class="notif.is_read ? 'noti-text-read' : 'noti-text'"
                @click="notifClicked(notif)"
              >
                {{ notif.msg }}
              </li>
            </ul>
            <div class="noti-footer" @click="markAllAsRead">
              Mark all as read
            </div>
          </b-dropdown>
        </span>
        <!-- end notif bell -->

        <!-- user guide -->
        <form action="/TSIS_UAT.pptx" method="get">
          <button class="userGuideBtn" variant="none">
            <font-awesome-icon
              title="User Guide"
              style="margin-top: 2px; color: black; height: 25px; width: 25px"
              icon="question-circle"
              class="icon1"
            />
            <span style="position: relative; bottom: 5px">User Guide</span>
          </button>
        </form>

        <span
          style="
            margin-top: 13px;
            position: relative;
            right: 8px;
            padding-left: 10px;
          "
        >
          <i
            class="fas fa-user-circle icon1"
            style="margin-top: 2px; color: black; height: 25px; width: 25px"
          ></i>
          <!-- <font-awesome-icon
            style="color: black; height: 26px; width: 26px"
            icon="user"
            class="icon1"
          /> -->
        </span>
        <span style="position: relative; right: 22px; padding-left: 2rem">
          <b-row>
            <b style="margin-top: 5px; font-size: 10px; font-size: 12px"
              >{{ user }}&nbsp;</b
            >
          </b-row>
          <b-row>
            <b-badge
              class="primary"
              style="margin-top: 1px; font-size: 9px; border-radius:100px; padding: 3px 6px;"
              >{{ role }}</b-badge
            >
          </b-row>
        </span>
        <span
          id="btnLO"
          align="right"
          style="margin-top: 5px; position: relative"
        >
          <b-button
            title="Sign-out"
            id="btnLogout"
            pill
            variant="none"
            class="customBtnLO"
            @click="show = true"
            v-b-modal.modal-logout
          >
            <!-- <i
              class="fas fa-sign-out-alt"
              style="color: grey; height: 22px; width: 22px"
            ></i> -->
            <i
              class="fas fa-power-off fa-sm"
              style="color: white; height: 20px; width: 20px"
            ></i>
            <!-- <font-awesome-icon
              style="color: red; height: 22px; width: 22px"
              icon="power-off"
            /> -->
          </b-button>
          <b-modal
            id="modal-logout"
            v-model="show"
            header-bg-variant="success"
            header-text-variant="light"
            title="Do you really wish to logout?"
          >
            <p>
              Any pending changes will not be saved... Press Logout to confirm
              or press esc or click x to cancel.
            </p>
            <template #modal-footer>
              <div class="w-100">
                <b-button
                  variant="success"
                  size="sm"
                  class="float-right"
                  @click="logout"
                >
                  Logout
                </b-button>
                <b-button
                  variant="secondary"
                  size="sm"
                  class="float-right mr-2"
                  @click="show = false"
                >
                  Cancel
                </b-button>
              </div>
            </template>
          </b-modal>
        </span>
      </b-row>
    </div>

    <div class="mainContainer">
      <nuxt />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

export default {
  async created() {
    // notifs
    await this.connectSocket();

    this.role = localStorage.role;

    if (localStorage.modules) {
      this.modules = JSON.parse(localStorage.modules);
    }

    //loop adminmenus
    for (let i = 0; i < this.adminsubmenus.length; i++) {
      //loop through modules localstorage
      for (let i2 = 0; i2 < this.modules.length; i2++) {
        for (let i3 = 0; i3 < this.modules[i2].actions.length; i3++) {
          if (
            this.adminsubmenus[i].action ===
              this.modules[i2].actions[i3].actionname &&
            this.modules[i2].modulestatus === "active" &&
            this.modules[i2].actions[i3].actionstatus === "active"
          ) {
            if (localStorage.role == "supervisor") {
              this.activeadminsubmenus.push(this.adminsubmenus[i]);
              if (this.adminsubmenus[i].description == "Roles & Access") {
                this.activeadminsubmenus.pop(this.adminsubmenus[i]);
              }
            } else {
              this.activeadminsubmenus.push(this.adminsubmenus[i]);
            }
          }
        }
      }
    }

    //loop menus
    for (let i = 0; i < this.links.length; i++) {
      //loop through modules localstorage
      for (let i2 = 0; i2 < this.modules.length; i2++) {
        for (let i3 = 0; i3 < this.modules[i2].actions.length; i3++) {
          if (
            this.links[i].action === this.modules[i2].actions[i3].actionname &&
            this.modules[i2].modulestatus === "active" &&
            this.modules[i2].actions[i3].actionstatus === "active"
          ) {
            // console.log(this.links[i], "LNKS");
            if (localStorage.role == "accounting") {
              this.activelinks.push(this.links[i]);
              if (this.links[i].description == "Trucks") {
                this.activelinks.pop(this.links[i]);
              } else if (this.links[i].description == "Drivers") {
                this.activelinks.pop(this.links[i]);
              } else if (this.links[i].description == "Transactions") {
                this.activelinks.pop(this.links[i]);
              }
            } else if (localStorage.role == "supervisor") {
              this.activelinks.push(this.links[i]);
              if (this.links[i].description == "Trucks") {
                this.activelinks.pop(this.links[i]);
              } else if (this.links[i].description == "Drivers") {
                this.activelinks.pop(this.links[i]);
              }
            } else {
              this.activelinks.push(this.links[i]);
            }
          }
        }
      }
    }
  },
  data() {
    return {
      show: false,
      myInterval: null,
      role: "Truck Scale Controller",
      user: localStorage.name,
      modules: [],
      activeadminsubmenus: [],
      activelinks: [],
      clickStatus: false,
      adminsubmenus: [
        {
          path: "/admin/modules",
          icon: "cubes",
          description: "Modules",
          action: "view modules"
        },
        {
          path: "/admin/actions",
          icon: "tasks",
          description: "Actions",
          action: "view actions"
        },
        {
          path: "/admin/accessrights",
          icon: "fingerprint",
          description: "Roles & Access",
          action: "view roles"
        },
        {
          path: "/admin/user",
          icon: "id-badge",
          description: "Users",
          action: "view users"
        },
        {
          path: "/truckscale",
          icon: "truck-loading",
          description: "Truckscale",
          action: "view truckscales"
        },
        {
          path: "/admin/activitylogs",
          icon: "mouse",
          description: "Activity Logs",
          action: "view modules"
        },
        {
          path: "/admin/printlogs",
          icon: "print",
          description: "Print Logs",
          action: "view print logs"
        }
      ],
      links: [
        {
          path: "/default",
          icon: "tachometer-alt",
          description: "Dashboard",
          action: "add transaction"
        },
        {
          path: "/transaction",
          icon: "file-signature",
          description: "Transactions",
          action: "view transactions"
        },

        {
          path: "/truck",
          icon: "truck",
          description: "Trucks",
          action: "view trucks"
        },
        {
          path: "/driver",
          icon: "user-circle",
          description: "Drivers",
          action: "view drivers"
        },
        {
          path: "/report",
          icon: "file-alt",
          description: "Reports",
          action: "view reports"
        },
        {
          path: "/request",
          icon: "user-edit",
          description: "Requests",
          action: "view requests"
        }
      ],

      notifCounter: 0,
      notifs: [],
      socket: null,
      requestCounter: 0
    };
  },

  methods: {
    adminwasclicked() {
      this.clickStatus = !this.clickStatus;
      // console.log(this.clickStatus);
    },
    async notifClicked(data) {
      try {
        if (!data.is_read) {
          const id = localStorage.id;

          this.socket.emit("notif read", {
            id: data.id,
            userId: id,
            session: localStorage.session
          });
        }
        this.$refs.ndropdown.hide(true);
        this.$router.push(`/request`);
      } catch (e) {
        console.log(e);
      }
    },
    async markAllAsRead() {
      try {
        const id = localStorage.id;

        this.socket.emit("notif all read", {
          id,
          session: localStorage.session
        });

        this.$refs.ndropdown.hide(true);
      } catch (e) {
        console.log(e);
      }
    },
    logout() {
      // stop the interval to emit to socket;
      clearInterval(this.myInterval);
      localStorage.clear();
      this.$router.push(`/`);
    },

    openNav() {
      document.getElementById("sidebar").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
    },

    async connectSocket() {
      try {
        this.socket = io.connect(process.env.socketUrl, { secure: true }); //connect to server

        const id = localStorage.id;
        // receive new notif;
        this.socket.on(`new req - ${id}`, data => {
          const e = data.e;

          let msg = "";
          let pre = "";

          // start words of the notif
          if (localStorage.id == e.created_by) {
            pre = "Your request";
          } else {
            pre = "Request";
          }

          // if pending
          if (e.request_status === "pending") {
            msg = `Request from ${e.first_name} ${
              e.last_name
            } received at ${this.formatDate(e.date)}.`;
          }

          // if validated
          if (e.request_status === "validated") {
            msg = `${pre} for ticket ${e.transaction_id} have been ${
              e.request_status
            } by ${e.first_name} ${e.last_name} at ${this.formatDate(e.date)}.`;
          }

          // if approve or disapprove
          if (
            e.request_status == "approved" ||
            e.request_status == "disapproved"
          ) {
            msg = `${pre} for ticket ${e.transaction_id} have been ${
              e.request_status
            } by ${e.first_name} ${e.last_name} at ${this.formatDate(e.date)}.`;
          }

          // if cancelled
          if (e.request_status === "cancelled") {
            msg = `${pre} for ticket ${e.transaction_id} have been ${
              e.request_status
            } by ${e.first_name} ${e.last_name} at ${this.formatDate(e.date)}.`;
          }

          this.notifs.unshift({ id: e.id, msg, is_read: e.is_read });
          this.notifCounter = this.notifCounter + 1; // just making sure maybe ++ not gonna work
        });

        // retrieve current notifs;
        this.socket.emit(`my notif`, { id });

        // get current notifs;
        this.socket.on(`my req - ${id}`, data => {
          console.log(data.unfinishedRequestsCount, "notif");
          this.requestCounter = data.unfinishedRequestsCount;

          let temp = [];
          this.notifs = []; // clear

          const notifs = data.notifs;
          let counter = 0;

          for (let i = 0; i < notifs.length; i++) {
            const e = notifs[i];
            let msg = "";
            let pre = "";

            // start words of the notif
            if (localStorage.id == e.created_by) {
              pre = "Your request";
            } else {
              pre = "Request";
            }

            // if pending
            if (e.request_status === "pending") {
              msg = `Request from ${e.first_name} ${
                e.last_name
              } received at ${this.formatDate(e.date)}.`;
            }

            // if validated
            if (e.request_status === "validated") {
              msg = `${pre} for ticket ${e.transaction_id} have been ${
                e.request_status
              } by ${e.first_name} ${e.last_name} at ${this.formatDate(
                e.date
              )}.`;
            }

            // if approve or disapprove
            if (
              e.request_status == "approved" ||
              e.request_status == "disapproved"
            ) {
              msg = `${pre} for ticket ${e.transaction_id} have been ${
                e.request_status
              } by ${e.first_name} ${e.last_name} at ${this.formatDate(
                e.date
              )}.`;
            }

            // if cancelled
            if (e.request_status === "cancelled") {
              msg = `${pre} for ticket ${e.transaction_id} have been ${
                e.request_status
              } by ${e.first_name} ${e.last_name} at ${this.formatDate(
                e.date
              )}.`;
            }

            // how many notifs;
            if (!e.is_read) {
              counter++;
            }
            // console.log('eeeeeee',e);

            temp.push({ id: e.id, msg, is_read: e.is_read });
          }

          this.notifs = temp;

          this.notifCounter = counter;
        });

        // done update after clicking all read
        this.socket.on(`done all read - ${id}`, data => {
          // retrieve current notifs;

          this.socket.emit(`my notif`, { id });
        });

        // this.socket.emit(`remain requests`, { id });
      } catch (e) {
        console.log(e);
      }
    },

    formatDate(created_at) {
      return moment(created_at).format("MMM DD, YYYY hh:mm A");
    }
  },

  computed: {
    checkAdmin() {
      for (let i = 0; i < this.modules.length; i++) {
        if (this.modules[i].modulename.toLowerCase() === "admin") {
          return true;
        }
      }
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
a[data-toggle="collapse"] {
  position: relative;
  /* font-size: large; */
}
.dropdown-toggle::after {
  display: fixed;
  position: absolute;
  top: 50%;
  right: 10px;
  /* transform: translateY(-50%); */
}
body {
  font-family: "Poppins", sans-serif;
  background: #fafafa;
}
p {
  font-family: "Poppins", sans-serif;
  font-size: 1.1em;
  font-weight: 300;
  line-height: 1.7em;
  color: #999;
}
.primary {
  background-color: #00a651;
}
.icon {
  margin-left: 13px;
  margin-right: 13px;
}
.icon1 {
  margin-left: 10px;
  margin-right: 5px;
}
.hr {
  background-color: white;
}
a,
a:hover,
a:focus {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 3px;
}

ul ul a {
  font-size: 0.9em !important;
  padding-left: 30px !important;
  background: black;
}

/* On mouse-over, add a deeper shadow */
.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}

/* Add some padding inside the card container */
.container {
  padding: 2px 16px;
}
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.notiButton {
  .btn:focus {
    box-shadow: none;
  }
}

.noti-body {
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 220px;
  overflow: auto;
  width: 20rem;
  border-top: 1px solid #ddd;
}

.noti-text {
  font-size: 13px;
  display: block;
  cursor: pointer;
  font: 11px normal "Helvetica Neue", Helvetica, Arial, sans-serif;
  width: 100%;
  padding: 5%;
  line-height: 15px;
  background-color: #e9eff2;
  border-bottom: 1px solid #ddd;
}

.noti-text-read {
  font-size: 13px;
  display: block;
  cursor: pointer;
  font: 11px normal "Helvetica Neue", Helvetica, Arial, sans-serif;
  width: 100%;
  padding: 5%;
  line-height: 15px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

.noti-footer {
  font-size: 13.5px;
  cursor: pointer;
  text-align: center;
  font: bold "Helvetica Neue", Helvetica, Arial, sans-serif;
  border-top: 1px solid #ddd;
  padding-top: 6px;
}
</style>
