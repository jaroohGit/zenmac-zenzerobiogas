<template>
  <div class="exec-wrap" :style="themeStyle">

    <!-- ── TITLE BAR ── -->
    <div class="exec-title-bar">
      <span class="exec-acc-dot"></span>
      <span class="exec-heading">EXECUTIVE SUMMARY — OPERATION REPORT</span>

      <!-- Display mode toggle -->
      <div class="view-sw">
        <button class="view-btn" :class="{active:displayMode==='monthly'}" @click="displayMode='monthly'">Monthly</button>
        <button class="view-btn" :class="{active:displayMode==='both'}"    @click="displayMode='both'">Both</button>
      </div>

      <!-- Theme switcher -->
      <div class="theme-sw" title="Switch theme">
        <button
          v-for="(th, key) in THEMES" :key="key"
          class="theme-btn" :class="{ 'ts-active': currentThemeKey === key }"
          :title="th.name" @click="switchTheme(key)"
          :style="`--ta:${th.accent}`"
        ></button>
      </div>
      <span class="demo-tag">DEMO DATA</span>
    </div>

    <!-- ── KPI GRID 5 cards ── -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="k in kpiCards" :key="k.tag" :style="`--c:${k.color}`">
        <div class="kpi-tag">{{ k.tag }}</div>
        <div class="kpi-big-row">
          <span class="kpi-big" :style="`color:${k.color}`">{{ k.big }}</span>
          <span class="kpi-unit-b" :style="`color:${k.color}`">{{ k.unit }}</span>
        </div>
        <div class="kpi-chips" v-if="k.chips && k.chips.length">
          <span class="kpi-chip" v-for="c in k.chips" :key="c.label" :style="`color:${c.color}`">{{ c.label }}: {{ c.val }}</span>
        </div>
        <div class="kpi-foot" v-if="k.foot">{{ k.foot }}</div>
      </div>
    </div>

    <!-- ── DUAL CHART COLUMNS ── -->
    <div class="chart-dual">

      <!-- Annual column -->
      <div class="chart-col" v-show="displayMode!=='monthly'">
        <div class="col-hdr">
          <span class="col-title">ANNUAL</span>
          <div class="col-nav">
            <button class="col-nav-btn" @click="changeYear(1)" :disabled="yearOffset>=4"><i class="bx bx-chevron-left"></i></button>
            <span class="col-nav-label">{{ yearLabel }}</span>
            <button class="col-nav-btn" @click="changeYear(-1)" :disabled="yearOffset<=0"><i class="bx bx-chevron-right"></i></button>
          </div>
        </div>
        <div class="chart-card chart-sm">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.perf}`"></span>PERFORMANCE — kWh/m³
            <span class="ctrl-group">Threshold <input type="number" v-model.number="perfThreshold" step="0.05" min="0.1" max="2.0" class="ctrl-input" :style="`color:${t.thresh};border-color:${t.thresh}40;background:${t.thresh}14`"/> kWh/m³</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartPerfA"></canvas></div>
        </div>
        <div class="chart-card chart-sm">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.cost}`"></span>ELECTRICITY COST — THB/month
            <span class="ctrl-group">Rate <input type="number" v-model.number="costRate" step="0.10" min="1" max="20" class="ctrl-input" :style="`color:${t.cost};border-color:${t.cost}40;background:${t.cost}14`"/> THB/kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartCostA"></canvas></div>
        </div>
        <div class="chart-card chart-sm">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.orpS}`"></span>ORP AVERAGE / MONTH (mV)
            <span class="legend"><span class="ls" :style="`background:${t.orpS}`"></span>Serum <span class="ls" :style="`background:${t.orpL}`"></span>Latex</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartORPA"></canvas></div>
        </div>
        <div class="chart-card chart-lg">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.kwh}`"></span>MONTHLY FLOW (m³) &amp; ENERGY (kWh)
            <span class="legend"><span class="ls" :style="`background:${t.serum}`"></span>Serum <span class="ls" :style="`background:${t.latex}`"></span>Latex <span class="ll" :style="`background:${t.kwh};margin-left:4px`"></span>kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartMainA"></canvas></div>
        </div>
      </div>

      <!-- Monthly column -->
      <div class="chart-col" v-show="displayMode!=='annual'">
        <div class="col-hdr">
          <span class="col-title">MONTHLY</span>
          <div class="col-nav">
            <button class="col-nav-btn" @click="changeMonth(1)" :disabled="monthOffset>=5"><i class="bx bx-chevron-left"></i></button>
            <span class="col-nav-label">{{ monthLabel }}</span>
            <button class="col-nav-btn" @click="changeMonth(-1)" :disabled="monthOffset<=0"><i class="bx bx-chevron-right"></i></button>
          </div>
        </div>
        <div class="monthly-body">

          <!-- Left: vertical KPI summary (monthly-only mode) -->
          <div class="monthly-kpi-col" v-if="displayMode==='monthly'">
            <div class="mkpi-card" v-for="k in monthlyKpiCards" :key="k.tag" :style="`--c:${k.color};flex:${k.flex||1}`">
              <div class="kpi-tag">{{ k.tag }}</div>
              <div class="kpi-big-row">
                <span class="kpi-big" :style="`color:${k.color}`">{{ k.big }}</span>
                <span class="kpi-unit-b" :style="`color:${k.color}`">{{ k.unit }}</span>
              </div>
              <div class="kpi-chips" v-if="k.chips && k.chips.length">
                <span class="kpi-chip" v-for="c in k.chips" :key="c.label" :style="`color:${c.color}`">{{ c.label }}: {{ c.val }}</span>
              </div>
              <div class="kpi-foot" v-if="k.foot">{{ k.foot }}</div>
            </div>
          </div>

          <!-- Right: charts -->
          <div class="monthly-charts">
            <div class="chart-card chart-sm">
              <div class="chart-hdr">
                <span class="ch-dot" :style="`background:${t.perf}`"></span>PERFORMANCE — kWh/m³
              </div>
              <div class="chart-wrap"><canvas ref="chartPerf"></canvas></div>
            </div>
            <div class="chart-card chart-sm">
              <div class="chart-hdr">
                <span class="ch-dot" :style="`background:${t.cost}`"></span>ELECTRICITY COST — THB/day
              </div>
              <div class="chart-wrap"><canvas ref="chartCost"></canvas></div>
            </div>
            <div class="chart-card chart-sm">
              <div class="chart-hdr">
                <span class="ch-dot" :style="`background:${t.orpS}`"></span>ORP AVERAGE / DAY (mV)
                <span class="legend"><span class="ls" :style="`background:${t.orpS}`"></span>Serum <span class="ls" :style="`background:${t.orpL}`"></span>Latex</span>
              </div>
              <div class="chart-wrap"><canvas ref="chartORP"></canvas></div>
            </div>
            <div class="chart-card chart-lg">
              <div class="chart-hdr">
                <span class="ch-dot" :style="`background:${t.kwh}`"></span>DAILY FLOW (m³) &amp; ENERGY (kWh/day)
                <span class="legend"><span class="ls" :style="`background:${t.serum}`"></span>Serum <span class="ls" :style="`background:${t.latex}`"></span>Latex <span class="ll" :style="`background:${t.kwh};margin-left:4px`"></span>kWh</span>
              </div>
              <div class="chart-wrap"><canvas ref="chartMain"></canvas></div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- ── BLOWER OPERATIONS STRIP ── -->
    <div class="bl-strip">
      <div class="bl-strip-hdr">
        <span class="bl-live-dot"></span>
        <span class="bl-strip-title">BLOWER OPERATIONS — TODAY</span>
      </div>
      <div class="bl-cards">

        <!-- TB-01 -->
        <div class="bl-card" :class="liveB1.status==='RUN'?'bl-run':'bl-stop'">
          <div class="bl-name-row">
            <span class="bl-dot"></span>
            <span class="bl-name">TB-01</span>
            <span class="bl-badge">{{ liveB1.status || 'N/A' }}</span>
          </div>
          <div class="bl-metrics">
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB1.kwhToday ?? '—' }}</span>
              <span class="bl-mu">kWh</span>
              <span class="bl-ml">today</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB1.runHoursToday ?? '—' }}</span>
              <span class="bl-mu">hr</span>
              <span class="bl-ml">run time</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ tb1Power }}</span>
              <span class="bl-mu">kW</span>
              <span class="bl-ml">now</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB1.onOffCount ?? tb1OnOff }}</span>
              <span class="bl-mu">×</span>
              <span class="bl-ml">starts</span>
            </div>
          </div>
        </div>

        <div class="bl-sep"></div>

        <!-- TB-02 -->
        <div class="bl-card" :class="liveB2.status==='RUN'?'bl-run':'bl-stop'">
          <div class="bl-name-row">
            <span class="bl-dot"></span>
            <span class="bl-name">TB-02</span>
            <span class="bl-badge">{{ liveB2.status || 'N/A' }}</span>
          </div>
          <div class="bl-metrics">
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB2.kwhToday ?? '—' }}</span>
              <span class="bl-mu">kWh</span>
              <span class="bl-ml">today</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB2.runHoursToday ?? '—' }}</span>
              <span class="bl-mu">hr</span>
              <span class="bl-ml">run time</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ tb2Power }}</span>
              <span class="bl-mu">kW</span>
              <span class="bl-ml">now</span>
            </div>
            <div class="bl-metric">
              <span class="bl-mv">{{ liveB2.onOffCount ?? tb2OnOff }}</span>
              <span class="bl-mu">×</span>
              <span class="bl-ml">starts</span>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { mapGetters } from 'vuex';
