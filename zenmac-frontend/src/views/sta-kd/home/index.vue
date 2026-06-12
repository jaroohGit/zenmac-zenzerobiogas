<template>
  <div class="kd-page">

    <!-- ── KPI ROW ────────────────────────────────────────────────── -->
    <div class="kpi-row">

      <div class="kpi-card">
        <div class="kpi-tag">SERUM PROCESS</div>
        <div class="kpi-name">Flow Rate</div>
        <div class="kpi-num c-orange">
          {{ fmtNum(serumFlow) }}<span class="kpi-unit">m³/hr</span>
        </div>
        <div class="kpi-sub">Today total: {{ fmtNum(serumFlowDay) }} m³</div>
        <div class="kpi-bar-bg"><div class="kpi-bar b-orange-bg" :style="{ width: pct(serumFlow, 300) + '%' }"></div></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-tag">LATEX PROCESS</div>
        <div class="kpi-name">Flow Rate</div>
        <div class="kpi-num c-teal">
          {{ fmtNum(processFlow) }}<span class="kpi-unit">m³/hr</span>
        </div>
        <div class="kpi-sub">Today total: {{ fmtNum(processFlowDay) }} m³</div>
        <div class="kpi-bar-bg"><div class="kpi-bar b-teal-bg" :style="{ width: pct(processFlow, 300) + '%' }"></div></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-tag">BLOWER SYSTEM</div>
        <div class="kpi-name">Power Usage</div>
        <div class="kpi-num c-green">
          {{ blowerTotalPower }}<span class="kpi-unit">kWh</span>
        </div>
        <div class="kpi-sub">BL-1: {{ tb1Status || '—' }} &nbsp;|&nbsp; BL-2: {{ tb2Status || '—' }}</div>
        <div class="kpi-bar-bg"><div class="kpi-bar b-green-bg" :style="{ width: pct(blowerTotalPower, 600) + '%' }"></div></div>
      </div>

      <div class="kpi-card">
        <div class="kpi-tag">SYSTEM STATUS</div>
        <div class="kpi-name">Combined ORP</div>
        <div class="kpi-num c-cyan">
          {{ combinedORP }}<span class="kpi-unit">mV avg</span>
        </div>
        <div class="kpi-sub">Serum: {{ fmtNum(serumORP) }} mV &nbsp;|&nbsp; Latex: {{ fmtNum(processORP) }} mV</div>
        <div class="kpi-bar-bg"><div class="kpi-bar b-cyan-bg" :style="{ width: pct(parseFloat(combinedORP) + 200, 400) + '%' }"></div></div>
      </div>

    </div>

    <!-- ── MID ROW: MAP + SENSORS ─────────────────────────────────── -->
    <div class="mid-row">

      <!-- AERIAL MAP -->
      <div class="map-card">
        <div class="sec-label">
          <span class="sec-acc"></span>
          SITE OVERVIEW — STA-KD : SERUM &amp; LATEX PROCESS
        </div>
        <div class="map-container">
          <img src="/kd-aerial.jpg" alt="STA-KD Site Aerial View" />
          <div class="overlay">

            <!-- Sludge Dewatering -->
            <div class="ov bdr-a" style="left:2%;top:5%">
              <div class="ov-title" style="color:var(--amber)">SLUDGE DEWATERING</div>
              <div class="ov-row">
                <span class="ov-b b-on">RUN</span>
                <span class="ov-b b-s">Normal</span>
              </div>
            </div>

            <!-- Equalizing Tank -->
            <div class="ov bdr-p" style="left:42%;top:4%">
              <div class="ov-title" style="color:var(--purple)">EQUALIZING TANK</div>
              <div class="ov-row">
                <span class="ov-b b-on">NORMAL</span>
                <span class="ov-b b-s">Level OK</span>
              </div>
            </div>

            <!-- Blower System -->
            <div class="ov bdr-g" style="left:33%;top:27%">
              <div class="ov-title" style="color:var(--green)">BLOWER SYSTEM</div>
              <div class="ov-row">
                <span class="ov-b b-blo">BL-1: {{ tb1Status || '—' }}</span>
                <span class="ov-dot dg"></span>
                <span class="ov-b b-stby">BL-2: {{ tb2Status || 'STBY' }}</span>
              </div>
            </div>

            <!-- AT-SERUM (บ่อ 1) -->
            <div class="ov bdr-o" style="left:14%;top:49%">
              <div class="ov-title" style="color:var(--orange)">AT-SERUM (บ่อ 1)</div>
              <div class="ov-row">
                <span class="ov-b b-s">ORP {{ fmtNum(serumORP) }} mV</span>
                <span class="ov-b b-on">pH {{ fmtNum(serumpH) }}</span>
              </div>
              <div class="ov-row" style="margin-top:3px">
                <span class="ov-b b-pump">Serum-P1</span>
                <span class="ov-dot" :class="serumPumpDot"></span>
                <span class="ov-b b-fl">{{ fmtNum(serumFlow) }} m³/hr</span>
              </div>
            </div>

            <!-- AT-LATEX (บ่อ 2) -->
            <div class="ov bdr-t" style="left:46%;top:49%">
              <div class="ov-title" style="color:var(--teal)">AT-LATEX (บ่อ 2)</div>
              <div class="ov-row">
                <span class="ov-b b-s">ORP {{ fmtNum(processORP) }} mV</span>
                <span class="ov-b b-on">pH {{ fmtNum(processpH) }}</span>
              </div>
              <div class="ov-row" style="margin-top:3px">
                <span class="ov-b b-pump">Latex-P1</span>
                <span class="ov-dot" :class="processPumpDot"></span>
                <span class="ov-b b-fl">{{ fmtNum(processFlow) }} m³/hr</span>
              </div>
            </div>

            <!-- Serum Storage -->
            <div class="ov bdr-o" style="right:2%;top:28%">
              <div class="ov-title" style="color:var(--orange)">SERUM STORAGE</div>
              <div class="ov-row">
                <span class="ov-b b-o">pH —</span>
                <span class="ov-b b-fl">Level —</span>
                <span class="ov-dot do"></span>
                <span class="ov-b b-on">ACTIVE</span>
              </div>
            </div>

            <!-- Sedimentation -->
            <div class="ov bdr-c" style="left:4%;bottom:4%">
              <div class="ov-title" style="color:var(--cyan)">SEDIMENTATION</div>
              <div class="ov-row">
                <span class="ov-b b-blo">RUNNING</span>
                <span class="ov-b b-s">Effluent OK</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- SENSOR SUMMARY PANEL -->
      <div class="sensor-col">

        <!-- AT-SERUM SENSORS -->
        <div class="sensor-panel">
          <div class="sensor-title">
            <div class="sensor-acc" style="background:var(--orange)"></div>
            <span>AT-SERUM SENSORS</span>
            <span class="sensor-sub">บ่อเติมอากาศ 1</span>
          </div>
          <div class="sensor-grid">
            <div class="sensor-item">
              <div class="si-tag">ORP SENSOR</div>
              <div class="si-name si-name-orp">ORP</div>
              <div class="si-val c-cyan">
                <span>{{ fmtSigned(serumORP) }}</span><span class="si-unit">mV</span>
              </div>
              <div class="si-status" :class="orpStatus(serumORP)">{{ orpLabel(serumORP) }}</div>
            </div>
            <div class="sensor-item">
              <div class="si-tag">pH SENSOR</div>
              <div class="si-name si-name-ph">pH</div>
              <div class="si-val c-green">
                <span>{{ fmtNum(serumpH) }}</span>
              </div>
              <div class="si-status" :class="phStatus(serumpH)">{{ phLabel(serumpH) }}</div>
            </div>
          </div>
        </div>

        <!-- AT-LATEX SENSORS -->
        <div class="sensor-panel">
          <div class="sensor-title">
            <div class="sensor-acc" style="background:var(--teal)"></div>
            <span>AT-LATEX SENSORS</span>
            <span class="sensor-sub">บ่อเติมอากาศ 2</span>
          </div>
          <div class="sensor-grid">
            <div class="sensor-item">
              <div class="si-tag">ORP SENSOR</div>
              <div class="si-name si-name-orp">ORP</div>
              <div class="si-val c-cyan">
                <span>{{ fmtSigned(processORP) }}</span><span class="si-unit">mV</span>
              </div>
              <div class="si-status" :class="orpStatus(processORP)">{{ orpLabel(processORP) }}</div>
            </div>
            <div class="sensor-item">
              <div class="si-tag">pH SENSOR</div>
              <div class="si-name si-name-ph">pH</div>
              <div class="si-val c-green">
                <span>{{ fmtNum(processpH) }}</span>
              </div>
              <div class="si-status" :class="phStatus(processpH)">{{ phLabel(processpH) }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── CHART ROW ─────────────────────────────────────────────── -->
    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-header">
          <div class="sec-label">
            <span class="sec-acc"></span>
            24-HR ORP TREND — SERUM vs LATEX
          </div>
          <div class="chart-legend">
            <span class="leg-dot" style="background:var(--orange)"></span><span>Serum</span>
            <span class="leg-dot" style="background:var(--green)"></span><span>Latex</span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="chartORP"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="sec-label">
            <span class="sec-acc"></span>
            24-HR FLOW TREND — SERUM vs LATEX
          </div>
          <div class="chart-legend">
            <span class="leg-dot" style="background:var(--orange)"></span><span>Serum m³/hr</span>
            <span class="leg-dot" style="background:var(--green)"></span><span>Latex m³/hr</span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="chartFlow"></canvas>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const CHART_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#3a4e62', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 9 },
      grid: { color: '#1e2a3a' },
    },
    y: {
      ticks: { color: '#8aa2b8', font: { family: 'JetBrains Mono', size: 9 } },
      grid: { color: '#1e2a3a' },
    },
  },
};

