<template>
  <div class="kd-page-wrap">

    <!-- KPI ROW -->
    <div class="kpi-row">
      <div class="kpi-card kpi-orange">
        <div class="kpi-icon"><i class="bx bx-water"></i></div>
        <div class="kpi-body">
          <div class="kpi-label">SERUM FLOW</div>
          <div class="kpi-val">{{ fmtNum(serumFlow) }}<span class="kpi-unit">m³/hr</span></div>
          <div class="kpi-sub">Today: {{ fmtNum(serumFlowDay) }} m³</div>
        </div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-icon"><i class="bx bx-droplet"></i></div>
        <div class="kpi-body">
          <div class="kpi-label">LATEX FLOW</div>
          <div class="kpi-val">{{ fmtNum(processFlow) }}<span class="kpi-unit">m³/hr</span></div>
          <div class="kpi-sub">Today: {{ fmtNum(processFlowDay) }} m³</div>
        </div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-icon"><i class="bx bx-wind"></i></div>
        <div class="kpi-body">
          <div class="kpi-label">BLOWER POWER</div>
          <div class="kpi-val">{{ blowerTotalPower }}<span class="kpi-unit">kW</span></div>
          <div class="kpi-sub">BL-1: {{ tb1Status || '—' }} | BL-2: {{ tb2Status || '—' }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-cyan">
        <div class="kpi-icon"><i class="bx bx-pulse"></i></div>
        <div class="kpi-body">
          <div class="kpi-label">COMBINED ORP</div>
          <div class="kpi-val">{{ combinedORP }}<span class="kpi-unit">mV</span></div>
          <div class="kpi-sub">S: {{ fmtNum(serumORP) }} | L: {{ fmtNum(processORP) }} mV</div>
        </div>
      </div>
    </div>

    <!-- MID ROW -->
    <div class="mid-row">
      <!-- MAP -->
      <div class="ov-card">
        <div class="ov-card-header">
          <span class="ov-acc"></span>
          <span>SITE OVERVIEW — STA-KD : SERUM &amp; LATEX PROCESS</span>
        </div>
        <div class="map-wrap">
          <img src="/kd-aerial.jpg" alt="STA-KD Site" />
          <div class="overlay">
            <div class="ov bdr-a" style="left:2%;top:5%">
              <div class="ov-title" style="color:#ffb800">SLUDGE DEWATERING</div>
              <div class="ov-row"><span class="ov-b b-on">RUN</span><span class="ov-b b-s">Normal</span></div>
            </div>
            <div class="ov bdr-p" style="left:50%;top:4%">
              <div class="ov-title" style="color:#a855f7">EQUALIZING TANK</div>
              <div class="ov-row"><span class="ov-b b-on">NORMAL</span><span class="ov-b b-s">Level OK</span></div>
            </div>
            <div class="ov bdr-g" style="left:26%;top:8%">
              <div class="ov-title" style="color:#00e87a">BLOWER SYSTEM</div>
              <div class="ov-row">
                <span class="ov-b b-blo">BL-1: {{ tb1Status || '—' }}</span>
                <span class="ov-dot dg"></span>
                <span class="ov-b b-stby">BL-2: {{ tb2Status || 'STBY' }}</span>
              </div>
            </div>
            <div class="ov bdr-o" style="left:14%;top:42%">
              <div class="ov-title" style="color:#ff7820">AT-SERUM (บ่อ 1)</div>
              <div class="ov-row">
                <span class="ov-b b-s">ORP {{ fmtNum(serumORP) }} mV</span>
                <span class="ov-b b-on">pH {{ fmtNum(serumpH) }}</span>
              </div>
            </div>
            <div class="ov bdr-t" style="left:46%;top:42%">
              <div class="ov-title" style="color:#00c8b0">AT-LATEX (บ่อ 2)</div>
              <div class="ov-row">
                <span class="ov-b b-s">ORP {{ fmtNum(processORP) }} mV</span>
                <span class="ov-b b-on">pH {{ fmtNum(processpH) }}</span>
              </div>
            </div>
            <div class="ov bdr-o" style="right:2%;top:28%">
              <div class="ov-title" style="color:#ff7820">SERUM STORAGE</div>
              <div class="ov-row">
                <span class="ov-b b-o">pH —</span>
                <span class="ov-b b-on">ACTIVE</span>
              </div>
            </div>
            <div class="ov bdr-c" style="left:4%;bottom:4%">
              <div class="ov-title" style="color:#00d4ff">SEDIMENTATION</div>
              <div class="ov-row"><span class="ov-b b-blo">RUNNING</span><span class="ov-b b-s">OK</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- SENSOR PANEL -->
      <div class="sensor-col">
        <div class="sensor-card">
          <div class="sensor-hdr"><span class="sensor-acc" style="background:#ff7820"></span>AT-SERUM SENSORS<span class="sensor-sub">บ่อ 1</span></div>
          <div class="sensor-grid">
            <div class="sensor-item">
              <div class="si-tag">ORP SENSOR</div>
              <div class="si-name si-orp">ORP-S-1A</div>
              <div class="si-val">{{ fmtSigned(serumORP) }}<span class="si-unit">mV</span></div>
              <div class="si-badge" :class="orpStatusClass(serumORP)">{{ orpLabel(serumORP) }}</div>
            </div>
            <div class="sensor-item">
              <div class="si-tag">pH SENSOR</div>
              <div class="si-name si-ph">pH-S-1A</div>
              <div class="si-val">{{ fmtNum(serumpH) }}</div>
              <div class="si-badge" :class="phStatusClass(serumpH)">{{ phLabel(serumpH) }}</div>
            </div>
          </div>
        </div>
        <div class="sensor-card">
          <div class="sensor-hdr"><span class="sensor-acc" style="background:#00c8b0"></span>AT-LATEX SENSORS<span class="sensor-sub">บ่อ 2</span></div>
          <div class="sensor-grid">
            <div class="sensor-item">
              <div class="si-tag">ORP SENSOR</div>
              <div class="si-name si-orp">ORP-L-2A</div>
              <div class="si-val">{{ fmtSigned(processORP) }}<span class="si-unit">mV</span></div>
              <div class="si-badge" :class="orpStatusClass(processORP)">{{ orpLabel(processORP) }}</div>
            </div>
            <div class="sensor-item">
              <div class="si-tag">pH SENSOR</div>
              <div class="si-name si-ph">pH-L-2A</div>
              <div class="si-val">{{ fmtNum(processpH) }}</div>
              <div class="si-badge" :class="phStatusClass(processpH)">{{ phLabel(processpH) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHART ROW -->
    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-hdr"><span class="chart-acc"></span>24-HR ORP TREND</div>
        <div class="chart-legend">
          <span class="leg-dot" style="background:#ff7820"></span>Serum
          <span class="leg-dot" style="background:#00e87a"></span>Latex
        </div>
        <div class="chart-wrap"><canvas ref="chartORP"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-hdr"><span class="chart-acc"></span>24-HR FLOW TREND</div>
        <div class="chart-legend">
          <span class="leg-dot" style="background:#ff7820"></span>Serum m³/hr
          <span class="leg-dot" style="background:#00e87a"></span>Latex m³/hr
        </div>
        <div class="chart-wrap"><canvas ref="chartFlow"></canvas></div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const CHART_OPT = (color1, color2, unit) => ({
  responsive: true, maintainAspectRatio: false, animation: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { ticks: { color: '#3a5070', font: { size: 9 }, maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,.04)' } },
    y: { ticks: { color: '#3a5070', font: { size: 9 }, callback: v => `${v}${unit}` }, grid: { color: 'rgba(255,255,255,.06)' } },
  },
});

function makeDataset(label, color) {
  return {
    label, data: [],
    borderColor: color, backgroundColor: color + '18',
    borderWidth: 1.5, pointRadius: 3, pointHoverRadius: 5,
    pointBackgroundColor: color, pointBorderColor: color,
    tension: 0.3, fill: true,
  };
}

function makeLabels() {
  const labels = [];
  for (let i = 0; i < 24; i++) {
    const h = (8 + i) % 24;
    labels.push(`${String(h).padStart(2,'0')}:00`);
  }
  return labels;
}

export default {
  name: 'KDOverview',
  computed: {
    ...mapGetters('staKd', [
      'serumFlow','processFlow','serumFlowDay','processFlowDay',
      'blowerTotalPower','combinedORP',
      'serumORP','processORP','serumpH','processpH',
      'tb1Status','tb2Status','serumPumpStatus','processPumpStatus',
    ]),
  },
  created() {
    this._chartORP = null;
    this._chartFlow = null;
  },
  mounted() {
    this.initCharts();
    this.loadHistory();
    this._liveTimer = setInterval(this.pushLivePoint, 5000);
  },
  beforeUnmount() {
    clearInterval(this._liveTimer);
    this._chartORP?.destroy();
    this._chartFlow?.destroy();
  },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(1); },
    fmtSigned(v) { const n = parseFloat(v); return isNaN(n) ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1); },
    orpStatusClass(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'ss-off';
      if (n > 200) return 'ss-ok';
      if (n > 0)   return 'ss-low';
      return 'ss-warn';
    },
    orpLabel(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'N/A';
      if (n > 200) return 'GOOD'; if (n > 0) return 'LOW'; return 'CRITICAL';
    },
    phStatusClass(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'ss-off';
      return (n >= 6.5 && n <= 8.5) ? 'ss-ok' : (n >= 6 && n <= 9) ? 'ss-low' : 'ss-warn';
    },
    phLabel(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'N/A';
      return (n >= 6.5 && n <= 8.5) ? 'NORMAL' : (n >= 6 && n <= 9) ? 'CAUTION' : 'OUT OF RANGE';
    },
    initCharts() {
      const labels = makeLabels(24);
      this._chartORP = new Chart(this.$refs.chartORP, {
        type: 'line',
        data: { labels, datasets: [makeDataset('Serum ORP','#ff7820'), makeDataset('Latex ORP','#00e87a')] },
        options: CHART_OPT('#ff7820','#00e87a',' mV'),
      });
      this._chartFlow = new Chart(this.$refs.chartFlow, {
        type: 'line',
        data: { labels, datasets: [makeDataset('Serum Flow','#ff7820'), makeDataset('Latex Flow','#00e87a')] },
        options: CHART_OPT('#ff7820','#00e87a',' m³'),
      });
    },
    async loadHistory() {
      try {
        const [sORP, lORP, sFlow, lFlow] = await Promise.all([
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Serum_ORP_Lock_hr' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Process_ORP_Lock_hr' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Serum Flow M3_Day_real' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Process Flow M3_Day_real' }),
        ]);
        const fill = (chart, ds0, ds1, h0, h1) => {
          const n = 24;
          chart.data.datasets[0].data = h0.slice(-n).map(p => parseFloat(p.value));
          chart.data.datasets[1].data = h1.slice(-n).map(p => parseFloat(p.value));
          chart.update();
        };
        fill(this._chartORP,  0, 1, sORP,  lORP);
        fill(this._chartFlow, 0, 1, sFlow, lFlow);
      } catch (e) { /* history unavailable */ }
    },
    pushLivePoint() {
      const push = (chart, v0, v1) => {
        if (!chart) return;
        chart.data.datasets[0].data.push(parseFloat(v0) || 0);
        chart.data.datasets[1].data.push(parseFloat(v1) || 0);
        if (chart.data.datasets[0].data.length > 24) {
          chart.data.datasets[0].data.shift();
          chart.data.datasets[1].data.shift();
        }
        chart.update();
      };
      push(this._chartORP,  this.serumORP,   this.processORP);
      push(this._chartFlow, this.serumFlow,   this.processFlow);
    },
  },
};
</script>

