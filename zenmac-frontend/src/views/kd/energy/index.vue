<template>
  <div class="en-wrap" :style="themeStyle">

    <!-- ── HEADER ── -->
    <div class="en-header">
      <span class="en-acc-dot"></span>
      <span class="en-heading">ENERGY MANAGEMENT</span>
      <span class="en-sub">AERATION SYSTEM</span>

      <div class="view-toggle">
        <button class="vt-btn" :class="{active:viewMode==='monthly'}" @click="switchView('monthly')">MONTHLY</button>
        <button class="vt-btn" :class="{active:viewMode==='annual'}"  @click="switchView('annual')">ANNUAL</button>
      </div>
      <div class="month-nav" v-if="viewMode==='monthly'">
        <button class="mn-btn" @click="changeMonth(1)" :disabled="monthOffset>=5"><i class="bx bx-chevron-left"></i></button>
        <span class="mn-label">{{ monthLabel }}</span>
        <button class="mn-btn" @click="changeMonth(-1)" :disabled="monthOffset<=0"><i class="bx bx-chevron-right"></i></button>
      </div>

      <div class="theme-sw" style="margin-left:auto">
        <button v-for="(th,key) in THEMES" :key="key" class="theme-btn"
          :class="{'ts-active':currentThemeKey===key}" :title="th.name"
          @click="switchTheme(key)" :style="`--ta:${th.accent}`"></button>
      </div>
    </div>

    <!-- ── LIVE POWER ROW ── -->
    <div class="live-row">

      <!-- TB-01 blower card -->
      <div class="bc" :style="`--bc:${t.kwh};--bs:${tb1StatusColor}`">
        <div class="bc-head">
          <span class="bc-title">TB-01 BLOWER</span>
          <span class="bc-badge" :style="`color:var(--bs);border-color:color-mix(in srgb,var(--bs) 40%,transparent);background:color-mix(in srgb,var(--bs) 12%,transparent)`">
            <span class="bc-dot" :style="`background:var(--bs)`"></span>{{ tb1Status }}
          </span>
        </div>
        <div class="bm bm--full">
          <div class="bm-label">POWER</div>
          <div class="bm-val"><span class="bm-num" :style="`color:${t.kwh}`">{{ tb1Power }}</span><span class="bm-unit">kW</span></div>
          <div class="bm-bar"><div class="bm-fill" :style="`width:${tb1PowerPct}%;background:${t.kwh}`"></div></div>
        </div>
        <div class="bc-row3">
          <div class="bm">
            <div class="bm-label">CURRENT</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.serum}`">{{ tb1Current }}</span><span class="bm-unit">A</span></div>
          </div>
          <div class="bm">
            <div class="bm-label">kWh TODAY</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.kwh}`">{{ fmt1(tb1KwhToday) }}</span></div>
          </div>
          <div class="bm">
            <div class="bm-label">RUN HOURS</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.perf}`">{{ fmt1(tb1RunHoursToday) }}</span><span class="bm-unit">h</span></div>
          </div>
        </div>
      </div>

      <!-- TB-02 blower card -->
      <div class="bc" :style="`--bc:${t.cost};--bs:${tb2StatusColor}`">
        <div class="bc-head">
          <span class="bc-title">TB-02 BLOWER</span>
          <span class="bc-badge" :style="`color:var(--bs);border-color:color-mix(in srgb,var(--bs) 40%,transparent);background:color-mix(in srgb,var(--bs) 12%,transparent)`">
            <span class="bc-dot" :style="`background:var(--bs)`"></span>{{ tb2Status }}
          </span>
        </div>
        <div class="bm bm--full">
          <div class="bm-label">POWER</div>
          <div class="bm-val"><span class="bm-num" :style="`color:${t.cost}`">{{ tb2Power }}</span><span class="bm-unit">kW</span></div>
          <div class="bm-bar"><div class="bm-fill" :style="`width:${tb2PowerPct}%;background:${t.cost}`"></div></div>
        </div>
        <div class="bc-row3">
          <div class="bm">
            <div class="bm-label">CURRENT</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.serum}`">{{ tb2Current }}</span><span class="bm-unit">A</span></div>
          </div>
          <div class="bm">
            <div class="bm-label">kWh TODAY</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.cost}`">{{ fmt1(tb2KwhToday) }}</span></div>
          </div>
          <div class="bm">
            <div class="bm-label">RUN HOURS</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.perf}`">{{ fmt1(tb2RunHoursToday) }}</span><span class="bm-unit">h</span></div>
          </div>
        </div>
      </div>

      <!-- Combined card -->
      <div class="bc" :style="`--bc:${t.accent};--bs:${t.hOk}`">
        <div class="bc-head">
          <span class="bc-title">COMBINED POWER</span>
          <span class="bc-badge" :style="`color:${t.hOk};border-color:color-mix(in srgb,${t.hOk} 40%,transparent);background:color-mix(in srgb,${t.hOk} 12%,transparent)`">
            <span class="bc-dot" :style="`background:${t.hOk}`"></span>SYSTEM ONLINE
          </span>
        </div>
        <div class="bm bm--full">
          <div class="bm-label">TOTAL POWER</div>
          <div class="bm-val"><span class="bm-num" :style="`color:${t.accent}`">{{ blowerTotalPower }}</span><span class="bm-unit">kW</span><span class="bm-ref">/ 150 kW</span></div>
          <div class="bm-bar"><div class="bm-fill" :style="`width:${combinedPowerPct}%;background:${t.accent}`"></div></div>
        </div>
        <div class="bc-row2">
          <div class="bm">
            <div class="bm-label">kWh TODAY</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.accent}`">{{ fmt1(todayKwh) }}</span></div>
          </div>
          <div class="bm">
            <div class="bm-label">EST. COST</div>
            <div class="bm-val"><span class="bm-num" :style="`color:${t.hWarn}`">฿{{ fmt0(todayCost) }}</span></div>
          </div>
        </div>
      </div>

      <!-- Period KPI column -->
      <div class="period-col">
        <div class="period-hdr">
          <span class="period-title">{{ viewMode==='annual'?'ANNUAL SUMMARY':'PERIOD SUMMARY' }}</span>
          <span class="period-sub">{{ viewMode==='annual'?new Date().getFullYear():monthLabel }}</span>
        </div>
        <div class="period-grid">
          <div class="period-kpi" v-for="k in activeKpiCards" :key="k.tag" :style="`--c:${k.color}`">
            <div class="pk-tag">{{ k.tag }}</div>
            <div class="pk-row">
              <span class="pk-val" :style="`color:${k.color}`">{{ k.big }}</span>
              <span class="pk-unit" :style="`color:${k.color}`">{{ k.unit }}</span>
            </div>
            <div class="pk-foot" v-if="k.foot">{{ k.foot }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── CHARTS SECTION ── -->
    <div class="charts-section">

      <!-- Left: Consumption -->
      <div class="chart-col">
        <div class="section-hdr" :style="`border-color:${t.kwh}60`">
          <span class="section-dot" :style="`background:${t.kwh}`"></span>
          <span class="section-title">CONSUMPTION</span>
        </div>
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.kwh}`"></span>
            {{ viewMode==='annual'?'MONTHLY':'DAILY' }} ENERGY — TB-01 vs TB-02 (kWh)
            <span class="legend">
              <span class="ls" :style="`background:${t.kwh}`"></span>TB-01
              <span class="ls" :style="`background:${t.cost}`"></span>TB-02
              <span class="ll" :style="`background:${t.hWarn};margin-left:4px`"></span>Cost ฿
            </span>
            <span class="ctrl-group">Rate <input type="number" v-model.number="costRate" step="0.1" min="1" max="20" class="ctrl-input" :style="`color:${t.hWarn};border-color:${t.hWarn}40;background:${t.hWarn}14`"/> ฿/kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartKwh"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.perf}`"></span>
            {{ viewMode==='annual'?'MONTHLY':'DAILY' }} RUN HOURS — TB-01 vs TB-02 (h)
            <span class="legend">
              <span class="ls" :style="`background:${t.kwh}`"></span>TB-01
              <span class="ls" :style="`background:${t.cost}`"></span>TB-02
            </span>
          </div>
          <div class="chart-wrap"><canvas ref="chartHours"></canvas></div>
        </div>
      </div>

      <!-- Right: Efficiency -->
      <div class="chart-col">
        <div class="section-hdr" :style="`border-color:${t.perf}60`">
          <span class="section-dot" :style="`background:${t.perf}`"></span>
          <span class="section-title">EFFICIENCY ANALYSIS</span>
        </div>
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.perf}`"></span>
            TREATMENT EFFICIENCY — m³/kWh
            <span class="legend">
              <span class="ls" :style="`background:${t.perf}`"></span>m³/kWh
              <span class="ll-dash" :style="`border-color:${t.thresh}`"></span>
              <span :style="`color:${t.thresh}`">{{ threshEff }}</span>
            </span>
            <span class="ctrl-group">Thresh <input type="number" v-model.number="threshEff" step="0.1" min="0.1" max="10" class="ctrl-input" :style="`color:${t.thresh};border-color:${t.thresh}40;background:${t.thresh}14`"/> m³/kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartEff"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.orpS}`"></span>
            kWh / ORP-SERUM TREND (kWh/mV)
            <span class="legend">
              <span class="ls" :style="`background:${t.orpS}`"></span>kWh/mV
              <span class="ll-dash" :style="`border-color:${t.thresh}`"></span>
              <span :style="`color:${t.thresh}`">{{ threshOrpE }}</span>
            </span>
            <span class="ctrl-group">Thresh <input type="number" v-model.number="threshOrpE" step="0.5" min="0.5" max="50" class="ctrl-input" :style="`color:${t.thresh};border-color:${t.thresh}40;background:${t.thresh}14`"/> kWh/mV</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartOrpE"></canvas></div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { mapGetters } from 'vuex';
