<template>
  <div class="dashboard">
    <Loading v-if="loading" />
    <div class="db-wrap">
      <div class="db-top">
        <div class="db-heading">
          <div class="db-kicker"><span class="db-kicker-dot"></span> HUMAN RESOURCE MANAGEMENT SYSTEM</div>
          <h2 class="db-title">HR Dashboard</h2>
          <p class="db-desc">A real-time overview of your workforce and employee records</p>
        </div>
        <div class="db-date"><font-awesome-icon icon="calendar-alt" /> {{ currentDate }}</div>
      </div>

      <div class="db-stats">
        <div class="stat stat--total">
          <div class="stat-info"><span class="stat-label-top">WORKFORCE</span><span class="stat-num">{{ employees.length }}</span><span class="stat-lbl">Total Employees</span></div>
          <div class="stat-icon"><font-awesome-icon icon="users" /></div>
        </div>
        <div class="stat stat--active">
          <div class="stat-info"><span class="stat-label-top">CURRENT</span><span class="stat-num">{{ activeCount }}</span><span class="stat-lbl">Active Employees</span></div>
          <div class="stat-icon"><font-awesome-icon icon="user-check" /></div>
        </div>
        <div class="stat stat--dept">
          <div class="stat-info"><span class="stat-label-top">ORGANIZATION</span><span class="stat-num">{{ departments.length }}</span><span class="stat-lbl">Departments</span></div>
          <div class="stat-icon"><font-awesome-icon icon="building" /></div>
        </div>
        <div class="stat stat--bday">
          <div class="stat-info"><span class="stat-label-top">TODAY</span><span class="stat-num">{{ birthdayToday.length }}</span><span class="stat-lbl">Birthdays</span></div>
          <div class="stat-icon"><font-awesome-icon icon="cake-candles" /></div>
        </div>
      </div>

      <div class="db-charts">
        <div class="card-c chart-card">
          <div class="card-c__h"><div class="card-title-icon"><font-awesome-icon icon="briefcase" /></div><div><span class="card-title">Employment Status</span><small>Workforce composition</small></div></div>
          <div class="card-c__b" ref="statusChart"></div>
        </div>
        <div class="card-c chart-card">
          <div class="card-c__h"><div class="card-title-icon"><font-awesome-icon icon="venus-mars" /></div><div><span class="card-title">Gender Distribution</span><small>Employee demographics</small></div></div>
          <div class="card-c__b" ref="genderChart"></div>
        </div>
      </div>

      <div class="card-c card-c--f chart-card dept-card">
        <div class="card-c__h"><div class="card-title-icon"><font-awesome-icon icon="chart-bar" /></div><div><span class="card-title">Employees per Department</span><small>Workforce distribution across offices and departments</small></div></div>
        <div class="card-c__b" ref="deptChart"></div>
      </div>

      <div class="card-c card-c--f data-card">
        <div class="card-c__h"><div class="card-title-icon"><font-awesome-icon icon="gift" /></div><div><span class="card-title">Birthday Today</span><small>Employees celebrating today</small></div><span class="card-c__badge">{{ birthdayToday.length }}</span></div>
        <div class="card-c__b card-table-body">
          <div v-if="birthdayToday.length > 0" class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Position</th><th>Birthday</th><th>Age</th></tr></thead><tbody><tr v-for="emp in birthdayToday" :key="emp.empid"><td class="td-mono">{{ emp.empno }}</td><td><strong>{{ emp.fullname }}</strong></td><td>{{ emp.deptdesc }}</td><td>{{ emp.position_desc }}</td><td><span class="bdg">{{ formatDate(emp.birthdate) }}</span></td><td>{{ emp.age }}</td></tr></tbody></table></div>
          <div v-else class="empty-bday"><font-awesome-icon icon="cake-candles" /><strong>No birthdays today</strong><span>There are no employee birthdays for today.</span></div>
        </div>
      </div>

      <div class="card-c card-c--f data-card">
        <div class="card-c__h"><div class="card-title-icon"><font-awesome-icon icon="clock" /></div><div><span class="card-title">Retirement Watch</span><small>Employees approaching or at retirement age</small></div><span class="card-c__badge">{{ retirees.length }}</span></div>
        <div class="card-c__b card-table-body">
          <div v-if="retirees.length > 0" class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Department</th><th>Age</th><th>Birthday</th><th>Status</th></tr></thead><tbody><tr v-for="emp in displayRetirees" :key="emp.empid"><td><strong>{{ emp.fullname }}</strong></td><td>{{ emp.deptdesc }}</td><td><span class="age-pill">{{ emp.age }}</span></td><td><span class="bdg">{{ formatMonthDay(emp.birthdate) }}</span></td><td><span v-if="emp.age > 64 && isDatePassed(emp.birthdate)" class="ret-bdg">RETIRED</span><span v-else class="ready-bdg">RETIREMENT WATCH</span></td></tr></tbody></table><div v-if="retirees.length > retireesLimit" class="exp-wrap"><button class="exp-btn" @click="retireesExpanded = !retireesExpanded"><font-awesome-icon :icon="retireesExpanded ? 'chevron-up' : 'chevron-down'" /> {{ retireesExpanded ? 'Show Less' : `Show All (${retirees.length})` }}</button></div></div>
          <div v-else class="empty-bday"><font-awesome-icon icon="clock" /><strong>No permanent employees at retirement age</strong><span>There are currently no employees in the retirement watch list.</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = ["#0b5ed7", "#1677ff", "#2563eb", "#3b82f6", "#1d4ed8", "#60a5fa", "#075985", "#0284c7", "#38bdf8", "#1e40af", "#2563eb", "#93c5fd"];