function labels24h() {
  return Array.from({ length: 289 }, (_, i) => {
    const m = i * 5;
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    return (m % 60 === 0) ? `${h}:${mm}` : '';
  });
}

export default {
  name: 'StaKdHome',
  data() {
    return {
      updateTimer: null,
    };
  },
  created() {
    // Non-reactive — keeps Chart.js instances outside Vue's Proxy
    this._chartORP  = null;
    this._chartFlow = null;
  },
  computed: {
    ...mapGetters('staKd', [
      'processFlow', 'serumFlow',
      'processORP', 'serumORP',
      'processpH', 'serumpH',
      'tb1Status', 'tb2Status',
      'processFlowDay', 'serumFlowDay',
      'processPumpStatus', 'serumPumpStatus',
      'combinedORP', 'blowerTotalPower',
    ]),
    serumPumpDot() {
      return this.serumPumpStatus === 'RUN' ? 'dg' : 'dgr';
    },
    processPumpDot() {
      return this.processPumpStatus === 'RUN' ? 'dg' : 'dgr';
    },
  },
  mounted() {
    this.buildCharts();
    this.$nextTick(() => {
      this._chartORP?.resize();
      this._chartFlow?.resize();
    });
    const safeHistory = (topicKey, field, cb) => {
      this.$store.dispatch('staKd/getHistory', { topicKey, field })
        .then(data => { if (data?.length) cb(data); })
        .catch(() => {});
    };
    safeHistory('kd4', 'Serum_ORP_Lock_hr',           d => this.seedHistory('serum', 'ORP',  d));
    safeHistory('kd4', 'Process_ORP_Lock_hr',          d => this.seedHistory('latex', 'ORP',  d));
    safeHistory('kd',  'Serum Flow m3_hr (real)',       d => this.seedHistory('serum', 'flow', d));
    safeHistory('kd',  'Process Flow m3_hr (Real)',     d => this.seedHistory('latex', 'flow', d));
    this.updateTimer = setInterval(this.pushLivePoint, 5000);
  },
  beforeUnmount() {
    clearInterval(this.updateTimer);
    this._chartORP?.destroy();
    this._chartFlow?.destroy();
  },
  methods: {
    buildCharts() {
      const labels = labels24h();
      const empty  = new Array(289).fill(null);

      this._chartORP = new Chart(this.$refs.chartORP, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Serum', data: [...empty],
              borderColor: '#ff7820', backgroundColor: 'rgba(255,120,32,.07)',
              borderWidth: 1.5, pointRadius: 0, tension: 0.3, spanGaps: true,
            },
            {
              label: 'Latex', data: [...empty],
              borderColor: '#00e87a', backgroundColor: 'rgba(0,232,122,.07)',
              borderWidth: 1.5, pointRadius: 0, tension: 0.3, spanGaps: true,
            },
          ],
        },
        options: {
          ...CHART_BASE,
          scales: {
            ...CHART_BASE.scales,
            y: { ...CHART_BASE.scales.y, title: { display: true, text: 'mV', color: '#3a4e62', font: { size: 9 } } },
          },
        },
      });

      this._chartFlow = new Chart(this.$refs.chartFlow, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Serum m³/hr', data: [...empty],
              borderColor: '#ff7820', backgroundColor: 'rgba(255,120,32,.07)',
              borderWidth: 1.5, pointRadius: 0, tension: 0.3, spanGaps: true,
            },
            {
              label: 'Latex m³/hr', data: [...empty],
              borderColor: '#00e87a', backgroundColor: 'rgba(0,232,122,.07)',
              borderWidth: 1.5, pointRadius: 0, tension: 0.3, spanGaps: true,
            },
          ],
        },
        options: {
          ...CHART_BASE,
          scales: {
            ...CHART_BASE.scales,
            y: { ...CHART_BASE.scales.y, title: { display: true, text: 'm³/hr', color: '#3a4e62', font: { size: 9 } } },
          },
        },
      });
    },

    seedHistory(side, type, points) {
      const dataset = type === 'ORP' ? this._chartORP : this._chartFlow;
      if (!dataset) return;
      const idx = side === 'serum' ? 0 : 1;
      const now = Date.now();
      const buckets = new Array(289).fill(null);
      points.forEach(({ v, t }) => {
        const minAgo = Math.round((now - t) / 60000);
        const slot   = 288 - Math.min(288, Math.floor(minAgo / 5));
        if (slot >= 0 && slot < 289) buckets[slot] = v;
      });
      dataset.data.datasets[idx].data = buckets;
      dataset.update('none');
    },

    pushLivePoint() {
      const now    = Date.now();
      const slot   = Math.floor((now % 86400000) / 300000); // 5-min bucket of the day

      const updateDataset = (chart, idx, val) => {
        if (!chart) return;
        const arr = chart.data.datasets[idx].data;
        arr[slot]  = parseFloat(val) || null;
        chart.update('none');
      };

      updateDataset(this._chartORP,  0, this.serumORP);
      updateDataset(this._chartORP,  1, this.processORP);
      updateDataset(this._chartFlow, 0, this.serumFlow);
      updateDataset(this._chartFlow, 1, this.processFlow);
    },

    fmtNum(v) {
      const n = parseFloat(v);
      return isNaN(n) ? '—' : n.toFixed(2);
    },
    fmtSigned(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return '—';
      return (n >= 0 ? '+' : '') + n.toFixed(0);
    },
    pct(val, max) {
      const n = parseFloat(val);
      if (isNaN(n)) return 0;
      return Math.min(100, Math.max(0, (n / max) * 100));
    },
    orpStatus(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'ss-off';
      if (n >= 50) return 'ss-ok';
      if (n >= 0)  return 'ss-low';
      return 'ss-warn';
    },
    orpLabel(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return '— N/A';
      if (n >= 50) return '● NORMAL';
      if (n >= 0)  return '▲ LOW';
      return '▲ LOW';
    },
    phStatus(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return 'ss-off';
      if (n >= 6.5 && n <= 8.5) return 'ss-ok';
      if (n >= 6.0 && n <= 9.0) return 'ss-low';
      return 'ss-warn';
    },
    phLabel(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return '— N/A';
      if (n >= 6.5 && n <= 8.5) return '● NORMAL';
      if (n >= 6.0 && n <= 9.0) return '▲ LOW';
      return '▲ OUT';
    },
  },
};
</script>

