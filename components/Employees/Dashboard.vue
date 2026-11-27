<template>
  <div class="dashboard hr-dashboard">
    <Loading v-if="loading" />
    <div class="db-wrap">
      <section class="db-top hr-hero hr-hero-minimal">
        <h2 class="db-title">HR Dashboard</h2>
        <div class="db-date">
          <font-awesome-icon icon="calendar-alt" /> {{ currentDate }}
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Overview</h3>
      </div>
      <section class="db-stats hr-kpi-grid">
        <div class="stat stat--total hr-kpi">
          <div class="stat-icon"><font-awesome-icon icon="users" /></div>
          <div class="stat-info">
            <span class="stat-lbl">Employees</span>
            <span class="stat-num">{{ employees.length }}</span>
          </div>
        </div>
        <div class="stat stat--active hr-kpi">
          <div class="stat-icon"><font-awesome-icon icon="building" /></div>
          <div class="stat-info">
            <span class="stat-lbl">Departments</span>
            <span class="stat-num">{{ departments.length }}</span>
          </div>
        </div>
        <div class="stat stat--dept hr-kpi">
          <div class="stat-icon"><font-awesome-icon icon="user-clock" /></div>
          <div class="stat-info">
            <span class="stat-lbl">Average Age</span>
            <span class="stat-num">{{ averageAge }}</span>
          </div>
        </div>
        <div class="stat stat--bday hr-kpi hr-kpi-alert">
          <div class="stat-icon"><font-awesome-icon icon="bell" /></div>
          <div class="stat-info">
            <span class="stat-lbl">For Attention</span>
            <span class="stat-num">{{ attentionCount }}</span>
          </div>
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Analytics</h3>
      </div>
      <section class="hr-analytics-grid">
        <div class="card-c chart-card dept-card hr-panel hr-department-panel">
          <div class="card-c__h">
            <span class="card-title">Employees per Department</span>
          </div>
          <div class="card-c__b" ref="deptChart"></div>
        </div>
        <div class="card-c chart-card hr-panel">
          <div class="card-c__h">
            <span class="card-title">Employment Status</span>
          </div>
          <div class="card-c__b" ref="statusChart"></div>
        </div>
        <div class="card-c chart-card hr-panel">
          <div class="card-c__h">
            <span class="card-title">Gender Distribution</span>
          </div>
          <div class="card-c__b" ref="genderChart"></div>
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Insights</h3>
      </div>
      <section class="hr-insight-grid">
        <div class="hr-insight-tile tile--blue">
          <div class="hr-insight-tile-icon">
            <font-awesome-icon icon="user-group" />
          </div>
          <div class="hr-insight-tile-body">
            <span class="hr-insight-tile-label">Gender</span>
            <div class="hr-insight-tile-value">{{ dominantGender }}</div>
            <small class="hr-insight-tile-sub">{{ dominantGenderCount }}</small>
          </div>
        </div>
        <div class="hr-insight-tile tile--green">
          <div class="hr-insight-tile-icon">
            <font-awesome-icon icon="briefcase" />
          </div>
          <div class="hr-insight-tile-body">
            <span class="hr-insight-tile-label">Employment</span>
            <div class="hr-insight-tile-value">{{ dominantEmployment }}</div>
            <small class="hr-insight-tile-sub">{{ dominantEmploymentCount }}</small>
          </div>
        </div>
        <div class="hr-insight-tile tile--pink">
          <div class="hr-insight-tile-icon">
            <font-awesome-icon icon="cake-candles" />
          </div>
          <div class="hr-insight-tile-body">
            <span class="hr-insight-tile-label">Birthdays</span>
            <div class="hr-insight-tile-value">{{ birthdayToday.length }}</div>
          </div>
        </div>
        <div class="hr-insight-tile tile--orange">
          <div class="hr-insight-tile-icon">
            <font-awesome-icon icon="hourglass-half" />
          </div>
          <div class="hr-insight-tile-body">
            <span class="hr-insight-tile-label">Retirement</span>
            <div class="hr-insight-tile-value">{{ retirees.length }}</div>
          </div>
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Action Center</h3>
      </div>
      <section class="hr-action-grid">
        <div class="card-c data-card hr-panel hr-action-panel">
          <div class="card-c__h">
            <span class="card-title">Birthdays Today</span>
            <span class="card-c__badge">{{ birthdayToday.length }}</span>
          </div>
          <div class="card-c__b card-table-body">
            <div v-if="birthdayToday.length > 0" class="tbl-wrap">
              <table class="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Birthday</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="emp in birthdayToday" :key="emp.empid">
                    <td class="td-mono">{{ emp.empno }}</td>
                    <td>
                      <strong>{{ emp.fullname }}</strong>
                    </td>
                    <td>{{ emp.deptdesc || "—" }}</td>
                    <td>{{ emp.position_desc || "—" }}</td>
                    <td>
                      <span class="bdg">{{ formatDate(emp.birthdate) }}</span>
                    </td>
                    <td>{{ emp.age }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-bday">
              <font-awesome-icon icon="cake-candles" />
              <strong>No birthdays today</strong>
            </div>
          </div>
        </div>
        <div class="card-c data-card hr-panel hr-action-panel">
          <div class="card-c__h">
            <span class="card-title">Retirement Watch</span>
            <span class="card-c__badge">{{ retirees.length }}</span>
          </div>
          <div class="card-c__b card-table-body">
            <div v-if="retirees.length > 0" class="tbl-wrap">
              <table class="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Age</th>
                    <th>Birthday</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="emp in displayRetirees" :key="emp.empid">
                    <td>
                      <strong>{{ emp.fullname }}</strong>
                    </td>
                    <td>{{ emp.deptdesc || "—" }}</td>
                    <td>
                      <span class="age-pill">{{ emp.age }}</span>
                    </td>
                    <td>
                      <span class="bdg">{{
                        formatMonthDay(emp.birthdate)
                      }}</span>
                    </td>
                    <td>
                      <span
                        v-if="emp.age > 64 && isDatePassed(emp.birthdate)"
                        class="ret-bdg"
                        >RETIRED</span
                      ><span v-else class="ready-bdg">WATCH</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="retirees.length > retireesLimit" class="exp-wrap">
                <button
                  class="exp-btn"
                  @click="retireesExpanded = !retireesExpanded"
                >
                  <font-awesome-icon
                    :icon="retireesExpanded ? 'chevron-up' : 'chevron-down'"
                  />
                  {{
                    retireesExpanded
                      ? "Show Less"
                      : `Show All (${retirees.length})`
                  }}
                </button>
              </div>
            </div>
            <div v-else class="empty-bday">
              <font-awesome-icon icon="clock" />
              <strong>No retirement watch</strong>
            </div>
          </div>
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Spotlight</h3>
      </div>
      <section class="card-c hr-panel spotlight-panel">
        <div class="card-c__b" v-if="mostTenured">
          <div class="spotlight-card">
            <div class="spotlight-avatar">
              {{ mostTenured.initials }}
            </div>
            <div class="spotlight-info">
              <strong class="spotlight-name">{{ mostTenured.fullname }}</strong>
              <span class="spotlight-meta"
                >{{ mostTenured.position_desc }} &middot;
                {{ mostTenured.deptdesc }}</span
              >
            </div>
            <div class="spotlight-stats">
              <div class="spotlight-stat">
                <span class="spotlight-stat-num">{{
                  mostTenured.years
                }}</span
                ><span class="spotlight-stat-lbl">Years</span>
              </div>
              <div class="spotlight-stat">
                <span class="spotlight-stat-num">{{
                  formatDate(mostTenured.datehired)
                }}</span
                ><span class="spotlight-stat-lbl">Hired</span>
              </div>
              <div class="spotlight-stat">
                <span class="spotlight-stat-num td-mono">{{
                  mostTenured.empno
                }}</span
                ><span class="spotlight-stat-lbl">Employee No.</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-bday">
          <font-awesome-icon icon="award" />
          <strong>No employee record</strong>
        </div>
      </section>

      <div class="hr-section-head">
        <h3>Birthdays</h3>
      </div>
      <section class="card-c card-c--f data-card hr-panel upcoming-panel">
        <div class="card-c__b card-table-body">
          <div
            v-if="upcomingBirthdays.length"
            class="upcoming-birthday-grid upcoming-birthday-grid--four"
          >
            <div
              v-for="emp in upcomingBirthdays"
              :key="`up-${emp.empid}`"
              class="upcoming-birthday-item"
            >
              <div class="upcoming-date">
                <strong>{{ emp.daysUntil }}</strong
                ><small>{{ emp.daysUntil === 1 ? "DAY" : "DAYS" }}</small>
              </div>
              <div class="upcoming-person">
                <strong>{{ emp.fullname }}</strong>
                <span>{{ emp.deptdesc || "—" }}</span>
              </div>
              <div class="upcoming-bday">
                <span>{{ formatMonthDay(emp.birthdate) }}</span
                ><small>Age {{ emp.nextAge }}</small>
              </div>
            </div>
          </div>
          <div v-else class="empty-bday">
            <font-awesome-icon icon="calendar-days" />
            <strong>No upcoming birthdays</strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = [
  "#2563eb",
  "#0d9488",
  "#7c3aed",
  "#db2777",
  "#f59e0b",
  "#0891b2",
  "#64748b",
  "#60a5fa",
];

export default {
  components: { Loading },
  head() {
    return {
      meta: [
        { hid: "description", name: "description", content: "HR Dashboard" },
      ],
    };
  },
  data() {
    return {
      loading: true,
      employees: [],
      departments: [],
      birthdayToday: [],
      currentDate: "",
      retireesLimit: 10,
      retireesExpanded: false,
      charts: [],
      mostTenured: null,
      tenureLoading: true,
      tenureHydrating: false,
      tenureHydrated: 0,
      tenureTotal: 0,
      _tenureRun: 0,
    };
  },
  computed: {
    activeCount() {
      return this.employees.filter((e) => !e.isseparated && e.EmploymentStatus)
        .length;
    },
    averageAge() {
      const ages = this.employees
        .map((e) => this.calcAge(e.birthdate))
        .filter((a) => a > 0 && a < 120);
      return ages.length
        ? Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10
        : 0;
    },
    attentionCount() {
      return this.birthdayToday.length + this.retirees.length;
    },
    dominantGender() {
      return this.topKey(
        this.countBy(this.employees, (e) => e.genderdesc || "Unknown"),
        "No data"
      );
    },
    dominantGenderCount() {
      const map = this.countBy(
        this.employees,
        (e) => e.genderdesc || "Unknown"
      );
      return map[this.dominantGender] || 0;
    },
    dominantEmployment() {
      return this.topKey(
        this.countBy(this.employees, (e) => e.EmploymentStatus || "Unknown"),
        "No data"
      );
    },
    dominantEmploymentCount() {
      const map = this.countBy(
        this.employees,
        (e) => e.EmploymentStatus || "Unknown"
      );
      return map[this.dominantEmployment] || 0;
    },
    retirees() {
      return this.employees
        .filter((e) => {
          if (
            e.EmploymentStatus !== "Permanent" &&
            e.EmploymentStatus !== "Co-terminous" &&
            e.EmploymentStatus !== "Casual"
          )
            return false;
          const age = this.calcAge(e.birthdate);
          return age >= 60 && age <= 65;
        })
        .map((e) => ({ ...e, age: this.calcAge(e.birthdate) }))
        .sort((a, b) => {
          if (a.age !== b.age) return b.age - a.age;
          const da = new Date(a.birthdate),
            db = new Date(b.birthdate);
          return da.getMonth() - db.getMonth() || da.getDate() - db.getDate();
        });
    },
    tenureBrackets() {
      const rows = this.employees.filter((e) => e.datehired);
      if (!rows.length) return [];
      const make = (key, label, min, max, color) => {
        const items = rows.filter((e) => {
          const m = this.tenureMonths(e.datehired);
          return m >= min && m < max;
        });
        return {
          key,
          label,
          count: items.length,
          pct: Math.round((items.length * 100) / rows.length),
          color,
        };
      };
      return [
        make("20_plus", "20+ years", 240, Infinity, "#f59e0b"),
        make("15_19", "15–19 yrs", 180, 240, "#2563eb"),
        make("10_14", "10–14 yrs", 120, 180, "#38bdf8"),
        make("5_9", "5–9 yrs", 60, 120, "#22c55e"),
        make("under5", "Under 5 yrs", 0, 60, "#94a3b8"),
      ];
    },
    displayRetirees() {
      return this.retireesExpanded
        ? this.retirees
        : this.retirees.slice(0, this.retireesLimit);
    },
    upcomingBirthdays() {
      const now = new Date(),
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return this.employees
        .map((e) => {
          if (!e.birthdate) return null;
          const birth = new Date(e.birthdate);
          if (Number.isNaN(birth.getTime())) return null;
          let date = new Date(
            now.getFullYear(),
            birth.getMonth(),
            birth.getDate()
          );
          if (date < today)
            date = new Date(
              now.getFullYear() + 1,
              birth.getMonth(),
              birth.getDate()
            );
          const daysUntil = Math.round((date - today) / 86400000);
          if (daysUntil < 1 || daysUntil > 30) return null;
          return { ...e, daysUntil, nextAge: this.calcAge(e.birthdate) + 1 };
        })
        .filter(Boolean)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 12);
    },
  },
  created() {
    const d = new Date();
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.currentDate = `${days[d.getDay()]}, ${
      months[d.getMonth()]
    } ${d.getDate()}, ${d.getFullYear()}`;
    this.fetchData();
  },
  beforeDestroy() {
    this.charts.forEach((chart) => {
      try {
        chart.dispose();
      } catch (e) {}
    });
    this.charts = [];
  },
  methods: {
    countBy(items, getter) {
      return items.reduce((map, item) => {
        const key = getter(item);
        map[key] = (map[key] || 0) + 1;
        return map;
      }, {});
    },
    topKey(map, fallback) {
      const keys = Object.keys(map);
      return keys.length ? keys.sort((a, b) => map[b] - map[a])[0] : fallback;
    },
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([this.fetchEmployees(), this.fetchDepartments()]);
        this.fetchMostTenured();
        this.$nextTick(() => {
          this.processBirthdays();
          this.buildCharts();
        });
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        this.loading = false;
      }
    },
    async fetchEmployees() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/employees/get-all`,
          params: { text: "", IsSeparated: 0 },
        });
        const payload = res.data;
        if (Array.isArray(payload)) this.employees = payload;
        else if (payload && Array.isArray(payload.data))
          this.employees = payload.data;
        else if (payload && Array.isArray(payload.items))
          this.employees = payload.items;
        else this.employees = [];
      } catch (e) {
        console.error("Error fetching employees:", e);
        this.employees = [];
      }
    },
    async fetchDepartments() {
      try {
        const res = await axios({
          method: "GET",
          url: `${this.$axios.defaults.baseURL}/file-maintenance/department/get-all`,
        });
        this.departments = res.data || [];
      } catch (e) {
        console.error("Error fetching departments:", e);
        this.departments = [];
      }
    },
    async fetchMostTenured() {
      // Lock so only one hydration runs at a time.
      if (this._tenureHydrating || !this.employees.length) return;
      this._tenureHydrating = true;
      this.tenureLoading = true;
      const cacheKey = "hrms_tenure_cache_v1";
      let cache = {};
      try {
        cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
      } catch (e) {}
      try {
        const pool = this.employees.filter(
          (e) => e.empid != null && !e.datehired && !cache[e.empid]
        );
        if (pool.length) {
          this.tenureHydrating = true;
          const CONCURRENCY = 8;
          let done = 0;
          const queue = [...pool];
          const workers = Array.from(
            { length: Math.min(CONCURRENCY, queue.length) },
            async () => {
              while (queue.length) {
                const emp = queue.shift();
                try {
                  const res = await axios({
                    method: "GET",
                    url: `${this.$axios.defaults.baseURL}/employees/get-one`,
                    params: { empid: emp.empid },
                  });
                  const row = res.data && res.data[0];
                  if (row && row.datehired) {
                    cache[emp.empid] = row.datehired;
                    this.$set(emp, "datehired", row.datehired);
                  } else {
                    cache[emp.empid] = null;
                  }
                } catch (err) {
                  cache[emp.empid] = null;
                }
                done++;
                if (done % 20 === 0 || done === pool.length) {
                  this.tenureHydrated = done;
                }
              }
            }
          );
          await Promise.all(workers);
          this.tenureHydrating = false;
          try {
            localStorage.setItem(cacheKey, JSON.stringify(cache));
          } catch (e) {}
        }
        this.applyTenureCache(cache);
        this.computeTenureDist();
      } catch (e) {
        console.error("Error computing tenures:", e);
      } finally {
        this._tenureHydrating = false;
        this.tenureLoading = false;
      }
    },
    applyTenureCache(cache) {
      if (!cache || !this.employees.length) return;
      this.employees.forEach((e) => {
        if (!e.datehired && cache[e.empid]) {
          this.$set(e, "datehired", cache[e.empid]);
        }
      });
    },
    computeTenureDist() {
      const rows = this.employees.filter((e) => e.datehired);
      if (!rows.length) return;
      const dist = [
        { key: "20plus", label: "20+ Years", min: 20, max: 99 },
        { key: "15_19", label: "15–19 Years", min: 15, max: 19 },
        { key: "10_14", label: "10–14 Years", min: 10, max: 14 },
        { key: "5_9", label: "5–9 Years", min: 5, max: 9 },
        { key: "under5", label: "Under 5 Years", min: 0, max: 4.99 },
      ].map((b) => {
        const yearsVal = (e) => {
          const y = this.tenureYearsNum(e.datehired);
          return y;
        };
        const items = rows.filter((e) => {
          const y = yearsVal(e);
          return y >= b.min && y < b.max;
        });
        return { ...b, count: items.length };
      });
      const grand = dist.reduce((a, b) => a + b.count, 0) || 1;
      dist.forEach((b) => (b.percent = Math.round((b.count / grand) * 100)));
      this.tenureDist = dist;
      const sorted = [...rows].sort(
        (a, b) => new Date(a.datehired) - new Date(b.datehired)
      );
      const top = sorted[0];
      if (top) {
        this.mostTenured = {
          ...top,
          years: this.formatTenure(top.datehired),
          initials: this.getInitials(top.fullname),
        };
      }
    },
    formatTenure(value) {
      if (!value) return "—";
      const hire = new Date(value);
      if (Number.isNaN(hire.getTime())) return "—";
      const now = new Date();
      let totalMonths =
        (now.getFullYear() - hire.getFullYear()) * 12 +
        (now.getMonth() - hire.getMonth());
      if (now.getDate() < hire.getDate()) totalMonths -= 1;
      if (totalMonths < 0) totalMonths = 0;
      const y = Math.floor(totalMonths / 12);
      const m = totalMonths % 12;
      if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
      if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
      return `${y} years, ${m} month${m !== 1 ? "s" : ""}`;
    },
    getInitials(name) {
      if (!name) return "—";
      return name
        .split(/[,\s]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("");
    },
    processBirthdays() {
      const now = new Date();
      this.birthdayToday = this.employees
        .filter((e) => {
          if (!e.birthdate) return false;
          const d = new Date(e.birthdate);
          return (
            !Number.isNaN(d.getTime()) &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
          );
        })
        .map((e) => ({ ...e, age: this.calcAge(e.birthdate) }));
    },
    calcAge(value) {
      if (!value) return 0;
      const birth = new Date(value);
      if (Number.isNaN(birth.getTime())) return 0;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const month = today.getMonth() - birth.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birth.getDate()))
        age--;
      return age;
    },
    isDatePassed(value) {
      if (!value) return false;
      const d = new Date(value),
        today = new Date();
      return (
        d.getMonth() < today.getMonth() ||
        (d.getMonth() === today.getMonth() && d.getDate() <= today.getDate())
      );
    },
    formatDate(value) {
      if (!value) return "—";
      const d = new Date(value);
      return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
    },
    formatMonthDay(value) {
      if (!value) return "—";
      const d = new Date(value);
      return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    },
    chartBaseOption() {
      return {
        animationDuration: 650,
        animationEasing: "cubicOut",
        textStyle: { fontFamily: "Tahoma, 'Segoe UI', sans-serif" },
        tooltip: {
          backgroundColor: "#fff",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: [8, 12],
          textStyle: { color: "#334155", fontSize: 12 },
          extraCssText:
            "box-shadow:0 4px 16px rgba(15,23,42,.08);border-radius:8px;",
        },
      };
    },
    initChart(ref) {
      if (!this.$refs[ref]) return null;
      const chart = echarts.init(this.$refs[ref]);
      this.charts.push(chart);
      return chart;
    },
    buildCharts() {
      this.charts.forEach((c) => {
        try {
          c.dispose();
        } catch (e) {}
      });
      this.charts = [];
      this.buildStatusChart();
      this.buildGenderChart();
      this.buildDeptChart();
      this.$nextTick(() => this.resizeCharts());
    },
    resizeCharts() {
      this.charts.forEach((c) => {
        try {
          c.resize();
        } catch (e) {}
      });
    },
    buildStatusChart() {
      const map = this.countBy(
          this.employees,
          (e) => e.EmploymentStatus || "Unknown"
        ),
        keys = Object.keys(map),
        vals = Object.values(map),
        total = vals.reduce((a, b) => a + b, 0),
        chart = this.initChart("statusChart");
      if (!chart) return;
      chart.setOption({
        ...this.chartBaseOption(),
        tooltip: {
          ...this.chartBaseOption().tooltip,
          trigger: "item",
          formatter: (p) =>
            `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`,
        },
        legend: {
          bottom: 4,
          left: "center",
          width: "90%",
          textStyle: { fontSize: 11, color: "#64748b", fontWeight: 600 },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 14,
        },
        series: [
          {
            type: "pie",
            radius: ["52%", "72%"],
            center: ["50%", "44%"],
            itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 3 },
            label: {
              show: true,
              formatter: "{d}%",
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
            },
            labelLine: {
              length: 8,
              length2: 6,
              lineStyle: { color: "#cbd5e1" },
            },
            emphasis: {
              scale: true,
              scaleSize: 4,
              label: { show: true, fontSize: 13, fontWeight: 700, color: "#2563eb" },
            },
            data: keys.map((k, i) => ({
              name: k,
              value: map[k],
              itemStyle: { color: palette[i % palette.length] },
            })),
          },
        ],
        graphic: [
          {
            type: "group",
            left: "center",
            top: "40%",
            children: [
              {
                type: "text",
                left: "center",
                top: -10,
                style: {
                  text: `${total}`,
                  fill: "#0f172a",
                  fontSize: 28,
                  fontWeight: 700,
                  textAlign: "center",
                },
              },
              {
                type: "text",
                left: "center",
                top: 22,
                style: {
                  text: "EMPLOYEES",
                  fill: "#94a3b8",
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                },
              },
            ],
          },
        ],
      });
    },
    buildGenderChart() {
      const map = this.countBy(
          this.employees,
          (e) => e.genderdesc || "Unknown"
        ),
        keys = Object.keys(map),
        total = Object.values(map).reduce((a, b) => a + b, 0),
        chart = this.initChart("genderChart");
      if (!chart) return;
      chart.setOption({
        ...this.chartBaseOption(),
        tooltip: {
          ...this.chartBaseOption().tooltip,
          trigger: "item",
          formatter: (p) =>
            `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`,
        },
        legend: {
          bottom: 4,
          left: "center",
          textStyle: { fontSize: 11, color: "#64748b", fontWeight: 600 },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 18,
        },
        series: [
          {
            type: "pie",
            radius: ["52%", "72%"],
            center: ["50%", "44%"],
            itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 3 },
            label: {
              show: true,
              formatter: "{b} {d}%",
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
            },
            labelLine: {
              length: 8,
              length2: 6,
              lineStyle: { color: "#cbd5e1" },
            },
            emphasis: {
              scale: true,
              scaleSize: 4,
              label: { show: true, fontSize: 13, fontWeight: 700, color: "#2563eb" },
            },
            data: keys.map((k, i) => ({
              name: k,
              value: map[k],
              itemStyle: {
                color:
                  ["#2563eb", "#db2777", "#0d9488"][i] ||
                  palette[i % palette.length],
              },
            })),
          },
        ],
        graphic: [
          {
            type: "group",
            left: "center",
            top: "40%",
            children: [
              {
                type: "text",
                left: "center",
                top: -10,
                style: {
                  text: `${total}`,
                  fill: "#0f172a",
                  fontSize: 28,
                  fontWeight: 700,
                  textAlign: "center",
                },
              },
              {
                type: "text",
                left: "center",
                top: 22,
                style: {
                  text: "EMPLOYEES",
                  fill: "#94a3b8",
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                },
              },
            ],
          },
        ],
      });
    },
    buildDeptChart() {
      const empMap = this.countBy(
          this.employees,
          (e) => e.deptdesc || "Unknown"
        ),
        allDepts = this.departments.length
          ? [
              ...new Set([
                ...this.departments.map((d) => d.deptdesc),
                ...Object.keys(empMap),
              ]),
            ]
          : Object.keys(empMap),
        sorted = allDepts.sort((a, b) => (empMap[b] || 0) - (empMap[a] || 0)),
        labels = sorted,
        vals = sorted.map((d) => empMap[d] || 0),
        chart = this.initChart("deptChart");
      if (!chart) return;
      chart.setOption({
        ...this.chartBaseOption(),
        tooltip: {
          ...this.chartBaseOption().tooltip,
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params) => {
            const p = params[0];
            return `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees</div>`;
          },
        },
        grid: {
          left: "2%",
          right: "4%",
          top: "6%",
          bottom: labels.length > 8 ? "22%" : "14%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: {
            color: "#64748b",
            fontSize: 10,
            interval: 0,
            rotate: labels.length > 8 ? 30 : 0,
          },
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: { color: "#94a3b8", fontSize: 10 },
          splitLine: { lineStyle: { color: "#f1f5f9" } },
          axisLine: { show: false },
        },
        series: [
          {
            type: "bar",
            data: vals.map((v, i) => ({
              value: v,
              itemStyle: {
                color: palette[i % palette.length],
                borderRadius: [5, 5, 0, 0],
              },
            })),
            barMaxWidth: 36,
            showBackground: true,
            backgroundStyle: { color: "#f8fafc", borderRadius: [5, 5, 0, 0] },
            label: {
              show: true,
              position: "top",
              color: "#475569",
              fontSize: 10,
              fontWeight: 700,
            },
          },
        ],
      });
    },
  },
};
</script>