Chart.register(...registerables);

// ── Theme definitions ──────────────────────────────────────────────
const THEMES = {
  slate: {
    name:'Slate & Steel',    accent:'#4a9eba',
    bg:'#0d1117',
    g1:'rgba(74,158,186,.07)',   g2:'rgba(74,124,111,.05)',
    cBg:'rgba(17,24,32,.85)',    cBdr:'rgba(30,45,61,.9)',
    text:'rgba(200,216,232,.28)', tick:'#3d5068',
    serum:'#ff7820', latex:'#00e87a', kwh:'#9b8fc0',
    perf:'#6b82a8',  cost:'#b8935a',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#c8a96e', y1:'#7870a8',
    hOk:'#00e87a',   hWarn:'#c8a96e', hCrit:'#a86868',
  },
  carbon: {
    name:'Carbon & Copper',  accent:'#b07d56',
    bg:'#0e0f11',
    g1:'rgba(176,125,86,.07)',   g2:'rgba(122,158,142,.05)',
    cBg:'rgba(16,14,12,.88)',    cBdr:'rgba(44,32,22,.95)',
    text:'rgba(216,207,200,.28)', tick:'#524438',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8878b0',
    perf:'#7888a0',  cost:'#c4a040',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#c4a050', y1:'#8878b0',
    hOk:'#00e87a',   hWarn:'#c4a050', hCrit:'#a87858',
  },
  midnight: {
    name:'Midnight & Sage',  accent:'#5a9e82',
    bg:'#0a0e14',
    g1:'rgba(90,158,130,.07)',   g2:'rgba(90,142,170,.05)',
    cBg:'rgba(12,18,28,.88)',    cBdr:'rgba(21,29,40,.95)',
    text:'rgba(176,200,192,.28)', tick:'#385060',
    serum:'#ff7820', latex:'#00e87a', kwh:'#9888c0',
    perf:'#7a8aaa',  cost:'#9e8a5a',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#c0a878', y1:'#9888c0',
    hOk:'#00e87a',   hWarn:'#c0a878', hCrit:'#a87878',
  },
  obsidian: {
    name:'Obsidian & Frost', accent:'#6888c8',
    bg:'#0c0c10',
    g1:'rgba(104,136,200,.07)',  g2:'rgba(96,168,160,.05)',
    cBg:'rgba(14,14,20,.88)',    cBdr:'rgba(24,24,32,.95)',
    text:'rgba(208,208,224,.28)', tick:'#404060',
    serum:'#ff7820', latex:'#00e87a', kwh:'#9080d0',
    perf:'#7888b8',  cost:'#c8a850',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#d0b870', y1:'#9080d0',
    hOk:'#00e87a',   hWarn:'#d0b870', hCrit:'#c07070',
  },
  dark: {
    name:'Deep Dark',        accent:'#3d8fab',
    bg:'#060810',
    g1:'rgba(61,143,171,.04)',   g2:'rgba(50,100,90,.03)',
    cBg:'rgba(8,10,16,.96)',     cBdr:'rgba(18,26,38,.98)',
    text:'rgba(155,185,210,.22)', tick:'#253545',
    serum:'#ff7820', latex:'#00e87a', kwh:'#7a6ea8',
    perf:'#506080',  cost:'#9a7848',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#a88c58', y1:'#6060a0',
    hOk:'#00e87a',   hWarn:'#a88c58', hCrit:'#905858',
  },
  light: {
    name:'Light',            accent:'#2a7fa8',
    bg:'#eef0f4',
    g1:'rgba(42,127,168,.09)',   g2:'rgba(60,140,110,.07)',
    cBg:'rgba(255,255,255,.88)', cBdr:'rgba(180,200,220,.75)',
    text:'rgba(40,60,80,.58)',   tick:'#5a7890',
    serum:'#ff7820', latex:'#00a854', kwh:'#6050b0',
    perf:'#5a7098',  cost:'#a07040',
    orpS:'#ff7820',  orpL:'#00a854', thresh:'#a08040', y1:'#6050a8',
    hOk:'#00a854',   hWarn:'#a08040', hCrit:'#a84848',
  },
};

