<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--amber)"></div>
      <h1 class="kd-page-title">ENERGY ANALYTICS</h1>
      <span class="kd-breadcrumb">STA-KD / ENERGY</span>
    </div>

    <!-- KPI Row -->
    <div class="kd-kpi-row-5">
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">TOTAL POWER</div>
        <div class="kd-kpi-num c-amber">{{ blowerTotalPower }}<span class="kd-kpi-unit">kW</span></div>
        <div class="kd-kpi-sub">TB-01 + TB-02</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">TB-01 POWER</div>
        <div class="kd-kpi-num c-cyan">{{ fmtNum(tb1Power) }}<span class="kd-kpi-unit">kW</span></div>
        <div class="kd-kpi-sub">Current: {{ fmtNum(tb1Current) }} A</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">TB-02 POWER</div>
        <div class="kd-kpi-num c-cyan">{{ fmtNum(tb2Power) }}<span class="kd-kpi-unit">kW</span></div>
        <div class="kd-kpi-sub">Current: {{ fmtNum(tb2Current) }} A</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">EFFICIENCY · PROCESS</div>
        <div class="kd-kpi-num c-green">{{ processEff }}<span class="kd-kpi-unit">m³/kWh</span></div>
        <div class="kd-kpi-sub">Flow / Power ratio</div>
      </div>
      <div class="kd-kpi-card">
        <div class="kd-kpi-tag">DAILY ENERGY</div>
        <div class="kd-kpi-num c-orange">{{ dailyEnergy }}<span class="kd-kpi-unit">kWh</span></div>
        <div class="kd-kpi-sub">Est. today</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="kd-dual-row">
      <div class="kd-chart-card">
        <div class="kd-sec-label">POWER CONSUMPTION — 24h</div>
        <div class="kd-chart-wrap-lg"><canvas ref="chartPower"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">POWER DISTRIBUTION</div>
        <div class="kd-chart-wrap-lg"><canvas ref="chartDist"></canvas></div>
      </div>
    </div>

    <!-- Blower efficiency table -->
    <div class="kd-energy-table-card">
      <div class="kd-sec-label">BLOWER EFFICIENCY COMPARISON</div>
      <table class="kd-etable">
        <thead>
          <tr>
            <th>Device</th><th>Power (kW)</th><th>Current (A)</th>
            <th>Flow (m³/min)</th><th>Efficiency (m³/kW)</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="kd-et-name">TB-01 Blower</td>
            <td class="c-amber">{{ fmtNum(tb1Power) }}</td>
            <td class="c-cyan">{{ fmtNum(tb1Current) }}</td>
            <td class="c-green">{{ fmtNum(tb1Flow) }}</td>
            <td class="c-teal">{{ eff(tb1Flow, tb1Power) }}</td>
            <td><span class="kd-st-badge" :class="stClass(tb1Status)">{{ tb1Status }}</span></td>
          </tr>
          <tr>
            <td class="kd-et-name">TB-02 Blower</td>
            <td class="c-amber">{{ fmtNum(tb2Power) }}</td>
            <td class="c-cyan">{{ fmtNum(tb2Current) }}</td>
            <td class="c-green">{{ fmtNum(tb2Flow) }}</td>
            <td class="c-teal">{{ eff(tb2Flow, tb2Power) }}</td>
            <td><span class="kd-st-badge" :class="stClass(tb2Status)">{{ tb2Status }}</span></td>
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