<style scoped>
.kd-page-wrap {
  padding: 14px 16px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  display: flex; flex-direction: column; gap: 10px;
  min-height: calc(100vh - 56px - 37px);
  overflow-y: auto;
  background:
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(212,160,64,.04) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 10% 80%, rgba(0,212,255,.03) 0%, transparent 55%),
    transparent;
}

/* ── KPI ROW ── */
.kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; flex-shrink: 0; }
.kpi-card {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 14px 18px;
  transition: border-color .2s;
}
.kpi-card:hover { border-color: rgba(255,255,255,.14); }
.kpi-icon { font-size: 32px; flex-shrink: 0; }
.kpi-orange .kpi-icon { color: #ff7820; }
.kpi-teal  .kpi-icon { color: #00c8b0; }
.kpi-green .kpi-icon { color: #b8e834; }
.kpi-cyan  .kpi-icon { color: #00d4ff; }
.kpi-label {
  font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,.22); letter-spacing: .1em; margin-bottom: 3px; text-transform: uppercase;
}
.kpi-val { font-family: 'JetBrains Mono',monospace; font-size: 26px; font-weight: 700; line-height: 1.1; }
.kpi-orange .kpi-val { color: #ff7820; }
.kpi-teal  .kpi-val { color: #00c8b0; }
.kpi-green .kpi-val { color: #b8e834; }
.kpi-cyan  .kpi-val { color: #00d4ff; }
.kpi-unit { font-size: 12px; font-weight: 400; color: rgba(255,255,255,.28); margin-left: 3px; }
.kpi-sub  { font-size: 11px; color: rgba(255,255,255,.18); margin-top: 2px; }

/* ── MID ROW ── */
.mid-row { display: grid; grid-template-columns: minmax(0, 837px) 1fr; gap: 8px; height: 420px; flex-shrink: 0; }
.ov-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 10px;
  display: flex; flex-direction: column; gap: 6px; min-height: 0;
}
.ov-card-header {
  font-size: 9.5px; font-weight: 600;
  color: rgba(255,255,255,.35);
  letter-spacing: .08em; display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.ov-acc {
  width: 6px; height: 6px; background: #d4a040;
  border-radius: 50%; display: inline-block;
  box-shadow: 0 0 5px #d4a04080;
  animation: pulseA 2s infinite;
}
.map-wrap { position: relative; flex: 1; min-height: 0; border-radius: 6px; overflow: hidden; background: #06080c; }
.map-wrap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 45%; transform: scale(1.22); transform-origin: 42% 48%; filter: saturate(.8) brightness(.82); }
.overlay { position: absolute; inset: 0; pointer-events: none; }
.ov { position: absolute; background: rgba(8,10,14,.7); border: 1.5px solid rgba(255,255,255,.2); border-radius: 7px; padding: 6px 12px; white-space: nowrap; backdrop-filter: blur(4px); }
.bdr-a { border-color: rgba(255,184,0,.75); }
.bdr-p { border-color: rgba(168,85,247,.7); }
.bdr-g { border-color: rgba(184,232,52,.75); }
.bdr-o { border-color: rgba(255,120,32,.75); }
.bdr-t { border-color: rgba(0,200,176,.75); }
.bdr-c { border-color: rgba(0,212,255,.7); }
.ov-title { font-size: 12px; font-weight: 700; letter-spacing: .05em; margin-bottom: 3px; }
.ov-row { display: flex; gap: 3px; align-items: center; }
.ov-b { font-family: 'JetBrains Mono',monospace; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }
.b-on   { background: rgba(184,232,52,.2); color: #b8e834; border: 1px solid rgba(184,232,52,.4); }
.b-s    { background: rgba(0,212,255,.2); color: #00d4ff; border: 1px solid rgba(0,212,255,.4); }
.b-blo  { background: rgba(184,232,52,.2); color: #b8e834; border: 1px solid rgba(184,232,52,.4); }
.b-stby { background: rgba(255,184,0,.22); color: #ffb800; border: 1px solid rgba(255,184,0,.45); }
.b-o    { background: rgba(255,120,32,.2); color: #ff7820; border: 1px solid rgba(255,120,32,.4); }
.ov-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dg { background: #b8e834; animation: pulseA 2s infinite; }
@keyframes pulseA { 0%,100%{opacity:1} 50%{opacity:.35} }

/* ── SENSOR PANEL ── */
.sensor-col { display: flex; flex-direction: column; gap: 7px; min-height: 0; overflow-y: auto; scrollbar-width: none; }
.sensor-col::-webkit-scrollbar { display: none; }
.sensor-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 10px 12px;
}
.sensor-hdr {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 700; margin-bottom: 8px;
  color: rgba(255,255,255,.75);
}
.sensor-acc { width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0; }
.sensor-sub { font-size: 11px; color: rgba(255,255,255,.2); margin-left: auto; }
.sensor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.sensor-item {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 7px; padding: 7px 8px;
}
.si-tag { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.2); letter-spacing: .06em; margin-bottom: 1px; }
.si-name { font-family: 'JetBrains Mono',monospace; font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.si-orp { color: #e0956a; }
.si-ph  { color: #6aaa88; }
.si-val { font-family: 'JetBrains Mono',monospace; font-size: 22px; font-weight: 700; color: rgba(255,255,255,.8); line-height: 1.1; }
.si-unit { font-size: 11px; font-weight: 400; color: rgba(255,255,255,.28); }
.si-badge { font-family: 'JetBrains Mono',monospace; font-size: 11px; font-weight: 700; margin-top: 4px; letter-spacing: .04em; }
.ss-ok   { color: #b8e834; }
.ss-low  { color: #ffb800; }
.ss-warn { color: #ff5050; }
.ss-off  { color: rgba(255,255,255,.2); }

/* ── CHARTS ── */
.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; flex-shrink: 0; height: 154px; }
.chart-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 8px 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.chart-hdr {
  font-size: 9.5px; font-weight: 600;
  color: rgba(255,255,255,.35);
  letter-spacing: .08em; display: flex; align-items: center; gap: 6px;
}
.chart-acc { width: 5px; height: 5px; background: #d4a040; border-radius: 1px; display: inline-block; }
.chart-legend {
  display: flex; gap: 10px; align-items: center;
  font-size: 9px; color: rgba(255,255,255,.25);
}
.leg-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.chart-wrap { flex: 1; min-height: 0; position: relative; }
.chart-wrap canvas { position: absolute; inset: 0; }
</style>
