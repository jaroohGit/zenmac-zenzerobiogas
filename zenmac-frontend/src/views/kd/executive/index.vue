<template>
  <div class="exec-wrap" :style="themeStyle">

    <!-- ── TITLE BAR ── -->
    <div class="exec-title-bar">
      <span class="exec-acc-dot"></span>
      <span class="exec-heading">EXECUTIVE SUMMARY — OPERATION REPORT</span>

      <!-- View toggle -->
      <div class="view-toggle">
        <button class="vt-btn" :class="{active:viewMode==='monthly'}" @click="switchView('monthly')">MONTHLY</button>
        <button class="vt-btn" :class="{active:viewMode==='annual'}"  @click="switchView('annual')">ANNUAL</button>
      </div>

      <!-- Month navigation (monthly mode only) -->
      <div class="month-nav" v-if="viewMode==='monthly'">
        <button class="mn-btn" @click="changeMonth(1)" :disabled="monthOffset>=5"><i class="bx bx-chevron-left"></i></button>
        <span class="mn-label">{{ monthLabel }}</span>
        <button class="mn-btn" @click="changeMonth(-1)" :disabled="monthOffset<=0"><i class="bx bx-chevron-right"></i></button>
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
    </div>

    <!-- ── KPI GRID 5 cards ── -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="k in activeKpiCards" :key="k.tag" :style="`--c:${k.color}`">
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

    <!-- ── MONTHLY BODY: left KPI panel + charts ── -->
    <div class="monthly-body">

      <!-- Left: Treatment Performance column -->
      <div class="tp-col">
        <div class="tp-col-hdr">
          <span class="tp-title">TREATMENT PERFORMANCE</span>
          <span class="tp-sub">{{ viewMode==='annual'?'สรุปรายปี':'สรุปรายเดือน' }}</span>
        </div>
        <div class="tp-card" v-for="k in activeTreatPerfCards" :key="k.tag" :style="`--c:${k.color};--pct:${k.meter??0}`">
          <div class="tp-donut-wrap">
            <div class="tp-donut-inner">
              <span class="tp-big" :style="`color:${k.color}`">{{ k.big }}</span>
              <span class="tp-unit" :style="`color:${k.color}`">{{ k.unit }}</span>
            </div>
          </div>
          <div class="tp-info">
            <div class="kpi-tag">{{ k.tag }}</div>
            <div class="tp-status" v-if="k.status" :style="`color:${k.color}`">{{ k.status }}</div>
            <div class="kpi-foot">{{ k.foot }}</div>
          </div>
        </div>
      </div>

      <!-- Right: charts -->
      <div class="monthly-charts">

        <!-- TOP ROW: 2 main charts -->
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.perf}`"></span>{{ viewMode==='annual'?'EFFICIENCY BY MONTH':'TREATMENT EFFICIENCY' }} — m³/kWh
            <span class="legend">
              <span class="ls" :style="`background:${t.perf}`"></span>m³/kWh
              <span class="ll" :style="`background:${t.hWarn};margin-left:4px`"></span>฿/m³
              <span class="ll-dash" :style="`border-color:${t.thresh}`"></span><span :style="`color:${t.thresh}`">{{ threshEff }}</span>
            </span>
            <span class="ctrl-group">Thresh <input type="number" v-model.number="threshEff" step="0.1" min="0.1" max="10" class="ctrl-input" :style="`color:${t.thresh};border-color:${t.thresh}40;background:${t.thresh}14`"/> m³/kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartPerf"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.kwh}`"></span>BLOWER ENERGY — TB-01 vs TB-02 {{ viewMode==='annual'?'(kWh/month)':'(kWh/day)' }}
            <span class="legend">
              <span class="ls" :style="`background:${t.kwh}`"></span>TB-01
              <span class="ls" :style="`background:${t.cost}`"></span>TB-02
              <span class="ll" :style="`background:${t.hWarn};margin-left:4px`"></span>Cost ฿
            </span>
            <span class="ctrl-group">Rate <input type="number" v-model.number="costRate" step="0.10" min="1" max="20" class="ctrl-input" :style="`color:${t.hWarn};border-color:${t.hWarn}40;background:${t.hWarn}14`"/> ฿/kWh</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartBlower"></canvas></div>
        </div>

        <!-- BOTTOM-LEFT: Flow chart -->
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.serum}`"></span>DAILY FLOW — SERUM &amp; LATEX {{ viewMode==='annual'?'(m³/month)':'(m³/day)' }}
            <span class="legend">
              <span class="ls" :style="`background:${t.serum}`"></span>Serum
              <span class="ls" :style="`background:${t.latex}`"></span>Latex
            </span>
          </div>
          <div class="chart-wrap"><canvas ref="chartMain"></canvas></div>
        </div>

        <!-- BOTTOM-RIGHT: ORP chart -->
        <div class="chart-card">
          <div class="chart-hdr">
            <span class="ch-dot" :style="`background:${t.orpS}`"></span>ORP — SERUM &amp; LATEX {{ viewMode==='annual'?'(mV/month)':'(mV/day)' }}
            <span class="legend">
              <span class="ls" :style="`background:${t.orpS}`"></span>Serum
              <span class="ls" :style="`background:${t.orpL}`"></span>Latex
              <span class="ll-dash" :style="`border-color:${t.thresh}`"></span><span :style="`color:${t.thresh};font-size:9px`">{{ threshORP }}</span>
            </span>
            <span class="ctrl-group">Thresh <input type="number" v-model.number="threshORP" step="10" min="10" max="500" class="ctrl-input" :style="`color:${t.thresh};border-color:${t.thresh}40;background:${t.thresh}14`"/> mV</span>
          </div>
          <div class="chart-wrap"><canvas ref="chartORP"></canvas></div>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

const API = process.env.VUE_APP_KD_BACKEND
  || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3323');

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

function genAnnualData() {
  const now = new Date();
  const y = now.getFullYear(), curM = now.getMonth();
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return labels.map((label, m) => {
    if (m > curM) return { label, month:m+1, serum:null, latex:null, kwh:null, kwh1:null, kwh2:null, orp_serum:null, orp_latex:null, flow:null };
    const days = new Date(y, m+1, 0).getDate();
    const serum = Math.round((100+Math.random()*300)*days);
    const latex = Math.round((80 +Math.random()*220)*days);
    const kwh   = Math.round((150+Math.random()*200)*days);
    const kwh1  = Math.round(kwh*.52), kwh2 = kwh-kwh1;
    const orp_serum = Math.round(150+Math.random()*230);
    const orp_latex = Math.round(120+Math.random()*250);
    return { label, month:m+1, serum, latex, kwh, kwh1, kwh2, orp_serum, orp_latex, flow:serum+latex };
  });
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
    const kwh1=Math.round(kwh*.52), kwh2=kwh-kwh1;
    const orp_serum=Math.round(150+Math.random()*230), orp_latex=Math.round(120+Math.random()*250);
    return {day,serum,latex,kwh,kwh1,kwh2,orp_serum,orp_latex,flow:serum+latex};
  });
}


const SCALE_X = {
  ticks:{color:'',font:{size:8},maxTicksLimit:31,autoSkip:false,maxRotation:0},
  grid:{display:false},
};
const fitY = s => { s.width=52; };

export default {
  name: 'KDExecutive',
  data() {
    return { monthOffset:0, monthData:[], annualData:[], viewMode:'monthly', costRate:4.50, threshEff:1.5, threshORP:150, currentThemeKey:'slate', THEMES };
  },
  watch: {
    costRate() {
      const cd = this.viewMode==='annual' ? this.getAnnualChartData() : this.getChartData();
      if(this._chartBlower) { this._chartBlower.data.datasets[2].data=cd.cost; this._chartBlower.update('none'); }
      if(this._chartPerf)   { this._chartPerf.data.datasets[1].data=cd.costPerM3; this._chartPerf.update('none'); }
    },
    threshEff() {
      if(this._chartPerf) {
        this._chartPerf.data.datasets[2].data=this._chartPerf.data.labels.map(()=>this.threshEff);
        this._chartPerf.update('none');
      }
    },
    threshORP() {
      if(this._chartORP) {
        this._chartORP.data.datasets[2].data=this._chartORP.data.labels.map(()=>this.threshORP);
        this._chartORP.update('none');
      }
    },
    viewMode() {
      this.destroyCharts();
      this.$nextTick(()=>this.buildCharts());
    },
    currentThemeKey() {
      this.destroyCharts();
      this.$nextTick(()=>this.buildCharts());
    },
  },
  computed: {
    t() { return THEMES[this.currentThemeKey]; },
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
      const d=this.monthData.filter(r=>r.flow!==null);
      if(!d.length) return {totalFlow:0,serumTotal:0,latexTotal:0,kwhTotal:0,avgORPSerum:'—',avgORPLatex:'—',efficiency:'—',totalCost:'—',bestDay:{day:'—',flow:0}};
      const totalFlow=d.reduce((a,r)=>a+r.flow,0);
      const serumTotal=d.reduce((a,r)=>a+r.serum,0);
      const latexTotal=d.reduce((a,r)=>a+r.latex,0);
      const kwhTotal=d.reduce((a,r)=>a+r.kwh,0);
      const kwh1Total=d.reduce((a,r)=>a+(r.kwh1||0),0);
      const kwh2Total=d.reduce((a,r)=>a+(r.kwh2||0),0);
      const orpSData=d.filter(r=>r.orp_serum!=null);
      const orpLData=d.filter(r=>r.orp_latex!=null);
      const avgORPSerum=orpSData.length?(orpSData.reduce((a,r)=>a+r.orp_serum,0)/orpSData.length).toFixed(0):'—';
      const avgORPLatex=orpLData.length?(orpLData.reduce((a,r)=>a+r.orp_latex,0)/orpLData.length).toFixed(0):'—';
      const efficiency=kwhTotal?(totalFlow/kwhTotal).toFixed(2):'—';
      const totalCost=(kwhTotal*this.costRate).toFixed(0);
      const best=d.reduce((a,r)=>r.flow>a.flow?r:a,d[0]);
      return {totalFlow,serumTotal,latexTotal,kwhTotal,kwh1Total,kwh2Total,avgORPSerum,avgORPLatex,efficiency,totalCost,bestDay:best};
    },
    kpiCards() {
      const s=this.stats, t=this.t;
      const count=this.monthData.filter(r=>r.flow!==null).length;
      const orpAvg=parseInt(s.avgORPSerum)+parseInt(s.avgORPLatex);
      const orpCombined=isNaN(orpAvg)?'—':Math.round(orpAvg/2);
      const tc=parseInt(s.totalCost)||0;
      const costD=this.fmt0(count?Math.round(tc/count):0);
      return [
        {
          tag:'TOTAL FLOW', big:this.fmt0(s.totalFlow), unit:'m³', color:t.accent,
          chips:[
            {label:'Serum', val:this.fmt0(s.serumTotal), color:t.serum},
            {label:'Latex', val:this.fmt0(s.latexTotal), color:t.latex},
          ],
        },
        {
          tag:'TOTAL ENERGY', big:this.fmt0(s.kwhTotal), unit:'kWh', color:t.kwh,
          chips:[
            {label:'TB-01', val:this.fmt0(s.kwh1Total), color:t.kwh},
            {label:'TB-02', val:this.fmt0(s.kwh2Total), color:t.cost},
          ],
        },
        {
          tag:'PERFORMANCE', big:s.efficiency, unit:'m³/kWh', color:t.perf,
          chips:[],
          foot:'Flow ÷ Energy — Higher is Better',
        },
        {
          tag:'EST. ENERGY COST', big:this.fmt0(s.totalCost), unit:'฿', color:t.cost,
          chips:[],
          foot:`${this.fmt0(tc)} ฿/month  ·  ${costD} ฿/day avg`,
        },
        {
          tag:'ORP AVERAGE', big:orpCombined, unit:'mV', color:t.orpS,
          chips:[
            {label:'Serum', val:`${s.avgORPSerum} mV`, color:t.orpS},
            {label:'Latex', val:`${s.avgORPLatex} mV`, color:t.orpL},
          ],
        },
      ];
    },
    treatPerfCards() {
      const s=this.stats, t=this.t;
      const d=this.monthData.filter(r=>r.flow!==null&&r.kwh!==null);
      if(!d.length) return [];
      const effVal    = s.kwhTotal ? s.totalFlow/s.kwhTotal : 0;
      const costVal   = s.totalFlow ? (s.kwhTotal*this.costRate)/s.totalFlow : 0;
      const effMeter  = Math.min(100,Math.round(effVal/2.0*100));
      const costMeter = Math.max(0,Math.min(100,Math.round((1-costVal/15)*100)));
      const effColor  = effMeter>=100?t.hOk:effMeter>=60?t.hWarn:t.hCrit;
      const costColor = costMeter>=60?t.hOk:costMeter>=30?t.hWarn:t.hCrit;
      const orpOk     = d.filter(r=>r.orp_serum>150&&r.orp_latex>150).length;
      const orpAch    = Math.round(orpOk/d.length*100);
      const orpColor  = orpAch>=70?t.hOk:orpAch>=40?t.hWarn:t.hCrit;
      const avgOrpS   = parseFloat(s.avgORPSerum) || 0;
      const kwoSVal   = avgOrpS ? s.kwhTotal / avgOrpS : null;
      const kwoS      = kwoSVal !== null ? kwoSVal.toFixed(2) : '—';
      const kwoSMeter = kwoSVal !== null ? Math.max(0,Math.min(100,Math.round((1-kwoSVal/15)*100))) : 0;
      const kwoSColor = kwoSMeter>=70?t.hOk:kwoSMeter>=40?t.hWarn:t.hCrit;
      return [
        { tag:'TREAT. EFFICIENCY', big:effVal.toFixed(2),  unit:'m³/kWh', color:effColor,  foot:'Flow ÷ Energy — Higher is Better', meter:effMeter,  meterColor:effColor,  status:effMeter>=100?'OPTIMAL':effMeter>=60?'MODERATE':'NEEDS WORK' },
        { tag:'AERATION COST',     big:costVal.toFixed(1), unit:'฿/m³',   color:costColor, foot:`Rate ${this.costRate} ฿/kWh`,      meter:costMeter, meterColor:costColor, status:costMeter>=60?'EFFICIENT':costMeter>=30?'MODERATE':'HIGH COST' },
        { tag:'kWh/ORP-SERUM',     big:kwoS, unit:'kWh/mV', color:kwoSColor, foot:`Avg ORP Serum: ${s.avgORPSerum} mV`, meter:kwoSMeter, meterColor:kwoSColor, status:kwoSMeter>=70?'EFFICIENT':kwoSMeter>=40?'MODERATE':'REVIEW' },
        { tag:'ORP ACHIEVEMENT',   big:orpAch,    unit:'%',      color:orpColor,  foot:`${orpOk}/${d.length} days ORP > 150 mV` },
      ];
    },
    annualStats() {
      const d=this.annualData.filter(r=>r.flow!=null||(r.serum!=null||r.latex!=null)).map(r=>({...r,flow:r.flow??((r.serum||0)+(r.latex||0))}));
      if(!d.length) return {totalFlow:0,kwhTotal:0,totalCost:'—'};
      const totalFlow=d.reduce((a,r)=>a+r.flow,0);
      const kwhTotal=d.reduce((a,r)=>a+r.kwh,0);
      const kwh1Total=d.reduce((a,r)=>a+(r.kwh1||0),0);
      const kwh2Total=d.reduce((a,r)=>a+(r.kwh2||0),0);
      const totalCost=Math.round(kwhTotal*this.costRate);
      const aOrpS=d.filter(r=>r.orp_serum!=null);
      const aOrpL=d.filter(r=>r.orp_latex!=null);
      const avgOrpS=aOrpS.length?Math.round(aOrpS.reduce((a,r)=>a+r.orp_serum,0)/aOrpS.length):null;
      const avgOrpL=aOrpL.length?Math.round(aOrpL.reduce((a,r)=>a+r.orp_latex,0)/aOrpL.length):null;
      return {totalFlow,kwhTotal,kwh1Total,kwh2Total,totalCost,serumTotal:d.reduce((a,r)=>a+r.serum,0),latexTotal:d.reduce((a,r)=>a+r.latex,0),avgOrpS,avgOrpL,months:d.length};
    },
    annualKpiCards() {
      const s=this.annualStats, t=this.t;
      const eff = s.kwhTotal?(s.totalFlow/s.kwhTotal).toFixed(2):'—';
      const orpOk=this.annualData.filter(r=>r.orp_serum!==null&&r.orp_serum>150&&r.orp_latex>150).length;
      const orpAch=s.months?Math.round(orpOk/s.months*100):0;
      return [
        { tag:'ANNUAL FLOW',       big:this.fmt0(s.totalFlow),   unit:'m³',   color:t.accent, chips:[{label:'Serum',val:this.fmt0(s.serumTotal),color:t.serum},{label:'Latex',val:this.fmt0(s.latexTotal),color:t.latex}] },
        { tag:'ANNUAL ENERGY',     big:this.fmt0(s.kwhTotal),    unit:'kWh',  color:t.kwh,    chips:[{label:'TB-01',val:this.fmt0(s.kwh1Total),color:t.kwh},{label:'TB-02',val:this.fmt0(s.kwh2Total),color:t.cost}] },
        { tag:'AVG EFFICIENCY',    big:eff,                       unit:'m³/kWh',color:t.perf,  chips:[], foot:'Annual Flow ÷ Energy' },
        { tag:'EST. ANNUAL COST',  big:this.fmt0(s.totalCost),   unit:'฿',    color:t.cost,   chips:[], foot:`${s.months} months · ${this.costRate} ฿/kWh` },
        { tag:'ORP ACHIEVEMENT',   big:orpAch,                   unit:'%',    color:orpAch>=70?t.hOk:orpAch>=40?t.hWarn:t.hCrit, chips:[{label:'Serum avg',val:s.avgOrpS+' mV',color:t.orpS},{label:'Latex avg',val:s.avgOrpL+' mV',color:t.orpL}] },
      ];
    },
    annualTreatPerfCards() {
      const s=this.annualStats, t=this.t;
      const d=this.annualData.filter(r=>r.flow!=null||(r.serum!=null||r.latex!=null)).map(r=>({...r,flow:r.flow??((r.serum||0)+(r.latex||0))}));
      if(!d.length) return [];
      const effVal    = s.kwhTotal ? s.totalFlow/s.kwhTotal : 0;
      const costVal   = s.totalFlow ? s.kwhTotal*this.costRate/s.totalFlow : 0;
      const effMeter  = Math.min(100,Math.round(effVal/2.0*100));
      const costMeter = Math.max(0,Math.min(100,Math.round((1-costVal/15)*100)));
      const effColor  = effMeter>=100?t.hOk:effMeter>=60?t.hWarn:t.hCrit;
      const costColor = costMeter>=60?t.hOk:costMeter>=30?t.hWarn:t.hCrit;
      const orpOk=d.filter(r=>r.orp_serum>150&&r.orp_latex>150).length;
      const orpAch=Math.round(orpOk/d.length*100);
      const orpColor=orpAch>=70?t.hOk:orpAch>=40?t.hWarn:t.hCrit;
      const kwoSVal   = s.avgOrpS ? s.kwhTotal / s.avgOrpS : null;
      const kwoS      = kwoSVal !== null ? kwoSVal.toFixed(2) : '—';
      const kwoSMeter = kwoSVal !== null ? Math.max(0,Math.min(100,Math.round((1-kwoSVal/15)*100))) : 0;
      const kwoSColor = kwoSMeter>=70?t.hOk:kwoSMeter>=40?t.hWarn:t.hCrit;
      return [
        { tag:'ANNUAL EFFICIENCY', big:effVal.toFixed(2),  unit:'m³/kWh', color:effColor,  foot:'Annual Flow ÷ Energy', meter:effMeter,  meterColor:effColor,  status:effMeter>=100?'OPTIMAL':effMeter>=60?'MODERATE':'NEEDS WORK' },
        { tag:'AVG AERATION COST', big:costVal.toFixed(1), unit:'฿/m³',   color:costColor, foot:`Rate ${this.costRate} ฿/kWh`,  meter:costMeter, meterColor:costColor, status:costMeter>=60?'EFFICIENT':costMeter>=30?'MODERATE':'HIGH COST' },
        { tag:'kWh/ORP-SERUM',     big:kwoS, unit:'kWh/mV', color:kwoSColor, foot:`Avg ORP Serum: ${s.avgOrpS} mV`, meter:kwoSMeter, meterColor:kwoSColor, status:kwoSMeter>=70?'EFFICIENT':kwoSMeter>=40?'MODERATE':'REVIEW' },
        { tag:'ORP ACHIEVEMENT',   big:orpAch, unit:'%',  color:orpColor, foot:`${orpOk}/${d.length} months ORP > 150 mV` },
      ];
    },
    activeKpiCards()       { return this.viewMode==='annual' ? this.annualKpiCards      : this.kpiCards; },
    activeTreatPerfCards() { return this.viewMode==='annual' ? this.annualTreatPerfCards : this.treatPerfCards; },
    orpBarStats() {
      const s=this.stats, t=this.t;
      const d=this.monthData.filter(r=>r.flow!==null);
      const orpOk=d.filter(r=>r.orp_serum>this.threshORP&&r.orp_latex>this.threshORP).length;
      const ach=d.length?Math.round(orpOk/d.length*100):0;
      const achColor=ach>=70?t.hOk:ach>=40?t.hWarn:t.hCrit;
      const sVal=parseFloat(s.avgORPSerum)||0, lVal=parseFloat(s.avgORPLatex)||0;
      const maxV=Math.max(500,sVal*1.1,lVal*1.1);
      return { serumAvg:s.avgORPSerum, latexAvg:s.avgORPLatex, serumPct:Math.min(100,sVal/maxV*100).toFixed(1), latexPct:Math.min(100,lVal/maxV*100).toFixed(1), threshPct:Math.min(100,this.threshORP/maxV*100).toFixed(1), ach, achColor, daysAbove:orpOk, daysTotal:d.length };
    },
    annualOrpBarStats() {
      const s=this.annualStats, t=this.t;
      const d=this.annualData.filter(r=>r.orp_serum!=null||r.orp_latex!=null);
      const orpOk=d.filter(r=>r.orp_serum>this.threshORP&&r.orp_latex>this.threshORP).length;
      const ach=d.length?Math.round(orpOk/d.length*100):0;
      const achColor=ach>=70?t.hOk:ach>=40?t.hWarn:t.hCrit;
      const sVal=s.avgOrpS||0, lVal=s.avgOrpL||0;
      const maxV=Math.max(500,sVal*1.1,lVal*1.1);
      return { serumAvg:sVal, latexAvg:lVal, serumPct:Math.min(100,sVal/maxV*100).toFixed(1), latexPct:Math.min(100,lVal/maxV*100).toFixed(1), threshPct:Math.min(100,this.threshORP/maxV*100).toFixed(1), ach, achColor, daysAbove:orpOk, daysTotal:d.length };
    },
    activeOrpStats() { return this.viewMode==='annual'?this.annualOrpBarStats:this.orpBarStats; },
    activeFlowStats() {
      const s=this.viewMode==='annual'?this.annualStats:this.stats;
      const serum=s.serumTotal||0, latex=s.latexTotal||0, total=serum+latex||1;
      const kwh=s.kwhTotal||0, eff=kwh?(total/kwh).toFixed(2):'—';
      return { serum, latex, total, kwh, eff, serumPct:Math.round(serum/total*100), latexPct:Math.round(latex/total*100) };
    },
  },
  async mounted() {
    this._chartMain=null; this._chartORP=null; this._chartPerf=null; this._chartBlower=null;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    try {
      const res = await axios.get(`${API}/api/kd/history/daily?month=${ym}`);
      this.monthData = res.data && res.data.length ? res.data : genMonthData(0);
    } catch { this.monthData = genMonthData(0); }
    try {
      const res = await axios.get(`${API}/api/kd/history/monthly?year=${now.getFullYear()}`);
      this.annualData = res.data && res.data.length ? res.data : genAnnualData();
    } catch { this.annualData = genAnnualData(); }
    this.buildCharts();
  },
  beforeUnmount(){ this.destroyCharts(); },
  methods: {
    fmt0(v)     { const n=parseInt(v); return isNaN(n)?'—':n.toLocaleString(); },
    pct(a,b)    { return b?((a/b)*100).toFixed(1):'0'; },
    orpLabel(v) { const n=parseInt(v); if(isNaN(n))return''; return n>200?'GOOD':n>0?'LOW':'CRITICAL'; },
    orpCls(v)   { const n=parseInt(v); if(isNaN(n))return''; return n>200?'h-ok':n>0?'h-warn':'h-crit'; },
    destroyCharts() {
      [this._chartMain,this._chartORP,this._chartPerf,this._chartBlower].forEach(c=>c?.destroy());
    },
    switchTheme(key) { this.currentThemeKey=key; },
    async changeMonth(dir) {
      this.monthOffset=Math.max(0,Math.min(5,this.monthOffset+dir));
      const d = new Date(); d.setMonth(d.getMonth()-this.monthOffset);
      const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      try {
        const res = await axios.get(`${API}/api/kd/history/daily?month=${ym}`);
        this.monthData = res.data && res.data.length ? res.data : genMonthData(this.monthOffset);
      } catch { this.monthData = genMonthData(this.monthOffset); }
      [this._chartPerf,this._chartBlower,this._chartORP,this._chartMain].forEach(c=>c?.destroy());
      this.$nextTick(()=>this.buildMonthlyCharts());
    },
    getChartData() {
      const d=this.monthData, rate=parseFloat(this.costRate)||4.5;
      return {
        labels:    d.map(r=>`${r.day}`),
        serum:     d.map(r=>r.serum),
        latex:     d.map(r=>r.latex),
        kwh:       d.map(r=>r.kwh),
        kwh1:      d.map(r=>r.kwh1),
        kwh2:      d.map(r=>r.kwh2),
        orp_serum: d.map(r=>r.orp_serum),
        orp_latex: d.map(r=>r.orp_latex),
        perf:      d.map(r=>r.flow?+(r.kwh/r.flow).toFixed(3):null),
        cost:      d.map(r=>r.kwh!==null?+(r.kwh*rate).toFixed(0):null),
        treatEff:  d.map(r=>r.flow&&r.kwh?+(r.flow/r.kwh).toFixed(3):null),
        costPerM3: d.map(r=>r.flow&&r.kwh?+(r.kwh*rate/r.flow).toFixed(1):null),
      };
    },
    buildCharts() {
      if (this.viewMode==='annual') this.buildAnnualCharts();
      else this.buildMonthlyCharts();
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
    async switchView(mode) {
      if (mode === 'annual') {
        try {
          const res = await axios.get(`${API}/api/kd/history/monthly?year=${new Date().getFullYear()}`);
          if (res.data && res.data.length) this.annualData = res.data;
        } catch { /* keep existing annualData */ }
      }
      this.viewMode = mode;
    },
    getAnnualChartData() {
      const d=this.annualData, rate=parseFloat(this.costRate)||4.5;
      const ML=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return {
        labels:    d.map(r=>r.label||(r.month?ML[r.month-1]:null)||String(r.month||'')),
        serum:     d.map(r=>r.serum),
        latex:     d.map(r=>r.latex),
        kwh:       d.map(r=>r.kwh),
        kwh1:      d.map(r=>r.kwh1),
        kwh2:      d.map(r=>r.kwh2),
        orp_serum: d.map(r=>r.orp_serum),
        orp_latex: d.map(r=>r.orp_latex),
        cost:      d.map(r=>r.kwh!==null?+(r.kwh*rate).toFixed(0):null),
        treatEff:  d.map(r=>r.flow&&r.kwh?+(r.flow/r.kwh).toFixed(3):null),
        costPerM3: d.map(r=>r.flow&&r.kwh?+(r.kwh*rate/r.flow).toFixed(1):null),
      };
    },
    buildAnnualCharts() {
      const cd=this.getAnnualChartData();
      const {tk,axisBdr,BASE,scY}=this._chartBase();
      const sXA={ ticks:{color:tk.tick,font:{size:9},maxRotation:0}, grid:{display:false}, border:{display:false} };
      this._chartPerf=new Chart(this.$refs.chartPerf,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',  label:'m³/kWh', data:cd.treatEff,  backgroundColor:h2r(tk.perf,.75), borderRadius:4, yAxisID:'y',  order:2},
          {type:'line', label:'฿/m³',   data:cd.costPerM3, borderColor:tk.hWarn, backgroundColor:h2r(tk.hWarn,.06), borderWidth:2, pointRadius:4, pointBackgroundColor:tk.hWarn, tension:.4, fill:false, yAxisID:'y1', order:1},
          {type:'line', label:'Threshold 1.5', data:cd.labels.map(()=>this.threshEff), borderColor:tk.thresh, backgroundColor:'transparent', borderWidth:1.5, borderDash:[5,4], pointRadius:0, tension:0, fill:false, yAxisID:'y', order:3},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:sXA,
          y: scY(v=>v.toFixed(2),tk.perf),
          y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+v},grid:{display:false},border:{color:axisBdr}},
        }},
      });
      this._chartBlower=new Chart(this.$refs.chartBlower,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'TB-01',data:cd.kwh1,backgroundColor:h2r(tk.kwh,.82),borderRadius:4,stack:'bl',yAxisID:'y'},
          {label:'TB-02',data:cd.kwh2,backgroundColor:h2r(tk.cost,.72),borderRadius:4,stack:'bl',yAxisID:'y'},
          {type:'line',label:'Cost ฿',data:cd.cost,borderColor:tk.hWarn,backgroundColor:h2r(tk.hWarn,.08),borderWidth:2,pointRadius:4,pointBackgroundColor:tk.hWarn,tension:.4,fill:false,yAxisID:'y1'},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:sXA,
          y:{...scY(v=>(v/1000).toFixed(0)+'k kWh'),stacked:true},
          y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+(v/1000).toFixed(0)+'k'},grid:{display:false},border:{color:axisBdr}},
        }},
      });
      this._chartMain=new Chart(this.$refs.chartMain,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'Serum',data:cd.serum,backgroundColor:h2r(tk.serum,.78),stack:'flow',borderRadius:4},
          {label:'Latex',data:cd.latex,backgroundColor:h2r(tk.latex,.78),stack:'flow',borderRadius:4},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:{...sXA,stacked:true},
          y:{...scY(v=>(v/1000).toFixed(0)+'k'),stacked:true},
        }},
      });
      this._chartORP=new Chart(this.$refs.chartORP,{
        type:'line',data:{labels:cd.labels,datasets:[
          {label:'Serum ORP',data:cd.orp_serum,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.07),borderWidth:2,pointRadius:4,pointBackgroundColor:tk.orpS,tension:.4,fill:true},
          {label:'Latex ORP',data:cd.orp_latex,borderColor:tk.orpL,backgroundColor:h2r(tk.orpL,.07),borderWidth:2,pointRadius:4,pointBackgroundColor:tk.orpL,tension:.4,fill:true},
          {label:'Threshold',data:cd.labels.map(()=>this.threshORP),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sXA,y:scY(v=>v+' mV')}},
      });
    },
    buildMonthlyCharts() {
      const cd=this.getChartData();
      const {tk,axisBdr,BASE,scY,sX}=this._chartBase();
      this._chartPerf=new Chart(this.$refs.chartPerf,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {type:'bar',  label:'m³/kWh', data:cd.treatEff,  backgroundColor:h2r(tk.perf,.72), borderRadius:2, yAxisID:'y',  order:2},
          {type:'line', label:'฿/m³',   data:cd.costPerM3, borderColor:tk.hWarn, backgroundColor:h2r(tk.hWarn,.06), borderWidth:1.5, pointRadius:0, tension:.4, fill:false, yAxisID:'y1', order:1},
          {type:'line', label:'Threshold 1.5', data:cd.labels.map(()=>this.threshEff), borderColor:tk.thresh, backgroundColor:'transparent', borderWidth:1.5, borderDash:[5,4], pointRadius:0, tension:0, fill:false, yAxisID:'y', order:3},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:sX,
          y: scY(v=>v.toFixed(2),tk.perf),
          y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+v},grid:{display:false},border:{color:axisBdr}},
        }},
      });
      this._chartBlower=new Chart(this.$refs.chartBlower,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'TB-01',data:cd.kwh1,backgroundColor:h2r(tk.kwh,.82),borderRadius:2,stack:'bl',yAxisID:'y'},
          {label:'TB-02',data:cd.kwh2,backgroundColor:h2r(tk.cost,.72),borderRadius:2,stack:'bl',yAxisID:'y'},
          {type:'line',label:'Cost ฿',data:cd.cost,borderColor:tk.hWarn,backgroundColor:h2r(tk.hWarn,.08),borderWidth:1.5,pointRadius:2,pointBackgroundColor:tk.hWarn,tension:.4,fill:false,yAxisID:'y1'},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:sX,
          y:{...scY(v=>v+' kWh'),stacked:true},
          y1:{position:'right',ticks:{color:tk.hWarn,font:{size:9},callback:v=>'฿'+v.toLocaleString()},grid:{display:false},border:{color:axisBdr}},
        },plugins:{...BASE.plugins,legend:{display:false}}},
      });
      this._chartMain=new Chart(this.$refs.chartMain,{
        type:'bar',data:{labels:cd.labels,datasets:[
          {label:'Serum',data:cd.serum,backgroundColor:h2r(tk.serum,.78),stack:'flow',borderRadius:2},
          {label:'Latex',data:cd.latex,backgroundColor:h2r(tk.latex,.78),stack:'flow',borderRadius:2},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{
          x:{...sX,stacked:true},
          y:{...scY(v=>v+' m³'),stacked:true},
        }},
      });
      this._chartORP=new Chart(this.$refs.chartORP,{
        type:'line',data:{labels:cd.labels,datasets:[
          {label:'Serum ORP',data:cd.orp_serum,borderColor:tk.orpS,backgroundColor:h2r(tk.orpS,.07),borderWidth:1.5,pointRadius:2,tension:.4,fill:true},
          {label:'Latex ORP',data:cd.orp_latex,borderColor:tk.orpL,backgroundColor:h2r(tk.orpL,.07),borderWidth:1.5,pointRadius:2,tension:.4,fill:true},
          {label:'Threshold',data:cd.labels.map(()=>this.threshORP),borderColor:tk.thresh,backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0,fill:false},
        ]},options:{...BASE,interaction:{mode:'index',intersect:false},scales:{x:sX,y:scY(v=>v+' mV')}},
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

/* ── Monthly body: charts ── */
.monthly-body   { flex:1; min-height:0; display:flex; gap:7px; }
.monthly-charts  { flex:1; min-height:0; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:5px; }

.chart-card {
  background:var(--ex-card-bg);
  border:1px solid var(--ex-card-bdr);
  border-radius:8px; padding:7px 11px;
  display:flex; flex-direction:column; gap:4px; min-height:0;
  transition:border-color .3s;
}
.chart-hdr {
  display:flex; align-items:center; gap:7px; flex-shrink:0;
  font-size:9px; font-weight:600; color:var(--ex-text); letter-spacing:.07em; text-transform:uppercase;
}
.ch-dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; transition:background .3s; }
.legend { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:9px; color:var(--ex-text-sub); }
.ls { width:8px; height:8px; border-radius:2px; display:inline-block; opacity:.85; transition:background .3s; }
.ll { width:14px; height:2.5px; border-radius:2px; display:inline-block; opacity:.85; transition:background .3s; }
.ll-dash { width:14px; display:inline-block; border-top:2px dashed; opacity:.85; vertical-align:middle; }

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

/* ── Treatment Performance left column ── */
/* ── Treatment Performance left column ── */
.tp-col {
  display:flex; flex-direction:column; gap:3px;
  width:150px; flex-shrink:0;
}
.tp-col-hdr {
  display:flex; flex-direction:column; gap:2px;
  padding:2px 8px 4px; flex-shrink:0;
}
.tp-title { font-size:8px; font-weight:700; letter-spacing:.1em; color:var(--ex-text-sub); text-transform:uppercase; }
.tp-sub   { font-size:7px; color:var(--ex-text-sub); opacity:.55; line-height:1.3; }
.tp-card {
  flex:1; min-height:0; overflow:hidden;
  padding:5px 8px 6px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
  background:linear-gradient(160deg,color-mix(in srgb,var(--c) 12%,var(--ex-card-bg)) 0%,var(--ex-card-bg) 65%);
  border-top:2px solid var(--c); border-radius:5px;
  transition:filter .15s;
}
.tp-card:hover { filter:brightness(1.08); }
.tp-donut-wrap {
  flex-shrink:0; width:60px; height:60px; border-radius:50%;
  background:conic-gradient(var(--c) calc(var(--pct) * 1%),color-mix(in srgb,var(--c) 12%,var(--ex-card-bdr)) 0);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 12px color-mix(in srgb,var(--c) 30%,transparent);
}
.tp-donut-inner {
  width:44px; height:44px; border-radius:50%;
  background:var(--ex-card-bg);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px;
}
.tp-big  { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:800; line-height:1; }
.tp-unit { font-size:8px; font-weight:600; opacity:.72; text-align:center; line-height:1.2; }
.tp-info { width:100%; display:flex; flex-direction:column; align-items:center; gap:2px; overflow:hidden; }
.tp-info .kpi-tag  { font-size:10px; text-align:center; }
.tp-info .kpi-foot { font-size:9px; text-align:center; white-space:normal; line-height:1.3; opacity:.7; }
.tp-status {
  font-size:9px; font-weight:700; letter-spacing:.06em;
  padding:1px 6px; border-radius:3px; display:inline-block;
  background:color-mix(in srgb,var(--c) 16%,transparent);
}

/* ── View toggle ── */
.view-toggle { display:flex; gap:2px; background:var(--ex-mn-bg); border:1px solid var(--ex-mn-bdr); border-radius:6px; padding:2px; }
.vt-btn {
  font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:.08em;
  padding:3px 10px; border-radius:4px; border:none; cursor:pointer; transition:all .15s;
  background:transparent; color:var(--ex-mn-color);
}
.vt-btn.active {
  background:var(--ex-accent); color:#fff;
  box-shadow:0 1px 6px color-mix(in srgb,var(--ex-accent) 40%,transparent);
}
.vt-btn:not(.active):hover { background:var(--ex-mn-hbg); color:var(--ex-mn-hclr); }

/* ── Summary cards (bottom row) ── */
.sc-card {
  background:var(--ex-card-bg);
  border:1px solid var(--ex-card-bdr);
  border-radius:8px; padding:7px 11px;
  display:flex; flex-direction:column; gap:6px; min-height:0; overflow:hidden;
}

/* ORP card body */
.sc-orp-body {
  flex:1; min-height:0;
  display:flex; gap:12px; align-items:center; overflow:hidden;
}
.sc-orp-bars {
  flex:1; min-height:0;
  display:flex; flex-direction:column; justify-content:center; gap:8px;
}

/* Bar rows */
.sc-bar-row {
  display:flex; align-items:center; gap:8px;
}
.sc-ach-row {
  display:flex; align-items:center; gap:8px; margin-top:2px;
  padding-top:6px; border-top:1px solid var(--ex-card-bdr);
}
.sc-bar-lbl {
  font-size:9px; font-weight:700; letter-spacing:.07em;
  min-width:70px; text-transform:uppercase;
}
.sc-bar-val {
  font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700;
  min-width:52px; text-align:right; white-space:nowrap;
}
.sc-bar-track {
  flex:1; height:8px; border-radius:4px;
  background:var(--ex-card-bdr); position:relative; overflow:visible;
}
.sc-bar-fill {
  height:100%; border-radius:4px;
  transition:width .6s ease;
  position:absolute; top:0; left:0;
}
.sc-bar-thresh {
  position:absolute; top:-3px; bottom:-3px;
  width:2px; background:rgba(255,255,255,.45);
  border-radius:1px; transform:translateX(-50%);
}

/* Doughnut wrap */
.sc-donut-wrap {
  position:relative;
  width:88px; height:88px; flex-shrink:0;
}
.sc-donut-wrap canvas {
  position:absolute; inset:0; width:100% !important; height:100% !important;
}
.sc-donut-center {
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  pointer-events:none;
}
.sc-donut-val {
  font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:800; line-height:1;
}
.sc-donut-lbl {
  font-size:8px; font-weight:700; letter-spacing:.1em;
  color:var(--ex-text-sub); text-transform:uppercase; margin-top:1px;
}

/* Flow card body */
.sc-flow-body {
  flex:1; min-height:0;
  display:flex; gap:12px; align-items:center; overflow:hidden;
}
.sc-flow-stats {
  flex:1; display:flex; flex-direction:column; justify-content:center; gap:5px;
}
.sc-fstat {
  display:flex; align-items:center; gap:7px;
  font-size:10px; color:var(--ex-label);
}
.sc-fstat--sep {
  margin-top:4px; padding-top:5px; border-top:1px solid var(--ex-card-bdr);
}
.sc-fstat-dot {
  width:7px; height:7px; border-radius:50%; flex-shrink:0;
}
.sc-fstat-val {
  font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700;
  margin-left:auto;
}
.sc-fstat-pct {
  font-size:9px; color:var(--ex-text-sub); min-width:30px; text-align:right;
}
</style>
