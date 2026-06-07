<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--purple)"></div>
      <h1 class="kd-page-title">HISTORICAL REPORT</h1>
      <span class="kd-breadcrumb">STA-KD / REPORT</span>
    </div>

    <!-- Period selector -->
    <div class="kd-period-bar">
      <button v-for="p in periods" :key="p.id" class="kd-period-btn"
              :class="{ active: period === p.id }" @click="setPeriod(p.id)">{{ p.label }}</button>
      <div style="margin-left:auto; display:flex; gap:8px;">
        <button class="kd-period-btn" @click="exportCSV">⬇ CSV</button>
        <button class="kd-period-btn" @click="exportPDF">⬇ PDF</button>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="kd-kpi-row-5">
      <div class="kd-kpi-card" v-for="kpi in kpiSummary" :key="kpi.label">
        <div class="kd-kpi-tag">{{ kpi.label }}</div>
        <div class="kd-kpi-num" :style="{ color: kpi.color }">{{ kpi.value }}<span class="kd-kpi-unit">{{ kpi.unit }}</span></div>
        <div class="kd-kpi-sub">{{ kpi.sub }}</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="kd-dual-row">
      <div class="kd-chart-card">
        <div class="kd-sec-label">TOTAL VOLUME — {{ periodLabel }}</div>
        <div class="kd-chart-wrap"><canvas ref="chartVol"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">ORP AVERAGE — {{ periodLabel }}</div>
        <div class="kd-chart-wrap"><canvas ref="chartORP"></canvas></div>
      </div>
    </div>

    <!-- Report Table -->
    <div class="kd-report-table-card">
      <div class="kd-sec-label">DETAILED PERFORMANCE REPORT</div>
      <table class="kd-rtable">
        <thead>
          <tr>
            <th>Period</th><th>Process Vol (m³)</th><th>Serum Vol (m³)</th>
            <th>Combined (m³)</th><th>Avg ORP (mV)</th><th>Energy (kWh)</th><th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reportRows" :key="row.period">
            <td class="kd-rt-period">{{ row.period }}</td>
            <td class="c-green">{{ row.process }}</td>
            <td class="c-cyan">{{ row.serum }}</td>
            <td class="c-amber">{{ row.combined }}</td>
            <td :style="{ color: orpColor(row.orp) }">{{ row.orp }}</td>
            <td class="c-text2">{{ row.energy }}</td>
            <td><span class="kd-score-badge" :class="scoreClass(row.score)">{{ row.score }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function rnd(a, b) { return +(a + Math.random() * (b - a)).toFixed(1); }

export default {
  name: 'StaKdReport',
  data() {
    return {
      period: 'daily',
      periods: [
        { id: 'daily',   label: 'DAILY' },
        { id: 'weekly',  label: 'WEEKLY' },
        { id: 'monthly', label: 'MONTHLY' },
      ],
      chartVol: null,
      chartORP: null,
    };
  },
  computed: {
    periodLabel() {
      return this.periods.find(p => p.id === this.period)?.label || '';
    },
    kpiSummary() {
      return [
        { label: 'AVG PROCESS FLOW', value: '128.4', unit: 'm³/hr', sub: periodDesc(this.period), color: '#00e87a' },
        { label: 'AVG SERUM FLOW',   value: '96.2',  unit: 'm³/hr', sub: periodDesc(this.period), color: '#00d4ff' },
        { label: 'TOTAL VOLUME',     value: '5,420', unit: 'm³',    sub: 'Combined period total',  color: '#ffb800' },
        { label: 'AVG ORP',          value: '28.5',  unit: 'mV',    sub: 'Average combined ORP',   color: '#a855f7' },
        { label: 'ENERGY USED',      value: '3,840', unit: 'kWh',   sub: 'Total for period',       color: '#ff7820' },
      ];
    },
    reportRows() {
      const labels = getLabels(this.period);
      return labels.map(l => ({
        period: l,
        process:  rnd(2000, 3500),
        serum:    rnd(1500, 2800),
        combined: rnd(4000, 6000),
        orp:      rnd(-30, 80),
        energy:   rnd(1500, 2000),
        score:    ['A', 'B+', 'A', 'B', 'A+'][Math.floor(Math.random() * 5)],
      }));
    },
  },
  mounted() { this.buildCharts(); },
  methods: {
    setPeriod(p) {
      this.period = p;
      this.rebuildCharts();
    },
    orpColor(v) {
      const n = parseFloat(v);
      if (isNaN(n)) return '#8aa2b8';
      if (n > 100) return '#ff4040';
      if (n > 50)  return '#ffb800';
      return '#00e87a';
    },
    scoreClass(s) {
      if (s === 'A+' || s === 'A') return 'score-a';
      if (s.startsWith('B'))       return 'score-b';
      return 'score-c';
    },
    exportCSV() { alert('CSV export — connects to backend in production'); },
    exportPDF() { alert('PDF export — connects to backend in production'); },
    buildCharts() {
      const labels = getLabels(this.period);
      const co = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { labels: { color: '#8aa2b8', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#3a4e62', font: { size: 9 } }, grid: { color: '#1e2a3a' } },
          y: { ticks: { color: '#8aa2b8', font: { size: 10 } }, grid: { color: '#1e2a3a' } },
        },
      };
      this.chartVol = new Chart(this.$refs.chartVol, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Process m³', data: labels.map(() => rnd(2000, 3500)), backgroundColor: 'rgba(0,232,122,.5)', borderColor: '#00e87a', borderWidth: 1 },
            { label: 'Serum m³',   data: labels.map(() => rnd(1500, 2800)), backgroundColor: 'rgba(0,212,255,.5)', borderColor: '#00d4ff', borderWidth: 1 },
          ],
        },
        options: co,
      });
      this.chartORP = new Chart(this.$refs.chartORP, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Avg ORP', data: labels.map(() => rnd(-30, 80)), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,.1)', borderWidth: 1.5, pointRadius: 3, tension: 0.3 },
          ],
        },
        options: co,
      });
    },
    rebuildCharts() {
      if (this.chartVol) { this.chartVol.destroy(); this.chartVol = null; }
      if (this.chartORP) { this.chartORP.destroy(); this.chartORP = null; }
      this.$nextTick(() => this.buildCharts());
    },
  },
};