Chart.register(...registerables);

const API = process.env.VUE_APP_KD_BACKEND
  || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3323');

const THEMES = {
  slate:    { name:'Slate & Steel',    accent:'#4a9eba', bg:'#0d1117', g1:'rgba(74,158,186,.07)',  g2:'rgba(74,124,111,.05)',  cBg:'rgba(17,24,32,.85)',    cBdr:'rgba(30,45,61,.9)',   text:'rgba(200,216,232,.28)', tick:'#3d5068', serum:'#ff7820', latex:'#00e87a', kwh:'#9b8fc0', perf:'#6b82a8', cost:'#b8935a', orpS:'#ff7820', orpL:'#00e87a', thresh:'#c8a96e', y1:'#7870a8', hOk:'#00e87a', hWarn:'#c8a96e', hCrit:'#a86868' },
  carbon:   { name:'Carbon & Copper',  accent:'#b07d56', bg:'#0e0f11', g1:'rgba(176,125,86,.07)', g2:'rgba(122,158,142,.05)', cBg:'rgba(16,14,12,.88)',    cBdr:'rgba(44,32,22,.95)',  text:'rgba(216,207,200,.28)', tick:'#524438', serum:'#ff7820', latex:'#00e87a', kwh:'#8878b0', perf:'#7888a0', cost:'#c4a040', orpS:'#ff7820', orpL:'#00e87a', thresh:'#c4a050', y1:'#8878b0', hOk:'#00e87a', hWarn:'#c4a050', hCrit:'#a87858' },
  midnight: { name:'Midnight & Sage',  accent:'#5a9e82', bg:'#0a0e14', g1:'rgba(90,158,130,.07)', g2:'rgba(90,142,170,.05)', cBg:'rgba(12,18,28,.88)',    cBdr:'rgba(21,29,40,.95)',  text:'rgba(176,200,192,.28)', tick:'#385060', serum:'#ff7820', latex:'#00e87a', kwh:'#9888c0', perf:'#7a8aaa', cost:'#9e8a5a', orpS:'#ff7820', orpL:'#00e87a', thresh:'#c0a878', y1:'#9888c0', hOk:'#00e87a', hWarn:'#c0a878', hCrit:'#a87878' },
  obsidian: { name:'Obsidian & Frost', accent:'#6888c8', bg:'#0c0c10', g1:'rgba(104,136,200,.07)',g2:'rgba(96,168,160,.05)', cBg:'rgba(14,14,20,.88)',    cBdr:'rgba(24,24,32,.95)',  text:'rgba(208,208,224,.28)', tick:'#404060', serum:'#ff7820', latex:'#00e87a', kwh:'#9080d0', perf:'#7888b8', cost:'#c8a850', orpS:'#ff7820', orpL:'#00e87a', thresh:'#d0b870', y1:'#9080d0', hOk:'#00e87a', hWarn:'#d0b870', hCrit:'#c07070' },
  dark:     { name:'Deep Dark',        accent:'#3d8fab', bg:'#060810', g1:'rgba(61,143,171,.04)',  g2:'rgba(50,100,90,.03)',  cBg:'rgba(8,10,16,.96)',     cBdr:'rgba(18,26,38,.98)',  text:'rgba(155,185,210,.22)', tick:'#253545', serum:'#ff7820', latex:'#00e87a', kwh:'#7a6ea8', perf:'#506080', cost:'#9a7848', orpS:'#ff7820', orpL:'#00e87a', thresh:'#a88c58', y1:'#6060a0', hOk:'#00e87a', hWarn:'#a88c58', hCrit:'#905858' },
  light:    { name:'Light',            accent:'#2a7fa8', bg:'#eef0f4', g1:'rgba(42,127,168,.09)',  g2:'rgba(60,140,110,.07)', cBg:'rgba(255,255,255,.88)', cBdr:'rgba(180,200,220,.75)',text:'rgba(40,60,80,.58)',   tick:'#5a7890', serum:'#ff7820', latex:'#00a854', kwh:'#6050b0', perf:'#5a7098', cost:'#a07040', orpS:'#ff7820', orpL:'#00a854', thresh:'#a08040', y1:'#6050a8', hOk:'#00a854', hWarn:'#a08040', hCrit:'#a84848' },
};

