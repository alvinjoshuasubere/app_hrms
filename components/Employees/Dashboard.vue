<template>
  <div class="dashboard hr-dashboard hr-ref-dashboard">
    <Loading v-if="loading"/>
    <div class="db-wrap">
      <header class="hr-ref-header">
        <div><p class="hr-ref-eyebrow">HUMAN RESOURCE MANAGEMENT</p><h1>Dashboard</h1><p class="hr-ref-subtitle">Your workforce at a glance</p></div>
        <div class="hr-ref-header-tools"><div class="hr-ref-search"><font-awesome-icon icon="search"/><input v-model="search" placeholder="Search employees" aria-label="Search employee lists"/></div><div class="hr-ref-date">{{ currentDate }}</div></div>
      </header>
      <section class="hr-ref-kpis" aria-label="Workforce overview">
        <div class="hr-ref-card hr-ref-kpi"><div class="hr-ref-kpi-label">Total employees</div><div class="hr-ref-kpi-line"><strong>{{ employees.length }}</strong><span class="hr-ref-kpi-icon purple"><font-awesome-icon icon="users"/></span></div><small>Active employee records</small></div>
        <div class="hr-ref-card hr-ref-kpi"><div class="hr-ref-kpi-label">Departments</div><div class="hr-ref-kpi-line"><strong>{{ departments.length }}</strong><span class="hr-ref-kpi-icon lilac"><font-awesome-icon icon="building"/></span></div><small>Offices represented</small></div>
        <div class="hr-ref-card hr-ref-kpi"><div class="hr-ref-kpi-label">Average age</div><div class="hr-ref-kpi-line"><strong>{{ averageAge }}</strong><span class="hr-ref-kpi-icon orange"><font-awesome-icon icon="user-clock"/></span></div><small>Years, based on birthdates</small></div>
        <div class="hr-ref-card hr-ref-kpi"><div class="hr-ref-kpi-label">HR action items</div><div class="hr-ref-kpi-line"><strong>{{ attentionCount }}</strong><span class="hr-ref-kpi-icon mint"><font-awesome-icon icon="bell"/></span></div><small>Birthdays and retirement watch</small></div>
      </section>
      <section class="hr-ref-chart-grid">
        <article class="hr-ref-card hr-ref-chart"><div class="hr-ref-panel-title"><div><h2>Employment status</h2><p>Workforce composition</p></div></div><div class="hr-ref-chart-area" ref="statusChart"></div></article>
        <article class="hr-ref-card hr-ref-chart"><div class="hr-ref-panel-title"><div><h2>Employees per department</h2><p>Workforce distribution by office</p></div></div><div class="hr-ref-chart-area" ref="deptChart"></div></article>
        <article class="hr-ref-card hr-ref-chart"><div class="hr-ref-panel-title"><div><h2>Gender distribution</h2><p>Employee demographic profile</p></div></div><div class="hr-ref-chart-area" ref="genderChart"></div></article>
      </section>
      <section class="hr-ref-bottom-grid">
        <article class="hr-ref-card hr-ref-panel"><div class="hr-ref-panel-title"><div><h2>Retirement watch</h2><p>Employees aged 60 to 65</p></div><span class="hr-ref-count">{{ retirees.length }}</span></div><div class="hr-ref-table-wrap"><table class="hr-ref-table"><thead><tr><th>Employee</th><th>Department</th><th>Age</th></tr></thead><tbody><tr v-for="emp in filteredRetirees" :key="emp.empid"><td><strong>{{ emp.fullname }}</strong></td><td>{{ emp.deptdesc || "—" }}</td><td><span class="hr-ref-age">{{ emp.age }}</span></td></tr><tr v-if="!filteredRetirees.length"><td colspan="3" class="hr-ref-empty">No matching employees on retirement watch</td></tr></tbody></table></div><button v-if="retirees.length>retireesLimit" type="button" class="hr-ref-more" @click="retireesExpanded=!retireesExpanded">{{ retireesExpanded ? 'Show fewer' : 'View all retirement watch' }} →</button></article>
        <article class="hr-ref-card hr-ref-panel"><div class="hr-ref-panel-title"><div><h2>Upcoming birthdays</h2><p>Next 30 days</p></div><span class="hr-ref-count">{{ upcomingBirthdays.length }}</span></div><div class="hr-ref-birthday-list"><div v-for="emp in filteredBirthdays" :key="emp.empid" class="hr-ref-birthday-row"><div class="hr-ref-avatar">{{ (emp.fullname||'?').charAt(0) }}</div><div class="hr-ref-person"><strong>{{ emp.fullname }}</strong><small>{{ emp.deptdesc || 'Department not specified' }}</small></div><div class="hr-ref-birthday-date"><strong>{{ formatMonthDay(emp.birthdate) }}</strong><small>In {{ emp.daysUntil }} days</small></div></div><p v-if="!filteredBirthdays.length" class="hr-ref-empty">No upcoming birthdays matching your search</p></div></article>
      </section>
      <section class="hr-ref-insights">
        <div><span class="hr-ref-insight-dot purple"></span><div><small>Largest gender group</small><strong>{{ dominantGender }}</strong><span>{{ dominantGenderCount }} employees</span></div></div>
        <div><span class="hr-ref-insight-dot orange"></span><div><small>Largest employment type</small><strong>{{ dominantEmployment }}</strong><span>{{ dominantEmploymentCount }} employees</span></div></div>
        <div><span class="hr-ref-insight-dot mint"></span><div><small>Birthdays today</small><strong>{{ birthdayToday.length }}</strong><span>Celebrating employees</span></div></div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as echarts from "echarts";