function periodDesc(p) { return p === 'daily' ? 'Last 7 days' : p === 'weekly' ? 'Last 4 weeks' : 'Last 12 months'; }
function getLabels(p) {
  if (p === 'daily')   return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  if (p === 'weekly')  return ['Week 1','Week 2','Week 3','Week 4'];
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
}
</script>

<style scoped>
.kd-page { display: flex; flex-direction: column; gap: 9px; }
.kd-page-title-bar { display: flex; align-items: center; gap: 9px; }
.kd-page-accent { width: 4px; height: 22px; border-radius: 2px; }
.kd-page-title { font-family: var(--font-ui); font-weight: 700; font-size: 18px; letter-spacing: .1em; }
.kd-breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-left: auto; }
.kd-period-bar { display: flex; align-items: center; gap: 6px; }
.kd-period-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border2); background: var(--bg2); color: var(--text2); transition: all .15s; }
.kd-period-btn.active { background: rgba(168,85,247,.13); color: var(--purple); border-color: rgba(168,85,247,.32); }
.kd-period-btn:hover:not(.active) { border-color: var(--border3); }
.kd-kpi-row-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 9px; }
.kd-kpi-card { background: rgba(10,14,20,.92); border: 1px solid var(--border); border-radius: 10px; padding: 11px 13px; }
.kd-kpi-tag  { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text3); letter-spacing: .08em; margin-bottom: 4px; }
.kd-kpi-num  { font-family: var(--font-mono); font-weight: 700; font-size: 20px; display: flex; align-items: baseline; gap: 3px; }
.kd-kpi-unit { font-size: 10px; font-weight: 400; color: var(--text2); }
.kd-kpi-sub  { font-family: var(--font-mono); font-size: 9px; color: var(--text3); margin-top: 3px; }
.kd-dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-chart-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-chart-wrap { height: 180px; position: relative; }
.kd-sec-label { font-family: var(--font-mono); font-size: 10px; color: #7ab8d4; letter-spacing: .1em; margin-bottom: 7px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.kd-sec-label::before { content: ""; display: block; width: 6px; height: 6px; background: var(--purple); border-radius: 1px; }
.kd-report-table-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-rtable { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; }
.kd-rtable th { color: var(--text3); font-size: 9px; letter-spacing: .06em; padding: 6px 10px; text-align: left; border-bottom: 1px solid var(--border); }
.kd-rtable td { padding: 7px 10px; border-bottom: 1px solid rgba(255,255,255,.04); }
.kd-rtable tr:hover td { background: rgba(25,35,50,.4); }
.kd-rt-period { font-family: var(--font-ui); font-weight: 600; font-size: 13px; }
.kd-score-badge { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.score-a { background: rgba(0,232,122,.15); color: var(--green); border: 1px solid rgba(0,232,122,.3); }
.score-b { background: rgba(0,212,255,.12); color: var(--cyan);  border: 1px solid rgba(0,212,255,.28); }
.score-c { background: rgba(255,184,0,.12); color: var(--amber); border: 1px solid rgba(255,184,0,.28); }
.c-green { color: var(--green); } .c-cyan { color: var(--cyan); }
.c-amber { color: var(--amber); } .c-text2 { color: var(--text2); }
</style>