function h2r(hex, a) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function genMonthData(offset) {
  const now=new Date(), target=new Date(now.getFullYear(),now.getMonth()-offset,1);
  const y=target.getFullYear(),m=target.getMonth();
  const dim=new Date(y,m+1,0).getDate(), today=offset===0?now.getDate():dim;
  return Array.from({length:dim},(_,i)=>{
    const day=i+1;
    if(day>today) return {day,kwh:null,kwh1:null,kwh2:null,h1:null,h2:null,flow:null,orp_serum:null};
    const kwh=Math.round(150+Math.random()*200), kwh1=Math.round(kwh*.52), kwh2=kwh-kwh1;
    const h1=+(8+Math.random()*8).toFixed(1), h2=+(6+Math.random()*8).toFixed(1);
    const serum=Math.round(100+Math.random()*300), latex=Math.round(80+Math.random()*220);
    const orp_serum=Math.round(150+Math.random()*230);
    return {day,kwh,kwh1,kwh2,h1,h2,serum,latex,flow:serum+latex,orp_serum};
  });
}

function genAnnualData() {
  const now=new Date(), y=now.getFullYear(), curM=now.getMonth();
  const labels=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return labels.map((label,m)=>{
    if(m>curM) return {label,month:m+1,kwh:null,kwh1:null,kwh2:null,h1:null,h2:null,flow:null,orp_serum:null};
    const days=new Date(y,m+1,0).getDate(), kwh=Math.round((150+Math.random()*200)*days);
    const kwh1=Math.round(kwh*.52), kwh2=kwh-kwh1;
    const h1=+((8+Math.random()*8)*days/30).toFixed(1), h2=+((6+Math.random()*8)*days/30).toFixed(1);
    const serum=Math.round((100+Math.random()*300)*days), latex=Math.round((80+Math.random()*220)*days);
    const orp_serum=Math.round(150+Math.random()*230);
    return {label,month:m+1,kwh,kwh1,kwh2,h1,h2,serum,latex,flow:serum+latex,orp_serum};
  });
}

const SCALE_X={ticks:{color:'',font:{size:8},maxTicksLimit:31,autoSkip:false,maxRotation:0},grid:{display:false}};
const fitY=s=>{s.width=52;};

