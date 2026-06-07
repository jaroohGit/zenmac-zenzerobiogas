<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--green)"></div>
      <h1 class="kd-page-title">PUMP MANAGEMENT</h1>
      <span class="kd-breadcrumb">STA-KD / PUMP</span>
    </div>

    <!-- KPI Row -->
    <div class="kd-kpi-row">
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">PROCESS PUMP</div>
        <div class="kd-kpi-name">Status</div>
        <div class="kd-kpi-num" :style="pumpColor(processPumpStatus)">{{ processPumpStatus }}</div>
        <div class="kd-kpi-sub">Flow: {{ fmtNum(processFlow) }} m³/hr</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">SERUM PUMP</div>
        <div class="kd-kpi-name">Status</div>
        <div class="kd-kpi-num" :style="pumpColor(serumPumpStatus)">{{ serumPumpStatus }}</div>
        <div class="kd-kpi-sub">Flow: {{ fmtNum(serumFlow) }} m³/hr</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">TODAY · PROCESS</div>
        <div class="kd-kpi-name">Process Flow Day</div>
        <div class="kd-kpi-num c-cyan">{{ fmtNum(processFlowDay) }}<span class="kd-kpi-unit">m³</span></div>
        <div class="kd-kpi-sub">Yesterday: {{ fmtNum(processFlowYest) }} m³</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">TODAY · SERUM</div>
        <div class="kd-kpi-name">Serum Flow Day</div>
        <div class="kd-kpi-num c-green">{{ fmtNum(serumFlowDay) }}<span class="kd-kpi-unit">m³</span></div>
        <div class="kd-kpi-sub">Yesterday: {{ fmtNum(serumFlowYest) }} m³</div>
      </div>
    </div>

    <!-- Pump Table -->
    <div class="kd-pump-card">
      <div class="kd-sec-label">PUMP STATUS TABLE</div>
      <div class="kd-pump-hdr">
        <span>PUMP</span><span>STATUS</span><span>FLOW (m³/hr)</span><span>DAY TOTAL (m³)</span><span>YESTERDAY (m³)</span><span>CTRL</span>
      </div>
      <div class="kd-pump-rows">
        <div class="kd-pump-row" :class="rowClass(processPumpStatus)">
          <span class="kd-pump-name">Process Pump</span>
          <span><span class="kd-st-b" :class="stClass(processPumpStatus)">{{ processPumpStatus }}</span></span>
          <span class="kd-pval">{{ fmtNum(processFlow) }}</span>
          <span class="kd-pflw">{{ fmtNum(processFlowDay) }}</span>
          <span class="kd-psum">{{ fmtNum(processFlowYest) }}</span>
          <span class="kd-pump-ctrl">
            <button class="kd-p-btn kd-p-btn-on"  @click="cmdPump('process', 'start')">ON</button>
            <button class="kd-p-btn kd-p-btn-off" @click="cmdPump('process', 'stop')">OFF</button>
          </span>
        </div>
        <div class="kd-pump-row" :class="rowClass(serumPumpStatus)">
          <span class="kd-pump-name">Serum Pump</span>
          <span><span class="kd-st-b" :class="stClass(serumPumpStatus)">{{ serumPumpStatus }}</span></span>
          <span class="kd-pval">{{ fmtNum(serumFlow) }}</span>
          <span class="kd-pflw">{{ fmtNum(serumFlowDay) }}</span>
          <span class="kd-psum">{{ fmtNum(serumFlowYest) }}</span>
          <span class="kd-pump-ctrl">
            <button class="kd-p-btn kd-p-btn-on"  @click="cmdPump('serum', 'start')">ON</button>
            <button class="kd-p-btn kd-p-btn-off" @click="cmdPump('serum', 'stop')">OFF</button>
          </span>
        </div>
      </div>
    </div>

    <!-- Flow Charts -->
    <div class="kd-dual-row">
      <div class="kd-chart-card">
        <div class="kd-sec-label">PROCESS FLOW — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartProcess"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">SERUM FLOW — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartSerum"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function genRand(min, max, pts = 24) {
  return Array.from({ length: pts }, () => +(min + Math.random() * (max - min)).toFixed(1));
}
function labels24() {
  return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
}