import Loading from "@/components/LoadingOverlay/Loadings";

const palette = ["#6925e8", "#9b70f7", "#d9c9fa", "#f47746", "#ffb29a", "#44baa0", "#8292e7", "#c5afe8"];

export default {
  components: { Loading },
  head() { return { meta: [{ hid: "description", name: "description", content: "HR Dashboard" }] }; },
  data() { return { loading: true, employees: [], departments: [], birthdayToday: [], currentDate: "", retireesLimit: 10, retireesExpanded: false, charts: [], search: "" }; },
  computed: {
    filteredRetirees() { const q=this.search.trim().toLowerCase();return q?this.displayRetirees.filter(e=>[e.fullname,e.deptdesc,e.position_desc].some(v=>String(v||"").toLowerCase().includes(q))):this.displayRetirees; },
    filteredBirthdays() {const q=this.search.trim().toLowerCase();return q?this.upcomingBirthdays.filter(e=>[e.fullname,e.deptdesc].some(v=>String(v||"").toLowerCase().includes(q))):this.upcomingBirthdays;},
    activeCount() { return this.employees.filter((e) => !e.isseparated && e.EmploymentStatus).length; },
    averageAge() { const ages = this.employees.map((e) => this.calcAge(e.birthdate)).filter((a) => a > 0 && a < 120); return ages.length ? Math.round((ages.reduce((a,b) => a+b, 0) / ages.length) * 10) / 10 : 0; },
    attentionCount() { return this.birthdayToday.length + this.retirees.length; },
    dominantGender() { return this.topKey(this.countBy(this.employees, (e) => e.genderdesc || "Unknown"), "No data"); },
    dominantGenderCount() { const map = this.countBy(this.employees, (e) => e.genderdesc || "Unknown"); return map[this.dominantGender] || 0; },
    dominantEmployment() { return this.topKey(this.countBy(this.employees, (e) => e.EmploymentStatus || "Unknown"), "No data"); },
    dominantEmploymentCount() { const map = this.countBy(this.employees, (e) => e.EmploymentStatus || "Unknown"); return map[this.dominantEmployment] || 0; },
    retirees() { return this.employees.filter((e) => { if (e.EmploymentStatus !== "Permanent" && e.EmploymentStatus !== "Co-terminous" && e.EmploymentStatus !== "Casual") return false; const age = this.calcAge(e.birthdate); return age >= 60 && age <= 65; }).map((e) => ({ ...e, age: this.calcAge(e.birthdate) })).sort((a,b) => { if (a.age !== b.age) return b.age-a.age; const da=new Date(a.birthdate), db=new Date(b.birthdate); return da.getMonth()-db.getMonth() || da.getDate()-db.getDate(); }); },
    displayRetirees() { return this.retireesExpanded ? this.retirees : this.retirees.slice(0, this.retireesLimit); },
    upcomingBirthdays() { const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()); return this.employees.map((e) => { if (!e.birthdate) return null; const birth=new Date(e.birthdate); if (Number.isNaN(birth.getTime())) return null; let date=new Date(now.getFullYear(),birth.getMonth(),birth.getDate()); if (date<today) date=new Date(now.getFullYear()+1,birth.getMonth(),birth.getDate()); const daysUntil=Math.round((date-today)/86400000); if(daysUntil<1||daysUntil>30)return null; return { ...e, daysUntil, nextAge:this.calcAge(e.birthdate)+1 }; }).filter(Boolean).sort((a,b)=>a.daysUntil-b.daysUntil).slice(0,12); },
  },
  created() { const d=new Date(); const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; this.currentDate=`${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; this.fetchData(); },
  beforeDestroy() { this.charts.forEach((chart)=>{try{chart.dispose();}catch(e){}}); this.charts=[]; },
  methods: {
    countBy(items,getter){return items.reduce((map,item)=>{const key=getter(item);map[key]=(map[key]||0)+1;return map;},{});},
    topKey(map,fallback){const keys=Object.keys(map);return keys.length?keys.sort((a,b)=>map[b]-map[a])[0]:fallback;},
    goEmployees(){this.$router.push("/employees");},
    async fetchData(){this.loading=true;try{await Promise.all([this.fetchEmployees(),this.fetchDepartments()]);this.$nextTick(()=>{this.processBirthdays();this.buildCharts();});}catch(e){console.error("Dashboard fetch error:",e);}finally{this.loading=false;}},
    async fetchEmployees(){try{const res=await axios({method:"GET",url:`${this.$axios.defaults.baseURL}/employees/get-all`,params:{text:"",IsSeparated:0}});const payload=res.data;if(Array.isArray(payload))this.employees=payload;else if(payload&&Array.isArray(payload.data))this.employees=payload.data;else if(payload&&Array.isArray(payload.items))this.employees=payload.items;else this.employees=[];}catch(e){console.error("Error fetching employees:",e);this.employees=[];}},
    async fetchDepartments(){try{const res=await axios({method:"GET",url:`${this.$axios.defaults.baseURL}/file-maintenance/department/get-all`});this.departments=res.data||[];}catch(e){console.error("Error fetching departments:",e);this.departments=[];}},
    processBirthdays(){const now=new Date();this.birthdayToday=this.employees.filter((e)=>{if(!e.birthdate)return false;const d=new Date(e.birthdate);return !Number.isNaN(d.getTime())&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();}).map((e)=>({...e,age:this.calcAge(e.birthdate)}));},
    calcAge(value){if(!value)return 0;const birth=new Date(value);if(Number.isNaN(birth.getTime()))return 0;const today=new Date();let age=today.getFullYear()-birth.getFullYear();const month=today.getMonth()-birth.getMonth();if(month<0||(month===0&&today.getDate()<birth.getDate()))age--;return age;},
    isDatePassed(value){if(!value)return false;const d=new Date(value),today=new Date();return d.getMonth()<today.getMonth()||(d.getMonth()===today.getMonth()&&d.getDate()<=today.getDate());},
    formatDate(value){if(!value)return "—";const d=new Date(value);return Number.isNaN(d.getTime())?"—":d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});},
    formatMonthDay(value){if(!value)return "—";const d=new Date(value);return Number.isNaN(d.getTime())?"—":d.toLocaleDateString("en-US",{month:"short",day:"numeric"});},
    chartBaseOption(){return{animationDuration:650,animationEasing:"cubicOut",textStyle:{fontFamily:"Arial, sans-serif"},tooltip:{backgroundColor:"#fff",borderColor:"#dbeafe",borderWidth:1,padding:[10,14],textStyle:{color:"#17345f",fontSize:12},extraCssText:"box-shadow:0 10px 30px rgba(15,64,120,.12);border-radius:10px;"}};},
    initChart(ref){if(!this.$refs[ref])return null;const chart=echarts.init(this.$refs[ref]);this.charts.push(chart);return chart;},
    buildCharts(){this.charts.forEach((c)=>{try{c.dispose();}catch(e){}});this.charts=[];this.buildStatusChart();this.buildGenderChart();this.buildDeptChart();this.$nextTick(()=>this.resizeCharts());},
    resizeCharts(){this.charts.forEach((c)=>{try{c.resize();}catch(e){}});},
    buildStatusChart(){const map=this.countBy(this.employees,(e)=>e.EmploymentStatus||"Unknown"),keys=Object.keys(map),vals=Object.values(map),total=vals.reduce((a,b)=>a+b,0),chart=this.initChart("statusChart");if(!chart)return;chart.setOption({...this.chartBaseOption(),tooltip:{...this.chartBaseOption().tooltip,trigger:"item",formatter:(p)=>`<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`},legend:{bottom:8,left:"center",width:"90%",textStyle:{fontSize:11,color:"#55708f",fontWeight:600},icon:"circle",itemWidth:8,itemHeight:8,itemGap:14},series:[{type:"pie",radius:["55%","76%"],center:["50%","45%"],itemStyle:{borderRadius:8,borderColor:"#fff",borderWidth:4},label:{show:true,formatter:"{d}%",fontSize:11,fontWeight:800,color:"#234a78"},labelLine:{length:8,length2:6,lineStyle:{color:"#93b4d8"}},emphasis:{scale:true,scaleSize:5,label:{show:true,fontSize:14,fontWeight:800,color:"#0b5ed7"}},data:keys.map((k,i)=>({name:k,value:map[k],itemStyle:{color:palette[i%palette.length]}}))}],graphic:[{type:"group",left:"center",top:"41%",children:[{type:"text",left:"center",top:-10,style:{text:`${total}`,fill:"#123b6d",fontSize:30,fontWeight:800,textAlign:"center"}},{type:"text",left:"center",top:25,style:{text:"EMPLOYEES",fill:"#7a94b0",fontSize:9,fontWeight:700,textAlign:"center"}}]}]});},
    buildGenderChart(){const map=this.countBy(this.employees,(e)=>e.genderdesc||"Unknown"),keys=Object.keys(map),total=Object.values(map).reduce((a,b)=>a+b,0),chart=this.initChart("genderChart");if(!chart)return;chart.setOption({...this.chartBaseOption(),tooltip:{...this.chartBaseOption().tooltip,trigger:"item",formatter:(p)=>`<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees &nbsp; <b>${p.percent}%</b></div>`},legend:{bottom:8,left:"center",textStyle:{fontSize:11,color:"#55708f",fontWeight:600},icon:"circle",itemWidth:8,itemHeight:8,itemGap:18},series:[{type:"pie",radius:["55%","76%"],center:["50%","45%"],itemStyle:{borderRadius:8,borderColor:"#fff",borderWidth:4},label:{show:true,formatter:"{b}\n{d}%",fontSize:11,fontWeight:800,color:"#234a78",lineHeight:16},labelLine:{length:8,length2:6,lineStyle:{color:"#93b4d8"}},emphasis:{scale:true,scaleSize:5,label:{show:true,fontSize:13,fontWeight:800,color:"#0b5ed7"}},data:keys.map((k,i)=>({name:k,value:map[k],itemStyle:{color:["#0b5ed7","#60a5fa","#bfdbfe"][i]||palette[i%palette.length]}}))}],graphic:[{type:"group",left:"center",top:"41%",children:[{type:"text",left:"center",top:-10,style:{text:`${total}`,fill:"#123b6d",fontSize:30,fontWeight:800,textAlign:"center"}},{type:"text",left:"center",top:25,style:{text:"EMPLOYEES",fill:"#7a94b0",fontSize:9,fontWeight:700,textAlign:"center"}}]}]});},
    buildDeptChart(){const empMap=this.countBy(this.employees,(e)=>e.deptdesc||"Unknown"),allDepts=this.departments.length?[...new Set([...this.departments.map((d)=>d.deptdesc),...Object.keys(empMap)])]:Object.keys(empMap),sorted=allDepts.sort((a,b)=>(empMap[b]||0)-(empMap[a]||0)),labels=sorted,vals=sorted.map((d)=>empMap[d]||0),chart=this.initChart("deptChart");if(!chart)return;chart.setOption({...this.chartBaseOption(),tooltip:{...this.chartBaseOption().tooltip,trigger:"axis",axisPointer:{type:"shadow"},formatter:(params)=>{const p=params[0];return `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>${p.value} employees</div>`;}},grid:{left:"2%",right:"4%",top:"5%",bottom:"18%",containLabel:true},xAxis:{type:"category",data:labels,axisLabel:{color:"#64748b",fontSize:10,interval:0,rotate:labels.length>8?28:0},axisLine:{lineStyle:{color:"#dbe5f0"}},axisTick:{show:false}},yAxis:{type:"value",minInterval:1,axisLabel:{color:"#7a8ba3",fontSize:10},splitLine:{lineStyle:{color:"#edf2f7"}},axisLine:{show:false}},series:[{type:"bar",data:vals.map((v,i)=>({value:v,itemStyle:{color:palette[i%palette.length],borderRadius:[7,7,0,0]}})),barMaxWidth:42,showBackground:true,backgroundStyle:{color:"#f4f7fb",borderRadius:[7,7,0,0]},label:{show:true,position:"top",color:"#345273",fontSize:10,fontWeight:700}}]});},
  },
};
</script>