// Arc path helper — semicircle 0→180° mapped to 0→100%
const ARC_R=55, ARC_CX=60, ARC_CY=65;
function arcCoord(deg) {
  const rad=(deg-180)*Math.PI/180;
  return [ARC_CX+ARC_R*Math.cos(rad), ARC_CY+ARC_R*Math.sin(rad)];
}
function arcPath(pct) {
  const angle=Math.min(99.9,Math.max(0,pct))*1.8; // 0→180deg
  const [x,y]=arcCoord(angle);
  const large=angle>90?1:0;
  const [sx,sy]=arcCoord(0);
  return `M${sx},${sy} A${ARC_R},${ARC_R} 0 ${large},1 ${x},${y}`;
}

export default {
  name: 'KDEnergy',
  data() {
    return { monthOffset:0, monthData:[], annualData:[], viewMode:'monthly', costRate:4.50, threshEff:1.5, threshOrpE:10, currentThemeKey:'slate', THEMES };
  },
  computed: {
    ...mapGetters('staKd', ['tb1Power','tb2Power','blowerTotalPower','tb1Current','tb2Current','tb1KwhToday','tb2KwhToday','tb1RunHoursToday','tb2RunHoursToday','tb1Status','tb2Status']),
    t() { return THEMES[this.currentThemeKey]; },
    monthLabel() { const d=new Date(); d.setMonth(d.getMonth()-this.monthOffset); return d.toLocaleString('en',{month:'long',year:'numeric'}); },
    themeStyle() {
      const t=this.t, li=t.bg[1]>'8', ov=li?'40,60,80':'255,255,255', ob=li?'0,0,0':'255,255,255';
      return {
        background:`radial-gradient(ellipse 60% 40% at 80% 5%,${t.g1},transparent 55%),radial-gradient(ellipse 40% 35% at 5% 95%,${t.g2},transparent 50%),${t.bg}`,
        '--ex-card-bg':t.cBg,'--ex-card-bdr':t.cBdr,'--ex-text':t.text,
        '--ex-h-ok':t.hOk,'--ex-h-warn':t.hWarn,'--ex-h-crit':t.hCrit,'--ex-accent':t.accent,
        '--ex-text-sub':`rgba(${ov},.22)`,'--ex-label':`rgba(${ov},.55)`,
        '--ex-mn-bg':`rgba(${ob},.04)`,'--ex-mn-bdr':`rgba(${ob},.12)`,
        '--ex-mn-color':`rgba(${ov},.45)`,'--ex-mn-hbg':`rgba(${ob},.1)`,'--ex-mn-hclr':`rgba(${ov},.88)`,
        '--ex-tag-bg':`rgba(${ob},.05)`,'--ex-tag-color':`rgba(${ov},.32)`,'--ex-tag-bdr':`rgba(${ob},.1)`,
        '--ex-surf-bdr':`rgba(${ob},.3)`,'--ex-surf-act':`rgba(${ob},.55)`,
      };
    },
    todayKwh() { const v1=parseFloat(this.tb1KwhToday),v2=parseFloat(this.tb2KwhToday); return (isNaN(v1)?0:v1)+(isNaN(v2)?0:v2); },
    todayCost() { return this.todayKwh*this.costRate; },
    tb1StatusColor() { const t=this.t,s=this.tb1Status; return s==='RUN'?t.hOk:s==='STANDBY'?t.hWarn:t.hCrit; },
    tb2StatusColor() { const t=this.t,s=this.tb2Status; return s==='RUN'?t.hOk:s==='STANDBY'?t.hWarn:t.hCrit; },
    tb1PowerPct() { const v=parseFloat(this.tb1Power); return isNaN(v)?0:Math.min(100,v/75*100); },
    tb2PowerPct() { const v=parseFloat(this.tb2Power); return isNaN(v)?0:Math.min(100,v/75*100); },
    combinedPowerPct() { const v=parseFloat(this.blowerTotalPower); return isNaN(v)?0:Math.min(100,v/150*100); },
    stats() {
      const d=this.monthData.filter(r=>r.kwh!==null);
      if(!d.length) return {kwhTotal:0,kwh1Total:0,kwh2Total:0,h1Total:0,h2Total:0,flowTotal:0,avgOrpS:0,kwoS:'—',kwoSColor:this.t.hCrit};
      const kwhTotal=d.reduce((a,r)=>a+(r.kwh||0),0), kwh1Total=d.reduce((a,r)=>a+(r.kwh1||0),0), kwh2Total=d.reduce((a,r)=>a+(r.kwh2||0),0);
      const h1Total=d.reduce((a,r)=>a+(r.h1||0),0), h2Total=d.reduce((a,r)=>a+(r.h2||0),0);
      const flowTotal=d.reduce((a,r)=>a+(r.flow||0),0), avgOrpS=d.reduce((a,r)=>a+(r.orp_serum||0),0)/d.length;
      const eff=kwhTotal?(flowTotal/kwhTotal).toFixed(2):'—';
      const kwoSVal=avgOrpS?kwhTotal/avgOrpS:null, kwoS=kwoSVal!==null?kwoSVal.toFixed(2):'—';
      const kwoSMeter=kwoSVal!==null?Math.max(0,Math.min(100,Math.round((1-kwoSVal/15)*100))):0;
      const t=this.t; const kwoSColor=kwoSMeter>=70?t.hOk:kwoSMeter>=40?t.hWarn:t.hCrit;
      return {kwhTotal,kwh1Total,kwh2Total,h1Total,h2Total,flowTotal,avgOrpS,eff,kwoS,kwoSColor};
    },
    kpiCards() {
      const s=this.stats,t=this.t, cost=Math.round(s.kwhTotal*this.costRate);
      const p1=s.kwhTotal?Math.round(s.kwh1Total/s.kwhTotal*100):0, p2=s.kwhTotal?Math.round(s.kwh2Total/s.kwhTotal*100):0;
      return [
        {tag:'TOTAL ENERGY', big:this.fmt0(s.kwhTotal),  unit:'kWh',    color:t.kwh,       foot:`TB-01 ${p1}% · TB-02 ${p2}%`},
        {tag:'EST. COST',    big:this.fmt0(cost),         unit:'฿',      color:t.hWarn,     foot:`${this.costRate} ฿/kWh`},
        {tag:'TB-01',        big:this.fmt0(s.kwh1Total), unit:'kWh',    color:t.kwh,       foot:`Run: ${s.h1Total.toFixed(1)} h`},
        {tag:'TB-02',        big:this.fmt0(s.kwh2Total), unit:'kWh',    color:t.cost,      foot:`Run: ${s.h2Total.toFixed(1)} h`},
        {tag:'EFFICIENCY',   big:s.eff,                   unit:'m³/kWh', color:t.perf,      foot:'Flow ÷ Energy'},
        {tag:'kWh/ORP-S',    big:s.kwoS,                  unit:'kWh/mV', color:s.kwoSColor, foot:`ORP avg: ${Math.round(s.avgOrpS)} mV`},
      ];
    },
    annualStats() {
      const d=this.annualData.filter(r=>r.kwh!==null);
      if(!d.length) return {kwhTotal:0,kwh1Total:0,kwh2Total:0,h1Total:0,h2Total:0,flowTotal:0,avgOrpS:0,kwoS:'—',kwoSColor:this.t.hCrit,months:0};
      const kwhTotal=d.reduce((a,r)=>a+(r.kwh||0),0), kwh1Total=d.reduce((a,r)=>a+(r.kwh1||0),0), kwh2Total=d.reduce((a,r)=>a+(r.kwh2||0),0);
      const h1Total=d.reduce((a,r)=>a+(r.h1||0),0), h2Total=d.reduce((a,r)=>a+(r.h2||0),0);
      const flowTotal=d.reduce((a,r)=>a+(r.flow||0),0), avgOrpS=d.reduce((a,r)=>a+(r.orp_serum||0),0)/d.length;
      const eff=kwhTotal?(flowTotal/kwhTotal).toFixed(2):'—';
      const kwoSVal=avgOrpS?kwhTotal/avgOrpS:null, kwoS=kwoSVal!==null?kwoSVal.toFixed(2):'—';
      const kwoSMeter=kwoSVal!==null?Math.max(0,Math.min(100,Math.round((1-kwoSVal/15)*100))):0;
      const t=this.t; const kwoSColor=kwoSMeter>=70?t.hOk:kwoSMeter>=40?t.hWarn:t.hCrit;
      return {kwhTotal,kwh1Total,kwh2Total,h1Total,h2Total,flowTotal,avgOrpS,eff,kwoS,kwoSColor,months:d.length};
    },
    annualKpiCards() {
      const s=this.annualStats,t=this.t, cost=Math.round(s.kwhTotal*this.costRate);
      const p1=s.kwhTotal?Math.round(s.kwh1Total/s.kwhTotal*100):0, p2=s.kwhTotal?Math.round(s.kwh2Total/s.kwhTotal*100):0;
      return [
        {tag:'ANNUAL ENERGY', big:this.fmt0(s.kwhTotal),  unit:'kWh',    color:t.kwh,       foot:`TB-01 ${p1}% · TB-02 ${p2}%`},
        {tag:'EST. COST',     big:this.fmt0(cost),         unit:'฿',      color:t.hWarn,     foot:`${s.months} months · ${this.costRate} ฿/kWh`},
        {tag:'TB-01',         big:this.fmt0(s.kwh1Total), unit:'kWh',    color:t.kwh,       foot:`Run: ${Math.round(s.h1Total)} h`},
        {tag:'TB-02',         big:this.fmt0(s.kwh2Total), unit:'kWh',    color:t.cost,      foot:`Run: ${Math.round(s.h2Total)} h`},
        {tag:'EFFICIENCY',    big:s.eff,                   unit:'m³/kWh', color:t.perf,      foot:'Annual Flow ÷ Energy'},
        {tag:'kWh/ORP-S',     big:s.kwoS,                  unit:'kWh/mV', color:s.kwoSColor, foot:`ORP avg: ${Math.round(s.avgOrpS)} mV`},
      ];
    },
    activeKpiCards() { return this.viewMode==='annual'?this.annualKpiCards:this.kpiCards; },
  },
  watch: {
    costRate() {
      const cd=this.viewMode==='annual'?this.getAnnualChartData():this.getChartData();
      if(this._chartKwh){this._chartKwh.data.datasets[2].data=cd.cost;this._chartKwh.update('none');}
    },
    threshEff() { if(this._chartEff){this._chartEff.data.datasets[1].data=this._chartEff.data.labels.map(()=>this.threshEff);this._chartEff.update('none');} },
    threshOrpE(){ if(this._chartOrpE){this._chartOrpE.data.datasets[1].data=this._chartOrpE.data.labels.map(()=>this.threshOrpE);this._chartOrpE.update('none');} },
    viewMode()        { this.destroyCharts(); this.$nextTick(()=>this.buildCharts()); },
    currentThemeKey() { this.destroyCharts(); this.$nextTick(()=>this.buildCharts()); },
  },
  async created() {
    this._chartKwh=null; this._chartHours=null; this._chartEff=null; this._chartOrpE=null;
    const now=new Date(), ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    try { const r=await axios.get(`${API}/api/kd/history/daily?month=${ym}`); this.monthData=r.data&&r.data.length?r.data:genMonthData(0); } catch { this.monthData=genMonthData(0); }
    try { const r=await axios.get(`${API}/api/kd/history/monthly?year=${now.getFullYear()}`); this.annualData=r.data&&r.data.length?r.data:genAnnualData(); } catch { this.annualData=genAnnualData(); }
  },
  mounted()      { this.buildCharts(); },
  beforeUnmount(){ this.destroyCharts(); },
  methods: {
    fmt0(v){ const n=parseFloat(v); return isNaN(n)?'—':Math.round(n).toLocaleString(); },
    fmt1(v){ const n=parseFloat(v); return isNaN(n)?'—':n.toFixed(1); },
    arcPath,
    destroyCharts(){ [this._chartKwh,this._chartHours,this._chartEff,this._chartOrpE].forEach(c=>c?.destroy()); },
    switchTheme(key){ this.currentThemeKey=key; },
    async switchView(mode){
      if(mode==='annual'){ try{ const r=await axios.get(`${API}/api/kd/history/monthly?year=${new Date().getFullYear()}`); if(r.data&&r.data.length)this.annualData=r.data; }catch(e){ void e; } }
      this.viewMode=mode;
    },
    async changeMonth(dir){
      this.monthOffset=Math.max(0,Math.min(5,this.monthOffset+dir));
      const d=new Date(); d.setMonth(d.getMonth()-this.monthOffset);
      const ym=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      try{ const r=await axios.get(`${API}/api/kd/history/daily?month=${ym}`); this.monthData=r.data&&r.data.length?r.data:genMonthData(this.monthOffset); }catch{ this.monthData=genMonthData(this.monthOffset); }
      this.destroyCharts(); this.$nextTick(()=>this.buildCharts());
    },
    getChartData(){
      const d=this.monthData, rate=parseFloat(this.costRate)||4.5;
      return { labels:d.map(r=>`${r.day}`), kwh1:d.map(r=>r.kwh1), kwh2:d.map(r=>r.kwh2), cost:d.map(r=>r.kwh!=null?+(r.kwh*rate).toFixed(0):null), h1:d.map(r=>r.h1??r.tb1_run_hours??null), h2:d.map(r=>r.h2??r.tb2_run_hours??null), treatEff:d.map(r=>r.flow&&r.kwh?+(r.flow/r.kwh).toFixed(3):null), kwoS:d.map(r=>r.orp_serum&&r.kwh?+(r.kwh/r.orp_serum).toFixed(3):null) };
    },
    getAnnualChartData(){
      const d=this.annualData, rate=parseFloat(this.costRate)||4.5;
      return { labels:d.map(r=>r.label), kwh1:d.map(r=>r.kwh1), kwh2:d.map(r=>r.kwh2), cost:d.map(r=>r.kwh!=null?+(r.kwh*rate).toFixed(0):null), h1:d.map(r=>r.h1??null), h2:d.map(r=>r.h2??null), treatEff:d.map(r=>r.flow&&r.kwh?+(r.flow/r.kwh).toFixed(3):null), kwoS:d.map(r=>r.orp_serum&&r.kwh?+(r.kwh/r.orp_serum).toFixed(3):null) };
    },
    buildCharts(){ if(this.viewMode==='annual')this.buildAnnualCharts(); else this.buildMonthlyCharts(); },
    _base(){
      const tk=this.t, li=tk.bg[1]>'8', axisBdr=li?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';
      const BASE={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}}};
      const scY=(cb,color=tk.tick)=>({afterFit:fitY,ticks:{color,font:{size:9},callback:cb},grid:{display:false},border:{color:axisBdr}});
      const sX={...SCALE_X,ticks:{...SCALE_X.ticks,color:tk.tick}};
      const sXA={ticks:{color:tk.tick,font:{size:9},maxRotation:0},grid:{display:false},border:{display:false}};
      return {tk,axisBdr,BASE,scY,sX,sXA};
    },
    buildMonthlyCharts(){
      const cd=this.getChartData(); const {tk,axisBdr,BASE,scY,sX}=this._base();
      this._chartKwh=new Chart(this.$refs.chartKwh,{type:'bar',data:{labels:cd.labels,datasets:[
        {label:'TB-01',data:cd.kwh1,backgroundColor:h2r(tk.kwh,.82),borderRadius:2,stack:'kw',yAxisID:'y'},
        {label:'TB-02',data:cd.kwh2,backgroundColor:h2r(tk.cost,.72),borderRadius:2,stack:'kw',yAxisID:'y'},
        {type:'line',label:'Cost',data:cd.cost,borderColor:tk.hWarn,backgroundColor:h2r(tk.hWarn,.08),borderWidth:1.5,pointRadius:2,pointBackgroundColor:tk.hWarn,tension:.4,fill:false,yAxisID:'y1'},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sX,y:{...scY(v=>v+' kWh'),stacked:true},y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+v.toLocaleString()},grid:{display:false},border:{color:axisBdr}}}}});
      this._chartHours=new Chart(this.$refs.chartHours,{type:'bar',data:{labels:cd.labels,datasets:[
        {label:'TB-01',data:cd.h1,backgroundColor:h2r(tk.kwh,.78),borderRadius:2,stack:'hr'},
        {label:'TB-02',data:cd.h2,backgroundColor:h2r(tk.cost,.68),borderRadius:2,stack:'hr'},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sX,y:{...scY(v=>v+' h'),stacked:true}}}});
      this._chartEff=new Chart(this.$refs.chartEff,{type:'bar',data:{labels:cd.labels,datasets:[
        {type:'bar',label:'m³/kWh',data:cd.treatEff,backgroundColor:h2r(tk.perf,.72),borderRadius:2,yAxisID:'y',order:2},
        {type:'line',label:'Threshold',data:cd.labels.map(()=>this.threshEff),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false,yAxisID:'y',order:1},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sX,y:scY(v=>v.toFixed(2),tk.perf)}}});
      this._chartOrpE=new Chart(this.$refs.chartOrpE,{type:'line',data:{labels:cd.labels,datasets:[
        {label:'kWh/mV',data:cd.kwoS,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.1),borderWidth:1.5,pointRadius:2,tension:.4,fill:true},
        {type:'line',label:'Threshold',data:cd.labels.map(()=>this.threshOrpE),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sX,y:scY(v=>v.toFixed(1),tk.orpS)}}});
    },
    buildAnnualCharts(){
      const cd=this.getAnnualChartData(); const {tk,axisBdr,BASE,scY,sXA}=this._base();
      this._chartKwh=new Chart(this.$refs.chartKwh,{type:'bar',data:{labels:cd.labels,datasets:[
        {label:'TB-01',data:cd.kwh1,backgroundColor:h2r(tk.kwh,.82),borderRadius:4,stack:'kw',yAxisID:'y'},
        {label:'TB-02',data:cd.kwh2,backgroundColor:h2r(tk.cost,.72),borderRadius:4,stack:'kw',yAxisID:'y'},
        {type:'line',label:'Cost',data:cd.cost,borderColor:tk.hWarn,backgroundColor:h2r(tk.hWarn,.08),borderWidth:2,pointRadius:4,pointBackgroundColor:tk.hWarn,tension:.4,fill:false,yAxisID:'y1'},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sXA,y:{...scY(v=>(v/1000).toFixed(0)+'k kWh'),stacked:true},y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+(v/1000).toFixed(0)+'k'},grid:{display:false},border:{color:axisBdr}}}}});
      this._chartHours=new Chart(this.$refs.chartHours,{type:'bar',data:{labels:cd.labels,datasets:[
        {label:'TB-01',data:cd.h1,backgroundColor:h2r(tk.kwh,.78),borderRadius:4,stack:'hr'},
        {label:'TB-02',data:cd.h2,backgroundColor:h2r(tk.cost,.68),borderRadius:4,stack:'hr'},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sXA,y:{...scY(v=>Math.round(v)+' h'),stacked:true}}}});
      this._chartEff=new Chart(this.$refs.chartEff,{type:'bar',data:{labels:cd.labels,datasets:[
        {type:'bar',label:'m³/kWh',data:cd.treatEff,backgroundColor:h2r(tk.perf,.75),borderRadius:4,yAxisID:'y',order:2},
        {type:'line',label:'Threshold',data:cd.labels.map(()=>this.threshEff),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false,yAxisID:'y',order:1},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sXA,y:scY(v=>v.toFixed(2),tk.perf)}}});
      this._chartOrpE=new Chart(this.$refs.chartOrpE,{type:'line',data:{labels:cd.labels,datasets:[
        {label:'kWh/mV',data:cd.kwoS,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.1),borderWidth:2,pointRadius:4,tension:.4,fill:true},
        {type:'line',label:'Threshold',data:cd.labels.map(()=>this.threshOrpE),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false},
      ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sXA,y:scY(v=>v.toFixed(1),tk.orpS)}}});
    },
  },
};
</script>

