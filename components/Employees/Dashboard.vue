<template>
  <div class="dashboard">
    <Loading v-if="loading" />

    <div class="db-wrap">
      <div class="db-top">
        <div>
          <h2 class="db-title">Dashboard</h2>
          <p class="db-desc">HRMS overview</p>
        </div>
        <span class="db-date">{{ currentDate }}</span>
      </div>

      <div class="db-stats">
        <div class="stat stat--total">
          <div class="stat-info">
            <span class="stat-num">{{ employees.length }}</span>
            <span class="stat-lbl">Total Employees</span>
          </div>
          <div class="stat-icon"><font-awesome-icon icon="users" /></div>
        </div>
        <div class="stat stat--active">
          <div class="stat-info">
            <span class="stat-num">{{ activeCount }}</span>
            <span class="stat-lbl">Active</span>
          </div>
          <div class="stat-icon"><font-awesome-icon icon="user-check" /></div>
        </div>
        <div class="stat stat--dept">
          <div class="stat-info">
            <span class="stat-num">{{ departments.length }}</span>
            <span class="stat-lbl">Departments</span>
          </div>
          <div class="stat-icon"><font-awesome-icon icon="building" /></div>
        </div>
        <div class="stat stat--bday">
          <div class="stat-info">
            <span class="stat-num">{{ birthdayToday.length }}</span>
            <span class="stat-lbl">Birthdays Today</span>
          </div>
          <div class="stat-icon"><font-awesome-icon icon="cake-candles" /></div>
        </div>
      </div>

      <div class="db-charts">
        <div class="card-c">
          <div class="card-c__h">
            <font-awesome-icon icon="briefcase" />
            <span>Employment Status</span>
          </div>
          <div class="card-c__b" ref="statusChart"></div>
        </div>
        <div class="card-c">
          <div class="card-c__h">
            <font-awesome-icon icon="venus-mars" />
            <span>Gender</span>
          </div>
          <div class="card-c__b" ref="genderChart"></div>
        </div>
      </div>

      <div class="card-c card-c--f">
        <div class="card-c__h">
          <font-awesome-icon icon="chart-bar" />
          <span>Employees per Department</span>
        </div>
        <div class="card-c__b" ref="deptChart"></div>
      </div>

      <div class="card-c card-c--f">
        <div class="card-c__h">
          <font-awesome-icon icon="gift" />
          <span>Birthday Today</span>
          <span class="card-c__badge">{{ birthdayToday.length }}</span>
        </div>
        <div class="card-c__b" style="padding: 0">
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
                  <td>{{ emp.deptdesc }}</td>
                  <td>{{ emp.position_desc }}</td>
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
            <span>No birthdays today</span>
          </div>
        </div>
      </div>

      <div class="card-c card-c--f">
        <div class="card-c__h">
          <font-awesome-icon icon="clock" />
          <span>Retirement</span>
          <span class="card-c__badge">{{ retirees.length }}</span>
        </div>
        <div class="card-c__b" style="padding: 0">
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
                  <td>{{ emp.deptdesc }}</td>
                  <td>{{ emp.age }}</td>
                  <td>
                    <span class="bdg">{{ formatMonthDay(emp.birthdate) }}</span>
                  </td>
                  <td>
                    <span
                      v-if="emp.age > 64 && isDatePassed(emp.birthdate)"
                      class="ret-bdg"
                      >RETIRED</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="retirees.length > retireesLimit" class="exp-wrap">
              <button
                class="exp-btn"
                @click="retireesExpanded = !retireesExpanded"
              >
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
            <span>No permanent employees at retirement age</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#06b6d4",
  "#d946ef",
];

