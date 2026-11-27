<template>
  <div class="dashboard hr-dashboard hr-reference-final">
    <Loading v-if="loading"/>
    <div class="ref-workspace">
      <header class="ref-heading"><h1>Dashboard</h1><button type="button" class="ref-refresh" @click="fetchData" :disabled="loading"><font-awesome-icon icon="sync-alt"/> Refresh data</button><label class="ref-search"><font-awesome-icon icon="magnifying-glass"/><input v-model="search" placeholder="Search birthday or retirement records" aria-label="Search birthday or retirement records"/></label></header>
      <section class="ref-kpis">
        <article v-for="item in kpiItems" :key="item.key" class="ref-card ref-kpi"><span>{{item.label}}</span><div class="ref-kpi-value"><strong>{{item.value}}</strong><span class="ref-trend" :class="trendClass(item.key)" :title="comparisonDate ? 'Compared with '+comparisonDate : 'No previous data snapshot'"><span v-if="trend(item.key) !== null">{{trend(item.key)>0?'↗ +':trend(item.key)<0?'↘ ':'→ '}}{{trend(item.key).toFixed(1)}}%</span><span v-else>{{trendFromZero(item.key) ? "New" : "—"}}</span></span></div><small class="ref-trend-caption">{{comparisonDate ? 'vs '+comparisonDate : 'No prior comparison'}}</small></article>
      </section>
      <section class="ref-middle">
        <article class="ref-card"><h2>Employment status</h2><div class="ref-chart" ref="statusChart"></div></article>
        <article class="ref-card"><h2>Employees per department</h2><div class="ref-chart" ref="deptChart"></div></article>
        <article class="ref-card ref-summary"><h2>Workforce overview</h2><div v-for="item in [{label:'Average age',value:averageAge,icon:'user-clock'},{label:'Departments',value:departments.length,icon:'building'},{label:'Birthdays today',value:birthdayToday.length,icon:'cake-candles'},{label:'Upcoming retirement',value:upcomingRetirement.length,icon:'hourglass-half'}]" :key="item.label" class="ref-summary-row"><font-awesome-icon :icon="item.icon"/><span>{{item.label}}</span><strong>{{item.value}}</strong></div></article>
      </section>
      <section class="ref-pairs">
        <article class="ref-card"><h2>Age distribution</h2><div class="ref-chart" ref="ageChart"></div></article>
        <article class="ref-card"><h2>Birthdays Today <span class="ref-count">{{birthdayToday.length}}</span></h2><div class="ref-list"><table v-if="filteredToday.length"><thead><tr><th>Full name</th><th>Department</th><th>Age</th></tr></thead><tbody><tr v-for="e in filteredToday" :key="e.empid"><td><span class="ref-avatar">{{(e.fullname||'?').charAt(0)}}</span>{{e.fullname}}</td><td>{{e.deptdesc}}</td><td>{{e.age}}</td></tr></tbody></table><p v-else class="ref-empty">{{search ? 'No matching records' : 'No birthdays today'}}</p></div></article>
        <article class="ref-card"><h2>Gender distribution</h2><div class="ref-chart" ref="genderChart"></div></article>
        <article class="ref-card"><h2>Upcoming Retirement <span class="ref-count">{{upcomingRetirement.length}}</span></h2><div class="ref-list"><table v-if="filteredRetirement.length"><thead><tr><th>Full name</th><th>Department</th><th>Age</th><th>Age 65 date</th></tr></thead><tbody><tr v-for="e in filteredRetirement" :key="e.empid"><td><span class="ref-avatar">{{(e.fullname||'?').charAt(0)}}</span>{{e.fullname}}</td><td>{{e.deptdesc}}</td><td><span class="ref-age">{{e.age}}</span></td><td>{{formatDate(e.retirementDate)}}</td></tr></tbody></table><p v-else class="ref-empty">{{search ? 'No matching records' : 'No upcoming retirement records'}}</p></div></article>
        <article class="ref-card"><h2>Employees by employment type</h2><div class="ref-chart" ref="typeChart"></div></article>
        <article class="ref-card"><h2>Birthdays by month</h2><div class="ref-chart" ref="birthdayChart"></div></article>
      </section>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = [
  "#438bc4",
  "#a7d8f5",
  "#76bce8",
  "#cce9fa",
  "#65b5d8",
  "#83aee0",
  "#b8dcf4",
  "#e3f2fc",
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
      search: "",
      previousSnapshot: null,
      comparisonDate: "",
      fetchFailed: false,
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
    kpiItems() {
      return [{key:"employees",label:"Total employees",value:this.employees.length},{key:"departments",label:"Departments",value:this.departments.length},{key:"birthdays",label:"Birthdays today",value:this.birthdayToday.length},{key:"retirement",label:"Upcoming retirement",value:this.upcomingRetirement.length}];
    },
    upcomingRetirement() {
      const now = new Date();
      return this.retirees.map(e => {
        const b = new Date(e.birthdate);
        const date = new Date(b.getFullYear()+65,b.getMonth(),b.getDate());
        return {...e, retirementDate:date};
      }).filter(e=>e.retirementDate >= new Date(now.getFullYear(),now.getMonth(),now.getDate())).sort((a,b)=>a.retirementDate-b.retirementDate);
    },
    filteredToday() { return this.filterPeople(this.birthdayToday); },
    filteredRetirement() { return this.filterPeople(this.upcomingRetirement); },
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
    trend(key) {
      if (!this.previousSnapshot || this.fetchFailed) return null;
      const previous=this.previousSnapshot.values[key];
      const current=this.kpiItems.find(i=>i.key===key).value;
      if (!Number.isFinite(previous) || previous===0) return previous===0 && current===0 ? 0 : null;
      return (current-previous)/previous*100;
    },
    trendFromZero(key) {
      return !this.fetchFailed && this.previousSnapshot && this.previousSnapshot.values[key]===0 && this.kpiItems.find(i=>i.key===key).value>0;
    },
    trendClass(key) {
      if(this.trendFromZero(key)) return "higher";
      const n=this.trend(key);
      return n===null || n===0 ? "neutral" : n>0 ? "higher" : "lower";
    },
    saveComparisonSnapshot() {
      if (this.fetchFailed) return;
      try {
        const key="hrms-dashboard-daily-v1";
        const stored=JSON.parse(localStorage.getItem(key)||"{}");
        const values=this.kpiItems.reduce((o,i)=>{o[i.key]=i.value;return o;},{});
        let latest=stored.latest;
        if(!latest) {
          const prior=Object.keys(stored).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
          if(prior) latest={values:stored[prior],at:prior};
        }
        const changed=latest && Object.keys(values).some(k=>values[k]!==latest.values[k]);
        const baseline=changed ? latest : stored.baseline || null;
        const current=(!latest || changed) ? {values,at:new Date().toISOString()} : latest;
        this.previousSnapshot=baseline;
        this.comparisonDate=baseline ? new Date(baseline.at).toLocaleString() : "";
        localStorage.setItem(key,JSON.stringify({latest:current,baseline}));
      } catch(e) { this.previousSnapshot=null; this.comparisonDate=""; }
    },
    filterPeople(rows) {
      const q=this.search.trim().toLowerCase();
      return rows.filter(e=>[e.fullname,e.deptdesc,e.empno].some(v=>String(v||"").toLowerCase().includes(q)));
    },
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
      this.fetchFailed = false;
      try {
        await Promise.all([this.fetchEmployees(), this.fetchDepartments()]);
        this.$nextTick(() => {
          this.processBirthdays();
          this.saveComparisonSnapshot();
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
        else { this.fetchFailed = true; this.employees = []; }
      } catch (e) {
        this.fetchFailed = true;
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
        const payload=res.data;
        if(Array.isArray(payload)) this.departments=payload;
        else if(payload && Array.isArray(payload.data)) this.departments=payload.data;
        else if(payload && Array.isArray(payload.items)) this.departments=payload.items;
        else {this.fetchFailed=true;this.departments=[];}
      } catch (e) {
        this.fetchFailed = true;
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
          borderColor: "#dcecf7",
          borderWidth: 1,
          padding: [10, 14],
          textStyle: { color: "#294b65", fontSize: 12 },
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
        const category={type:"category",data:labels,axisTick:{show:false},axisLabel:{color:"#668398",interval:0,overflow:"truncate",width:100},axisLine:{lineStyle:{color:"#e1edf6"}}};
        const value={type:"value",minInterval:1,splitLine:{lineStyle:{color:"#e1edf6"}}};
        chart.setOption({...this.chartBaseOption(),tooltip:{trigger:"axis",axisPointer:{type:"shadow"}},grid:{left:12,right:24,top:20,bottom:12,containLabel:true},xAxis:horizontal?value:category,yAxis:horizontal?{...category,inverse:true}:value,series:[{type:"bar",data:values,barMaxWidth:36,itemStyle:{color,borderRadius:horizontal?[0,5,5,0]:[5,5,0,0]}}]});
      };
      bar("ageChart",groups,counts,"#438bc4");
      bar("typeChart",types,types.map(k=>map[k]),"#65b5d8",true);
      const chart=this.initChart("birthdayChart");
      if(chart)chart.setOption({...this.chartBaseOption(),tooltip:{trigger:"axis"},grid:{left:12,right:20,top:20,bottom:12,containLabel:true},xAxis:{type:"category",data:months,axisLabel:{color:"#668398"}},yAxis:{type:"value",minInterval:1,splitLine:{lineStyle:{color:"#e1edf6"}}},series:[{type:"line",data:birthdays,smooth:true,symbolSize:6,lineStyle:{color:"#438bc4",width:3},itemStyle:{color:"#438bc4"},areaStyle:{color:"#d9effc"}}]});
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
          textStyle: { fontSize: 11, color: "#6c879c", fontWeight: 600 },
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
              color: "#34556f",
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
                color: "#438bc4",
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
                  fill: "#203f59",
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
                  fill: "#8ba3b5",
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
                  ["#438bc4", "#bda3ff", "#efe8ff"][i] ||
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
        labels = sorted.filter(Boolean),
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
        dataZoom: labels.length > 8 ? [{type:"inside",startValue:0,endValue:7},{type:"slider",height:12,bottom:2,startValue:0,endValue:7}] : [],
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
                color: i % 2 ? "#cce9fa" : "#76bce8",
                barBorderRadius: [5, 5, 0, 0],
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
.hr-reference-final{position:static!important;inset:auto!important;transform:none!important;width:100%!important;max-width:none!important;height:auto!important;max-height:none!important;overflow:visible!important;background:#f0f8ff!important}
.ref-workspace{width:100%;padding:24px;box-sizing:border-box;color:#20202b;font-family:font_R,"Segoe UI",sans-serif}
.ref-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}
.ref-heading h1{font-size:24px;font-weight:750;margin:0}
.ref-search{display:flex;align-items:center;gap:10px;background:#fff;border-radius:24px;padding:9px 16px;width: min(45%,460px);color:#9693a5;margin:0}
.ref-search input{border:0;outline:0;width:100%;font:inherit;font-size:12px;background:transparent}
.ref-kpis,.ref-middle,.ref-pairs{display:grid;gap:18px;margin-bottom:18px}
.ref-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}
.ref-middle{grid-template-columns:minmax(0,1fr) minmax(0,2.15fr) minmax(0,1fr)}
.ref-pairs{grid-template-columns:repeat(2,minmax(0,1fr))}
.ref-card{background:white;border-radius:20px;padding:20px;min-width:0}
.ref-kpi{padding:20px 24px;display:flex;flex-direction:column;gap:8px}
.ref-kpi span{font-size:13px;font-weight:600}
.ref-kpi strong{font-size:30px;line-height:1.15}
.ref-card h2{font-size:16px;font-weight:750;margin:0 0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.ref-chart{height:240px;width:100%}
.ref-summary-row{display:flex;align-items:center;gap:10px;padding:15px 0;border-bottom:1px solid #eaf3fa;font-size:12px}
.ref-summary-row:last-child{border:0}
.ref-summary-row svg{color:#9898a8}
.ref-summary-row strong{margin-left:auto;font-size:14px}
.ref-count{font-size:12px;color:#438bc4;background:#e5f3fd;padding:4px 9px;border-radius:12px}
.ref-list{max-height:240px;overflow:auto}
.ref-list table{width:100%;border-collapse:collapse;font-size:12px;text-align:left}
.ref-list th{color:#858596;font-weight:500;padding:10px 6px}
.ref-list td{padding:10px 6px;border-top:1px solid #eaf3fa}
.ref-avatar{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#e5f3fd;color:#438bc4;margin-right:8px;font-weight:700}
.ref-empty{padding:40px 0;text-align:center;color:#858596;font-size:13px}
@media(max-width:1100px){.ref-middle{grid-template-columns:repeat(2,minmax(0,1fr))}.ref-middle>article:nth-child(2){grid-column:span 1}.ref-summary{grid-column:1/-1}}
@media(max-width:650px){.ref-workspace{padding:14px}.ref-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.ref-middle,.ref-pairs{grid-template-columns:1fr}.ref-heading{flex-wrap:wrap}.ref-search{width:100%}.ref-card{padding:16px}.ref-chart{height:250px}}
.ref-kpi-value{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ref-kpi .ref-trend{font-size:12px;font-weight:700;white-space:nowrap}
.ref-trend.higher{color:#00a889}.ref-trend.lower{color:#e34b55}.ref-trend.neutral{color:#9693a5}
.ref-trend-caption{font-size:10px;color:#9693a5}
.ref-age{display:inline-block;padding:3px 8px;background:#e5f3fd;color:#438bc4;border-radius:8px;font-weight:700}
.ref-refresh{margin-left:auto;border:1px solid #dcecf7;background:white;color:#438bc4;border-radius:20px;padding:8px 14px;font-size:12px;white-space:nowrap}.ref-refresh:disabled{opacity:.5}
</style>