export default {
  components: { Loading },
  head() { return { meta: [{ hid: "description", name: "description", content: "Dashboard" }] }; },
  data() { return { loading: true, employees: [], departments: [], birthdayToday: [], currentDate: "", retireesLimit: 10, retireesExpanded: false }; },
  computed: {
    activeCount() { return this.employees.filter((e) => !e.isseparated && e.EmploymentStatus).length; },
    retirees() {
      return this.employees.filter((e) => { if (e.EmploymentStatus !== "Permanent" && e.EmploymentStatus !== "Co-terminous" && e.EmploymentStatus !== "Casual") return false; const age = this.calcAge(e.birthdate); return age >= 60 && age <= 65; }).map((e) => ({ ...e, age: this.calcAge(e.birthdate) })).sort((a, b) => { if (a.age !== b.age) return b.age - a.age; const da = new Date(a.birthdate); const db = new Date(b.birthdate); return da.getMonth() - db.getMonth() || da.getDate() - db.getDate(); });
    },
    displayRetirees() { return this.retireesExpanded ? this.retirees : this.retirees.slice(0, this.retireesLimit); },
  },
  created() {
    const d = new Date(); const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    this.currentDate = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; this.fetchData();
  },
  methods: {
    async fetchData() { this.loading = true; try { await Promise.all([this.fetchEmployees(), this.fetchDepartments()]); this.$nextTick(() => { this.buildCharts(); this.processBirthdays(); }); } catch (e) { console.error("Dashboard fetch error:", e); } finally { this.loading = false; } },
    async fetchEmployees() { try { const res = await axios({ method: "GET", url: `${this.$axios.defaults.baseURL}/employees/get-all`, params: { text: "", IsSeparated: 0 } }); const payload = res.data; if (Array.isArray(payload)) this.employees = payload; else if (payload && Array.isArray(payload.data)) this.employees = payload.data; else if (payload && Array.isArray(payload.items)) this.employees = payload.items; else this.employees = []; } catch (e) { console.error("Error fetching employees:", e); this.employees = []; } },
    async fetchDepartments() { try { const res = await axios({ method: "GET", url: `${this.$axios.defaults.baseURL}/file-maintenance/department/get-all` }); this.departments = res.data || []; } catch (e) { console.error("Error fetching departments:", e); this.departments = []; } },
    buildCharts() { this.buildStatusChart(); this.buildGenderChart(); this.buildDeptChart(); },
    buildStatusChart() {
      const map = {}; this.employees.forEach((e) => { const s = e.EmploymentStatus || "Unknown"; map[s] = (map[s] || 0) + 1; }); const keys = Object.keys(map); const vals = Object.values(map); const colors = palette.slice(0, keys.length); const total = vals.reduce((a,b) => a+b, 0); const chart = echarts.init(this.$refs.statusChart);
      chart.setOption({ animationDuration: 900, animationEasing: "cubicOut", tooltip: { trigger: "item", formatter: (p) => `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`, backgroundColor: "#ffffff", borderColor: "#dbeafe", borderWidth: 1, padding: [10,14], textStyle: { color: "#17345f", fontSize: 12 }, extraCssText: "box-shadow:0 10px 30px rgba(15,64,120,.12);border-radius:10px;" }, legend: { bottom: 8, left: "center", width: "90%", textStyle: { fontSize: 11, color: "#55708f", fontWeight: 600 }, icon: "circle", itemWidth: 8, itemHeight: 8, itemGap: 14 }, series: [{ type: "pie", radius: ["55%", "76%"], center: ["50%", "46%"], avoidLabelOverlap: true, itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 4 }, label: { show: true, formatter: "{d}%", fontSize: 11, fontWeight: 800, color: "#234a78" }, labelLine: { length: 8, length2: 6, lineStyle: { color: "#93b4d8" } }, emphasis: { scale: true, scaleSize: 5, label: { show: true, fontSize: 14, fontWeight: 800, color: "#0b5ed7" }, itemStyle: { shadowBlur: 24, shadowColor: "rgba(11,94,215,.25)" } }, data: keys.map((k,i) => ({ name:k, value:vals[i], itemStyle:{ color:colors[i] } })) }], graphic: [{ type:"group", left:"center", top:"42%", children:[{ type:"text", left:"center", top:-10, style:{ text:`${total}`, fill:"#123b6d", fontSize:30, fontWeight:800, textAlign:"center" } },{ type:"text", left:"center", top:25, style:{ text:"EMPLOYEES", fill:"#7a94b0", fontSize:9, fontWeight:700, textAlign:"center", letterSpacing:1 } }] }] });
      window.addEventListener("resize", () => chart.resize());
    },
    buildGenderChart() {
      const map = {}; this.employees.forEach((e) => { const g = e.genderdesc || "Unknown"; map[g] = (map[g] || 0) + 1; }); const keys = Object.keys(map); const vals = Object.values(map); const colors = ["#0b5ed7", "#60a5fa", "#bfdbfe"]; const total = vals.reduce((a,b) => a+b, 0); const chart = echarts.init(this.$refs.genderChart);
      chart.setOption({ animationDuration:900, animationEasing:"cubicOut", tooltip:{ trigger:"item", formatter:(p) => `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`, backgroundColor:"#fff", borderColor:"#dbeafe", borderWidth:1, padding:[10,14], textStyle:{color:"#17345f",fontSize:12}, extraCssText:"box-shadow:0 10px 30px rgba(15,64,120,.12);border-radius:10px;" }, legend:{bottom:8,left:"center",textStyle:{fontSize:11,color:"#55708f",fontWeight:600},icon:"circle",itemWidth:8,itemHeight:8,itemGap:18}, series:[{ type:"pie", radius:["55%","76%"], center:["50%","46%"], itemStyle:{borderRadius:8,borderColor:"#fff",borderWidth:4}, label:{show:true,formatter:"{b}\n{d}%",fontSize:11,fontWeight:800,color:"#234a78",lineHeight:16}, labelLine:{length:8,length2:6,lineStyle:{color:"#93b4d8"}}, emphasis:{scale:true,scaleSize:5,label:{show:true,fontSize:13,fontWeight:800,color:"#0b5ed7"},itemStyle:{shadowBlur:24,shadowColor:"rgba(11,94,215,.25)"}}, data:keys.map((k,i)=>({name:k,value:vals[i],itemStyle:{color:colors[i] || palette[i % palette.length]}})) }], graphic:[{type:"group",left:"center",top:"42%",children:[{type:"text",left:"center",top:-10,style:{text:`${total}`,fill:"#123b6d",fontSize:30,fontWeight:800,textAlign:"center"}},{type:"text",left:"center",top:25,style:{text:"EMPLOYEES",fill:"#7a94b0",fontSize:9,fontWeight:700,textAlign:"center",letterSpacing:1}}]}] });
      window.addEventListener("resize", () => chart.resize());
    },
    buildDeptChart() {
      const empMap = {}; this.employees.forEach((e) => { const d = e.deptdesc || "Unknown"; empMap[d] = (empMap[d] || 0) + 1; });
      const allDepts = this.departments.length > 0 ? [...new Set([...this.departments.map((d) => d.deptdesc), ...Object.keys(empMap)])] : Object.keys(empMap);
      const sorted = allDepts.sort((a,b) => (empMap[a] || 0) - (empMap[b] || 0)); const labels = sorted; const vals = sorted.map((d) => empMap[d] || 0); const chart = echarts.init(this.$refs.deptChart);
      chart.setOption({ animationDuration:900, animationEasing:"cubicOut", tooltip:{trigger:"axis",axisPointer:{type:"shadow",shadowStyle:{color:"rgba(37,99,235,.05)"}},backgroundColor:"#fff",borderColor:"#dbeafe",borderWidth:1,padding:[10,14],textStyle:{color:"#17345f",fontSize:12},extraCssText:"box-shadow:0 10px 30px rgba(15,64,120,.12);border-radius:10px;"}, grid:{left:"2%",right:"6%",bottom:"4%",top:"3%",containLabel:true}, xAxis:{type:"value",minInterval:1,axisLabel:{fontSize:11,color:"#7893ae",fontWeight:600},axisLine:{show:false},axisTick:{show:false},splitLine:{lineStyle:{color:"#e8f1fa",type:"dashed"}}}, yAxis:{type:"category",data:labels,axisLabel:{fontSize:11,color:"#35597e",fontWeight:600,width:180,overflow:"truncate"},axisLine:{show:false},axisTick:{show:false}}, series:[{type:"bar",barMaxWidth:24,barMinHeight:4,showBackground:true,backgroundStyle:{color:"#f1f6fc",borderRadius:[0,8,8,0]},data:vals.map((v,i)=>({value:v,itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#0b5ed7"},{offset:1,color:"#60a5fa"}]},borderRadius:[0,8,8,0],shadowBlur:8,shadowColor:"rgba(11,94,215,.12)"}})),label:{show:true,position:"right",formatter:(p)=>`${p.value}`,fontSize:12,fontWeight:800,color:"#164a7b"},emphasis:{itemStyle:{shadowBlur:14,shadowColor:"rgba(11,94,215,.2)"}}}] });
      window.addEventListener("resize", () => chart.resize());
    },
    processBirthdays() { const now = new Date(); const m = now.getMonth()+1; const d = now.getDate(); this.birthdayToday = this.employees.filter((e)=>{if(!e.birthdate)return false;const b=new Date(e.birthdate);return b.getMonth()+1===m&&b.getDate()===d;}).map((e)=>({...e,age:this.calcAge(e.birthdate)})).sort((a,b)=>a.fullname.localeCompare(b.fullname)); },
    calcAge(bd) { if(!bd)return "—"; const b=new Date(bd); const t=new Date(); let age=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))age--; return age; },
    formatDate(date) { if(!date)return "—"; const d=new Date(date); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; },
    formatMonthDay(date) { if(!date)return "—"; const d=new Date(date); const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`; },
    isDatePassed(date) { if(!date)return false; const b=new Date(date); const t=new Date(); return b.getMonth()<t.getMonth()||(b.getMonth()===t.getMonth()&&b.getDate()<=t.getDate()); },
  },
};
</script>

<style scoped lang="scss">
.dashboard{position:fixed;top:40px;left:50%;transform:translateX(-50%);width:90vw;bottom:0;overflow-x:hidden;background:#f4f8fd;z-index:5;padding-top:20px;min-height:calc(100vh - 60px);scrollbar-width:none;-ms-overflow-style:none;color:#17345f}.dashboard::-webkit-scrollbar{width:0;height:0;display:none}.db-wrap{padding:1.4rem 1.6rem 2.5rem;width:100%;max-width:1480px;margin:0 auto}.db-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding:1.5rem 1.7rem;background:linear-gradient(135deg,#0752b5 0%,#0b5ed7 52%,#2484ee 100%);border-radius:20px;box-shadow:0 16px 38px rgba(11,94,215,.18);color:#fff;position:relative;overflow:hidden}.db-top:after{content:"";position:absolute;width:300px;height:300px;border-radius:50%;right:-90px;top:-180px;background:rgba(255,255,255,.09)}.db-heading{position:relative;z-index:1}.db-kicker{font-size:.62rem;font-weight:800;letter-spacing:.14em;opacity:.78;margin-bottom:.35rem}.db-kicker-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#bfdbfe;margin-right:6px;vertical-align:1px}.db-title{font-size:1.75rem;font-weight:800;margin:0;letter-spacing:-.04em}.db-desc{font-size:.82rem;margin:.25rem 0 0;color:#dbeafe}.db-date{position:relative;z-index:1;display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18);padding:.6rem .85rem;border-radius:10px;font-size:.75rem;font-weight:700;white-space:nowrap}.db-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1rem}.stat{position:relative;background:#fff;border:1px solid #e2edf8;border-radius:16px;padding:1.15rem 1.25rem;display:flex;justify-content:space-between;align-items:center;min-height:120px;box-shadow:0 6px 20px rgba(22,74,125,.055);overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}.stat:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#0b5ed7}.stat:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(22,74,125,.11)}.stat-info{display:flex;flex-direction:column}.stat-label-top{font-size:.58rem;letter-spacing:.12em;font-weight:800;color:#91a9c0;margin-bottom:.25rem}.stat-num{font-size:2rem;font-weight:800;color:#123b6d;line-height:1.05;letter-spacing:-.05em}.stat-lbl{font-size:.72rem;color:#7893ae;margin-top:.3rem;font-weight:600}.stat-icon{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.05rem;box-shadow:0 10px 20px rgba(11,94,215,.18)}.stat--total:before{background:#0b5ed7}.stat--total .stat-icon{background:linear-gradient(135deg,#0752b5,#2484ee)}.stat--active:before{background:#1677ff}.stat--active .stat-icon{background:linear-gradient(135deg,#1264d9,#4da0ff)}.stat--dept:before{background:#0284c7}.stat--dept .stat-icon{background:linear-gradient(135deg,#0369a1,#38bdf8)}.stat--bday:before{background:#2563eb}.stat--bday .stat-icon{background:linear-gradient(135deg,#1d4ed8,#60a5fa)}.db-charts{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.card-c{background:#fff;border:1px solid #e0ebf6;border-radius:16px;box-shadow:0 6px 20px rgba(22,74,125,.05);overflow:hidden;display:flex;flex-direction:column;margin-bottom:1rem}.card-c--f{grid-column:1/-1}.card-c__h{display:flex;align-items:center;gap:.7rem;padding:1rem 1.15rem;border-bottom:1px solid #edf3f9;background:linear-gradient(180deg,#fff,#fafdff)}.card-title-icon{width:34px;height:34px;min-width:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#eaf3ff;color:#0b5ed7;font-size:.82rem}.card-title{display:block;color:#173f6d;font-size:.82rem;font-weight:800;letter-spacing:-.01em}.card-c__h small{display:block;color:#8aa2ba;font-size:.65rem;margin-top:2px;font-weight:500}.card-c__badge{margin-left:auto;min-width:30px;text-align:center;padding:.28rem .55rem;border-radius:8px;background:#eaf3ff;border:1px solid #cfe3fb;color:#0b5ed7;font-size:.68rem;font-weight:800}.card-c__b{flex:1;min-height:330px;width:100%;height:100%;padding:.5rem}.dept-card .card-c__b{min-height:390px}.data-card .card-c__b{min-height:0}.card-table-body{padding:0!important}.tbl-wrap{width:100%;overflow-x:auto}.tbl{width:100%;border-collapse:collapse;font-size:.79rem}.tbl thead th{text-align:left;padding:.78rem 1.1rem;font-weight:800;font-size:.62rem;text-transform:uppercase;letter-spacing:.07em;color:#63819f;background:#f5f9fd;border-bottom:1px solid #dfebf6;white-space:nowrap}.tbl tbody td{text-align:left;padding:.8rem 1.1rem;color:#365775;vertical-align:middle;border-bottom:1px solid #edf3f8}.tbl tbody tr:last-child td{border-bottom:none}.tbl tbody tr{transition:background .15s ease}.tbl tbody tr:hover td{background:#f4f9ff}.tbl tbody td strong{color:#173f6d;font-weight:750}.td-mono{font-family:monospace;font-size:.74rem;color:#7893ae!important}.bdg,.age-pill,.ret-bdg,.ready-bdg{display:inline-flex;align-items:center;white-space:nowrap;border-radius:7px;padding:.28rem .55rem;font-size:.65rem;font-weight:800}.bdg{background:#eef6ff;color:#24629b;border:1px solid #d8eafa}.age-pill{background:#eaf3ff;color:#0b5ed7;border:1px solid #cfe3fb}.ret-bdg{background:#eaf3ff;color:#0752b5;border:1px solid #bfdbfe}.ready-bdg{background:#f2f7fc;color:#64819d;border:1px solid #dfeaf4}.empty-bday{min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;color:#8ca4ba;font-size:.75rem}.empty-bday svg{width:20px;height:20px;padding:13px;border-radius:50%;background:#eef6ff;color:#4b8fd8;margin-bottom:.15rem}.empty-bday strong{color:#54738f;font-size:.78rem}.empty-bday span{font-size:.68rem}.exp-wrap{text-align:center;padding:.7rem;border-top:1px solid #edf3f8;background:#fbfdff}.exp-btn{display:inline-flex;align-items:center;gap:.4rem;background:#fff;border:1px solid #d6e5f3;border-radius:8px;padding:.42rem 1rem;font-size:.7rem;font-weight:800;color:#0b5ed7;cursor:pointer;transition:.15s ease}.exp-btn:hover{background:#eaf3ff;border-color:#a9cbee}.form-control,.custom-select,.custom-file-label{border-color:#d7e5f2;border-radius:9px}.form-control:focus,.custom-select:focus{border-color:#70aef0;box-shadow:0 0 0 .2rem rgba(11,94,215,.1)}.btn{border-radius:9px;font-weight:700}.table thead th,.b-table thead th{background:#f5f9fd;color:#63819f;border-top:0;border-bottom:1px solid #dfebf6;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.045em;white-space:nowrap;vertical-align:middle}.table tbody td,.b-table tbody td{border-color:#edf3f8;vertical-align:middle}.table-hover tbody tr:hover,.b-table tbody tr:hover{background:#f4f9ff}.table-responsive{border-radius:12px;scrollbar-width:none;-ms-overflow-style:none}.table-responsive::-webkit-scrollbar{display:none;width:0;height:0}@media(max-width:1200px){.db-wrap{padding-left:1.15rem;padding-right:1.15rem}.db-stats{gap:.75rem}}@media(max-width:992px){.db-stats{grid-template-columns:repeat(2,1fr)}.db-charts{grid-template-columns:1fr}.db-top{padding:1.25rem}.card-c__b{min-height:300px}}@media(max-width:640px){.dashboard{width:100vw;top:0;min-height:100vh;padding-top:10px}.db-wrap{padding:.8rem .7rem 1.5rem}.db-top{flex-direction:column;align-items:flex-start;gap:.8rem;border-radius:15px}.db-title{font-size:1.45rem}.db-date{font-size:.68rem}.db-stats{grid-template-columns:1fr}.stat{min-height:100px}.stat-num{font-size:1.75rem}.db-charts{grid-template-columns:1fr}.card-c__b{min-height:270px}.dept-card .card-c__b{min-height:320px}.tbl{min-width:720px}}
</style>