export default {
  components: { Loading },
  head() {
    return {
      meta: [{ hid: "description", name: "description", content: "Dashboard" }],
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
    };
  },
  computed: {
    activeCount() {
      return this.employees.filter((e) => !e.isseparated && e.EmploymentStatus)
        .length;
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
          const da = new Date(a.birthdate);
          const db = new Date(b.birthdate);
          return da.getMonth() - db.getMonth() || da.getDate() - db.getDate();
        });
    },
    displayRetirees() {
      return this.retireesExpanded
        ? this.retirees
        : this.retirees.slice(0, this.retireesLimit);
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
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.currentDate = `${days[d.getDay()]}, ${
      months[d.getMonth()]
    } ${d.getDate()}, ${d.getFullYear()}`;
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([this.fetchEmployees(), this.fetchDepartments()]);
        this.$nextTick(() => {
          this.buildCharts();
          this.processBirthdays();
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
    buildCharts() {
      this.buildStatusChart();
      this.buildGenderChart();
      this.buildDeptChart();
    },
    buildStatusChart() {
      const map = {};
      this.employees.forEach((e) => {
        const s = e.EmploymentStatus || "Unknown";
        map[s] = (map[s] || 0) + 1;
      });
      const keys = Object.keys(map);
      const vals = Object.values(map);
      const colors = palette.slice(0, keys.length);

      const total = vals.reduce((a, b) => a + b, 0);
      const chart = echarts.init(this.$refs.statusChart);
      chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
          backgroundColor: "#fff",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          textStyle: { color: "#1e293b", fontSize: 12 },
        },
        legend: {
          bottom: 0,
          textStyle: { fontSize: 11, color: "#64748b" },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
        },
        series: [
          {
            type: "pie",
            radius: ["45%", "70%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
            label: {
              show: true,
              formatter: "{d}%",
              fontSize: 12,
              fontWeight: "bold",
              color: "#1e293b",
            },
            emphasis: {
              label: { show: true, fontSize: 14, fontWeight: "bold" },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0,0,0,0.15)",
              },
            },
            data: keys.map((k, i) => ({
              name: k,
              value: vals[i],
              itemStyle: { color: colors[i] },
            })),
          },
        ],
        graphic: [
          {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: `${total}`,
              fill: "#0f172a",
              fontSize: 28,
              fontWeight: 700,
            },
            z: 100,
          },
        ],
      });
      window.addEventListener("resize", () => chart.resize());
    },
    buildGenderChart() {
      const map = {};
      this.employees.forEach((e) => {
        const g = e.genderdesc || "Unknown";
        map[g] = (map[g] || 0) + 1;
      });
      const keys = Object.keys(map);
      const vals = Object.values(map);
      const colors = ["#ec4899", "#6366f1", "#cbd5e1"];

      const total = vals.reduce((a, b) => a + b, 0);
      const chart = echarts.init(this.$refs.genderChart);
      chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
          backgroundColor: "#fff",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          textStyle: { color: "#1e293b", fontSize: 12 },
        },
        legend: {
          bottom: 0,
          textStyle: { fontSize: 11, color: "#64748b" },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
        },
        series: [
          {
            type: "pie",
            radius: ["30%", "75%"],
            center: ["50%", "50%"],
            roseType: "area",
            itemStyle: { borderRadius: 4 },
            label: {
              show: true,
              formatter: "{d}%",
              fontSize: 12,
              fontWeight: "bold",
              color: "#1e293b",
            },
            emphasis: {
              label: { show: true, fontSize: 14, fontWeight: "bold" },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0,0,0,0.15)",
              },
            },
            data: keys.map((k, i) => ({
              name: k,
              value: vals[i],
              itemStyle: { color: colors[i] },
            })),
          },
        ],
        graphic: [
          {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: `${total}`,
              fill: "#0f172a",
              fontSize: 28,
              fontWeight: 700,
            },
            z: 100,
          },
        ],
      });
      window.addEventListener("resize", () => chart.resize());
    },
    buildDeptChart() {
      const empMap = {};
      this.employees.forEach((e) => {
        const d = e.deptdesc || "Unknown";
        empMap[d] = (empMap[d] || 0) + 1;
      });

      const allDepts =
        this.departments.length > 0
          ? [
              ...new Set([
                ...this.departments.map((d) => d.deptdesc),
                ...Object.keys(empMap),
              ]),
            ]
          : Object.keys(empMap);

      const sorted = allDepts.sort(
        (a, b) => (empMap[a] || 0) - (empMap[b] || 0)
      );
      const labels = sorted;
      const vals = sorted.map((d) => empMap[d] || 0);
      const colors = palette.slice(0, labels.length);

      const chart = echarts.init(this.$refs.deptChart);
      chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          backgroundColor: "#fff",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          textStyle: { color: "#1e293b", fontSize: 12 },
        },
        grid: {
          left: "3%",
          right: "8%",
          bottom: "8%",
          top: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: { fontSize: 11, color: "#94a3b8" },
          splitLine: { lineStyle: { color: "#f1f5f9" } },
        },
        yAxis: {
          type: "category",
          data: labels,
          axisLabel: { fontSize: 12, color: "#334155", fontWeight: "600" },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            data: vals.map((v, i) => ({
              value: v,
              itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] },
            })),
            barMaxWidth: 32,
            label: {
              show: true,
              position: "right",
              formatter: (p) => `${p.value}`,
              fontSize: 13,
              fontWeight: "700",
              color: "#0f172a",
            },
          },
        ],
      });
      window.addEventListener("resize", () => chart.resize());
    },
    processBirthdays() {
      const now = new Date();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      this.birthdayToday = this.employees
        .filter((e) => {
          if (!e.birthdate) return false;
          const b = new Date(e.birthdate);
          return b.getMonth() + 1 === m && b.getDate() === d;
        })
        .map((e) => ({ ...e, age: this.calcAge(e.birthdate) }))
        .sort((a, b) => a.fullname.localeCompare(b.fullname));
    },
    calcAge(bd) {
      if (!bd) return "—";
      const b = new Date(bd);
      const t = new Date();
      let age = t.getFullYear() - b.getFullYear();
      if (
        t.getMonth() < b.getMonth() ||
        (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
      )
        age--;
      return age;
    },
    formatDate(date) {
      if (!date) return "—";
      const d = new Date(date);
      return `${
        [
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
        ][d.getMonth()]
      } ${d.getDate()}, ${d.getFullYear()}`;
    },
    formatMonthDay(date) {
      if (!date) return "—";
      const d = new Date(date);
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
      ];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
    },
    isDatePassed(date) {
      if (!date) return false;
      const b = new Date(date);
      const t = new Date();
      return (
        b.getMonth() < t.getMonth() ||
        (b.getMonth() === t.getMonth() && b.getDate() <= t.getDate())
      );
    },
  },
};
</script>