<style scoped>
.en-wrap {
  padding: 10px 14px;
  font-family: 'Inter','Segoe UI',sans-serif;
  display: flex; flex-direction: column; gap: 8px;
  height: calc(100vh - 56px - 37px);
  overflow: hidden;
}

/* ── Header ── */
.en-header { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.en-acc-dot { width:7px; height:7px; border-radius:50%; background:var(--ex-accent); flex-shrink:0; box-shadow:0 0 8px color-mix(in srgb,var(--ex-accent) 60%,transparent); }
.en-heading { font-size:12px; font-weight:800; letter-spacing:.1em; color:var(--ex-label); text-transform:uppercase; }
.en-sub { font-size:9px; font-weight:600; letter-spacing:.12em; color:var(--ex-text-sub); text-transform:uppercase; border-left:1px solid var(--ex-tag-bdr); padding-left:10px; }

.view-toggle { display:flex; gap:2px; background:var(--ex-mn-bg); border:1px solid var(--ex-mn-bdr); border-radius:6px; padding:2px; }
.vt-btn { font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:.08em; padding:3px 10px; border-radius:4px; border:none; cursor:pointer; transition:all .15s; background:transparent; color:var(--ex-mn-color); }
.vt-btn.active { background:var(--ex-accent); color:#fff; box-shadow:0 1px 6px color-mix(in srgb,var(--ex-accent) 40%,transparent); }
.vt-btn:not(.active):hover { background:var(--ex-mn-hbg); color:var(--ex-mn-hclr); }

.month-nav { display:flex; align-items:center; gap:7px; }
.mn-btn { width:24px; height:24px; border-radius:5px; border:1px solid var(--ex-mn-bdr); background:var(--ex-mn-bg); color:var(--ex-mn-color); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; transition:all .15s; }
.mn-btn:hover:not(:disabled) { background:var(--ex-mn-hbg); color:var(--ex-mn-hclr); }
.mn-btn:disabled { opacity:.22; cursor:default; }
.mn-label { font-size:12px; font-weight:600; color:var(--ex-label); min-width:130px; text-align:center; letter-spacing:.02em; }

.theme-sw { display:flex; align-items:center; gap:5px; padding:0 4px; }
.theme-btn { width:13px; height:13px; border-radius:50%; background:var(--ta); border:2px solid transparent; cursor:pointer; transition:all .2s; flex-shrink:0; outline:none; }
.theme-btn:hover { border-color:var(--ex-surf-bdr); transform:scale(1.15); }
.ts-active { border-color:var(--ex-surf-act) !important; transform:scale(1.2); box-shadow:0 0 6px var(--ta); }

/* ── Live Power Row ── */
.live-row { display:flex; gap:8px; flex-shrink:0; }

/* ── Blower Card ── */
.bc {
  flex:1; display:flex; flex-direction:column; gap:6px;
  background:color-mix(in srgb,var(--bc) 6%,var(--ex-card-bg));
  border:1px solid color-mix(in srgb,var(--bc) 18%,var(--ex-card-bdr));
  border-left:3px solid var(--bc);
  border-radius:10px; padding:12px 14px;
  transition:border-color .3s;
}
.bc-head { display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
.bc-title { font-size:11px; font-weight:700; letter-spacing:.12em; color:var(--ex-label); text-transform:uppercase; }
.bc-badge { display:flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:.07em; padding:3px 10px; border-radius:5px; border:1px solid; }
.bc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; box-shadow:0 0 5px currentColor; }

/* metric tile */
.bm {
  background:var(--ex-card-bg);
  border:1px solid var(--ex-card-bdr);
  border-radius:6px; padding:10px 14px;
  display:flex; flex-direction:column; gap:4px;
}
.bm--full { flex:1; }
.bm-label { font-size:10px; font-weight:700; letter-spacing:.1em; color:var(--ex-text-sub); text-transform:uppercase; }
.bm-val { display:flex; align-items:baseline; gap:6px; }
.bm-num { font-family:'JetBrains Mono',monospace; font-size:34px; font-weight:800; line-height:1; }
.bm-unit { font-size:14px; font-weight:600; color:var(--ex-text-sub); }
.bm-ref { font-size:12px; color:var(--ex-text-sub); margin-left:2px; }

/* progress bar */
.bm-bar { height:4px; background:color-mix(in srgb,var(--bc) 15%,var(--ex-card-bdr)); border-radius:3px; overflow:hidden; margin-top:1px; }
.bm-fill { height:100%; border-radius:3px; transition:width .6s ease; box-shadow:0 0 6px color-mix(in srgb,currentColor 60%,transparent); }

/* sub-rows */
.bc-row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; }
.bc-row2 { display:grid; grid-template-columns:1fr 1fr; gap:5px; }

/* Period KPI column */
.period-col {
  width:280px; flex-shrink:0; display:flex; flex-direction:column; gap:6px;
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-radius:10px; padding:12px 14px; overflow:hidden;
}
.period-hdr { display:flex; flex-direction:column; gap:2px; padding-bottom:8px; border-bottom:1px solid var(--ex-card-bdr); }
.period-title { font-size:11px; font-weight:700; letter-spacing:.1em; color:var(--ex-text-sub); text-transform:uppercase; }
.period-sub { font-size:14px; font-weight:600; color:var(--ex-label); }
.period-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; flex:1; }
.period-kpi {
  display:flex; flex-direction:column; gap:2px;
  padding:8px 10px; border-radius:6px;
  background:color-mix(in srgb,var(--c) 6%,var(--ex-card-bg));
  border:1px solid color-mix(in srgb,var(--c) 18%,var(--ex-card-bdr));
}
.pk-tag { font-size:8px; font-weight:700; letter-spacing:.09em; color:var(--ex-text-sub); text-transform:uppercase; }
.pk-row { display:flex; align-items:baseline; gap:4px; flex-wrap:wrap; }
.pk-val { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; line-height:1.1; }
.pk-unit { font-size:11px; font-weight:600; }
.pk-foot { font-size:8px; color:var(--ex-text-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* ── Charts Section ── */
.charts-section { flex:1; min-height:0; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.chart-col { display:flex; flex-direction:column; gap:5px; min-height:0; }
.section-hdr { display:flex; align-items:center; gap:7px; padding-bottom:4px; border-bottom:1px solid; flex-shrink:0; }
.section-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.section-title { font-size:8px; font-weight:700; letter-spacing:.12em; color:var(--ex-text-sub); text-transform:uppercase; }

.chart-card { flex:1; min-height:0; background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr); border-radius:8px; padding:7px 11px; display:flex; flex-direction:column; gap:4px; transition:border-color .3s; }
.chart-hdr { display:flex; align-items:center; gap:7px; flex-shrink:0; font-size:9px; font-weight:600; color:var(--ex-text); letter-spacing:.07em; text-transform:uppercase; }
.ch-dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; }
.legend { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:9px; color:var(--ex-text-sub); }
.ls { width:8px; height:8px; border-radius:2px; display:inline-block; opacity:.85; }
.ll { width:14px; height:2.5px; border-radius:2px; display:inline-block; opacity:.85; }
.ll-dash { width:14px; display:inline-block; border-top:2px dashed; opacity:.85; vertical-align:middle; }
.ctrl-group { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:9px; color:var(--ex-text-sub); }
.ctrl-input { width:46px; padding:1px 5px; border-radius:4px; border-width:1px; border-style:solid; font-size:10px; font-weight:600; font-family:'JetBrains Mono',monospace; text-align:center; outline:none; transition:border-color .15s,background .15s; }
.ctrl-input:focus { opacity:1; filter:brightness(1.2); }
.chart-wrap { flex:1; min-height:0; position:relative; }
.chart-wrap canvas { position:absolute; inset:0; }
</style>
