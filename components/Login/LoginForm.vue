<template>
  <div class="wrapper">
    <img class="logo" src="/city_logo.png" />
    <div class="headline">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h1 style="margin: 0">DTR Tracking</h1>
        <b-badge
          id="UpdateIcon"
          @mouseenter="isUpdateHovered = true"
          @mouseleave="isUpdateHovered = false"
          style="background-color: #3498db"
        >
          <em>version 3.1.1</em>
        </b-badge>
      </div>
      <b-tooltip
        target="UpdateIcon"
        triggers="hover"
        placement="right"
        v-show="isUpdateHovered"
      >
        <small style="font-family: font_M" class="text-left">
          <strong
            ><font-awesome-icon class="mr-1" icon="circle-info" small />New
            Update/s
          </strong>
          <b-list-group style="color: #3498db" flush>
            <b-list-group-item
              v-for="(update, index) in updates"
              :key="index"
              class="px-2 py-1"
            >
              <small>{{ update }}</small>
            </b-list-group-item>
          </b-list-group>
        </small>
      </b-tooltip>
      <div>
        <small style="font-size: 13px">
          <p style="margin: 0">
            Data displayed here is
            <b-badge variant="dark">REAL-TIME</b-badge> based on your biometric
            scan.
          </p>
        </small>
      </div>
    </div>
    <b-form>
      <div class="signup">
        <div class="form-group">
          <b-input
            v-on:keyup.enter="login()"
            v-model="user.swipe_id"
            type="text"
            placeholder="Swipe ID"
            required
          ></b-input>
        </div>
        <div class="form-group">
          <b-input
            v-on:keyup.enter="login()"
            v-model="user.firstname"
            type="text"
            placeholder="Firstname"
            required=""
          ></b-input>
        </div>
        <div class="form-group">
          <b-input
            v-model="user.middlename"
            type="text"
            placeholder="Middlename (optional)"
          ></b-input>
        </div>
        <div class="form-group">
          <b-input
            v-on:keyup.enter="login()"
            v-model="user.lastname"
            type="text"
            placeholder="Lastname"
            required=""
          ></b-input>
        </div>
        <b-button style="border-radius: 15px" @click="login()" class="btn"
          >View</b-button
        >
        <b-row class="footerLogin">
          <b-col cols="10">
            <p>&copy;2024 City Government of Koronadal</p>
          </b-col>
          <b-col align="right">
            <div>
              <font-awesome-icon
                icon="gear"
                small
                id="teamMembersIcon"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false"
              />
              <b-tooltip
                target="teamMembersIcon"
                triggers="hover"
                placement="right"
                v-show="isHovered"
              >
                <h6 class="text-center" style="font-family: font_M">
                  <strong>Developed By:</strong><br />
                  <!-- <small class="text-left" style="font-size: 9px"
                    >Credit for the initiative and expertise goes to those who
                    developed this system.</small
                  > -->
                </h6>
                <div class="team-members">
                  <div
                    v-for="(member, index) in teamMembers"
                    :key="member.id"
                    class="member-card"
                  >
                    <img
                      :src="member.image"
                      alt="Team Member"
                      class="member-image"
                    />
                    <div class="member-name">{{ member.name }}</div>
                  </div>
                </div>
              </b-tooltip>
            </div>
          </b-col>
        </b-row>
      </div>
    </b-form>
    <div class="alert-div">
      <b-alert
        id="alert-message"
        :show="alert.showAlert"
        dismissible
        :variant="alert.variant"
        @dismissed="alert.showAlert = 0"
        @dismiss-count-down="countDownChanged"
      >
        <font-awesome-icon
          :icon="
            alert.variant == 'success' ? 'check-circle' : 'triangle-exclamation'
          "
          small
        />

        {{ alert.message }}
      </b-alert>
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

<style>
.logo {
  height: 50px;
  width: auto;
  margin-bottom: 20px;
}
</style>