<style scoped>
/* ── PAGE: scrollable ─────────────────────────────────────────────── */
.kd-page {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 6px;
  overflow-y: auto;
  padding-bottom: 16px;
}

/* ── KPI ROW ──────────────────────────────────────────────────────── */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }

.kpi-card {
  background: rgba(10,14,20,0.92);
  border: 1px solid var(--border);
  border-radius: 8px; padding: 7px 11px;
  transition: border-color .2s, transform .15s;
}
.kpi-card:hover { border-color: var(--border3); transform: translateY(-1px); }
.kpi-tag  { font-family: var(--font-mono); font-size: 9px; color: var(--text3); letter-spacing: .08em; margin-bottom: 1px; }
.kpi-name { font-family: var(--font-ui); font-size: 15px; color: var(--text2); font-weight: 600; }
.kpi-num  { font-family: var(--font-mono); font-weight: 700; font-size: 22px; line-height: 1.1; margin-top: 2px; display: flex; align-items: baseline; gap: 3px; }
.kpi-unit { font-size: 10px; font-weight: 400; color: var(--text2); }
.kpi-sub  { font-family: var(--font-mono); font-size: 8.5px; color: var(--text3); margin-top: 2px; }
.kpi-bar-bg { height: 2px; background: var(--bg3); border-radius: 2px; margin-top: 5px; }
.kpi-bar    { height: 2px; border-radius: 2px; transition: width 1.2s ease; }

