<template>
  <div class="kd-page-wrap">

    <div class="page-title">
      <i class="bx bx-bar-chart-alt-2"></i>
      Executive Summary — WASTEWATER TREATMENT KPI
    </div>

    <!-- Summary cards -->
    <div class="summary-row">
      <div class="sum-card" v-for="s in summary" :key="s.label" :class="s.cls">
        <div class="sum-icon"><i :class="s.icon"></i></div>
        <div class="sum-body">
          <div class="sum-label">{{ s.label }}</div>
          <div class="sum-val">{{ s.val }}<span class="sum-unit">{{ s.unit }}</span></div>
          <div class="sum-trend" :class="s.trendCls">{{ s.trend }}</div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="exec-charts">
      <div class="exec-card">
        <div class="exec-card-title"><i class="bx bx-line-chart me-2"></i>ORP Trend — Serum &amp; Latex (24 hr)</div>
        <div class="exec-chart-wrap"><canvas ref="chartORP"></canvas></div>
      </div>
      <div class="exec-card">
        <div class="exec-card-title"><i class="bx bx-water me-2"></i>Flow Trend — Serum &amp; Latex (24 hr)</div>
        <div class="exec-chart-wrap"><canvas ref="chartFlow"></canvas></div>
      </div>
    </div>

    <!-- Status table -->
    <div class="exec-card exec-table-card">
      <div class="exec-card-title"><i class="bx bx-table me-2"></i>Equipment Status</div>
      <table class="status-table">
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Status</th>
            <th>ORP (mV)</th>
            <th>pH</th>
            <th>Flow (m³/hr)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="eq-dot" style="background:#ff7820"></span>Serum Process (บ่อ 1)</td>
            <td><span class="status-badge st-on">ACTIVE</span></td>
            <td class="c-cyan">{{ fmtSigned(serumORP) }}</td>
            <td class="c-green">{{ fmtNum(serumpH) }}</td>
            <td class="c-orange">{{ fmtNum(serumFlow) }}</td>
          </tr>
          <tr>
            <td><span class="eq-dot" style="background:#00c8b0"></span>Latex Process (บ่อ 2)</td>
            <td><span class="status-badge st-on">ACTIVE</span></td>
            <td class="c-cyan">{{ fmtSigned(processORP) }}</td>
            <td class="c-green">{{ fmtNum(processpH) }}</td>
            <td class="c-teal">{{ fmtNum(processFlow) }}</td>
          </tr>
          <tr>
            <td><span class="eq-dot" style="background:#00e87a"></span>Blower TB-01</td>
            <td><span class="status-badge" :class="tb1Status === 'RUN' ? 'st-on' : 'st-stby'">{{ tb1Status || '—' }}</span></td>
            <td>—</td><td>—</td>
            <td class="c-green">{{ tb1Flow }}</td>
          </tr>
          <tr>
            <td><span class="eq-dot" style="background:#ffb800"></span>Blower TB-02</td>
            <td><span class="status-badge" :class="tb2Status === 'RUN' ? 'st-on' : 'st-stby'">{{ tb2Status || '—' }}</span></td>
            <td>—</td><td>—</td>
            <td class="c-green">{{ tb2Flow }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function makeDataset(label, color) {
  return { label, data: [], borderColor: color, backgroundColor: color+'18', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: true };
}

export default {
  name: 'KDExecutive',
  computed: {
    ...mapGetters('staKd', [
      'serumFlow','processFlow','serumFlowDay','processFlowDay',
      'blowerTotalPower','combinedORP',
      'serumORP','processORP','serumpH','processpH',
      'tb1Status','tb2Status','tb1Flow','tb2Flow',
      'serumPumpStatus','processPumpStatus',
    ]),
    summary() {
      return [
        { label:'SERUM FLOW',    val: this.fmtNum(this.serumFlow),   unit:' m³/hr', icon:'bx bx-water',          cls:'sum-orange', trend:'Today: '+this.fmtNum(this.serumFlowDay)+' m³', trendCls:'' },
        { label:'LATEX FLOW',    val: this.fmtNum(this.processFlow),  unit:' m³/hr', icon:'bx bx-droplet',        cls:'sum-teal',   trend:'Today: '+this.fmtNum(this.processFlowDay)+' m³', trendCls:'' },
        { label:'BLOWER POWER',  val: this.blowerTotalPower,          unit:' kW',    icon:'bx bx-wind',           cls:'sum-green',  trend:'TB-01: '+this.tb1Status+' | TB-02: '+this.tb2Status, trendCls:'' },
        { label:'COMBINED ORP',  val: this.combinedORP,               unit:' mV',    icon:'bx bx-pulse',          cls:'sum-cyan',   trend:'S: '+this.fmtNum(this.serumORP)+' | L: '+this.fmtNum(this.processORP)+' mV', trendCls:'' },
      ];
    },
  },
  created() { this._chartORP = null; this._chartFlow = null; },
  mounted() {
    const labels = Array.from({length:24},(_,i)=>{const d=new Date();d.setHours(d.getHours()-(23-i));return`${String(d.getHours()).padStart(2,'0')}:00`;});
    const opt = { responsive:true, maintainAspectRatio:false, animation:false, plugins:{legend:{display:true, labels:{color:'#5a7a90',font:{size:10}}}}, scales:{x:{ticks:{color:'#3a5070',font:{size:9},maxTicksLimit:6},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#3a5070',font:{size:9}},grid:{color:'rgba(255,255,255,.06)'}}} };
    this._chartORP  = new Chart(this.$refs.chartORP,  { type:'line', data:{ labels, datasets:[makeDataset('Serum ORP','#ff7820'),makeDataset('Latex ORP','#00e87a')] }, options: opt });
    this._chartFlow = new Chart(this.$refs.chartFlow, { type:'line', data:{ labels, datasets:[makeDataset('Serum Flow','#ff7820'),makeDataset('Latex Flow','#00c8b0')] }, options: opt });
    this.loadHistory();
  },
  beforeUnmount() {
    this._chartORP?.destroy(); this._chartFlow?.destroy();
  },
  methods: {
    fmtNum(v)    { const n=parseFloat(v); return isNaN(n)?'—':n.toFixed(1); },
    fmtSigned(v) { const n=parseFloat(v); return isNaN(n)?'—':(n>=0?'+':'')+n.toFixed(1); },
    async loadHistory() {
      try {
        const [sO,lO,sF,lF] = await Promise.all([
          this.$store.dispatch('staKd/getHistory',{topicKey:'kd4',field:'Serum_ORP_Lock_hr'}),
          this.$store.dispatch('staKd/getHistory',{topicKey:'kd4',field:'Process_ORP_Lock_hr'}),
          this.$store.dispatch('staKd/getHistory',{topicKey:'kd5',field:'Serum Flow M3_Day_real'}),
          this.$store.dispatch('staKd/getHistory',{topicKey:'kd5',field:'Process Flow M3_Day_real'}),
        ]);
        this._chartORP.data.datasets[0].data  = sO.slice(-24).map(p=>parseFloat(p.value));
        this._chartORP.data.datasets[1].data  = lO.slice(-24).map(p=>parseFloat(p.value));
        this._chartFlow.data.datasets[0].data = sF.slice(-24).map(p=>parseFloat(p.value));
        this._chartFlow.data.datasets[1].data = lF.slice(-24).map(p=>parseFloat(p.value));
        this._chartORP.update(); this._chartFlow.update();
      } catch (e) { /* history unavailable */ }
    },
  },
};
</script>

<style scoped>
.kd-page-wrap { padding: 16px; font-family: 'Inter','Segoe UI',sans-serif; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.page-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.4); display: flex; align-items: center; gap: 8px; letter-spacing: .06em; text-transform: uppercase; }
.summary-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.sum-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 14px 16px; transition: border-color .2s; }
.sum-card:hover { border-color: rgba(255,255,255,.14); }
.sum-icon { font-size: 26px; flex-shrink: 0; }
.sum-orange .sum-icon { color: #ff7820; } .sum-teal .sum-icon { color: #00c8b0; } .sum-green .sum-icon { color: #b8e834; } .sum-cyan .sum-icon { color: #00d4ff; }
.sum-label { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.22); letter-spacing: .1em; margin-bottom: 2px; text-transform: uppercase; }
.sum-val { font-family: 'JetBrains Mono',monospace; font-size: 20px; font-weight: 700; line-height: 1.1; }
.sum-orange .sum-val{color:#ff7820} .sum-teal .sum-val{color:#00c8b0} .sum-green .sum-val{color:#b8e834} .sum-cyan .sum-val{color:#00d4ff}
.sum-unit { font-size: 10px; font-weight: 400; color: rgba(255,255,255,.28); }
.sum-trend { font-size: 10px; color: rgba(255,255,255,.2); margin-top: 3px; }
.exec-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.exec-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 14px; }
.exec-card-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.35); letter-spacing: .04em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.exec-chart-wrap { height: 160px; position: relative; }
.exec-chart-wrap canvas { position: absolute; inset: 0; }
.status-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.status-table th { font-size: 10px; font-weight: 600; letter-spacing: .06em; color: rgba(255,255,255,.22); padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,.07); text-align: left; text-transform: uppercase; }
.status-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.04); color: rgba(255,255,255,.5); font-size: 13px; }
.status-table tr:last-child td { border-bottom: none; }
.status-table tr:hover td { background: rgba(255,255,255,.02); }
.eq-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.status-badge { font-family: 'JetBrains Mono',monospace; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }
.st-on   { background: rgba(184,232,52,.15); color: #b8e834; border: 1px solid rgba(184,232,52,.3); }
.st-stby { background: rgba(255,184,0,.15); color: #ffb800; border: 1px solid rgba(255,184,0,.3); }
.c-orange{color:#ff7820} .c-teal{color:#00c8b0} .c-green{color:#b8e834} .c-cyan{color:#00d4ff}
</style>
