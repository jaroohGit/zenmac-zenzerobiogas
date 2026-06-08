<template>
  <div class="bw-root" :style="themeStyle">

    <!-- ── Header ── -->
    <div class="bw-hdr">
      <div class="bw-hdr-left">
        <div class="bw-title-accent" :style="`background:${t.accent}`"></div>
        <div>
          <div class="bw-title">BLOWER MONITORING</div>
          <div class="bw-sub">TB-01 &amp; TB-02 — ZenZero Biogas Plant</div>
        </div>
      </div>
      <div class="bw-hdr-right">
        <div class="bw-theme-row">
          <button v-for="(th,key) in THEMES" :key="key" class="bw-theme-btn"
            :class="{active: currentThemeKey===key}" :title="th.name"
            @click="setTheme(key)"
            :style="currentThemeKey===key ? `box-shadow:0 0 0 2px ${th.accent}` : ''">
            <span class="bw-theme-dot" :style="`background:${th.accent}`"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══ REAL-TIME SECTION ══ -->
    <div class="bw-sec-bar">
      <span class="bw-sec-title" :style="`color:${t.accent}`">REAL-TIME</span>
      <span class="bw-live-pulse"></span>
      <span class="bw-live-txt">LIVE</span>
    </div>

    <div class="bw-rt-grid">

      <!-- TB-01 card -->
      <div class="bw-blower-card" :style="`--bc:${t.accent}`">
        <div class="bw-bl-hdr">
          <span class="bw-bl-num">TB-01</span>
          <span class="bw-bl-sub">TURBO BLOWER 1</span>
          <span class="bw-status" :class="statusCls(tb1Status)">● {{ tb1Status }}</span>
        </div>
        <div class="bw-metrics">
          <div class="bw-m-row" v-for="m in tb1Metrics" :key="m.label">
            <span class="bw-m-label">{{ m.label }}</span>
            <div class="bw-m-track"><div class="bw-m-fill" :style="`width:${m.pct}%;background:${m.color}`"></div></div>
            <span class="bw-m-val" :style="`color:${m.color}`">{{ m.val }}</span>
            <span class="bw-m-unit">{{ m.unit }}</span>
          </div>
        </div>
        <div class="bw-bl-foot">
          On/Off Count <strong :style="`color:${t.accent}`">{{ tb1OnOff }}</strong>
        </div>
      </div>

      <!-- TB-02 card -->
      <div class="bw-blower-card" :style="`--bc:${t.kwh}`">
        <div class="bw-bl-hdr">
          <span class="bw-bl-num">TB-02</span>
          <span class="bw-bl-sub">TURBO BLOWER 2</span>
          <span class="bw-status" :class="statusCls(tb2Status)">● {{ tb2Status }}</span>
        </div>
        <div class="bw-metrics">
          <div class="bw-m-row" v-for="m in tb2Metrics" :key="m.label">
            <span class="bw-m-label">{{ m.label }}</span>
            <div class="bw-m-track"><div class="bw-m-fill" :style="`width:${m.pct}%;background:${m.color}`"></div></div>
            <span class="bw-m-val" :style="`color:${m.color}`">{{ m.val }}</span>
            <span class="bw-m-unit">{{ m.unit }}</span>
          </div>
        </div>
        <div class="bw-bl-foot">
          On/Off Count <strong :style="`color:${t.kwh}`">{{ tb2OnOff }}</strong>
        </div>
      </div>

      <!-- Live rolling charts column -->
      <div class="bw-live-col">
        <div class="bw-chart-card bw-live-card">
          <div class="bw-ch-hdr">
            <span class="bw-ch-dot" :style="`background:${t.accent}`"></span>POWER — 60 min rolling (kW)
            <span class="bw-legend">
              <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
              <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
            </span>
          </div>
          <div class="bw-chart-wrap"><canvas ref="chartLivePow"></canvas></div>
        </div>
        <div class="bw-chart-card bw-live-card">
          <div class="bw-ch-hdr">
            <span class="bw-ch-dot" :style="`background:${t.perf}`"></span>SUCTION FLOW — 60 min rolling (m³/min)
            <span class="bw-legend">
              <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
              <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
            </span>
          </div>
          <div class="bw-chart-wrap"><canvas ref="chartLiveFlow"></canvas></div>
        </div>
      </div>

    </div><!-- /bw-rt-grid -->

    <!-- ══ SUMMARY SECTION ══ -->
    <div class="bw-sec-bar" style="margin-top:6px">
      <span class="bw-sec-title" :style="`color:${t.cost}`">SUMMARY</span>
      <div class="view-sw">
        <button class="view-btn" :class="{active: summaryMode==='daily'}"   @click="setSummaryMode('daily')">DAILY</button>
        <button class="view-btn" :class="{active: summaryMode==='monthly'}" @click="setSummaryMode('monthly')">MONTHLY</button>
      </div>
      <div class="bw-nav">
        <button class="bw-nav-btn" @click="changeSummaryOffset(1)" :disabled="summaryOffset>=(summaryMode==='daily'?6:5)">
          <i class="bx bx-chevron-left"></i>
        </button>
        <span class="bw-nav-label">{{ summaryLabel }}</span>
        <button class="bw-nav-btn" @click="changeSummaryOffset(-1)" :disabled="summaryOffset<=0">
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Summary KPI bar -->
    <div class="bw-kpi-bar">
      <div class="bw-kpi-card" v-for="k in summaryKpi" :key="k.tag" :style="`--c:${k.color}`">
        <div class="bw-kpi-tag">{{ k.tag }}</div>
        <div class="bw-kpi-row">
          <span class="bw-kpi-big" :style="`color:${k.color}`">{{ k.big }}</span>
          <span class="bw-kpi-unit" :style="`color:${k.color}`">{{ k.unit }}</span>
        </div>
        <div class="bw-kpi-chips" v-if="k.chips && k.chips.length">
          <span class="bw-kpi-chip" v-for="c in k.chips" :key="c.label" :style="`color:${c.color}`">{{ c.label }}: {{ c.val }}</span>
        </div>
        <div class="bw-kpi-foot" v-if="k.foot">{{ k.foot }}</div>
      </div>
    </div>

    <!-- Summary charts row -->
    <div class="bw-sum-charts">
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.accent}`"></span>
          POWER — {{ summaryMode==='daily' ? '24hr hourly avg (kW)' : 'daily avg (kW)' }}
          <span class="bw-legend">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-chart-wrap"><canvas ref="chartSumPow"></canvas></div>
      </div>
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.perf}`"></span>
          SUCTION FLOW — {{ summaryMode==='daily' ? '24hr (m³/min)' : 'daily avg (m³/min)' }}
          <span class="bw-legend">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-chart-wrap"><canvas ref="chartSumFlow"></canvas></div>
      </div>
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.cost}`"></span>
          ENERGY — {{ summaryMode==='daily' ? 'per hour (kWh)' : 'per day (kWh)' }}
          <span class="bw-legend">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-chart-wrap"><canvas ref="chartSumEnergy"></canvas></div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ── Themes (identical to Executive page) ──────────────────────────
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
    hOk:'#00e87a',   hWarn:'#c0a878', hCrit:'#a86060',
  },
  obsidian: {
    name:'Obsidian & Frost', accent:'#6888c8',
    bg:'#0c0c10',
    g1:'rgba(104,136,200,.07)',  g2:'rgba(88,104,168,.05)',
    cBg:'rgba(14,14,22,.88)',    cBdr:'rgba(28,28,48,.95)',
    text:'rgba(200,208,232,.28)', tick:'#404060',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8870c8',
    perf:'#8090b8',  cost:'#a888a0',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#a8a0c0', y1:'#8870c8',
    hOk:'#00e87a',   hWarn:'#a8a0c0', hCrit:'#a86080',
  },
  dark: {
    name:'Deep Dark',        accent:'#3d8fab',
    bg:'#060810',
    g1:'rgba(61,143,171,.06)',   g2:'rgba(50,120,140,.04)',
    cBg:'rgba(8,12,20,.90)',     cBdr:'rgba(20,28,42,.95)',
    text:'rgba(188,208,224,.24)', tick:'#2e4458',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8878a8',
    perf:'#6070a0',  cost:'#a08850',
    orpS:'#ff7820',  orpL:'#00e87a', thresh:'#c0a060', y1:'#8878a8',
    hOk:'#00e87a',   hWarn:'#c0a060', hCrit:'#a06060',
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

// ── Demo data generators ───────────────────────────────────────────
function genLive(base, amp, shift, pts=60) {
  return Array.from({length:pts}, (_,i) =>
    Math.round((base + amp*Math.sin((i+shift)*0.12) + Math.random()*amp*0.18)*10)/10
  );
}
function liveLabels(pts=60) {
  return Array.from({length:pts}, (_,i) => {
    const m=pts-1-i; return (m%10===0) ? (m===0?'now':`-${m}m`) : '';
  });
}

function genDailyData(dayOffset=0) {
  const now=new Date();
  const todayHr=dayOffset===0 ? now.getHours() : 23;
  return Array.from({length:24}, (_,h) => {
    if(h>todayHr) return {label:`${String(h).padStart(2,'0')}:00`, tb1pow:null, tb2pow:null, tb1flow:null, tb2flow:null};
    const on=h>=6 && h<=22;
    return {
      label: `${String(h).padStart(2,'0')}:00`,
      tb1pow:  on ? Math.round((72+Math.random()*28)*10)/10 : Math.round(Math.random()*8*10)/10,
      tb2pow:  on ? Math.round((65+Math.random()*25)*10)/10 : Math.round(Math.random()*7*10)/10,
      tb1flow: on ? Math.round((4.6+Math.random()*1.4)*10)/10 : Math.round(Math.random()*0.5*10)/10,
      tb2flow: on ? Math.round((4.1+Math.random()*1.2)*10)/10 : Math.round(Math.random()*0.4*10)/10,
    };
  });
}

function genMonthlyData(monthOffset=0) {
  const now=new Date();
  const target=new Date(now.getFullYear(), now.getMonth()-monthOffset, 1);
  const y=target.getFullYear(), m=target.getMonth();
  const dim=new Date(y,m+1,0).getDate();
  const today=monthOffset===0 ? now.getDate() : dim;
  return Array.from({length:dim}, (_,i) => {
    const d=i+1;
    if(d>today) return {label:`${d}`, tb1kwh:null, tb2kwh:null, tb1peakPow:null, tb2peakPow:null, tb1flow:null, tb2flow:null};
    return {
      label:      `${d}`,
      tb1kwh:     Math.round(520+Math.random()*420),
      tb2kwh:     Math.round(465+Math.random()*395),
      tb1peakPow: Math.round((82+Math.random()*28)*10)/10,
      tb2peakPow: Math.round((74+Math.random()*26)*10)/10,
      tb1flow:    Math.round((4.8+Math.random()*1.2)*10)/10,
      tb2flow:    Math.round((4.2+Math.random()*1.1)*10)/10,
    };
  });
}

export default {
  name: 'KDBlower',
  computed: {
    ...mapGetters('staKd', [
      'tb1Power','tb1Current','tb1Flow','tb1SuctPres','tb1DischPres',
      'tb1OutsideTemp','tb1MotorTemp','tb1DriveTemp','tb1DischTemp','tb1OnOff','tb1Status',
      'tb2Power','tb2Current','tb2Flow','tb2SuctPres','tb2DischPres',
      'tb2OutsideTemp','tb2MotorTemp','tb2DriveTemp','tb2DischTemp','tb2OnOff','tb2Status',
    ]),
    t() { return THEMES[this.currentThemeKey]; },
    themeStyle() {
      const t=this.t;
      const li=t.bg[1]>'8';
      const ov=li?'40,60,80':'255,255,255';
      const ob=li?'0,0,0':'255,255,255';
      return {
        background: `radial-gradient(ellipse 55% 40% at 85% 10%,${t.g1},transparent 55%),radial-gradient(ellipse 40% 35% at 5% 90%,${t.g2},transparent 50%),${t.bg}`,
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
        '--ex-tag-bg':    `rgba(${ob},.05)`,
        '--ex-tag-color': `rgba(${ov},.32)`,
        '--ex-tag-bdr':   `rgba(${ob},.1)`,
      };
    },
    summaryLabel() {
      if(this.summaryMode==='daily') {
        const d=new Date(); d.setDate(d.getDate()-this.summaryOffset);
        return d.toLocaleString('en',{weekday:'short',month:'short',day:'numeric'});
      }
      const d=new Date(); d.setMonth(d.getMonth()-this.summaryOffset);
      return d.toLocaleString('en',{month:'long',year:'numeric'});
    },
    tb1Metrics() {
      const t=this.t;
      const p=(v,max)=>{ const n=parseFloat(v); return {pct:isNaN(n)?0:Math.min(100,Math.max(0,n/max*100))}; };
      return [
        {label:'Power',     ...p(this.tb1Power,   150), val:this.tb1Power,      unit:'kW',     color:t.accent},
        {label:'Current',   ...p(this.tb1Current,  80), val:this.tb1Current,    unit:'A',      color:t.accent},
        {label:'Suct Flow', ...p(this.tb1Flow,     10), val:this.tb1Flow,       unit:'m³/min', color:t.perf},
        {label:'Suct Pres', ...p(this.tb1SuctPres,300), val:this.tb1SuctPres,   unit:'mmAq',   color:t.orpL},
        {label:'Disch Pres',...p(this.tb1DischPres,600),val:this.tb1DischPres,  unit:'mmAq',   color:t.orpS},
        {label:'Motor Temp',...p(this.tb1MotorTemp,100),val:this.tb1MotorTemp,  unit:'°C',     color:t.cost},
        {label:'Drive Temp',...p(this.tb1DriveTemp,100),val:this.tb1DriveTemp,  unit:'°C',     color:t.cost},
        {label:'Disch Temp',...p(this.tb1DischTemp,100),val:this.tb1DischTemp,  unit:'°C',     color:t.kwh},
        {label:'Out Temp',  ...p(this.tb1OutsideTemp,50),val:this.tb1OutsideTemp,unit:'°C',    color:t.thresh},
      ];
    },
    tb2Metrics() {
      const t=this.t;
      const p=(v,max)=>{ const n=parseFloat(v); return {pct:isNaN(n)?0:Math.min(100,Math.max(0,n/max*100))}; };
      return [
        {label:'Power',     ...p(this.tb2Power,   150), val:this.tb2Power,      unit:'kW',     color:t.kwh},
        {label:'Current',   ...p(this.tb2Current,  80), val:this.tb2Current,    unit:'A',      color:t.kwh},
        {label:'Suct Flow', ...p(this.tb2Flow,     10), val:this.tb2Flow,       unit:'m³/min', color:t.perf},
        {label:'Suct Pres', ...p(this.tb2SuctPres,300), val:this.tb2SuctPres,   unit:'mmAq',   color:t.orpL},
        {label:'Disch Pres',...p(this.tb2DischPres,600),val:this.tb2DischPres,  unit:'mmAq',   color:t.orpS},
        {label:'Motor Temp',...p(this.tb2MotorTemp,100),val:this.tb2MotorTemp,  unit:'°C',     color:t.cost},
        {label:'Drive Temp',...p(this.tb2DriveTemp,100),val:this.tb2DriveTemp,  unit:'°C',     color:t.cost},
        {label:'Disch Temp',...p(this.tb2DischTemp,100),val:this.tb2DischTemp,  unit:'°C',     color:t.kwh},
        {label:'Out Temp',  ...p(this.tb2OutsideTemp,50),val:this.tb2OutsideTemp,unit:'°C',    color:t.thresh},
      ];
    },
    summaryData() {
      return this.summaryMode==='daily' ? this.dailyData : this.monthlyData;
    },
    summaryStats() {
      const isD=this.summaryMode==='daily';
      if(isD) {
        const rows=this.dailyData.filter(r=>r.tb1pow!==null);
        if(!rows.length) return {tb1kwh:0,tb2kwh:0,peakTb1:'0',peakTb2:'0',avgFlow1:'0',avgFlow2:'0',runH1:0,runH2:0};
        return {
          tb1kwh:   Math.round(rows.reduce((a,r)=>a+(r.tb1pow||0),0)),
          tb2kwh:   Math.round(rows.reduce((a,r)=>a+(r.tb2pow||0),0)),
          peakTb1:  Math.max(...rows.map(r=>r.tb1pow||0)).toFixed(1),
          peakTb2:  Math.max(...rows.map(r=>r.tb2pow||0)).toFixed(1),
          avgFlow1: (rows.reduce((a,r)=>a+(r.tb1flow||0),0)/rows.length).toFixed(1),
          avgFlow2: (rows.reduce((a,r)=>a+(r.tb2flow||0),0)/rows.length).toFixed(1),
          runH1:    rows.filter(r=>(r.tb1pow||0)>5).length,
          runH2:    rows.filter(r=>(r.tb2pow||0)>5).length,
        };
      }
      const rows=this.monthlyData.filter(r=>r.tb1kwh!==null);
      if(!rows.length) return {tb1kwh:0,tb2kwh:0,peakTb1:'0',peakTb2:'0',avgFlow1:'0',avgFlow2:'0',runH1:0,runH2:0};
      return {
        tb1kwh:   rows.reduce((a,r)=>a+(r.tb1kwh||0),0),
        tb2kwh:   rows.reduce((a,r)=>a+(r.tb2kwh||0),0),
        peakTb1:  Math.max(...rows.map(r=>r.tb1peakPow||0)).toFixed(1),
        peakTb2:  Math.max(...rows.map(r=>r.tb2peakPow||0)).toFixed(1),
        avgFlow1: (rows.reduce((a,r)=>a+(r.tb1flow||0),0)/rows.length).toFixed(1),
        avgFlow2: (rows.reduce((a,r)=>a+(r.tb2flow||0),0)/rows.length).toFixed(1),
        runH1:    rows.length*16,
        runH2:    rows.length*15,
      };
    },
    summaryKpi() {
      const s=this.summaryStats, t=this.t;
      const f=v=>{const n=parseInt(v);return isNaN(n)?'—':n.toLocaleString();};
      return [
        { tag:'TB-01 ENERGY', big:f(s.tb1kwh), unit:'kWh', color:t.accent, chips:[], foot:'' },
        { tag:'TB-02 ENERGY', big:f(s.tb2kwh), unit:'kWh', color:t.kwh,   chips:[], foot:'' },
        { tag:'PEAK POWER',   big:s.peakTb1,   unit:'kW',  color:t.perf,
          chips:[{label:'TB-01',val:`${s.peakTb1} kW`,color:t.accent},{label:'TB-02',val:`${s.peakTb2} kW`,color:t.kwh}] },
        { tag:'AVG SUCT FLOW', big:s.avgFlow1, unit:'m³/m', color:t.orpS,
          chips:[{label:'TB-01',val:s.avgFlow1,color:t.accent},{label:'TB-02',val:s.avgFlow2,color:t.kwh}] },
        { tag:'RUN HOURS',     big:s.runH1,    unit:'hr',   color:t.cost,
          chips:[{label:'TB-01',val:`${s.runH1}h`,color:t.accent},{label:'TB-02',val:`${s.runH2}h`,color:t.kwh}],
          foot: this.summaryMode==='daily' ? '(hours active today)' : '(est. monthly hours)' },
      ];
    },
  },
  data() {
    return {
      currentThemeKey: 'slate', THEMES,
      summaryMode: 'daily', summaryOffset: 0,
      dailyData: [], monthlyData: [],
    };
  },
  watch: {
    currentThemeKey() { this.destroyCharts(); this.$nextTick(()=>this.buildCharts()); },
  },
  created() {
    this._chartLivePow=null; this._chartLiveFlow=null;
    this._chartSumPow=null;  this._chartSumFlow=null; this._chartSumEnergy=null;
    this.dailyData=genDailyData(0);
    this.monthlyData=genMonthlyData(0);
  },
  mounted()      { this.buildCharts(); },
  beforeUnmount(){ this.destroyCharts(); },
  methods: {
    statusCls(v) {
      const s=String(v||'').toUpperCase();
      if(s.includes('RUN'))              return 'st-ok';
      if(s.includes('STBY')||s.includes('STAND')) return 'st-warn';
      return 'st-off';
    },
    destroyCharts() {
      [this._chartLivePow,this._chartLiveFlow,this._chartSumPow,this._chartSumFlow,this._chartSumEnergy]
        .forEach(c=>c?.destroy());
      this._chartLivePow=this._chartLiveFlow=null;
      this._chartSumPow=this._chartSumFlow=this._chartSumEnergy=null;
    },
    _opts() {
      const t=this.t;
      return {
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false,bodyFont:{family:'JetBrains Mono',size:11}} },
        scales:{
          x:{ ticks:{color:t.tick,font:{size:9},maxRotation:0}, grid:{color:h2r(t.tick,.18)}, border:{display:false} },
          y:{ ticks:{color:t.tick,font:{size:9}},               grid:{color:h2r(t.tick,.18)}, border:{display:false} },
        },
      };
    },
    buildCharts() {
      this.buildLiveCharts();
      this.buildSummaryCharts();
    },
    buildLiveCharts() {
      const t=this.t, lbl=liveLabels(), opts=this._opts();
      this._chartLivePow=new Chart(this.$refs.chartLivePow, {
        type:'line',
        data:{ labels:lbl, datasets:[
          {label:'TB-01 kW', data:genLive(82,20,0), borderColor:t.accent, backgroundColor:h2r(t.accent,.07), borderWidth:1.5, pointRadius:0, tension:0.35, fill:true},
          {label:'TB-02 kW', data:genLive(74,18,7), borderColor:t.kwh,   backgroundColor:h2r(t.kwh,.07),   borderWidth:1.5, pointRadius:0, tension:0.35, fill:true},
        ]},
        options:opts,
      });
      this._chartLiveFlow=new Chart(this.$refs.chartLiveFlow, {
        type:'line',
        data:{ labels:lbl, datasets:[
          {label:'TB-01 m³/min', data:genLive(5.0,1.0,2), borderColor:t.accent, backgroundColor:h2r(t.accent,.07), borderWidth:1.5, pointRadius:0, tension:0.35, fill:true},
          {label:'TB-02 m³/min', data:genLive(4.5,0.9,9), borderColor:t.kwh,   backgroundColor:h2r(t.kwh,.07),   borderWidth:1.5, pointRadius:0, tension:0.35, fill:true},
        ]},
        options:opts,
      });
    },
    buildSummaryCharts() {
      const t=this.t, d=this.summaryData, isD=this.summaryMode==='daily';
      const labels=d.map(r=>r.label);
      const opts=this._opts();
      const stackOpts={
        ...opts,
        scales:{
          x:{...opts.scales.x, stacked:true},
          y:{...opts.scales.y, stacked:true},
        },
      };
      this._chartSumPow=new Chart(this.$refs.chartSumPow, {
        type:'line',
        data:{ labels, datasets:[
          {label:'TB-01 kW', data:isD?d.map(r=>r.tb1pow):d.map(r=>r.tb1peakPow), borderColor:t.accent, backgroundColor:h2r(t.accent,.08), borderWidth:1.5, pointRadius:0, tension:0.3, fill:true},
          {label:'TB-02 kW', data:isD?d.map(r=>r.tb2pow):d.map(r=>r.tb2peakPow), borderColor:t.kwh,   backgroundColor:h2r(t.kwh,.08),   borderWidth:1.5, pointRadius:0, tension:0.3, fill:true},
        ]},
        options:opts,
      });
      this._chartSumFlow=new Chart(this.$refs.chartSumFlow, {
        type:'line',
        data:{ labels, datasets:[
          {label:'TB-01 m³/min', data:d.map(r=>r.tb1flow), borderColor:t.accent, backgroundColor:h2r(t.accent,.08), borderWidth:1.5, pointRadius:0, tension:0.3, fill:true},
          {label:'TB-02 m³/min', data:d.map(r=>r.tb2flow), borderColor:t.kwh,   backgroundColor:h2r(t.kwh,.08),   borderWidth:1.5, pointRadius:0, tension:0.3, fill:true},
        ]},
        options:opts,
      });
      this._chartSumEnergy=new Chart(this.$refs.chartSumEnergy, {
        type:'bar',
        data:{ labels, datasets:[
          {label:'TB-01 kWh', data:isD?d.map(r=>r.tb1pow):d.map(r=>r.tb1kwh), backgroundColor:h2r(t.accent,.75), borderColor:t.accent, borderWidth:0, stack:'bl'},
          {label:'TB-02 kWh', data:isD?d.map(r=>r.tb2pow):d.map(r=>r.tb2kwh), backgroundColor:h2r(t.kwh,.75),   borderColor:t.kwh,   borderWidth:0, stack:'bl'},
        ]},
        options:stackOpts,
      });
    },
    setTheme(key) {
      this.currentThemeKey=key;
    },
    setSummaryMode(mode) {
      if(this.summaryMode===mode) return;
      this.summaryMode=mode; this.summaryOffset=0;
      [this._chartSumPow,this._chartSumFlow,this._chartSumEnergy].forEach(c=>c?.destroy());
      this._chartSumPow=this._chartSumFlow=this._chartSumEnergy=null;
      this.$nextTick(()=>this.buildSummaryCharts());
    },
    changeSummaryOffset(dir) {
      const max=this.summaryMode==='daily'?6:5;
      this.summaryOffset=Math.max(0,Math.min(max,this.summaryOffset+dir));
      if(this.summaryMode==='daily') this.dailyData=genDailyData(this.summaryOffset);
      else this.monthlyData=genMonthlyData(this.summaryOffset);
      [this._chartSumPow,this._chartSumFlow,this._chartSumEnergy].forEach(c=>c?.destroy());
      this._chartSumPow=this._chartSumFlow=this._chartSumEnergy=null;
      this.$nextTick(()=>this.buildSummaryCharts());
    },
  },
};
</script>

<style scoped>
/* ── Root ── */
.bw-root {
  display:flex; flex-direction:column; gap:8px;
  padding:14px; min-height:100%;
  font-family:'Inter',sans-serif;
}

/* ── Header ── */
.bw-hdr { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.bw-hdr-left { display:flex; align-items:center; gap:10px; }
.bw-title-accent { width:4px; height:30px; border-radius:2px; flex-shrink:0; }
.bw-title { font-size:16px; font-weight:800; letter-spacing:.12em; color:var(--ex-label); }
.bw-sub   { font-size:9px;  font-weight:500; color:var(--ex-text-sub); letter-spacing:.06em; margin-top:2px; }
.bw-hdr-right { margin-left:auto; }
.bw-theme-row { display:flex; gap:5px; }
.bw-theme-btn {
  width:20px; height:20px; border-radius:50%;
  background:var(--ex-mn-bg); border:1px solid var(--ex-tag-bdr);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:transform .15s;
}
.bw-theme-btn.active { transform:scale(1.25); }
.bw-theme-dot { width:11px; height:11px; border-radius:50%; }

/* ── Section bar ── */
.bw-sec-bar { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.bw-sec-title { font-size:9px; font-weight:800; letter-spacing:.14em; }
.bw-live-pulse {
  width:7px; height:7px; border-radius:50%;
  background:var(--ex-h-ok); box-shadow:0 0 5px var(--ex-h-ok);
  animation:bwpulse 2s infinite;
}
.bw-live-txt { font-size:9px; font-weight:700; color:var(--ex-h-ok); letter-spacing:.1em; }
@keyframes bwpulse { 0%,100%{opacity:1} 50%{opacity:.35} }

/* ── Real-time grid ── */
.bw-rt-grid {
  display:grid; grid-template-columns:1fr 1fr 2fr;
  gap:8px; align-items:stretch;
}

/* ── Blower card ── */
.bw-blower-card {
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-left:3px solid var(--bc); border-radius:8px;
  padding:12px; display:flex; flex-direction:column; gap:8px;
}
.bw-bl-hdr { display:flex; align-items:center; gap:8px; }
.bw-bl-num { font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:700; color:var(--bc); }
.bw-bl-sub { font-size:8px; color:var(--ex-text-sub); letter-spacing:.08em; }
.bw-status { margin-left:auto; font-size:9px; font-weight:700; letter-spacing:.06em; white-space:nowrap; }
.st-ok   { color:var(--ex-h-ok); }
.st-warn { color:var(--ex-h-warn); }
.st-off  { color:var(--ex-text-sub); }

/* ── Metric rows ── */
.bw-metrics { display:flex; flex-direction:column; gap:5px; }
.bw-m-row {
  display:grid;
  grid-template-columns:70px 1fr 40px 46px;
  align-items:center; gap:6px;
}
.bw-m-label { font-size:9px; color:var(--ex-text-sub); white-space:nowrap; }
.bw-m-track { height:3px; background:var(--ex-mn-bg); border-radius:2px; overflow:hidden; }
.bw-m-fill  { height:100%; border-radius:2px; transition:width .4s; }
.bw-m-val   { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; text-align:right; white-space:nowrap; }
.bw-m-unit  { font-size:8px; color:var(--ex-text-sub); }
.bw-bl-foot {
  font-size:9px; color:var(--ex-text-sub);
  padding-top:5px; border-top:1px solid var(--ex-card-bdr);
}

/* ── Live charts column ── */
.bw-live-col { display:flex; flex-direction:column; gap:8px; }
.bw-live-card { flex:1; }
.bw-chart-card {
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-radius:8px; padding:10px 12px;
  display:flex; flex-direction:column; gap:6px;
}
.bw-ch-hdr {
  display:flex; align-items:center; gap:6px; flex-shrink:0;
  font-size:9px; font-weight:700; color:var(--ex-label); letter-spacing:.06em;
}
.bw-ch-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.bw-chart-wrap { flex:1; min-height:110px; position:relative; }
.bw-legend { display:flex; align-items:center; gap:6px; margin-left:auto; font-weight:500; color:var(--ex-text-sub); }
.bw-ls { display:inline-block; width:18px; height:2px; border-radius:1px; vertical-align:middle; }

/* ── View switch & nav (same pattern as Executive) ── */
.view-sw { display:flex; background:var(--ex-mn-bg); border:1px solid var(--ex-mn-bdr,var(--ex-tag-bdr)); border-radius:5px; overflow:hidden; }
.view-btn { padding:3px 11px; font-size:9px; font-weight:700; cursor:pointer; color:var(--ex-mn-color); background:transparent; border:none; letter-spacing:.06em; }
.view-btn.active { background:var(--ex-accent); color:rgba(255,255,255,.92); }
.bw-nav { display:flex; align-items:center; gap:4px; }
.bw-nav-btn { background:none; border:none; color:var(--ex-label); cursor:pointer; font-size:16px; padding:0 2px; line-height:1; }
.bw-nav-btn:disabled { opacity:.28; cursor:not-allowed; }
.bw-nav-label { font-size:10px; color:var(--ex-label); min-width:90px; text-align:center; font-weight:600; }

/* ── Summary KPI bar ── */
.bw-kpi-bar {
  display:grid; grid-template-columns:repeat(5,1fr);
  gap:1px; background:var(--ex-card-bdr); border-radius:8px; overflow:hidden; flex-shrink:0;
}
.bw-kpi-card {
  background:var(--ex-card-bg); border-left:3px solid var(--c);
  padding:10px 14px; display:flex; flex-direction:column; gap:5px;
  transition:filter .15s;
}
.bw-kpi-card:hover { filter:brightness(1.08); }
.bw-kpi-tag  { font-size:9px; font-weight:700; color:var(--ex-text-sub); letter-spacing:.08em; text-transform:uppercase; }
.bw-kpi-row  { display:flex; align-items:baseline; gap:5px; }
.bw-kpi-big  { font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; line-height:1; }
.bw-kpi-unit { font-size:12px; font-weight:600; }
.bw-kpi-chips { display:flex; flex-wrap:wrap; gap:4px; }
.bw-kpi-chip  { font-size:9px; padding:2px 7px; border-radius:3px; background:var(--ex-tag-bg); border:1px solid var(--ex-tag-bdr); white-space:nowrap; }
.bw-kpi-foot  { font-size:9px; color:var(--ex-text-sub); }

/* ── Summary charts ── */
.bw-sum-charts { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.bw-sum-charts .bw-chart-wrap { min-height:175px; }
</style>