function genSine(base, amp, shift, pts = 24) {
  return Array.from({ length: pts }, (_, i) => +(base + amp * Math.sin((i + shift) * 0.4)).toFixed(1));
}
function labels24() { return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`); }

export default {
  name: 'StaKdEnergy',
  computed: {
    ...mapGetters('staKd', [
      'tb1Power','tb2Power','tb1Current','tb2Current','tb1Flow','tb2Flow',
      'tb1Status','tb2Status','processFlow','blowerTotalPower',
    ]),
    processEff() {
      const flow = parseFloat(this.processFlow);
      const pow  = parseFloat(this.blowerTotalPower);
      if (isNaN(flow) || isNaN(pow) || pow === 0) return '—';
      return (flow / pow).toFixed(2);
    },
    dailyEnergy() {
      const pow = parseFloat(this.blowerTotalPower);
      if (isNaN(pow)) return '—';
      return (pow * 24).toFixed(0);
    },
  },
  mounted() { this.buildCharts(); },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(1); },
    eff(flow, pow) {
      const f = parseFloat(flow), p = parseFloat(pow);
      if (isNaN(f) || isNaN(p) || p === 0) return '—';
      return (f / p).toFixed(3);
    },
    stClass(s) {
      const v = String(s).toLowerCase();
      if (v === 'on' || v === '1' || v === 'run') return 'st-on';
      if (v === 'standby' || v === 'stby') return 'st-stby';
      return 'st-off';
    },
    buildCharts() {
      const co = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { labels: { color: '#8aa2b8', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#3a4e62', font: { size: 9 } }, grid: { color: '#1e2a3a' } },
          y: { ticks: { color: '#8aa2b8', font: { size: 10 } }, grid: { color: '#1e2a3a' } },
        },
      };
      new Chart(this.$refs.chartPower, {
        type: 'line',
        data: {
          labels: labels24(),
          datasets: [
            { label: 'TB-01 kW', data: genSine(85, 18, 0), borderColor: '#ffb800', backgroundColor: 'rgba(255,184,0,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
            { label: 'TB-02 kW', data: genSine(78, 20, 3), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          ],
        },
        options: co,
      });
      new Chart(this.$refs.chartDist, {
        type: 'doughnut',
        data: {
          labels: ['TB-01 Blower', 'TB-02 Blower', 'Pump & Others'],
          datasets: [{ data: [85, 78, 12], backgroundColor: ['rgba(255,184,0,.7)','rgba(0,212,255,.7)','rgba(168,85,247,.7)'], borderColor: '#1e2a3a', borderWidth: 2 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#8aa2b8', font: { size: 10 }, padding: 12 } } },
          cutout: '65%',
        },
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
.kd-kpi-row-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 9px; }
.kd-kpi-card { background: rgba(10,14,20,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
.kd-kpi-tag  { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text3); letter-spacing: .08em; margin-bottom: 4px; }
.kd-kpi-num  { font-family: var(--font-mono); font-weight: 700; font-size: 22px; display: flex; align-items: baseline; gap: 4px; }
.kd-kpi-unit { font-size: 10px; font-weight: 400; color: var(--text2); }
.kd-kpi-sub  { font-family: var(--font-mono); font-size: 9px; color: var(--text3); margin-top: 4px; }
.kd-dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-chart-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-chart-wrap-lg { height: 200px; position: relative; }
.kd-sec-label { font-family: var(--font-mono); font-size: 10px; color: #7ab8d4; letter-spacing: .1em; margin-bottom: 7px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.kd-sec-label::before { content: ""; display: block; width: 6px; height: 6px; background: var(--amber); border-radius: 1px; }
.kd-energy-table-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-etable { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; }
.kd-etable th { color: var(--text3); font-size: 9px; letter-spacing: .06em; padding: 6px 10px; text-align: left; border-bottom: 1px solid var(--border); }
.kd-etable td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.04); }
.kd-etable tr:hover td { background: rgba(25,35,50,.4); }
.kd-et-name { font-family: var(--font-ui); font-weight: 600; font-size: 13px; }
.kd-st-badge { font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 3px; }
.st-on   { background:rgba(0,232,122,.13); color:var(--green); border:1px solid rgba(0,232,122,.3); }
.st-stby { background:rgba(255,184,0,.13); color:var(--amber); border:1px solid rgba(255,184,0,.3); }
.st-off  { background:rgba(55,75,95,.2);  color:var(--text3); border:1px solid rgba(255,255,255,.07); }
.c-amber { color:var(--amber); } .c-cyan { color:var(--cyan); } .c-green { color:var(--green); }
.c-teal  { color:var(--teal); } .c-orange { color:var(--orange); }
</style>