export default {
  name: 'StaKdPump',
  computed: {
    ...mapGetters('staKd', [
      'processFlow', 'serumFlow',
      'processPumpStatus', 'serumPumpStatus',
      'processFlowDay', 'serumFlowDay', 'totalFlowDay',
      'processFlowYest', 'serumFlowYest',
    ]),
  },
  mounted() { this.buildCharts(); },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(1); },
    pumpColor(s) {
      const v = String(s).toLowerCase();
      if (v === 'on' || v === '1' || v === 'run') return 'color: var(--green)';
      if (v === 'off' || v === '0') return 'color: var(--text3)';
      return 'color: var(--amber)';
    },
    rowClass(s) {
      const v = String(s).toLowerCase();
      if (v === 'on' || v === '1' || v === 'run') return 'row-run';
      if (v === 'standby' || v === 'stby') return 'row-stby';
      return 'row-off';
    },
    stClass(s) {
      const v = String(s).toLowerCase();
      if (v === 'on' || v === '1' || v === 'run') return 'st-on';
      if (v === 'standby' || v === 'stby') return 'st-stby';
      return 'st-off';
    },
    cmdPump(side, cmd) { this.$store.dispatch('staKd/cmdPump', { side, cmd }); },
    buildCharts() {
      const opts = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#3a4e62', font: { size: 9 } }, grid: { color: '#1e2a3a' } },
          y: { ticks: { color: '#8aa2b8', font: { size: 10 } }, grid: { color: '#1e2a3a' } },
        },
      };
      new Chart(this.$refs.chartProcess, {
        type: 'bar',
        data: { labels: labels24(), datasets: [{ label: 'Process Flow', data: genRand(80, 160), backgroundColor: 'rgba(0,232,122,.35)', borderColor: '#00e87a', borderWidth: 1 }] },
        options: opts,
      });
      new Chart(this.$refs.chartSerum, {
        type: 'bar',
        data: { labels: labels24(), datasets: [{ label: 'Serum Flow', data: genRand(60, 130), backgroundColor: 'rgba(0,212,255,.35)', borderColor: '#00d4ff', borderWidth: 1 }] },
        options: opts,
      });
    },
  },
};
</script>

<style scoped>
.kd-page { display: flex; flex-direction: column; gap: 9px; }
.kd-page-title-bar { display: flex; align-items: center; gap: 9px; }
.kd-page-accent { width: 4px; height: 22px; border-radius: 2px; }
.kd-page-title { font-family: var(--font-ui); font-weight: 700; font-size: 18px; letter-spacing: .1em; }
.kd-breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-left: auto; }

.kd-kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 9px; }
.kd-kpi-card { background: rgba(10,14,20,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
.kd-kpi-tag  { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text3); letter-spacing: .08em; }
.kd-kpi-name { font-family: var(--font-ui); font-size: 13px; color: var(--text2); font-weight: 600; }
.kd-kpi-num  { font-family: var(--font-mono); font-weight: 700; font-size: 20px; margin-top: 3px; display: flex; align-items: baseline; gap: 4px; }
.kd-kpi-unit { font-size: 11px; font-weight: 400; color: var(--text2); }
.kd-kpi-sub  { font-family: var(--font-mono); font-size: 9px; color: var(--text3); margin-top: 4px; }

.kd-pump-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 11px; }
.kd-pump-hdr { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr; gap: 4px; padding: 0 5px; font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: .05em; margin-bottom: 6px; }
.kd-pump-rows { display: flex; flex-direction: column; gap: 5px; }
.kd-pump-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr; align-items: center; gap: 4px; background: rgba(18,25,36,.55); border-radius: 6px; padding: 8px 5px; border: 1px solid rgba(255,255,255,.05); border-left: 3px solid rgba(255,255,255,.08); transition: all .2s; }
.row-run  { border-left-color: var(--green); }
.row-stby { border-left-color: var(--amber); }
.row-off  { border-left-color: var(--text3); }
.kd-pump-row:hover { background: rgba(25,35,50,.7); }
.kd-pump-name { font-family: var(--font-ui); font-weight: 600; font-size: 13px; }
.kd-st-b { display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: 3px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; }
.st-on   { background: rgba(0,232,122,.13); color: var(--green); border: 1px solid rgba(0,232,122,.3); }
.st-stby { background: rgba(255,184,0,.13); color: var(--amber); border: 1px solid rgba(255,184,0,.3); }
.st-off  { background: rgba(55,75,95,.2);  color: var(--text3); border: 1px solid rgba(255,255,255,.07); }
.kd-pval { font-family: var(--font-mono); font-size: 11px; color: var(--text2); }
.kd-pflw { font-family: var(--font-mono); font-size: 11px; color: var(--amber); }
.kd-psum { font-family: var(--font-mono); font-size: 11px; color: var(--cyan); }
.kd-pump-ctrl { display: flex; gap: 4px; }
.kd-p-btn { font-family: var(--font-mono); font-size: 8px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer; transition: all .15s; border: 1px solid; }
.kd-p-btn-on  { background: rgba(0,232,122,.12); color: var(--green); border-color: rgba(0,232,122,.3); }
.kd-p-btn-on:hover  { background: rgba(0,232,122,.22); }
.kd-p-btn-off { background: rgba(255,64,64,.10);  color: var(--red);   border-color: rgba(255,64,64,.28); }
.kd-p-btn-off:hover { background: rgba(255,64,64,.18); }

.kd-dual-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-chart-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-chart-wrap { height: 180px; position: relative; }
.kd-sec-label { font-family: var(--font-mono); font-size: 10px; color: #7ab8d4; letter-spacing: .1em; margin-bottom: 7px; display: flex; align-items: center; gap: 6px; font-weight: 700; }
.kd-sec-label::before { content: ""; display: block; width: 6px; height: 6px; background: var(--green); border-radius: 1px; }
.c-cyan { color: var(--cyan); } .c-green { color: var(--green); }
</style>