/* ── MID ROW ──────────────────────────────────────────────────────── */
.mid-row {
  display: grid;
  grid-template-columns: minmax(0, 837px) 1fr;
  gap: 6px;
  align-items: start;
}

/* ── MAP CARD ─────────────────────────────────────────────────────── */
.map-card {
  background: rgba(8,12,18,0.88);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 342px;
}

.sec-label {
  font-family: var(--font-mono); font-size: 10px; color: #7ab8d4;
  letter-spacing: .1em; font-weight: 700;
  display: flex; align-items: center; gap: 6px;
}
.sec-acc {
  display: inline-block; width: 6px; height: 6px;
  background: var(--cyan); border-radius: 1px; flex-shrink: 0;
}

.map-container {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #060a10;
}
.map-container img {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 0%;
  border-radius: 6px;
  filter: saturate(0.85) brightness(0.88);
  transform: scale(1.22);
  transform-origin: 42% 48%;
}
.overlay {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

/* Overlay nodes */
.ov {
  position: absolute;
  background: rgba(4,8,14,0.62);
  border: 1.5px solid rgba(255,255,255,0.28);
  border-radius: 7px; padding: 6px 12px;
  pointer-events: auto;
  transition: border-color .2s, background .2s;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}
.ov:hover { background: rgba(4,8,14,0.82); border-color: rgba(255,255,255,0.52); }
.ov.bdr-g { border-color: rgba(0,232,122,.80); }
.ov.bdr-a { border-color: rgba(255,184,0,.80); }
.ov.bdr-p { border-color: rgba(168,85,247,.75); }
.ov.bdr-c { border-color: rgba(0,212,255,.75); }
.ov.bdr-o { border-color: rgba(255,120,32,.78); }
.ov.bdr-t { border-color: rgba(0,200,176,.78); }

.ov-title {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  letter-spacing: .05em;
  text-shadow: 0 1px 8px rgba(0,0,0,1), 0 0 16px rgba(0,0,0,.9);
  margin-bottom: 4px;
}
.ov-row { display: flex; gap: 3px; align-items: center; flex-wrap: wrap; }

.ov-b {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  padding: 2px 8px; border-radius: 3px; white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0,0,0,.9);
}
.b-pump { background: rgba(0,212,255,.30); color: #60d8f8; border: 1px solid rgba(0,212,255,.55); }
.b-on   { background: rgba(0,232,122,.30); color: var(--green); border: 1px solid rgba(0,232,122,.62); }
.b-off  { background: rgba(50,65,85,.45); color: rgba(255,255,255,.40); border: 1px solid rgba(255,255,255,.18); }
.b-stby { background: rgba(255,184,0,.28); color: var(--amber); border: 1px solid rgba(255,184,0,.55); }
.b-s    { background: rgba(0,212,255,.25); color: var(--cyan); border: 1px solid rgba(0,212,255,.48); }
.b-blo  { background: rgba(0,232,122,.25); color: var(--green); border: 1px solid rgba(0,232,122,.52); }
.b-fl   { background: rgba(255,184,0,.25); color: var(--amber); border: 1px solid rgba(255,184,0,.48); }
.b-o    { background: rgba(255,120,32,.25); color: var(--orange); border: 1px solid rgba(255,120,32,.52); }
.b-t    { background: rgba(0,200,176,.22); color: var(--teal); border: 1px solid rgba(0,200,176,.48); }

.ov-dot  { width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.dg  { background: var(--green); animation: pulseA 2s infinite; }
.da  { background: var(--amber); animation: pulseA 2.5s infinite; }
.dgr { background: rgba(255,255,255,.25); }
.do  { background: var(--orange); animation: pulseA 2s infinite; }

/* ── SENSOR COLUMN ────────────────────────────────────────────────── */
.sensor-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sensor-col::-webkit-scrollbar { width: 4px; }
.sensor-col::-webkit-scrollbar-track { background: transparent; }
.sensor-col::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 2px; }
.sensor-col::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.22); }

