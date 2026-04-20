<template>
  <div>
    <!-- <printDtr
      :groupedLogs="groupedLogs"
      :dateRange="dateRange"
      ref="printDtr"
      v-show="false"
    /> -->
    <Loading v-if="showLoading" />
    <b-modal
      id="leave-summary-modal"
      title="Leave Summary"
      no-close-on-backdrop
      header-bg-variant="dark"
      header-text-variant="light"
      size="xl"
      hide-footer
      @close="clearLeaveSummary"
    >
      <div class="summary-card p-2">
        <b-row>
          <b-col cols="6">
            <div class="summary-item">
              <div class="summary-left">
                <i class="fas fa-plane icon-left"></i>
                <div class="summary-label">Vacation Leaves</div>
              </div>
              <div class="summary-count">
                {{
                  allLeaves.leaveCredits
                    ? allLeaves.leaveCredits.vl_credits.toFixed(2)
                    : 0
                }}
                &nbsp;<small style="font-size: 11px">day/s</small>
              </div>
            </div>

            <div class="summary-item">
              <div class="summary-left">
                <i class="fas fa-syringe icon-left"></i>
                <div class="summary-label">Sick Leaves</div>
              </div>
              <div class="summary-count">
                {{
                  allLeaves.leaveCredits
                    ? allLeaves.leaveCredits.sl_credits.toFixed(2)
                    : 0
                }}&nbsp;<small style="font-size: 11px">day/s</small>
              </div>
            </div>

            <div class="summary-item present">
              <div class="summary-left">
                <i class="fas fa-star icon-left"></i>
                <div class="summary-label">Total Leaves</div>
              </div>
              <div class="summary-count">
                {{
                  allLeaves.leaveCredits
                    ? (
                        allLeaves.leaveCredits.sl_credits +
                        allLeaves.leaveCredits.vl_credits
                      ).toFixed(2)
                    : 0
                }}
                &nbsp;<small style="font-size: 11px">day/s</small>
              </div>
            </div>
          </b-col>
          <b-col>
            <div class="summary-item">
              <div class="summary-left">
                <i class="fas fa-triangle-exclamation icon-left"></i>
                <div class="summary-label">Remaining MC6</div>
              </div>
              <div class="summary-count">{{ allLeaves.remainingMc6 }}</div>
            </div>

            <div class="summary-item">
              <div class="summary-left">
                <i class="fas fa-person-circle-exclamation icon-left"></i>
                <div class="summary-label">Remaining Force Leave</div>
              </div>
              <div class="summary-count">
                {{ allLeaves.remainingForceLeave }}
              </div>
            </div>
          </b-col>
        </b-row>
        <hr />

        <b-row>
          <b-col>
            <table class="tableLeave table">
              <thead class="tableHead text-left">
                <tr>
                  <th>Date Filed</th>
                  <th>Leave Description</th>
                  <th>Date Start</th>
                  <th>Date End</th>
                  <th>No. of Days</th>
                </tr>
              </thead>
              <tbody class="text-left">
                <tr v-for="(leave, index) in paginatedLeaves" :key="index">
                  <td>{{ formatDateNew(leave.date_filed) }}</td>
                  <td>{{ leave.leavetype_desc }}</td>
                  <td>{{ formatDateNew(leave.start_date) }}</td>
                  <td>{{ formatDateNew(leave.end_date) }}</td>
                  <td>{{ leave.working_days_applied }}</td>
                </tr>
              </tbody>
            </table>
            <hr />
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="text-left mb-2">
                <b-form-select
                  v-model="perPage"
                  :options="[5, 10, 20, 50, 100]"
                  size="sm"
                  class="form-control-sm mr-2"
                  style="width: 70px"
                ></b-form-select>
              </div>
              <div class="entries-text">
                Showing {{ startEntry }} to {{ endEntry }} of
                {{ allLeavesData.length }} entries
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="allLeavesData.length"
                :per-page="perPage"
                align="right"
                size="sm"
                class="pagination-pill"
              ></b-pagination>
            </div>
          </b-col>
        </b-row>
      </div>
    </b-modal>

    <div class="container">
      <b-row class="mt-3 mb-2">
        <b-col cols="6" class="text-left">
          <b-button class="backBtn" @click="goBack()">
            <font-awesome-icon icon="circle-arrow-left" class="mr-2" />Back
          </b-button>
        </b-col>
        <b-col class="text-right">
          <b-button pill variant="outline-dark" size="sm" @click="viewLeave()">
            <font-awesome-icon icon="user-plus" class="mr-2" />View Leave
            Credits
          </b-button>
        </b-col>
      </b-row>
      <b-row class="justify-content-center align-items-center">
        <!-- <b-col class="text-center">
          <img class="logo mr-2" src="/city_logo.png" />
        </b-col> -->
        <b-col>
          <h2 style="font-family: font_B" class="mb-0">DAILY TIME RECORD</h2>
          <div>
            <span class="italicDesc"
              >This system information is only available for viewing.</span
            >
          </div>
        </b-col>
      </b-row>
      <b-card class="DateCard mt-2 employee-card">
        <b-row>
          <b-col class="text-center mb-3">
            <div class="employee-header">
              <div class="employee-avatar">
                <img class="logoIcon" src="/icon.png" />
                <div class="avatar-badge">
                  <font-awesome-icon icon="user-check" />
                </div>
              </div>
              <h4 class="employee-name mt-2">{{ user.name }}</h4>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <div class="employee-info-grid">
              <div class="info-item">
                <font-awesome-icon icon="id-badge" class="info-icon" />
                <span class="info-label">Emp No:</span>
                <strong class="info-value">{{ user.empno }}</strong>
              </div>
              <div class="info-item">
                <font-awesome-icon icon="credit-card" class="info-icon" />
                <span class="info-label">Swipe ID:</span>
                <strong class="info-value">{{ user.swipe_id }}</strong>
              </div>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="employee-role-section">
              <div class="department-badge">
                <font-awesome-icon icon="building" class="dept-icon" />
                <span class="dept-name">{{ user.department }}</span>
              </div>
              <div class="position-info">
                <font-awesome-icon icon="briefcase" class="position-icon" />
                <span class="position-title">{{ user.position }}</span>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-card>
      <b-row class="mt-2">
        <b-col>
          <!-- Logs Table -->
          <b-card class="DateCard">
            <b-row>
              <b-col cols="2" class="text-left">
                <b-button
                  v-b-tooltip.noninteractive.hover
                  title="Previous Month"
                  class="NPDate"
                  @click="previousMonth"
                  ><font-awesome-icon icon="circle-arrow-left" class="mr-2"
                /></b-button>
                <b-button
                  v-b-tooltip.noninteractive.hover
                  title="Next Month"
                  class="NPDate"
                  @click="nextMonth"
                  ><font-awesome-icon icon="circle-arrow-right" class="mr-2"
                /></b-button>
              </b-col>
              <b-col cols="4">
                <h5 class="headerText mt-2">
                  <strong>{{ selectedMonth }}</strong>
                </h5>
              </b-col>
              <b-col class="text-right">
                <!-- Month Filter -->
                <div class="mb-4">
                  <b-select
                    class="form-control w-auto filterDate"
                    v-model="selectedSemiMonthly"
                  >
                    <option value="1">Month</option>
                    <option value="2">1st Payroll</option>
                    <option value="3">2nd Payroll</option>
                  </b-select>
                  <b-select
                    v-model="selectedMonth"
                    id="monthSelect"
                    class="form-control w-auto filterDate"
                  >
                    <option
                      v-for="month in months"
                      :key="month.name"
                      :value="month.name"
                    >
                      {{ month.name }}
                    </option>
                  </b-select>
                  <b-form-select
                    class="w-auto filterDate"
                    v-model="selectedYear"
                    :options="years"
                  ></b-form-select>

                  <!-- <b-button
                    @click="printTable"
                    style="background-color: #3498db; border: none"
                    ><font-awesome-icon icon="print" class="icon" small
                  /></b-button> -->
                </div>
              </b-col>
            </b-row>
            <div class="lates-container">
              <span class="label">Total Lates:</span>
              <div
                class="lates-pill"
                :class="{
                  'lates-red': totalLates > 10,
                  'lates-yellow': totalLates <= 10,
                }"
              >
                {{ totalLates }}
              </div>
            </div>

            <div class="tableRow">
              <div class="tableColumn">
                <table class="tableUi table">
                  <thead class="tableHead">
                    <tr>
                      <th>DATE</th>
                      <th>DAY</th>
                      <th>SHIFT</th>
                      <th>TIME IN</th>
                      <th>BREAK OUT</th>
                      <th>BREAK IN</th>
                      <th>TIME OUT</th>
                      <th>LOCATION SCAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="log in groupedLogs"
                      :key="log.dtr_date"
                      :class="{
                        'dayoff-row': log.dayoff,
                        'holiday-row': log.holiday,
                        'pending-row': formatNoDate(log),
                      }"
                    >
                      <td>{{ formatDate(log.dtr_date) }}</td>
                      <td>{{ formatDay(log.dtr_date) }}</td>
                      <td>
                        {{
                          log.shift_description ? log.shift_description : "--"
                        }}
                      </td>
                      <td>
                        <span v-if="formatTime(log.in_1)">{{
                          formatTime(log.in_1)
                        }}</span>
                        <span v-else
                          ><font-awesome-icon
                            icon="calendar-xmark"
                            class="icon"
                        /></span>
                      </td>
                      <td>
                        <span v-if="formatTime(log.out_1)">{{
                          formatTime(log.out_1)
                        }}</span>
                        <span v-else
                          ><font-awesome-icon
                            icon="calendar-xmark"
                            class="icon"
                        /></span>
                      </td>
                      <td>
                        <span v-if="formatTime(log.in_2)">{{
                          formatTime(log.in_2)
                        }}</span>
                        <span v-else
                          ><font-awesome-icon
                            icon="calendar-xmark"
                            class="icon"
                        /></span>
                      </td>
                      <td>
                        <span v-if="formatTime(log.out_2)">{{
                          formatTime(log.out_2)
                        }}</span>
                        <span v-else
                          ><font-awesome-icon
                            icon="calendar-xmark"
                            class="icon"
                        /></span>
                      </td>
                      <td>
                        <font-awesome-icon
                          :id="'view-btn-' + log.dtr_date"
                          icon="eye"
                          style="font-size: 20px"
                          class="mr-2"
                        />

                        <b-tooltip
                          :target="'view-btn-' + log.dtr_date"
                          triggers="hover"
                          placement="right"
                          custom-class="tooltip-card"
                        >
                          <div class="text-left">
                            <strong>Time In:</strong>
                            {{ log.machine_in_1 || "❌" }} <br />
                            <strong>Break Out:</strong>
                            {{ log.machine_out_1 || "❌" }} <br />
                            <strong>Break In:</strong>
                            {{ log.machine_in_2 || "❌" }} <br />
                            <strong>Time Out:</strong>
                            {{ log.machine_out_2 || "❌" }}
                          </div>
                        </b-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </b-card>
        </b-col>
      </b-row>
      <p class="footerLogin">
        <img class="logoCity mr-2" src="/city_logo.png" /> &copy;2024 City
        Government of Koronadal
      </p>
    </div>
  </div>
