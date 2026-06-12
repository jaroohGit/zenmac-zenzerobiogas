<template>
  <div class="dr-wrap">

    <!-- ── TITLE BAR ── -->
    <div class="dr-bar">
      <span class="dr-acc"></span>
      <span class="dr-title">DAILY REPORT</span>
      <span class="dr-date">{{ todayStr }}</span>
      <div class="pt-group">
        <button class="pt-btn" :class="{active:period==='1d'}" @click="setPeriod('1d')">1 DAY</button>
        <button class="pt-btn" :class="{active:period==='7d'}" @click="setPeriod('7d')">7 DAYS</button>
        <button class="pt-btn" :class="{active:period==='1m'}" @click="setPeriod('1m')">1 MONTH</button>
      </div>
      <div class="dr-loading" v-if="loading"><span class="spin"></span> LOADING</div>
      <button class="btn-export"><i class="bx bx-download"></i> EXPORT</button>
    </div>

    <!-- ── KPI CARDS ── -->
    <div class="dr-kpi">
      <div class="kc" v-for="k in kpiCards" :key="k.tag" :style="`--c:${k.color}`">
        <div class="kc-tag">{{ k.tag }}</div>
        <div class="kc-row">
          <span class="kc-val" :style="`color:${k.color}`">{{ k.val }}</span>
          <span class="kc-unit">{{ k.unit }}</span>
        </div>
        <div class="kc-sub">{{ k.sub }}</div>
      </div>
    </div>

    <!-- ── CHARTS 2×2 ── -->
    <div class="dr-charts">

      <!-- ORP Trend -->
      <div class="cc">
        <div class="cc-hdr">
          <span class="cc-dot" style="background:#ff7820"></span>ORP TREND — {{ periodLabel }}
          <span class="cc-leg">
            <span class="cc-ls" style="background:#ff7820"></span>Serum
            <span class="cc-ls" style="background:#00c8b0"></span>Latex
            <span class="cc-ld"></span><span style="color:#c8a96e;font-size:8px">{{ threshORP }} mV</span>
          </span>
          <span class="cc-ctrl">Thresh <input type="number" v-model.number="threshORP" step="10" min="10" max="500" class="cc-input" style="color:#c8a96e;border-color:rgba(200,169,110,.3);background:rgba(200,169,110,.08)"/> mV</span>
        </div>
        <div class="cc-wrap"><canvas ref="chartORP"></canvas></div>
      </div>

      <!-- pH Trend -->
      <div class="cc">
        <div class="cc-hdr">
          <span class="cc-dot" style="background:#b8e834"></span>pH TREND — {{ period==='1d'?'24 HRS':'DAILY AVG' }}
          <span class="cc-leg">
            <span class="cc-ls" style="background:#b8e834"></span>Serum
            <span class="cc-ls" style="background:#00d4ff"></span>Latex
            <span class="cc-ld" style="border-color:rgba(100,200,255,.5)"></span><span style="color:#00d4ff;font-size:8px">{{ threshPH }}</span>
          </span>
          <span class="cc-ctrl" v-if="period==='1d'">Thresh <input type="number" v-model.number="threshPH" step="0.1" min="1" max="14" class="cc-input" style="color:#00d4ff;border-color:rgba(0,212,255,.3);background:rgba(0,212,255,.08)"/></span>
        </div>
        <div class="cc-wrap">
          <canvas ref="chartPH" v-show="period==='1d'"></canvas>
          <div class="cc-nodata" v-show="period!=='1d'">pH data available in 1 DAY view only</div>
        </div>
      </div>

      <!-- Flow -->
      <div class="cc">
        <div class="cc-hdr">
          <span class="cc-dot" style="background:#ff7820"></span>FLOW — {{ period==='1d'?'CUMULATIVE (m³)':'DAILY TOTAL (m³)' }}
          <span class="cc-leg">
            <span class="cc-ls" style="background:#ff7820"></span>Serum
            <span class="cc-ls" style="background:#00c8b0"></span>Latex
          </span>
        </div>
        <div class="cc-wrap"><canvas ref="chartFlow"></canvas></div>
      </div>

      <!-- Energy -->
      <div class="cc">
        <div class="cc-hdr">
          <span class="cc-dot" style="background:#9b8fc0"></span>{{ period==='1d'?'BLOWER POWER (kW)':'ENERGY (kWh)' }} — {{ periodLabel }}
          <span class="cc-leg">
            <span class="cc-ls" style="background:#9b8fc0"></span>TB-01
            <span class="cc-ls" style="background:#c8a96e"></span>TB-02
          </span>
        </div>
        <div class="cc-wrap"><canvas ref="chartEnergy"></canvas></div>
      </div>

    </div>

    <!-- ── DATA TABLE ── -->
    <div class="dr-table-card">
      <div class="dt-hdr"><i class="bx bx-table"></i> DATA LOG — {{ rows.length }} RECORDS</div>
      <div class="table-wrap">
        <table class="dr-table">
          <thead>
            <tr>
              <th>TIME</th>
              <th>S-ORP (mV)</th><th>L-ORP (mV)</th>
              <th>S-pH</th><th>L-pH</th>
              <th>S-FLOW (m³)</th><th>L-FLOW (m³)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.time">
              <td class="t-time">{{ r.time }}</td>
              <td class="t-o">{{ r.serumORP }}</td>
              <td class="t-l">{{ r.latexORP }}</td>
              <td class="t-g">{{ r.serumpH }}</td>
              <td class="t-c">{{ r.latexpH }}</td>
              <td class="t-o">{{ r.serumFlow }}</td>
              <td class="t-l">{{ r.latexFlow }}</td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="7" class="no-data">กำลังโหลดข้อมูล...</td>
            </tr>
          </tbody>
        </table>
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