.sensor-panel {
  background: rgba(8,12,18,0.92);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 22px 24px;
}
.sensor-title {
  font-family: var(--font-ui); font-weight: 700; font-size: 30px;
  display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
}
.sensor-acc { width: 5px; height: 30px; border-radius: 2px; flex-shrink: 0; }
.sensor-sub { font-family: var(--font-mono); font-size: 22px; color: var(--text3); margin-left: auto; }

.sensor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.sensor-item {
  background: rgba(14,20,30,.6);
  border: 1px solid var(--border);
  border-radius: 14px; padding: 20px 22px;
}
.si-tag  { font-family: var(--font-mono); font-size: 19px; color: var(--text3); letter-spacing: .06em; margin-bottom: 4px; }
.si-name { font-family: var(--font-mono); font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.si-name-orp { color: #ffaa66; }
.si-name-ph  { color: #66ffaa; }
.si-val  {
  font-family: var(--font-mono); font-weight: 700; font-size: 38px;
  line-height: 1.1; display: flex; align-items: baseline; gap: 4px;
}
.si-unit { font-size: 26px; font-weight: 400; color: var(--text2); }

.si-status { font-family: var(--font-mono); font-size: 26px; font-weight: 700; margin-top: 14px; letter-spacing: .04em; }
.ss-ok   { color: var(--green); }
.ss-low  { color: var(--amber); }
.ss-warn { color: var(--red); }
.ss-off  { color: var(--text3); }

/* ── COLORS ───────────────────────────────────────────────────────── */
.c-cyan   { color: var(--cyan); }
.c-green  { color: var(--green); }
.c-amber  { color: var(--amber); }
.c-orange { color: var(--orange); }
.c-teal   { color: var(--teal); }
.b-orange-bg { background: var(--orange); }
.b-teal-bg   { background: var(--teal); }
.b-green-bg  { background: var(--green); }
.b-cyan-bg   { background: var(--cyan); }

/* ── ANIMATIONS ───────────────────────────────────────────────────── */
@keyframes pulseA {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,232,122,.5); }
  50%       { opacity: .7; box-shadow: 0 0 0 4px rgba(0,232,122,0); }
}

/* ── CHART ROW ────────────────────────────────────────────────────── */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  flex-shrink: 0;
}
.chart-card {
  background: rgba(8,12,18,0.92);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
.chart-header {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; flex-wrap: nowrap;
}
.chart-header .sec-label {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chart-legend {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 9px; color: var(--text2);
  white-space: nowrap; flex-shrink: 0;
}
.leg-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.chart-wrap { position: relative; height: 630px; }

/* ── RESPONSIVE ───────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .mid-row { grid-template-columns: minmax(0, 708px) 1fr; }
}
@media (max-width: 900px) {
  .kd-page { grid-template-rows: auto auto auto; overflow-y: auto; height: auto; }
  .mid-row { grid-template-columns: 1fr; }
  .sensor-col { flex-direction: row; overflow-y: visible; }
  .sensor-panel { flex: 1; }
  .map-container { padding-bottom: 56%; flex: none; }
}
@media (max-width: 767.98px) {
  .kd-page { height: auto; overflow-y: auto; }
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .mid-row { grid-template-columns: 1fr; }
  .sensor-col { flex-direction: column; overflow-y: visible; }
  .chart-row  { grid-template-columns: 1fr; }
  .map-container { padding-bottom: 65%; flex: none; }
  .ov { padding: 4px 8px; }
  .ov-title { font-size: 9px; }
  .ov-b { font-size: 9px; padding: 2px 6px; }
}
@media (max-width: 480px) {
  .kpi-row  { gap: 5px; }
  .kpi-num  { font-size: 18px; }
  .chart-wrap { height: 90px; }
}
</style>