function h2r(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function genMonthData(offset) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth()-offset, 1);
  const y=target.getFullYear(), m=target.getMonth();
  const dim = new Date(y,m+1,0).getDate();
  const today = offset===0 ? now.getDate() : dim;
  return Array.from({length:dim},(_,i)=>{
    const day=i+1;
    if(day>today) return {day,serum:null,latex:null,kwh:null,orp_serum:null,orp_latex:null,flow:null};
    const serum=Math.round(100+Math.random()*300), latex=Math.round(80+Math.random()*220);
    const kwh=Math.round(150+Math.random()*200);
    const orp_serum=Math.round(150+Math.random()*230), orp_latex=Math.round(120+Math.random()*250);
    return {day,serum,latex,kwh,orp_serum,orp_latex,flow:serum+latex};
  });
}

function genAnnualData(yearOffset) {
  const now=new Date();
  const year=now.getFullYear()-yearOffset;
  const curM=yearOffset===0?now.getMonth():11;
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return MONTHS.map((label,mi)=>{
    if(mi>curM) return {label,serum:null,latex:null,kwh:null,orp_serum:null,orp_latex:null,flow:null};
    const dim=new Date(year,mi+1,0).getDate();
    let s=0,l=0,k=0,os=0,ol=0;
    for(let d=1;d<=dim;d++){
      s+=Math.round(100+Math.random()*300); l+=Math.round(80+Math.random()*220);
      k+=Math.round(150+Math.random()*200);
      os+=Math.round(150+Math.random()*230); ol+=Math.round(120+Math.random()*250);
    }
    return {label,serum:s,latex:l,kwh:k,orp_serum:Math.round(os/dim),orp_latex:Math.round(ol/dim),flow:s+l};
  });
}

const SCALE_X = {
  ticks:{color:'',font:{size:8},maxTicksLimit:31,autoSkip:false,maxRotation:0},
  grid:{display:false},
};
const SCALE_X_H = { ticks:{display:false}, grid:{display:false} };
const fitY = s => { s.width=52; };

