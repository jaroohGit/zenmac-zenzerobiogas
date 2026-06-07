<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--teal)"></div>
      <h1 class="kd-page-title">SENSOR READINGS</h1>
      <span class="kd-breadcrumb">STA-KD / SENSOR</span>
    </div>

    <div class="kd-dual-row">
      <!-- Process Sensors -->
      <div class="kd-sensor-panel">
        <div class="kd-sensor-title">
          <div class="kd-sensor-acc" style="background:var(--cyan)"></div>
          Process Tank — Sensors
        </div>
        <div class="kd-sensor-grid-2">
          <SensorItem tag="AT-ORP-01" name="Process ORP"  :val="processORP"  unit="mV"    :min="-200" :max="200" color="cyan"   :warnLo="-100" :warnHi="150" />
          <SensorItem tag="AT-pH-01"  name="Process pH"   :val="processpH"   unit="pH"    :min="4"    :max="10"  color="teal"   :warnLo="5"    :warnHi="9" />
          <SensorItem tag="AT-T-01"   name="Process Temp" :val="processTemp"  unit="°C"    :min="0"    :max="80"  color="orange" :warnHi="65" />
          <SensorItem tag="AT-FM-01"  name="Process Flow" :val="processFlow"  unit="m³/hr" :min="0"    :max="500" color="green" />
        </div>
        <div class="kd-chart-card" style="margin-top:9px">
          <div class="kd-sec-label" style="--accent:var(--cyan)">PROCESS ORP TREND</div>
          <div class="kd-chart-wrap"><canvas ref="chartProcORP"></canvas></div>
        </div>
      </div>

      <!-- Serum Sensors -->
      <div class="kd-sensor-panel">
        <div class="kd-sensor-title">
          <div class="kd-sensor-acc" style="background:var(--green)"></div>
          Serum Tank — Sensors
        </div>
        <div class="kd-sensor-grid-2">
          <SensorItem tag="AT-ORP-02" name="Serum ORP"  :val="serumORP"  unit="mV"    :min="-200" :max="200" color="cyan"   :warnLo="-100" :warnHi="150" />
          <SensorItem tag="AT-pH-02"  name="Serum pH"   :val="serumpH"   unit="pH"    :min="4"    :max="10"  color="teal"   :warnLo="5"    :warnHi="9" />
          <SensorItem tag="AT-T-02"   name="Serum Temp" :val="serumTemp"  unit="°C"    :min="0"    :max="80"  color="orange" :warnHi="65" />
          <SensorItem tag="AT-FM-02"  name="Serum Flow" :val="serumFlow"  unit="m³/hr" :min="0"    :max="500" color="green" />
        </div>
        <div class="kd-chart-card" style="margin-top:9px">
          <div class="kd-sec-label" style="--accent:var(--green)">SERUM ORP TREND</div>
          <div class="kd-chart-wrap"><canvas ref="chartSerumORP"></canvas></div>
        </div>
      </div>
    </div>

    <!-- pH & Temp side by side -->
    <div class="kd-dual-row">
      <div class="kd-chart-card">
        <div class="kd-sec-label">pH COMPARISON — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartPH"></canvas></div>
      </div>
      <div class="kd-chart-card">
        <div class="kd-sec-label">TEMPERATURE — 24h</div>
        <div class="kd-chart-wrap"><canvas ref="chartTemp"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
import SensorItem from '../components/SensorItem.vue';
Chart.register(...registerables);

function genSine(base, amp, shift, pts = 24) {
  return Array.from({ length: pts }, (_, i) => +(base + amp * Math.sin((i + shift) * 0.4) + (Math.random() - 0.5) * 2).toFixed(2));
}
function labels24() { return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`); }

const CO = {
  responsive: true, maintainAspectRatio: false, animation: false,
  plugins: { legend: { labels: { color: '#8aa2b8', font: { family: 'JetBrains Mono', size: 10 } } } },
  scales: {
    x: { ticks: { color: '#3a4e62', font: { size: 9 } }, grid: { color: '#1e2a3a' } },
    y: { ticks: { color: '#8aa2b8', font: { size: 10 } }, grid: { color: '#1e2a3a' } },
  },
};

export default {
  name: 'StaKdSensor',
  components: { SensorItem },
  computed: {
    ...mapGetters('staKd', ['processORP','serumORP','processpH','serumpH','processTemp','serumTemp','processFlow','serumFlow']),
  },
  mounted() { this.buildCharts(); },
  methods: {
    buildCharts() {
      const L = labels24();
      new Chart(this.$refs.chartProcORP, {
        type: 'line',
        data: { labels: L, datasets: [{ label: 'Process ORP (mV)', data: genSine(-20, 35, 0), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }] },
        options: CO,
      });
      new Chart(this.$refs.chartSerumORP, {
        type: 'line',
        data: { labels: L, datasets: [{ label: 'Serum ORP (mV)', data: genSine(15, 28, 3), borderColor: '#00e87a', backgroundColor: 'rgba(0,232,122,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }] },
        options: CO,
      });
      new Chart(this.$refs.chartPH, {
        type: 'line',
        data: {
          labels: L,
          datasets: [
            { label: 'Process pH', data: genSine(7.2, 0.5, 0), borderColor: '#00c8b0', backgroundColor: 'rgba(0,200,176,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
            { label: 'Serum pH',   data: genSine(7.0, 0.6, 4), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,.08)', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          ],
        },
        options: CO,
      });
      new Chart(this.$refs.chartTemp, {
        type: 'line',
        data: {
          labels: L,
          datasets: [
            { label: 'Process °C', data: genSine(35, 8, 1), borderColor: '#ff7820', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
            { label: 'Serum °C',   data: genSine(32, 6, 5), borderColor: '#ffb800', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
          ],
        },
        options: CO,
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
.kd-dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-sensor-panel { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; }
.kd-sensor-title { font-family: var(--font-ui); font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.kd-sensor-acc { width: 3px; height: 16px; border-radius: 2px; }
.kd-sensor-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.kd-chart-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.kd-chart-wrap { height: 130px; position: relative; }
.kd-sec-label { font-family: var(--font-mono); font-size: 10px; color: #7ab8d4; letter-spacing: .1em; margin-bottom: 7px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.kd-sec-label::before { content: ""; display: block; width: 6px; height: 6px; background: var(--teal); border-radius: 1px; }
</style>