</template>

<script>
import printDtr from "~/components/Print/printDtr.vue";
import axios from "axios";
import Loading from "~/components/LoadingOverlay/Loadings.vue";
import moment from "moment-timezone";
export default {
  components: { Loading, printDtr },
  data() {
    return {
      dismissSecs: 10,
      dismissCountDown: 0,
      alert: {
        showAlert: 0,
        variant: "",
        message: "",
      },
      showLoading: false,
      showLogsNew: false,
      user: {
        fullname: null,
        empno: null,
        swipe_id: null,
        department: null,
        position: null,
      },
      months: [],
      years: Array.from(
        { length: new Date().getFullYear() - 1999 },
        (_, i) => ({ value: i + 2000, text: String(i + 2000) })
      ),
      selectedMonth: moment().format("MMMM"),
      selectedYear: moment().year(),
      groupedLogs: {},
      groupedLogsNew: {},
      leaves: {},
      lastFetchedDate: "",
      selectedSemiMonthly: 1,
      dateRange: null,
      allLeaves: {
        leaveCredits: {
          sl_credits: 0,
          vl_credits: 0,
        },
        remainingMc6: 0,
        remainingForceLeave: 0,
      },
      currentPage: 1,
      perPage: 5,
      allLeavesData: [],
      totalLates: 0,
    };
  },
  async created() {
    this.user.name = localStorage.fullname;
    this.user.empno = localStorage.empno;
    this.user.swipe_id = localStorage.swipe_id;
    this.user.department = localStorage.department;
    this.user.position = localStorage.position;
    this.user.shift = localStorage.shift;

    await this.generateMonths();
    await this.fetchLogs();
  },
  computed: {
    combinedDate() {
      return `${this.selectedMonth}-${this.selectedYear}-${this.selectedSemiMonthly}`;
    },
    paginatedLeaves() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.allLeavesData.slice(start, end);
    },
    startEntry() {
      return this.allLeavesData.length === 0
        ? 0
        : (this.currentPage - 1) * this.perPage + 1;
    },
    endEntry() {
      return Math.min(
        this.currentPage * this.perPage,
        this.allLeavesData.length
      );
    },
  },
  watch: {
    combinedDate(newDate) {
      this.fetchLogs(newDate);
    },
  },
  methods: {
    tooltipText(row) {
      return [
        `🕒 Time In:     ${row.machine_in_1 || "--"}`,
        `☕ Break Out:   ${row.machine_out_1 || "--"}`,
        `🔁 Break In:    ${row.machine_in_2 || "--"}`,
        `🏁 Time Out:    ${row.machine_out_2 || "--"}`,
      ].join("\n");
    },
    previousMonth() {
      const currentMonthIndex = this.months.findIndex(
        (month) => month.name === this.selectedMonth
      );
      const currentYearIndex = this.years.findIndex(
        (year) => year.value === this.selectedYear
      );

      if (currentMonthIndex > 0) {
        const previousMonth = this.months[currentMonthIndex - 1];
        this.selectedMonth = previousMonth.name;
      } else {
        this.selectedMonth = "December";
        this.selectedYear = this.years[currentYearIndex - 1].value;
      }
    },

    nextMonth() {
      const currentMonthIndex = this.months.findIndex(
        (month) => month.name === this.selectedMonth
      );
      const currentYearIndex = this.years.findIndex(
        (year) => year.value === this.selectedYear
      );

      if (currentMonthIndex < this.months.length - 1) {
        const nextMonth = this.months[currentMonthIndex + 1];
        this.selectedMonth = nextMonth.name;
      } else {
        this.selectedMonth = "January";
        this.selectedYear = this.years[currentYearIndex + 1].value;
      }
    },
    formatDay(data) {
      return moment.utc(data).format("ddd");
    },
    formatTime(data) {
      if (data) {
        if (data == "DAY OFF") {
          return "DAY OFF";
        } else if (data == "MO") {
          return "MO";
        } else if (data == "OT") {
          return "OT";
        } else if (data == "HOLIDAY") {
          return "HOLIDAY";
        } else if (data == "LEAVE") {
          return "LEAVE";
        } else {
          const time = data.split("T");
          const minutes = time[1].split(":");
          const hour = parseInt(minutes[0], 10);

          const formattedHour = hour === 0 ? 12 : hour;

          if (hour < 12) {
            return `${formattedHour}:${minutes[1]} AM`;
          } else {
            const hourIn12HourFormat = hour === 12 ? 12 : hour - 12;
            return `${hourIn12HourFormat}:${minutes[1]} PM`;
          }
        }
      }
    },
    formatDate(date) {
      return moment.utc(date).format("DD MMM-YYYY");
    },
    formatDateNew(date) {
      return moment.utc(date).format("MMM DD, YYYY");
    },
    goBack() {
      localStorage.clear();
      this.$router.push(`/`);
    },
    async viewLeave() {
      this.$bvModal.show("leave-summary-modal");
      await this.fetchLeaveSummary();
    },
    generateMonths() {
      for (let i = 0; i < 12; i++) {
        this.months.push({
          name: moment().month(i).format("MMMM"),
        });
      }
      // console.log(this.months)
      // Set date to current date
      for (let i = 0; i < this.months.length; i++) {
        const element = this.months[i];
        const current = moment().format("MMMM");

        if (current == element.name) {
          this.selectedMonth = element.name;
        }
      }
    },
    printTable() {
      this.$refs.printDtr.print();
    },
    clearData() {
      this.groupedLogs = null;
    },
    // isExcused(data) {
    //     if (data.in_1 == null || data.out_1 == null || data.in_2 == null || data.out_2 == null) {
    //         if ((data.ob_in_1 === true)) {
    //             return "OT"
    //         } else if (data.mission_in_1 === true) {
    //             return "MO"
    //         }
    //         else if ((data.ob_out_1 === true)) {
    //             return "OT"
    //         } else if (data.mission_out_1 === true) {
    //             return "MO"
    //         }
    //         else if ((data.ob_in_2 === true)) {
    //             return "OT"
    //         } else if (data.mission_in_2 === true) {
    //             return "MO"
    //         }
    //         else if ((data.ob_out_2 === true)) {
    //             return "OT"
    //         } else if (data.mission_out_2 === true) {
    //             return "MO"
    //         }
    //     } else if (data.in_1 == null && data.out_1 == null && data.in_2 == null && data.out_2 == null && data.in_3 == null && data.out_3 == null) {
    //         return "LEAVE"
    //     }

    // },
    // isLeave(data) {
    //     for (let leave of this.leaves) {
    //         if (data.dtr_date == leave.start_date) {
    //             return 'LEAVE'
    //         }
    //     }
    // },
    formatNoDate(data) {
      if (
        !data.dayoff &&
        !data.holiday &&
        data.in_1 == null &&
        data.out_1 == null &&
        data.in_2 == null &&
        data.out_2 == null &&
        !data.mission_in_1 &&
        !data.mission_out_1 &&
        !data.mission_in_2 &&
        !data.mission_out_2 &&
        !data.ob_in_1 &&
        !data.ob_out_1 &&
        !data.ob_in_2 &&
        !data.ob_out_2
      ) {
        return true;
      } else if (
        data.in_1 == "LEAVE" &&
        data.in_2 == "LEAVE" &&
        data.out_1 == "LEAVE" &&
        data.out_2 == "LEAVE"
      ) {
        return true;
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
    async fetchLeaveSummary() {
      try {
        this.showLoading = true;
        const res = await axios({
          method: "POST",
          url: `${this.$axios.defaults.baseURL}/dtr/get/leave`,
          data: {
            swipe_id: this.user.swipe_id,
          },
          headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "GET",
          },
        });
        this.allLeaves = res.data;
        this.allLeavesData = res.data.appliedLeaves;
        this.showLoading = false;
      } catch (error) {
        this.showLoading = false;
        this.showAlert(error, "danger");
      }
    },
    clearLeaveSummary() {
      this.allLeaves = {
        leaveCredits: {
          sl_credits: 0,
          vl_credits: 0,
        },
        remainingMc6: 0,
        remainingForceLeave: 0,
      };
      this.allLeavesData = [];
      this.$bvModal.hide("leave-summary-modal");
    },
    async fetchLogs(date) {
      this.showLoading = true;
      this.totalLates = 0; // reset total lates
      this.groupedLogs = [];
      this.leaves = [];

      let startDate,
        endDate = "";

      if (this.selectedSemiMonthly == 1) {
        // full month
        startDate = moment(date).startOf("month").format("YYYY-MM-DD");
        endDate = moment(date).endOf("month").format("YYYY-MM-DD");
      } else if (this.selectedSemiMonthly == 2) {
        // 1st cutoff
        startDate = moment(date).startOf("month").format("YYYY-MM-DD");
        endDate = moment(date)
          .startOf("month")
          .add(14, "days")
          .format("YYYY-MM-DD");
      } else if (this.selectedSemiMonthly == 3) {
        // 2nd cutoff
        startDate = moment(date)
          .startOf("month")
          .add(15, "days")
          .format("YYYY-MM-DD");
        endDate = moment(date).endOf("month").format("YYYY-MM-DD");
      }

      this.dateRange = `${moment(startDate).format("MM/DD/YYYY")}-${moment(
        endDate
      ).format("MM/DD/YYYY")}`;

      try {
        const res = await axios({
          method: "POST",
          url: `${this.$axios.defaults.baseURL}/dtr/${this.user.swipe_id}`,
          data: {
            startDate: startDate,
            endDate: endDate,
            shift: this.user.shift,
          },
        });

        if (res.data) {
          this.showLogsNew = false;
          const today = moment().add(1, "days").format("YYYY-MM-DD");

          this.groupedLogs = res.data.datesWithOT.filter((log) =>
            moment(log.dtr_date).isSameOrBefore(today)
          );

          this.leaves = res.data.datesWithLeave.filter((log) =>
            moment(log.start_date).isSameOrBefore(today)
          );

          const [shiftHourStr, shiftMinStr] = (
            this.user.shift_start || "08:00"
          ).split(":");
          const shiftHour = parseInt(shiftHourStr || "8", 10);
          const shiftMin = parseInt(shiftMinStr || "0", 10);

          this.groupedLogs.forEach((log) => {
            if (!log.in_1) return;

            const actualIn = moment.utc(log.in_1);
            const shiftIn = moment
              .utc(log.dtr_date)
              .startOf("day")
              .add(shiftHour, "hours")
              .add(shiftMin, "minutes");

            if (log.dayoff || log.holiday) return;

            if (actualIn.isAfter(shiftIn)) {
              this.totalLates++;
            }
          });

          this.showLoading = false;
        }
      } catch (error) {
        this.showAlert("danger", error);
        this.showLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.icon {
  color: var(--primary-color);
}
.summary-card {
  background: var(--form-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--form-shadow);
}

.summary-item {
  background: var(--form-field);
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--form-shadow);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--form-hover-shadow);
    border-color: var(--border-color);
  }
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-left {
  font-size: 1.3rem;
  color: var(--primary-color);
}

.summary-label {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-count {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--text-primary);
}
.present {
  background: var(--success-color);
  color: var(--white-color);
  border-color: var(--success-color);
  
  .summary-label {
    color: var(--white-color);
  }
  
  .summary-count {
    color: var(--white-color);
  }
  
  &:hover {
    background: #059669;
  }
}
</style>