export default {
  name: 'KDExecutive',
  data() {
    return { displayMode:'monthly', monthOffset:0, yearOffset:0, monthData:[], annualData:[], perfThreshold:0.50, costRate:4.50, currentThemeKey:'slate', THEMES };
  },
  watch: {
    perfThreshold(val) {
      const v=parseFloat(val)||0.5;
      if(this._chartPerf)  { this._chartPerf.data.datasets[1].data=Array(this._chartPerf.data.labels.length).fill(v); this._chartPerf.update('none'); }
      if(this._chartPerfA) { this._chartPerfA.data.datasets[1].data=Array(this._chartPerfA.data.labels.length).fill(v); this._chartPerfA.update('none'); }
    },
    costRate() {
      if(this._chartCost)  { this._chartCost.data.datasets[0].data=this.getChartData().cost;   this._chartCost.update('none'); }
      if(this._chartCostA) { this._chartCostA.data.datasets[0].data=this.annualChartData().cost; this._chartCostA.update('none'); }
    },
    currentThemeKey() {
      this.destroyCharts();
      this.$nextTick(()=>this.buildCharts());
    },
    displayMode() {
      this.destroyCharts();
      this.$nextTick(()=>this.buildCharts());
    },
  },
  computed: {
    ...mapGetters('staKd', ['tb1Power','tb1OnOff','tb2Power','tb2OnOff']),
    liveB1() { return this.$store.state.staKd.live?.blower1 || {}; },
    liveB2() { return this.$store.state.staKd.live?.blower2 || {}; },
    t() { return THEMES[this.currentThemeKey]; },
    yearLabel() { return `${new Date().getFullYear()-this.yearOffset}`; },
    monthLabel() { const d=new Date(); d.setMonth(d.getMonth()-this.monthOffset); return d.toLocaleString('en',{month:'long',year:'numeric'}); },
    themeStyle() {
      const t=this.t;
      const li=t.bg[1]>'8';
      const ov=li?'40,60,80':'255,255,255';
      const ob=li?'0,0,0':'255,255,255';
      return {
        background:`radial-gradient(ellipse 55% 40% at 85% 10%,${t.g1},transparent 55%),radial-gradient(ellipse 40% 35% at 5% 90%,${t.g2},transparent 50%),${t.bg}`,
        '--ex-card-bg':   t.cBg,
        '--ex-card-bdr':  t.cBdr,
        '--ex-text':      t.text,
        '--ex-h-ok':      t.hOk,
        '--ex-h-warn':    t.hWarn,
        '--ex-h-crit':    t.hCrit,
        '--ex-accent':    t.accent,
        '--ex-text-sub':  `rgba(${ov},.22)`,
        '--ex-label':     `rgba(${ov},.55)`,
        '--ex-mn-bg':     `rgba(${ob},.04)`,
        '--ex-mn-bdr':    `rgba(${ob},.12)`,
        '--ex-mn-color':  `rgba(${ov},.45)`,
        '--ex-mn-hbg':    `rgba(${ob},.1)`,
        '--ex-mn-hclr':   `rgba(${ov},.88)`,
        '--ex-tag-bg':    `rgba(${ob},.05)`,
        '--ex-tag-color': `rgba(${ov},.32)`,
        '--ex-tag-bdr':   `rgba(${ob},.1)`,
        '--ex-surf-bdr':  `rgba(${ob},.3)`,
        '--ex-surf-act':  `rgba(${ob},.55)`,
      };
    },
    stats() {
      const d=this.annualData.filter(r=>r.flow!==null);
      if(!d.length) return {totalFlow:0,serumTotal:0,latexTotal:0,kwhTotal:0,avgORPSerum:'—',avgORPLatex:'—',efficiency:'—',totalCost:'—',bestDay:{day:'—',flow:0}};
      const totalFlow=d.reduce((a,r)=>a+r.flow,0);
      const serumTotal=d.reduce((a,r)=>a+r.serum,0);
      const latexTotal=d.reduce((a,r)=>a+r.latex,0);
      const kwhTotal=d.reduce((a,r)=>a+r.kwh,0);
      const avgORPSerum=(d.reduce((a,r)=>a+r.orp_serum,0)/d.length).toFixed(0);
      const avgORPLatex=(d.reduce((a,r)=>a+r.orp_latex,0)/d.length).toFixed(0);
      const efficiency=(kwhTotal/totalFlow).toFixed(2);
      const totalCost=(kwhTotal*this.costRate).toFixed(0);
      const best=d.reduce((a,r)=>r.flow>a.flow?r:a,d[0]);
      return {totalFlow,serumTotal,latexTotal,kwhTotal,avgORPSerum,avgORPLatex,efficiency,totalCost,bestDay:best};
    },
    kpiCards() {
      const s=this.stats, t=this.t;
      const count=this.annualData.filter(r=>r.flow!==null).length;
      const orpAvg=parseInt(s.avgORPSerum)+parseInt(s.avgORPLatex);
      const orpCombined=isNaN(orpAvg)?'—':Math.round(orpAvg/2);
      const tc=parseInt(s.totalCost)||0;
      const costM=this.fmt0(count?Math.round(tc/count):0);
      const costD=this.fmt0(Math.round(tc/365));
      return [
        {
          tag:'TOTAL FLOW (ANNUAL)', big:this.fmt0(s.totalFlow), unit:'m³', color:t.accent,
          chips:[
            {label:'Serum', val:this.fmt0(s.serumTotal), color:t.serum},
            {label:'Latex', val:this.fmt0(s.latexTotal), color:t.latex},
          ],
        },
        {
          tag:'TOTAL ENERGY (ANNUAL)', big:this.fmt0(s.kwhTotal), unit:'kWh', color:t.kwh,
          chips:[
            {label:'Blower 1', val:this.fmt0(Math.round(s.kwhTotal*.52)), color:t.kwh},
            {label:'Blower 2', val:this.fmt0(Math.round(s.kwhTotal*.48)), color:t.kwh},
          ],
        },
        {
          tag:'PERFORMANCE (ANNUAL)', big:s.efficiency, unit:'kWh/m³', color:t.perf,
          chips:[],
          foot:'Total Energy ÷ Total Flow',
        },
        {
          tag:'EST. ENERGY COST (ANNUAL)', big:this.fmt0(s.totalCost), unit:'฿', color:t.cost,
          chips:[],
          foot:`${this.fmt0(tc)} ฿/annual  ·  ${costM} ฿/M  ·  ${costD} ฿/day`,
        },
        {
          tag:'ORP AVERAGE (ANNUAL)', big:orpCombined, unit:'mV', color:t.orpS,
          chips:[
            {label:'Serum', val:`${s.avgORPSerum} mV`, color:t.orpS},
            {label:'Latex', val:`${s.avgORPLatex} mV`, color:t.orpL},
          ],
        },
      ];
    },
    monthlyKpiCards() {
      const md=this.monthData, t=this.t;
      const d=md.filter(r=>r.flow!==null);
      if(!d.length) return [];
      const totalFlow   = Math.round(d.reduce((a,r)=>a+r.flow,0));
      const serumTotal  = Math.round(d.reduce((a,r)=>a+(r.serum||0),0));
      const latexTotal  = Math.round(d.reduce((a,r)=>a+(r.latex||0),0));
      const kwhTotal    = Math.round(d.reduce((a,r)=>a+(r.kwh||0),0));
      const avgORPSerum = Math.round(d.reduce((a,r)=>a+(r.orpSerum||0),0)/d.length);
      const avgORPLatex = Math.round(d.reduce((a,r)=>a+(r.orpLatex||0),0)/d.length);
      const totalCost   = Math.round(kwhTotal*this.costRate);
      const eff         = totalFlow?((kwhTotal/totalFlow).toFixed(2)):'—';
      const costD       = this.fmt0(Math.round(totalCost/d.length));
      const orpAvg      = Math.round((avgORPSerum+avgORPLatex)/2);
      return [
        {
          tag:'PERFORMANCE', big:eff, unit:'kWh/m³', color:t.perf, flex:1,
          chips:[], foot:'Energy ÷ Flow',
        },
        {
          tag:'EST. ENERGY COST', big:this.fmt0(totalCost), unit:'฿', color:t.cost, flex:1,
          chips:[], foot:`${this.fmt0(totalCost)} ฿/mo  ·  ${costD} ฿/day`,
        },
        {
          tag:'ORP AVERAGE', big:orpAvg, unit:'mV', color:t.orpS, flex:1,
          chips:[
            {label:'Serum', val:`${avgORPSerum} mV`, color:t.orpS},
            {label:'Latex', val:`${avgORPLatex} mV`, color:t.orpL},
          ],
        },
        {
          tag:'FLOW & ENERGY', big:this.fmt0(totalFlow), unit:'m³', color:t.accent, flex:1.5,
          chips:[
            {label:'Serum',  val:this.fmt0(serumTotal),  color:t.serum},
            {label:'Latex',  val:this.fmt0(latexTotal),  color:t.latex},
            {label:'Energy', val:`${this.fmt0(kwhTotal)} kWh`, color:t.kwh},
          ],
          foot:`B1: ${this.fmt0(Math.round(kwhTotal*.52))} · B2: ${this.fmt0(Math.round(kwhTotal*.48))} kWh`,
        },
      ];
    },
  },
  created() {
    this._chartMain=null; this._chartORP=null; this._chartPerf=null; this._chartCost=null;
    this._chartMainA=null; this._chartORPA=null; this._chartPerfA=null; this._chartCostA=null;
    this.annualData=genAnnualData(0);
    this.monthData=genMonthData(0);
  },
  mounted()      { this.buildCharts(); },
  beforeUnmount(){ this.destroyCharts(); },
  methods: {
    fmt0(v)     { const n=parseInt(v); return isNaN(n)?'—':n.toLocaleString(); },
    pct(a,b)    { return b?((a/b)*100).toFixed(1):'0'; },
    orpLabel(v) { const n=parseInt(v); if(isNaN(n))return''; return n>200?'GOOD':n>0?'LOW':'CRITICAL'; },
    orpCls(v)   { const n=parseInt(v); if(isNaN(n))return''; return n>200?'h-ok':n>0?'h-warn':'h-crit'; },
    destroyCharts() {
      [this._chartMain,this._chartORP,this._chartPerf,this._chartCost,
       this._chartMainA,this._chartORPA,this._chartPerfA,this._chartCostA].forEach(c=>c?.destroy());
    },
    switchTheme(key) { this.currentThemeKey=key; },
    changeYear(dir) {
      this.yearOffset=Math.max(0,Math.min(4,this.yearOffset+dir));
      this.annualData=genAnnualData(this.yearOffset);
      [this._chartPerfA,this._chartCostA,this._chartORPA,this._chartMainA].forEach(c=>c?.destroy());
      this.$nextTick(()=>this.buildAnnualCharts());
    },
    changeMonth(dir) {
      this.monthOffset=Math.max(0,Math.min(5,this.monthOffset+dir));
      this.monthData=genMonthData(this.monthOffset);
      [this._chartPerf,this._chartCost,this._chartORP,this._chartMain].forEach(c=>c?.destroy());
      this.$nextTick(()=>this.buildMonthlyCharts());
    },
    annualChartData() {
      const d=this.annualData, rate=parseFloat(this.costRate)||4.5;
      return {
        labels:    d.map(r=>r.label),
        serum:     d.map(r=>r.serum),
        latex:     d.map(r=>r.latex),
        kwh:       d.map(r=>r.kwh),
        orp_serum: d.map(r=>r.orp_serum),
        orp_latex: d.map(r=>r.orp_latex),
        perf:      d.map(r=>r.flow?+(r.kwh/r.flow).toFixed(3):null),
        cost:      d.map(r=>r.kwh!==null?+(r.kwh*rate).toFixed(0):null),
      };
    },
    getChartData() {
      const d=this.monthData, rate=parseFloat(this.costRate)||4.5;
      return {
        labels:    d.map(r=>`${r.day}`),
        serum:     d.map(r=>r.serum),
        latex:     d.map(r=>r.latex),
        kwh:       d.map(r=>r.kwh),
        orp_serum: d.map(r=>r.orp_serum),
        orp_latex: d.map(r=>r.orp_latex),
        perf:      d.map(r=>r.flow?+(r.kwh/r.flow).toFixed(3):null),
        cost:      d.map(r=>r.kwh!==null?+(r.kwh*rate).toFixed(0):null),
      };
    },
    buildCharts() {
      if(this.displayMode!=='monthly') this.buildAnnualCharts();
      if(this.displayMode!=='annual')  this.buildMonthlyCharts();
    },
    _chartBase() {
      const tk=this.t;
      const li=tk.bg[1]>'8';
      const axisBdr=li?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';
      const BASE={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}}};
      const scY=(cb,color=tk.tick)=>({afterFit:fitY,ticks:{color,font:{size:9},callback:cb},grid:{display:false},border:{color:axisBdr}});
      const sX={...SCALE_X,ticks:{...SCALE_X.ticks,color:tk.tick}};
      return {tk,axisBdr,BASE,scY,sX};
    },
    buildAnnualCharts() {
      const cd=this.annualChartData(), thr=parseFloat(this.perfThreshold)||0.5;
      const {tk,axisBdr,BASE,scY,sX}=this._chartBase();
      this._chartPerfA=new Chart(this.$refs.chartPerfA,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',label:'kWh/m³',data:cd.perf,backgroundColor:h2r(tk.perf,.72),borderRadius:2,order:2},
          {type:'line',label:'Threshold',data:Array(cd.labels.length).fill(thr),borderColor:tk.thresh,borderWidth:1.5,borderDash:[5,4],pointRadius:0,fill:false,order:1},
        ]},options:{...BASE,scales:{x:SCALE_X_H,y:scY(v=>v.toFixed(2))}},
      });
      this._chartCostA=new Chart(this.$refs.chartCostA,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'THB/mo',data:cd.cost,backgroundColor:h2r(tk.cost,.72),borderRadius:2},
        ]},options:{...BASE,scales:{x:SCALE_X_H,y:scY(v=>'฿'+v.toLocaleString())}},
      });
      this._chartORPA=new Chart(this.$refs.chartORPA,{
        type:'line',data:{labels:cd.labels,datasets:[
          {label:'Serum ORP',data:cd.orp_serum,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.07),borderWidth:1.5,pointRadius:3,tension:.4,fill:true},
          {label:'Latex ORP',data:cd.orp_latex,borderColor:tk.orpL,backgroundColor:h2r(tk.orpL,.07),borderWidth:1.5,pointRadius:3,tension:.4,fill:true},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:SCALE_X_H,y:scY(v=>v+' mV')}},
      });
      this._chartMainA=new Chart(this.$refs.chartMainA,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',label:'Serum',data:cd.serum,backgroundColor:h2r(tk.serum,.78),stack:'flow',yAxisID:'y',borderRadius:2},
          {type:'bar',label:'Latex',data:cd.latex,backgroundColor:h2r(tk.latex,.78),stack:'flow',yAxisID:'y',borderRadius:2},
          {type:'line',label:'kWh',data:cd.kwh,borderColor:tk.kwh,backgroundColor:h2r(tk.kwh,.07),borderWidth:1.5,pointRadius:3,pointBackgroundColor:tk.kwh,tension:.4,fill:false,yAxisID:'y1'},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:{...sX,stacked:true},
          y:{...scY(v=>v+' m³'),stacked:true,position:'left'},
          y1:{position:'right',ticks:{color:tk.y1,font:{size:9},callback:v=>v+' kWh'},grid:{display:false},border:{color:axisBdr}},
        }},
      });
    },
    buildMonthlyCharts() {
      const cd=this.getChartData(), thr=parseFloat(this.perfThreshold)||0.5;
      const {tk,axisBdr,BASE,scY,sX}=this._chartBase();
      this._chartPerf=new Chart(this.$refs.chartPerf,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',label:'kWh/m³',data:cd.perf,backgroundColor:h2r(tk.perf,.72),borderRadius:2,order:2},
          {type:'line',label:'Threshold',data:Array(cd.labels.length).fill(thr),borderColor:tk.thresh,borderWidth:1.5,borderDash:[5,4],pointRadius:0,fill:false,order:1},
        ]},options:{...BASE,scales:{x:SCALE_X_H,y:scY(v=>v.toFixed(2))}},
      });
      this._chartCost=new Chart(this.$refs.chartCost,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'THB/day',data:cd.cost,backgroundColor:h2r(tk.cost,.72),borderRadius:2},
        ]},options:{...BASE,scales:{x:SCALE_X_H,y:scY(v=>'฿'+v.toLocaleString())}},
      });
      this._chartORP=new Chart(this.$refs.chartORP,{
        type:'line',data:{labels:cd.labels,datasets:[
          {label:'Serum ORP',data:cd.orp_serum,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.07),borderWidth:1.5,pointRadius:2,tension:.4,fill:true},
          {label:'Latex ORP',data:cd.orp_latex,borderColor:tk.orpL,backgroundColor:h2r(tk.orpL,.07),borderWidth:1.5,pointRadius:2,tension:.4,fill:true},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:SCALE_X_H,y:scY(v=>v+' mV')}},
      });
      this._chartMain=new Chart(this.$refs.chartMain,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',label:'Serum',data:cd.serum,backgroundColor:h2r(tk.serum,.78),stack:'flow',yAxisID:'y',borderRadius:2},
          {type:'bar',label:'Latex',data:cd.latex,backgroundColor:h2r(tk.latex,.78),stack:'flow',yAxisID:'y',borderRadius:2},
          {type:'line',label:'kWh',data:cd.kwh,borderColor:tk.kwh,backgroundColor:h2r(tk.kwh,.07),borderWidth:1.5,pointRadius:2,pointBackgroundColor:tk.kwh,tension:.4,fill:false,yAxisID:'y1'},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:{...sX,stacked:true},
          y:{...scY(v=>v+' m³'),stacked:true,position:'left'},
          y1:{position:'right',ticks:{color:tk.y1,font:{size:9},callback:v=>v+' kWh'},grid:{display:false},border:{color:axisBdr}},
        }},
      });
    },
  },
};
</script>

