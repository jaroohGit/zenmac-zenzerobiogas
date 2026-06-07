<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--amber)"></div>
      <h1 class="kd-page-title">BLOWER SYSTEM</h1>
      <span class="kd-breadcrumb">STA-KD / BLOWER</span>
    </div>

    <div class="kd-dual-row">
      <BlowerDetail :n="1" v-bind="tb1" @cmd="onCmd(1, $event)" />
      <BlowerDetail :n="2" v-bind="tb2" @cmd="onCmd(2, $event)" />
    </div>

    <!-- Charts row -->
    <div class="kd-triple-row">
      <div class="kd-chart-card">
        <div class="kd-sec-label">TB-01 POWER — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartPower1"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">TB-02 POWER — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartPower2"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">SUCTION FLOW RATE — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartFlow"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
import BlowerDetail from '../components/BlowerDetail.vue';
Chart.register(...registerables);

function genSine(base, amp, shift, pts = 24) {
  return Array.from({ length: pts }, (_, i) => +(base + amp * Math.sin((i + shift) * 0.4)).toFixed(1));
}
function labels24() { return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`); }

export default {
  name: 'StaKdBlower',
  components: { BlowerDetail },
  computed: {
    ...mapGetters('staKd', [
      'tb1Power','tb1Current','tb1Flow','tb1SuctPres','tb1DischPres',
      'tb1OutsideTemp','tb1MotorTemp','tb1DriveTemp','tb1DischTemp','tb1OnOff','tb1Status',
      'tb2Power','tb2Current','tb2Flow','tb2SuctPres','tb2DischPres',
      'tb2OutsideTemp','tb2MotorTemp','tb2DriveTemp','tb2DischTemp','tb2OnOff','tb2Status',
    ]),
    tb1() {
      return {
        status: this.tb1Status, power: this.tb1Power, current: this.tb1Current,
        flow: this.tb1Flow, suctPres: this.tb1SuctPres, dischPres: this.tb1DischPres,
        outsideTemp: this.tb1OutsideTemp, motorTemp: this.tb1MotorTemp,
        driveTemp: this.tb1DriveTemp, dischTemp: this.tb1DischTemp, onOff: this.tb1OnOff,
      };
    },
    tb2() {
      return {
        status: this.tb2Status, power: this.tb2Power, current: this.tb2Current,
        flow: this.tb2Flow, suctPres: this.tb2SuctPres, dischPres: this.tb2DischPres,
        outsideTemp: this.tb2OutsideTemp, motorTemp: this.tb2MotorTemp,
        driveTemp: this.tb2DriveTemp, dischTemp: this.tb2DischTemp, onOff: this.tb2OnOff,
      };
    },
  },
  mounted() { this.buildCharts(); },
  methods: {
    onCmd(n, { cmd, speed_pct }) {
      this.$store.dispatch('staKd/cmdBlower', { n, cmd, speed_pct });
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
      new Chart(this.$refs.chartPower1, {
        type: 'line',
        data: { labels: labels24(), datasets: [{ label: 'TB-01 kW', data: genSine(85, 20, 0), borderColor: '#ffb800', backgroundColor: 'rgba(255,184,0,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }] },
        options: co,
      });
      new Chart(this.$refs.chartPower2, {
        type: 'line',
        data: { labels: labels24(), datasets: [{ label: 'TB-02 kW', data: genSine(78, 22, 3), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }] },
        options: co,
      });
      new Chart(this.$refs.chartFlow, {
        type: 'line',
        data: {
          labels: labels24(),
          datasets: [
            { label: 'TB-01 m³/min', data: genSine(5.2, 0.8, 1), borderColor: '#ffb800', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
            { label: 'TB-02 m³/min', data: genSine(4.8, 0.9, 5), borderColor: '#00d4ff', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          ],
        },
        options: co,
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
.kd-dual-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-triple-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 9px; }
.kd-chart-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-chart-wrap { height: 150px; position: relative; }
.kd-sec-label  { font-family: var(--font-mono); font-size: 10px; color: #7ab8d4; letter-spacing: .1em; margin-bottom: 7px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.kd-sec-label::before { content: ""; display: block; width: 6px; height: 6px; background: var(--amber); border-radius: 1px; }
</style>