const C = { serum:'#ff7820', latex:'#00c8b0', ph_s:'#b8e834', ph_l:'#00d4ff', kwh1:'#9b8fc0', kwh2:'#c8a96e', thresh:'#c8a96e' };

function h2r(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

export default {
  name: 'KDDailyReport',
  data() {
    return {
      period: '1d',
      loading: false,
      threshORP: 150,
      threshPH: 7.0,
      chartData: { labels:[], serumORP:[], latexORP:[], serumPH:[], latexPH:[], serumFlow:[], latexFlow:[], kwh1:[], kwh2:[] },
      rows: [],
      _cORP: null, _cPH: null, _cFlow: null, _cEnergy: null,
    };
  },
  computed: {
    ...mapGetters('staKd', [
      'serumFlowDay','processFlowDay','totalFlowDay',
      'serumFlowYest','processFlowYest',
      'combinedORP','serumORP','processORP',
      'tb1KwhToday','tb2KwhToday',
    ]),
    todayStr() {
      return new Date().toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    },
    periodLabel() {
      return { '1d':'24 HRS', '7d':'7 DAYS', '1m':'1 MONTH' }[this.period];
    },
    kpiCards() {
      const kwhTB1 = parseFloat(this.tb1KwhToday)||0;
      const kwhTB2 = parseFloat(this.tb2KwhToday)||0;
      const sOrp   = parseFloat(this.serumORP);
      const lOrp   = parseFloat(this.processORP);
      return [
        { tag:'SERUM FLOW',   val:this.fmtN(this.serumFlowDay),   unit:'m³',  color:C.serum,  sub:`Yesterday: ${this.fmtN(this.serumFlowYest)} m³` },
        { tag:'LATEX FLOW',   val:this.fmtN(this.processFlowDay),  unit:'m³',  color:C.latex,  sub:`Yesterday: ${this.fmtN(this.processFlowYest)} m³` },
        { tag:'TOTAL FLOW',   val:this.fmtN(this.totalFlowDay),    unit:'m³',  color:'#00e87a', sub:'Serum + Latex' },
        { tag:'SERUM ORP',    val:this.fmtN(this.serumORP),        unit:'mV',  color:C.serum,  sub:!isNaN(sOrp)?(sOrp>150?'▲ ABOVE THRESH':'▼ BELOW THRESH'):'' },
        { tag:'LATEX ORP',    val:this.fmtN(this.processORP),      unit:'mV',  color:C.latex,  sub:!isNaN(lOrp)?(lOrp>150?'▲ ABOVE THRESH':'▼ BELOW THRESH'):'' },
        { tag:'ENERGY TODAY', val:this.fmtN(kwhTB1+kwhTB2||null), unit:'kWh', color:C.kwh1,   sub:`TB-01: ${this.fmtN(this.tb1KwhToday)} | TB-02: ${this.fmtN(this.tb2KwhToday)}` },
      ];
    },
  },
  watch: {
    threshORP(val) {
      if (this._cORP) {
        this._cORP.data.datasets[2].data = this._cORP.data.labels.map(() => val);
        this._cORP.update('none');
      }
    },
    threshPH(val) {
      if (this._cPH) {
        this._cPH.data.datasets[2].data = this._cPH.data.labels.map(() => val);
        this._cPH.update('none');
      }
    },
  },
  async mounted() {
    await this.loadData();
    this.buildCharts();
  },
  beforeUnmount() { this.destroyCharts(); },
  methods: {
    fmtN(v) { const n=parseFloat(v); return isNaN(n)?'—':n.toFixed(1); },
    fmtV(v) { const n=parseFloat(v); return isNaN(n)?null:+n.toFixed(2); },

    async setPeriod(p) {
      if (this.period === p) return;
      this.period = p;
      await this.loadData();
      this.destroyCharts();
      this.$nextTick(() => this.buildCharts());
    },

    async loadData() {
      this.loading = true;
      try {
        if (this.period === '1d') await this.load1D();
        else await this.loadDaily();
      } catch(e){ void e; }
      this.loading = false;
    },

    async load1D() {
      const [sO, lO, sPH, lPH, sF, lF, e1, e2] = await Promise.all([
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Serum_ORP_Lock_hr' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Process_ORP_Lock_hr' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Serum_PH_Lock_hr' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Process_pH_Lock_hr' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Serum Flow M3_Day_real' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Process Flow M3_Day_real' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd1', field:'TB_1_BLOWER POWER_kW' }),
        this.$store.dispatch('staKd/getHistory', { topicKey:'kd1', field:'TB_2_BLOWER POWER_kW' }),
      ]);
      const n = Math.max(sO.length, lO.length, 1);
      const cnt = Math.min(n, 24);
      const pts = Array.from({length:cnt}, (_,i) => {
        const ri = n - cnt + i;
        const ts = sO[ri]?.ts || lO[ri]?.ts;
        const t  = ts ? new Date(ts).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) : `${String(i).padStart(2,'0')}:00`;
        return {
          time: t,
          serumORP:  this.fmtV(sO[ri]?.value),
          latexORP:  this.fmtV(lO[ri]?.value),
          serumPH:   this.fmtV(sPH[ri]?.value),
          latexPH:   this.fmtV(lPH[ri]?.value),
          serumFlow: this.fmtV(sF[ri]?.value),
          latexFlow: this.fmtV(lF[ri]?.value),
          kwh1: e1[ri]?.value != null ? +((parseFloat(e1[ri].value)||0)/10).toFixed(1) : null,
          kwh2: e2[ri]?.value != null ? +((parseFloat(e2[ri].value)||0)/10).toFixed(1) : null,
        };
      });
      this.chartData = {
        labels:    pts.map(r=>r.time),
        serumORP:  pts.map(r=>r.serumORP),
        latexORP:  pts.map(r=>r.latexORP),
        serumPH:   pts.map(r=>r.serumPH),
        latexPH:   pts.map(r=>r.latexPH),
        serumFlow: pts.map(r=>r.serumFlow),
        latexFlow: pts.map(r=>r.latexFlow),
        kwh1:      pts.map(r=>r.kwh1),
        kwh2:      pts.map(r=>r.kwh2),
      };
      this.rows = [...pts].reverse().map(r=>({
        time:r.time, serumORP:r.serumORP??'—', latexORP:r.latexORP??'—',
        serumpH:r.serumPH??'—', latexpH:r.latexPH??'—',
        serumFlow:r.serumFlow??'—', latexFlow:r.latexFlow??'—',
      }));
    },

    async loadDaily() {
      const now = new Date();
      const ym  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      let d = [];
      try {
        const res = await axios.get(`${API}/api/kd/history/daily?month=${ym}`);
        d = res.data && res.data.length ? res.data : [];
      } catch(e){ void e; }
      if (this.period === '7d') d = d.slice(-7);
      this.chartData = {
        labels:    d.map(r=>`${r.day}`),
        serumORP:  d.map(r=>r.orp_serum??null),
        latexORP:  d.map(r=>r.orp_latex??null),
        serumPH:   [], latexPH: [],
        serumFlow: d.map(r=>r.serum??null),
        latexFlow: d.map(r=>r.latex??null),
        kwh1:      d.map(r=>r.kwh1??null),
        kwh2:      d.map(r=>r.kwh2??null),
      };
      this.rows = [...d].reverse().map(r=>({
        time:`Day ${r.day}`,
        serumORP:r.orp_serum??'—', latexORP:r.orp_latex??'—',
        serumpH:'—', latexpH:'—',
        serumFlow:r.serum??'—', latexFlow:r.latex??'—',
      }));
    },

    destroyCharts() {
      [this._cORP, this._cPH, this._cFlow, this._cEnergy].forEach(c=>c?.destroy());
      this._cORP=this._cPH=this._cFlow=this._cEnergy=null;
    },

    buildCharts() {
      const cd  = this.chartData;
      const few = cd.labels.length <= 15;
      const BASE = { responsive:true, maintainAspectRatio:false, animation:false, plugins:{legend:{display:false}} };
      const ABDR = 'rgba(255,255,255,.04)';
      const TICK = '#3d5068';
      const scX  = { ticks:{color:TICK,font:{size:8},maxTicksLimit:12,autoSkip:true,maxRotation:0}, grid:{display:false}, border:{display:false} };
      const scY  = (cb) => ({ afterFit:s=>{s.width=46;}, ticks:{color:TICK,font:{size:8},callback:cb}, grid:{color:ABDR}, border:{display:false} });
      const pt   = few ? 3 : 0;

      // ORP
      this._cORP = new Chart(this.$refs.chartORP, {
        type:'line', data:{labels:cd.labels, datasets:[
          {label:'Serum ORP', data:cd.serumORP, borderColor:C.serum, backgroundColor:h2r(C.serum,.08), borderWidth:1.5, pointRadius:pt, pointBackgroundColor:C.serum, tension:.4, fill:true},
          {label:'Latex ORP', data:cd.latexORP, borderColor:C.latex, backgroundColor:h2r(C.latex,.08), borderWidth:1.5, pointRadius:pt, pointBackgroundColor:C.latex, tension:.4, fill:true},
          {label:'Thresh ORP', data:cd.labels.map(()=>this.threshORP), borderColor:C.thresh, backgroundColor:'transparent', borderWidth:1.5, borderDash:[5,4], pointRadius:0, tension:0, fill:false},
        ]},
        options:{...BASE, interaction:{mode:'index',intersect:false}, scales:{x:scX, y:scY(v=>v+' mV')}},
      });

      // pH (1D only)
      if (this.period==='1d' && cd.serumPH.length) {
        this._cPH = new Chart(this.$refs.chartPH, {
          type:'line', data:{labels:cd.labels, datasets:[
            {label:'Serum pH', data:cd.serumPH, borderColor:C.ph_s, backgroundColor:h2r(C.ph_s,.08), borderWidth:1.5, pointRadius:pt, pointBackgroundColor:C.ph_s, tension:.4, fill:true},
            {label:'Latex pH', data:cd.latexPH, borderColor:C.ph_l, backgroundColor:h2r(C.ph_l,.08), borderWidth:1.5, pointRadius:pt, pointBackgroundColor:C.ph_l, tension:.4, fill:true},
            {label:'Thresh pH', data:cd.labels.map(()=>this.threshPH), borderColor:'#00d4ff', backgroundColor:'transparent', borderWidth:1.5, borderDash:[5,4], pointRadius:0, tension:0, fill:false},
          ]},
          options:{...BASE, interaction:{mode:'index',intersect:false}, scales:{x:scX, y:{...scY(v=>v.toFixed(1)), suggestedMin:5, suggestedMax:9}}},
        });
      }

      // Flow
      const flowType = this.period==='1d' ? 'line' : 'bar';
      this._cFlow = new Chart(this.$refs.chartFlow, {
        type: flowType,
        data:{labels:cd.labels, datasets:[
          {label:'Serum', data:cd.serumFlow, backgroundColor:h2r(C.serum,.75), borderColor:C.serum, borderWidth:flowType==='line'?1.5:0, stack:'fl', borderRadius:flowType==='bar'?2:0, pointRadius:flowType==='line'?pt:0, tension:.4, fill:flowType==='line'},
          {label:'Latex', data:cd.latexFlow, backgroundColor:h2r(C.latex,.75), borderColor:C.latex, borderWidth:flowType==='line'?1.5:0, stack:'fl', borderRadius:flowType==='bar'?2:0, pointRadius:flowType==='line'?pt:0, tension:.4, fill:flowType==='line'},
        ]},
        options:{...BASE, interaction:{mode:'index',intersect:false}, scales:{
          x:{...scX, stacked:flowType==='bar'},
          y:{...scY(v=>v+' m³'), stacked:flowType==='bar'},
        }},
      });

      // Energy
      const eType = this.period==='1d' ? 'line' : 'bar';
      const eLabel = this.period==='1d' ? (v=>v+' kW') : (v=>v+' kWh');
      this._cEnergy = new Chart(this.$refs.chartEnergy, {
        type: eType,
        data:{labels:cd.labels, datasets:[
          {label:'TB-01', data:cd.kwh1, backgroundColor:h2r(C.kwh1,.82), borderColor:C.kwh1, borderWidth:eType==='line'?1.5:0, stack:'e', borderRadius:eType==='bar'?2:0, pointRadius:eType==='line'?pt:0, tension:.4, fill:eType==='line'},
          {label:'TB-02', data:cd.kwh2, backgroundColor:h2r(C.kwh2,.72), borderColor:C.kwh2, borderWidth:eType==='line'?1.5:0, stack:'e', borderRadius:eType==='bar'?2:0, pointRadius:eType==='line'?pt:0, tension:.4, fill:eType==='line'},
        ]},
        options:{...BASE, interaction:{mode:'index',intersect:false}, scales:{
          x:{...scX, stacked:eType==='bar'},
          y:{...scY(eLabel), stacked:eType==='bar'},
        }},
      });
    },
  },
};
</script>