<style scoped>
.exec-wrap {
  padding: 10px 14px;
  font-family: 'Inter','Segoe UI',sans-serif;
  display: flex; flex-direction: column; gap: 7px;
  height: calc(100vh - 56px - 37px);
  overflow: hidden;
}

/* ── Title bar ── */
.exec-title-bar { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.exec-acc-dot {
  width:7px; height:7px; border-radius:50%; background:var(--ex-accent); flex-shrink:0;
  box-shadow: 0 0 8px color-mix(in srgb, var(--ex-accent) 60%, transparent);
}
.exec-heading { font-size:10px; font-weight:700; letter-spacing:.09em; color:var(--ex-text); text-transform:uppercase; }

/* View mode toggle */
.view-sw { display:flex; align-items:center; background:var(--ex-mn-bg); border:1px solid var(--ex-mn-bdr); border-radius:5px; overflow:hidden; }
.view-btn { padding:3px 11px; font-size:9px; font-weight:700; letter-spacing:.06em; cursor:pointer; color:var(--ex-mn-color); background:transparent; border:none; transition:all .15s; white-space:nowrap; }
.view-btn.active { background:var(--ex-accent); color:rgba(255,255,255,.92); }
.view-btn:not(.active):hover { background:var(--ex-mn-hbg); }

/* Theme switcher */
.theme-sw { display:flex; align-items:center; gap:5px; padding:0 4px; }
.theme-btn {
  width:13px; height:13px; border-radius:50%;
  background:var(--ta); border:2px solid transparent;
  cursor:pointer; transition:all .2s; flex-shrink:0;
  outline:none;
}
.theme-btn:hover { border-color:var(--ex-surf-bdr); transform:scale(1.15); }
.ts-active { border-color:var(--ex-surf-act) !important; transform:scale(1.2); box-shadow:0 0 6px var(--ta); }

.month-nav { display:flex; align-items:center; gap:7px; margin-left:auto; }
.mn-btn {
  width:24px; height:24px; border-radius:5px;
  border:1px solid var(--ex-mn-bdr); background:var(--ex-mn-bg);
  color:var(--ex-mn-color); cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:15px; transition:all .15s;
}
.mn-btn:hover:not(:disabled) { background:var(--ex-mn-hbg); color:var(--ex-mn-hclr); }
.mn-btn:disabled { opacity:.22; cursor:default; }
.mn-label { font-size:12px; font-weight:600; color:var(--ex-label); min-width:130px; text-align:center; letter-spacing:.02em; }
.demo-tag { font-size:9px; font-weight:700; padding:1px 7px; border-radius:3px; background:var(--ex-tag-bg); color:var(--ex-tag-color); border:1px solid var(--ex-tag-bdr); letter-spacing:.07em; }

/* ── KPI Grid ── */
.kpi-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; flex-shrink:0; background:var(--ex-card-bdr); border-radius:8px; overflow:hidden; }
.kpi-card {
  display:flex; flex-direction:column; gap:6px;
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--c) 14%, var(--ex-card-bg)) 0%,
    var(--ex-card-bg) 52%
  );
  border-left:3px solid var(--c);
  box-shadow: inset 0 0 22px color-mix(in srgb, var(--c) 6%, transparent);
  padding:12px 16px;
  transition:background .2s, filter .15s;
}
.kpi-card:hover {
  filter:brightness(1.1);
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--c) 20%, var(--ex-card-bg)) 0%,
    var(--ex-card-bg) 55%
  );
}
.kpi-tag { font-size:9px; font-weight:700; color:var(--ex-text-sub); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kpi-big-row { display:flex; align-items:baseline; gap:6px; }
.kpi-big { font-family:'JetBrains Mono',monospace; font-size:30px; font-weight:700; line-height:1; }
.kpi-unit-b { font-size:14px; font-weight:600; }
.kpi-chips { display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
.kpi-chip { font-family:'JetBrains Mono',monospace; font-size:9px; padding:2px 8px; border-radius:3px; background:var(--ex-tag-bg); border:1px solid var(--ex-tag-bdr); white-space:nowrap; }
.kpi-foot { font-size:9px; color:var(--ex-text-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.h-ok   { color:var(--ex-h-ok) !important; }
.h-warn { color:var(--ex-h-warn) !important; }
.h-crit { color:var(--ex-h-crit) !important; }

/* ── Dual chart columns ── */
.chart-dual { flex:1; min-height:0; display:flex; gap:7px; }
.chart-col  { min-height:0; display:flex; flex-direction:column; gap:5px; }
.chart-col:first-child { flex:2; }
.chart-col:last-child  { flex:8; }

/* ── Monthly body: left KPI panel + charts ── */
.monthly-body   { flex:1; min-height:0; display:flex; gap:7px; }
.monthly-kpi-col { display:flex; flex-direction:column; gap:5px; width:175px; flex-shrink:0; }
.monthly-charts  { flex:1; min-height:0; display:flex; flex-direction:column; gap:5px; }
.mkpi-card { display:flex; flex-direction:column; gap:4px; background:var(--ex-card-bg); border-left:3px solid var(--c); padding:9px 11px; border-radius:4px; flex:1; min-height:0; overflow:hidden; }
.mkpi-card .kpi-tag    { font-size:8px; white-space:normal; line-height:1.2; }
.mkpi-card .kpi-big    { font-size:20px; }
.mkpi-card .kpi-unit-b { font-size:11px; }
.mkpi-card .kpi-chip   { font-size:8px; padding:1px 6px; }
.mkpi-card .kpi-foot   { font-size:8px; white-space:normal; line-height:1.3; }

.col-hdr { display:flex; align-items:center; justify-content:space-between; flex-shrink:0; padding:0 3px; }
.col-title { font-size:9px; font-weight:700; letter-spacing:.1em; color:var(--ex-accent); }
.col-nav { display:flex; align-items:center; gap:5px; }
.col-nav-btn { width:20px; height:20px; border-radius:4px; border:1px solid var(--ex-mn-bdr); background:var(--ex-mn-bg); color:var(--ex-mn-color); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; transition:all .15s; }
.col-nav-btn:hover:not(:disabled) { background:var(--ex-mn-hbg); color:var(--ex-mn-hclr); }
.col-nav-btn:disabled { opacity:.22; cursor:default; }
.col-nav-label { font-size:11px; font-weight:600; color:var(--ex-label); min-width:100px; text-align:center; }
.chart-card {
  background:var(--ex-card-bg);
  border:1px solid var(--ex-card-bdr);
  border-radius:8px; padding:7px 11px;
  display:flex; flex-direction:column; gap:4px; min-height:0;
  transition:border-color .3s;
}
.chart-sm { flex:1; }
.chart-lg { flex:1.5; }
.chart-hdr {
  display:flex; align-items:center; gap:7px; flex-shrink:0;
  font-size:9px; font-weight:600; color:var(--ex-text); letter-spacing:.07em; text-transform:uppercase;
}
.ch-dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; transition:background .3s; }
.legend { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:9px; color:var(--ex-text-sub); }
.ls { width:8px; height:8px; border-radius:2px; display:inline-block; opacity:.85; transition:background .3s; }
.ll { width:14px; height:2.5px; border-radius:2px; display:inline-block; opacity:.85; transition:background .3s; }

/* Controls */
.ctrl-group { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:9px; color:var(--ex-text-sub); }
.ctrl-input {
  width:46px; padding:1px 5px; border-radius:4px; border-width:1px; border-style:solid;
  font-size:10px; font-weight:600; font-family:'JetBrains Mono',monospace;
  text-align:center; outline:none; transition:border-color .15s, background .15s;
}
.ctrl-input:focus { opacity:1; filter:brightness(1.2); }

.chart-wrap { flex:1; min-height:0; position:relative; }
.chart-wrap canvas { position:absolute; inset:0; }

/* ── Blower strip ── */
.bl-strip {
  flex-shrink:0;
  background:var(--ex-card-bg);
  border:1px solid var(--ex-card-bdr);
  border-radius:7px;
  padding:7px 14px;
  display:flex; flex-direction:column; gap:5px;
}
.bl-strip-hdr { display:flex; align-items:center; gap:7px; }
.bl-strip-title { font-size:9px; font-weight:700; letter-spacing:.1em; color:var(--ex-text-sub); }
.bl-live-dot {
  width:6px; height:6px; border-radius:50%;
  background:#00e87a; box-shadow:0 0 4px #00e87a;
  animation:blinkdot 2s infinite; flex-shrink:0;
}
@keyframes blinkdot { 0%,100%{opacity:1} 50%{opacity:.25} }

.bl-cards { display:flex; align-items:center; gap:0; }
.bl-card  { flex:1; display:flex; align-items:center; gap:20px; padding:0 10px; }
.bl-sep   { width:1px; height:36px; background:var(--ex-card-bdr); flex-shrink:0; }

.bl-name-row { display:flex; align-items:center; gap:6px; flex-shrink:0; width:110px; }
.bl-dot   { width:8px; height:8px; border-radius:50%; background:var(--blc); box-shadow:0 0 5px var(--blc); flex-shrink:0; }
.bl-name  { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--ex-label); }
.bl-badge { font-size:8px; font-weight:700; letter-spacing:.06em; padding:1px 6px; border-radius:3px; color:var(--blc); background:color-mix(in srgb, var(--blc) 14%, transparent); }

.bl-run  { --blc:#00e87a; }
.bl-stop { --blc:rgba(255,255,255,.3); }

.bl-metrics { display:flex; align-items:center; gap:22px; }
.bl-metric  { display:flex; align-items:baseline; gap:2px; }
.bl-mv { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--ex-label); }
.bl-mu { font-size:9px; font-weight:600; color:var(--ex-text-sub); margin-left:1px; }
.bl-ml { font-size:8px; color:var(--ex-text-sub); margin-left:2px; }
</style>
