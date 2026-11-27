<template>
  <div class="dashboard hr-dashboard hr-chart-workspace">
    <Loading v-if="loading" />
    <div class="analytics-wrap">
      <header class="analytics-heading"><div><h1>Dashboard</h1><p>Workforce analytics</p></div><span>{{ currentDate }}</span></header>
      <section class="analytics-kpis">
        <article v-for="item in [{label:'Employees',value:employees.length,icon:'users'},{label:'Departments',value:departments.length,icon:'building'},{label:'Average age',value:averageAge,icon:'user-clock'},{label:'Retirement watch',value:retirees.length,icon:'hourglass-half'}]" :key="item.label" class="analytics-card analytics-kpi">
          <div><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div><div class="analytics-icon"><font-awesome-icon :icon="item.icon"/></div>
        </article>
      </section>
      <section class="analytics-grid">
        <article class="analytics-card analytics-wide"><h2>Employees per department</h2><div class="analytics-chart" ref="deptChart"></div></article>
        <article class="analytics-card"><h2>Employment status</h2><div class="analytics-chart" ref="statusChart"></div></article>
        <article class="analytics-card"><h2>Gender distribution</h2><div class="analytics-chart" ref="genderChart"></div></article>
        <article class="analytics-card"><h2>Age distribution</h2><div class="analytics-chart" ref="ageChart"></div></article>
        <article class="analytics-card"><h2>Employees by employment type</h2><div class="analytics-chart" ref="typeChart"></div></article>
        <article class="analytics-card analytics-wide"><h2>Birthdays by month</h2><div class="analytics-chart" ref="birthdayChart"></div></article>
      </section>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = [
  "#6925e8",
  "#b89afa",
  "#f47746",
  "#ffb29a",
  "#44baa0",
  "#8292e7",
  "#c5afe8",
  "#eadfff",
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
  mounted() { window.addEventListener("resize", this.resizeCharts); },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeCharts);
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
    goEmployees() {
      this.$router.push("/employees");
    },
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([this.fetchEmployees(), this.fetchDepartments()]);
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
        textStyle: { fontFamily: "Segoe UI, Arial, sans-serif" },
        tooltip: {
          backgroundColor: "#fff",
          borderColor: "#e9e3f3",
          borderWidth: 1,
          padding: [10, 14],
          textStyle: { color: "#362c48", fontSize: 12 },
          extraCssText:
            "box-shadow:0 10px 30px rgba(15,64,120,.12);border-radius:10px;",
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
      this.buildAdditionalCharts();
      this.$nextTick(() => this.resizeCharts());
    },
    resizeCharts() {
      this.charts.forEach((c) => {
        try {
          c.resize();
        } catch (e) {}
      });
    },
    buildAdditionalCharts() {
      const ages = this.employees.map(e => this.calcAge(e.birthdate)).filter(a => a > 0 && a < 120);
      const groups = ["Under 25","25–34","35–44","45–54","55–59","60+"];
      const counts = [0,0,0,0,0,0];
      ages.forEach(a => counts[a<25?0:a<35?1:a<45?2:a<55?3:a<60?4:5]++);
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const birthdays = Array(12).fill(0);
      this.employees.forEach(e => { if (!e.birthdate) return; const d = new Date(e.birthdate); if (!Number.isNaN(d.getTime())) birthdays[d.getMonth()]++; });
      const map = this.countBy(this.employees, e => e.EmploymentStatus || "Unknown");
      const types = Object.keys(map).sort((a,b)=>map[b]-map[a]);
      const bar = (ref, labels, values, color, horizontal=false) => {
        const chart=this.initChart(ref); if(!chart)return;
        const category={type:"category",data:labels,axisTick:{show:false},axisLabel:{color:"#77788a",interval:0,overflow:"truncate",width:100},axisLine:{lineStyle:{color:"#eeedf4"}}};
        const value={type:"value",minInterval:1,splitLine:{lineStyle:{color:"#eeedf4"}}};
        chart.setOption({...this.chartBaseOption(),tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},grid:{left:12,right:24,top:20,bottom:12,containLabel:true},xAxis:horizontal?value:category,yAxis:horizontal?{...category,inverse:true}:value,series:[{type:"bar",data:values,barMaxWidth:36,itemStyle:{color,borderRadius:horizontal?[0,5,5,0]:[5,5,0,0]}}]});
      };
      bar("ageChart",groups,counts,"#6925e8");
      bar("typeChart",types,types.map(k=>map[k]),"#44baa0",true);
      const chart=this.initChart("birthdayChart");
      if(chart)chart.setOption({...this.chartBaseOption(),tooltip:{trigger:"axis"},grid:{left:12,right:20,top:20,bottom:12,containLabel:true},xAxis:{type:"category",data:months,axisLabel:{color:"#77788a"}},yAxis:{type:"value",minInterval:1,splitLine:{lineStyle:{color:"#eeedf4"}}},series:[{type:"line",data:birthdays,smooth:true,symbolSize:6,lineStyle:{color:"#6925e8",width:3},itemStyle:{color:"#6925e8"},areaStyle:{color:"#e9ddff"}}]});
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
          bottom: 8,
          left: "center",
          width: "90%",
          textStyle: { fontSize: 11, color: "#817891", fontWeight: 600 },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 14,
        },
        series: [
          {
            type: "pie",
            radius: ["55%", "76%"],
            center: ["50%", "45%"],
            itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 4 },
            label: {
              show: true,
              formatter: "{d}%",
              fontSize: 11,
              fontWeight: 800,
              color: "#483e60",
            },
            labelLine: {
              length: 8,
              length2: 6,
              lineStyle: { color: "#93b4d8" },
            },
            emphasis: {
              scale: true,
              scaleSize: 5,
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 800,
                color: "#6925e8",
              },
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
            top: "41%",
            children: [
              {
                type: "text",
                left: "center",
                top: -10,
                style: {
                  text: `${total}`,
                  fill: "#282037",
                  fontSize: 30,
                  fontWeight: 800,
                  textAlign: "center",
                },
              },
              {
                type: "text",
                left: "center",
                top: 25,
                style: {
                  text: "EMPLOYEES",
                  fill: "#a098b3",
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
          bottom: 8,
          left: "center",
          textStyle: { fontSize: 11, color: "#55708f", fontWeight: 600 },
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 18,
        },
        series: [
          {
            type: "pie",
            radius: ["55%", "76%"],
            center: ["50%", "45%"],
            itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 4 },
            label: {
              show: true,
              formatter: "{b}\n{d}%",
              fontSize: 11,
              fontWeight: 800,
              color: "#234a78",
              lineHeight: 16,
            },
            labelLine: {
              length: 8,
              length2: 6,
              lineStyle: { color: "#93b4d8" },
            },
            emphasis: {
              scale: true,
              scaleSize: 5,
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 800,
                color: "#0b5ed7",
              },
            },
            data: keys.map((k, i) => ({
              name: k,
              value: map[k],
              itemStyle: {
                color:
                  ["#6925e8", "#bda3ff", "#efe8ff"][i] ||
                  palette[i % palette.length],
              },
            })),
          },
        ],
        graphic: [
          {
            type: "group",
            left: "center",
            top: "41%",
            children: [
              {
                type: "text",
                left: "center",
                top: -10,
                style: {
                  text: `${total}`,
                  fill: "#123b6d",
                  fontSize: 30,
                  fontWeight: 800,
                  textAlign: "center",
                },
              },
              {
                type: "text",
                left: "center",
                top: 25,
                style: {
                  text: "EMPLOYEES",
                  fill: "#7a94b0",
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
        labels = sorted.slice(0, 12),
        vals = labels.map((d) => empMap[d] || 0),
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
          top: "5%",
          bottom: "18%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: {
            color: "#8e879a",
            fontSize: 10,
            interval: 0,
            rotate: labels.length > 8 ? 28 : 0,
          },
          axisLine: { lineStyle: { color: "#ebe5f2" } },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: { color: "#97909e", fontSize: 10 },
          splitLine: { lineStyle: { color: "#f1edf7" } },
          axisLine: { show: false },
        },
        series: [
          {
            type: "bar",
            data: vals.map((v, i) => ({
              value: v,
              itemStyle: {
                color: palette[i % palette.length],
                borderRadius: [7, 7, 0, 0],
              },
            })),
            barMaxWidth: 42,
            showBackground: true,
            backgroundStyle: { color: "#f6f2fb", borderRadius: [7, 7, 0, 0] },
            label: {
              show: true,
              position: "top",
              color: "#756989",
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
<style scoped>
.hr-chart-workspace{position:static!important;inset:auto!important;transform:none!important;width:100%!important;max-width:none!important;height:auto!important;max-height:none!important;overflow:visible!important;background:#f6f7fb!important}
.analytics-wrap{width:100%;box-sizing:border-box;padding:24px}
.analytics-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;color:#77788a;font-size:12px}
.analytics-heading h1{font-size:26px;font-weight:750;color:#242433;margin:0}
.analytics-heading p{margin:4px 0 0}
.analytics-kpis,.analytics-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:16px}
.analytics-card{min-width:0;background:#fff;border:1px solid #eeedf4;border-radius:14px;padding:18px}
.analytics-kpi{display:flex;justify-content:space-between;align-items:center}
.analytics-kpi span{display:block;color:#77788a;font-size:12px}
.analytics-kpi strong{display:block;font-size:29px;color:#242433;margin-top:8px}
.analytics-icon{display:grid;place-items:center;width:42px;height:42px;background:#f0eaff;color:#6925e8;border-radius:12px}
.analytics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.analytics-wide{grid-column:1/-1}
.analytics-card h2{font-size:15px;color:#343442;font-weight:700;margin:0 0 12px}
.analytics-chart{height:280px;width:100%}
.analytics-wide .analytics-chart{height:320px}
@media(min-width:1500px){.analytics-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.analytics-wide{grid-column:span 4}}
@media(max-width:900px){.analytics-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.analytics-wrap{padding:14px}.analytics-grid{grid-template-columns:1fr}.analytics-wide{grid-column:auto}.analytics-card{padding:12px}.analytics-chart{height:260px}.analytics-heading{gap:12px}}
</style>