<style scoped lang="scss">
.dashboard {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  bottom: 0;
  overflow-x: hidden;
  background: white;
  overflow-y: auto;
  z-index: 5;
  padding-top: 20px;
  min-height: calc(100vh - 60px);
}

.db-wrap {
  padding: 1.25rem 1.5rem;
  width: 100%;
  max-width: none;
}

.db-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;

  .db-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .db-desc {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0.15rem 0 0;
  }
  .db-date {
    color: #94a3b8;
    font-size: 0.8rem;
  }
}

.db-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  .stat-info {
    display: flex;
    flex-direction: column;
  }
  .stat-num {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }
  .stat-lbl {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 0.1rem;
  }
  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #fff;
  }
}
.stat--total .stat-icon {
  background: #6366f1;
}
.stat--active .stat-icon {
  background: #10b981;
}
.stat--dept .stat-icon {
  background: #3b82f6;
}
.stat--bday .stat-icon {
  background: #f59e0b;
}

.db-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card-c {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
  &--f {
    grid-column: 1 / -1;
  }
  &__h {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.25rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    border-bottom: 1px solid #f8fafc;
    svg {
      color: #6366f1;
      font-size: 0.8rem;
    }
  }
  &__badge {
    margin-left: auto;
    background: #fef3c7;
    color: #92400e;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.5rem;
    border-radius: 20px;
  }
  &__b {
    flex: 1;
    min-height: 350px;
    width: 100%;
    height: 100%;
  }
}
.card-c--f .card-c__b {
  min-height: 400px;
}

.tbl-wrap {
  width: 100%;
  overflow-x: auto;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.825rem;
  thead th {
    text-align: left;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6366f1;
    background: #f8fafc;
    border-bottom: 2px solid #e0e7ff;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  tbody td {
    text-align: left;
    padding: 0.7rem 1.25rem;
    color: #1e293b;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover td {
    background: #f1f5f9;
  }
  tbody tr {
    transition: background 0.15s ease;
  }
}
.td-mono {
  font-family: monospace;
  font-size: 0.8rem;
  color: #94a3b8 !important;
}
.exp-wrap {
  text-align: center;
  padding: 0.7rem;
  border-top: 1px solid #f1f5f9;
}
.exp-btn {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.35rem 1.1rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}
.exp-btn:hover {
  background: #eef2ff;
  border-color: #6366f1;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.12);
}
.bdg {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  line-height: 1.3;
}
.ret-bdg {
  display: inline-block;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  line-height: 1.3;
  letter-spacing: 0.03em;
}
.empty-bday {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  padding: 2rem;
}

@media (max-width: 992px) {
  .db-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .db-charts {
    grid-template-columns: 1fr;
  }
  .db-wrap {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .db-stats {
    grid-template-columns: 1fr;
  }
  .db-wrap {
    padding: 1rem;
  }
  .db-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  .card-c__b {
    min-height: 240px;
  }
  .card-c--f .card-c__b {
    min-height: 260px;
  }
}
</style>