<style scoped>
.dr-wrap {
  padding: 10px 14px;
  font-family: 'Inter','Segoe UI',sans-serif;
  display: flex; flex-direction: column; gap: 7px;
  height: calc(100vh - 56px - 37px);
  overflow: hidden;
  color: rgba(200,216,232,.88);
}

/* ── Title bar ── */
.dr-bar { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.dr-acc { width:7px; height:7px; border-radius:50%; background:#4a9eba; flex-shrink:0; box-shadow:0 0 8px rgba(74,158,186,.55); }
.dr-title { font-size:10px; font-weight:700; letter-spacing:.09em; color:rgba(200,216,232,.3); text-transform:uppercase; }
.dr-date { font-size:9px; color:rgba(200,216,232,.18); white-space:nowrap; }
.pt-group { display:flex; gap:2px; background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px; margin-left:auto; }
.pt-btn { font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:.08em; padding:3px 10px; border-radius:4px; border:none; cursor:pointer; transition:all .15s; background:transparent; color:rgba(200,216,232,.35); }
.pt-btn.active { background:#4a9eba; color:#fff; box-shadow:0 1px 6px rgba(74,158,186,.4); }
.pt-btn:not(.active):hover { background:rgba(255,255,255,.06); color:rgba(200,216,232,.7); }
.dr-loading { display:flex; align-items:center; gap:5px; font-size:8px; font-weight:700; letter-spacing:.08em; color:rgba(200,216,232,.3); }
.spin { width:10px; height:10px; border:1.5px solid rgba(74,158,186,.2); border-top-color:#4a9eba; border-radius:50%; animation:spin .8s linear infinite; display:inline-block; }
@keyframes spin { to { transform:rotate(360deg); } }
.btn-export { background:rgba(212,160,64,.08); border:1px solid rgba(212,160,64,.2); color:#d4a040; font-size:9px; font-weight:700; padding:4px 12px; border-radius:5px; cursor:pointer; display:flex; align-items:center; gap:4px; letter-spacing:.06em; flex-shrink:0; }
.btn-export:hover { background:rgba(212,160,64,.16); }

/* ── KPI cards ── */
.dr-kpi {
  display:grid; grid-template-columns:repeat(6,1fr); gap:1px;
  flex-shrink:0; background:rgba(30,45,61,.9); border-radius:8px; overflow:hidden;
}
.kc {
  display:flex; flex-direction:column; gap:3px;
  padding:10px 12px;
  background:linear-gradient(110deg,color-mix(in srgb,var(--c) 12%,rgba(17,24,32,.9)) 0%,rgba(17,24,32,.9) 60%);
  border-left:2px solid var(--c);
  transition:filter .15s;
}
.kc:hover { filter:brightness(1.1); }
.kc-tag  { font-size:8px; font-weight:700; color:rgba(200,216,232,.22); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kc-row  { display:flex; align-items:baseline; gap:4px; }
.kc-val  { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; line-height:1; }
.kc-unit { font-size:10px; color:rgba(200,216,232,.28); }
.kc-sub  { font-size:8px; color:rgba(200,216,232,.18); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* ── Charts 2×2 ── */
.dr-charts {
  flex:1; min-height:0;
  display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:5px;
}
.cc {
  background:rgba(17,24,32,.88);
  border:1px solid rgba(30,45,61,.9);
  border-radius:8px; padding:7px 11px;
  display:flex; flex-direction:column; gap:4px; min-height:0;
}
.cc-hdr {
  display:flex; align-items:center; gap:7px; flex-shrink:0;
  font-size:9px; font-weight:600; color:rgba(200,216,232,.28); letter-spacing:.07em; text-transform:uppercase;
}
.cc-dot  { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; }
.cc-leg  { display:flex; align-items:center; gap:5px; margin-left:auto; font-size:8px; color:rgba(200,216,232,.22); }
.cc-ls   { width:8px; height:8px; border-radius:2px; display:inline-block; opacity:.85; }
.cc-ld   { width:14px; display:inline-block; border-top:2px dashed rgba(200,169,110,.55); vertical-align:middle; }
.cc-ctrl { display:flex; align-items:center; gap:4px; margin-left:auto; font-size:8px; color:rgba(200,216,232,.25); flex-shrink:0; }
.cc-input {
  width:44px; padding:1px 4px; border-radius:4px; border-width:1px; border-style:solid;
  font-size:10px; font-weight:600; font-family:'JetBrains Mono',monospace;
  text-align:center; outline:none; transition:border-color .15s, background .15s;
}
.cc-input:focus { filter:brightness(1.25); }
.cc-wrap { flex:1; min-height:0; position:relative; }
.cc-wrap canvas { position:absolute; inset:0; }
.cc-nodata {
  flex:1; display:flex; align-items:center; justify-content:center;
  font-size:10px; color:rgba(200,216,232,.2); letter-spacing:.05em; text-transform:uppercase;
}

/* ── Table ── */
.dr-table-card {
  flex-shrink:0; max-height:150px;
  background:rgba(17,24,32,.88);
  border:1px solid rgba(30,45,61,.9);
  border-radius:8px; padding:7px 11px;
  display:flex; flex-direction:column; gap:5px; overflow:hidden;
}
.dt-hdr {
  font-size:9px; font-weight:700; color:rgba(200,216,232,.2);
  letter-spacing:.07em; text-transform:uppercase;
  display:flex; align-items:center; gap:6px; flex-shrink:0;
}
.table-wrap { overflow-y:auto; flex:1; min-height:0; }
.table-wrap::-webkit-scrollbar { width:4px; }
.table-wrap::-webkit-scrollbar-track { background:transparent; }
.table-wrap::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
.dr-table { width:100%; border-collapse:collapse; }
.dr-table th {
  font-size:8px; font-weight:700; letter-spacing:.06em; color:rgba(200,216,232,.18);
  padding:4px 10px; border-bottom:1px solid rgba(255,255,255,.05);
  text-align:right; white-space:nowrap; text-transform:uppercase;
  position:sticky; top:0; background:rgba(15,21,30,.98);
}
.dr-table th:first-child { text-align:left; }
.dr-table td {
  font-family:'JetBrains Mono',monospace; font-size:10px;
  padding:5px 10px; border-bottom:1px solid rgba(255,255,255,.03);
  text-align:right; color:rgba(200,216,232,.3);
}
.dr-table td:first-child { text-align:left; }
.dr-table tr:last-child td { border-bottom:none; }
.dr-table tr:hover td { background:rgba(255,255,255,.018); }
.t-time { color:rgba(200,216,232,.18) !important; }
.t-o { color:#ff7820 !important; }
.t-l { color:#00c8b0 !important; }
.t-g { color:#b8e834 !important; }
.t-c { color:#00d4ff !important; }
.no-data { text-align:center !important; color:rgba(200,216,232,.15); padding:16px !important; }
</style>
