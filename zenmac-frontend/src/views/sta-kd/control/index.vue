<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--orange)"></div>
      <h1 class="kd-page-title">PROCESS CONTROL</h1>
      <span class="kd-breadcrumb">STA-KD / CONTROL</span>
    </div>

    <!-- Control Tabs -->
    <div class="kd-tab-bar">
      <button v-for="t in tabs" :key="t.id" class="kd-tab-btn"
              :class="{ active: activeTab === t.id }" @click="activeTab = t.id">{{ t.label }}</button>
    </div>

    <!-- ORP Band Control -->
    <div v-if="activeTab === 'orp'" class="kd-ctrl-grid">
      <div class="kd-ctrl-card">
        <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--cyan)"></div>Process ORP Bands</div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Target ORP</div><div class="kd-set-sub">Target setpoint for Process</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpTarget" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Upper Band</div><div class="kd-set-sub">Upper ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpHi" class="kd-num-input amber" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Lower Band</div><div class="kd-set-sub">Lower ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpLo" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-info-box kd-info-cyan">Current: {{ processORP }} mV &nbsp;|&nbsp; Target: {{ proc.orpTarget }} mV</div>
        <button class="kd-save-btn kd-save-cyan" @click="saveProc">SAVE PROCESS SETTINGS</button>
      </div>

      <div class="kd-ctrl-card">
        <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--green)"></div>Serum ORP Bands</div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Target ORP</div><div class="kd-set-sub">Target setpoint for Serum</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpTarget" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Upper Band</div><div class="kd-set-sub">Upper ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpHi" class="kd-num-input amber" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Lower Band</div><div class="kd-set-sub">Lower ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpLo" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-info-box kd-info-green">Current: {{ serumORP }} mV &nbsp;|&nbsp; Target: {{ serum.orpTarget }} mV</div>
        <button class="kd-save-btn kd-save-green" @click="saveSerum">SAVE SERUM SETTINGS</button>
      </div>
    </div>

    <!-- Loop Control -->
    <div v-if="activeTab === 'loop'" class="kd-ctrl-card">
      <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--cyan)"></div>Loop Control Settings</div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Loop Interval</div><div class="kd-set-sub">Frequency of control loop evaluation</div></div>
        <div class="kd-set-right"><input v-model.number="loop.interval" class="kd-num-input" type="number" /><span class="kd-num-unit">min</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Deadband</div><div class="kd-set-sub">No action within ±deadband of target</div></div>
        <div class="kd-set-right"><input v-model.number="loop.deadband" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Min Blower Speed</div><div class="kd-set-sub">Minimum blower setpoint</div></div>
        <div class="kd-set-right"><input v-model.number="loop.minSpeed" class="kd-num-input green" type="number" /><span class="kd-num-unit">%</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Max Blower Speed</div><div class="kd-set-sub">Maximum blower setpoint</div></div>
        <div class="kd-set-right"><input v-model.number="loop.maxSpeed" class="kd-num-input amber" type="number" /><span class="kd-num-unit">%</span></div>
      </div>
      <button class="kd-save-btn kd-save-cyan" @click="saveLoop">SAVE LOOP SETTINGS</button>
    </div>

    <!-- Turning Points -->
    <div v-if="activeTab === 'turning'" class="kd-turning-card">
      <div class="kd-ctrl-title" style="margin-bottom:14px"><div class="kd-ctrl-dot" style="background:var(--purple)"></div>Turning Point Timeline</div>
      <div class="kd-tp-timeline">
        <div v-for="(tp, i) in turningPoints" :key="i" class="kd-tp-item">
          <div class="kd-tp-num">TP{{ i + 1 }}</div>
          <div class="kd-tp-fields">
            <div class="kd-tp-field">
              <label class="kd-tp-lbl">TIME</label>
              <input v-model="tp.time" class="kd-tp-input" type="time" />
            </div>
            <div class="kd-tp-field">
              <label class="kd-tp-lbl">ORP TARGET</label>
              <input v-model.number="tp.orp" class="kd-tp-input" type="number" style="width:70px" />
            </div>
            <div class="kd-tp-field">
              <label class="kd-tp-lbl">SPEED %</label>
              <input v-model.number="tp.speed" class="kd-tp-input" type="number" style="width:60px" />
            </div>
          </div>
          <div class="kd-tp-marker"></div>
        </div>
      </div>
      <button class="kd-save-btn kd-save-cyan" style="margin-top:14px" @click="saveTurning">SAVE TURNING POINTS</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'StaKdControl',
  data() {
    return {
      activeTab: 'orp',
      tabs: [
        { id: 'orp',     label: 'ORP BANDS' },
        { id: 'loop',    label: 'LOOP CONTROL' },
        { id: 'turning', label: 'TURNING POINTS' },
      ],
      proc:  { orpTarget: 50, orpHi: 120, orpLo: -50 },
      serum: { orpTarget: 30, orpHi: 100, orpLo: -60 },
      loop:  { interval: 5, deadband: 10, minSpeed: 30, maxSpeed: 100 },
      turningPoints: [
        { time: '06:00', orp: 30, speed: 60 },
        { time: '09:00', orp: 50, speed: 75 },
        { time: '12:00', orp: 60, speed: 85 },
        { time: '18:00', orp: 40, speed: 70 },
        { time: '22:00', orp: 20, speed: 50 },
      ],
    };
  },
  computed: {
    ...mapGetters('staKd', ['processORP', 'serumORP']),
  },
  methods: {
    saveProc()    { alert('Process ORP settings saved (integration pending)'); },
    saveSerum()   { alert('Serum ORP settings saved (integration pending)'); },
    saveLoop()    { alert('Loop control settings saved (integration pending)'); },
    saveTurning() { alert('Turning points saved (integration pending)'); },
  },
};
</script>

<style scoped>
.kd-page { display: flex; flex-direction: column; gap: 9px; }
.kd-page-title-bar { display: flex; align-items: center; gap: 9px; }
.kd-page-accent { width: 4px; height: 22px; border-radius: 2px; }
.kd-page-title { font-family: var(--font-ui); font-weight: 700; font-size: 18px; letter-spacing: .1em; }
.kd-breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-left: auto; }

.kd-tab-bar { display: flex; gap: 6px; }
.kd-tab-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 6px 16px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border2); background: var(--bg2); color: var(--text2); transition: all .15s; }
.kd-tab-btn.active { background: rgba(0,212,255,.13); color: var(--cyan); border-color: rgba(0,212,255,.32); }
.kd-tab-btn:hover:not(.active) { border-color: var(--border3); }

.kd-ctrl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-ctrl-card { background: rgba(10,14,20,.92); border: 1px solid var(--border2); border-radius: 11px; padding: 14px 16px; }
.kd-ctrl-title { font-family: var(--font-ui); font-weight: 700; font-size: 15px; letter-spacing: .06em; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
.kd-ctrl-dot { width: 4px; height: 20px; border-radius: 2px; }

.kd-set-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
.kd-set-row:last-of-type { border-bottom: none; }
.kd-set-label { font-family: var(--font-ui); font-size: 13px; color: var(--text2); font-weight: 500; }
.kd-set-sub { font-family: var(--font-mono); font-size: 8.5px; color: var(--text3); margin-top: 2px; }
.kd-set-right { display: flex; align-items: center; gap: 8px; }
.kd-num-input { width: 74px; font-family: var(--font-mono); font-size: 14px; font-weight: 700; background: rgba(18,28,44,.85); border: 1px solid var(--border2); color: var(--cyan); padding: 5px 8px; border-radius: 6px; outline: none; text-align: center; }
.kd-num-input:focus { border-color: rgba(0,212,255,.5); }
.kd-num-input.amber { color: var(--amber); }
.kd-num-input.green { color: var(--green); }
.kd-num-unit { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
.kd-info-box { font-family: var(--font-mono); font-size: 10px; line-height: 1.55; padding: 9px 12px; border-radius: 7px; margin-top: 8px; }
.kd-info-cyan  { background: rgba(0,212,255,.06); border: 1px solid rgba(0,212,255,.18); color: #70b8d0; }
.kd-info-green { background: rgba(0,232,122,.06); border: 1px solid rgba(0,232,122,.18); color: #60b880; }
.kd-save-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; border: 1px solid; margin-top: 12px; }
.kd-save-cyan  { background: rgba(0,212,255,.1); color: var(--cyan); border-color: rgba(0,212,255,.3); }
.kd-save-cyan:hover  { background: rgba(0,212,255,.18); }
.kd-save-green { background: rgba(0,232,122,.1); color: var(--green); border-color: rgba(0,232,122,.3); }
.kd-save-green:hover { background: rgba(0,232,122,.18); }

/* Turning Points */
.kd-turning-card { background: rgba(10,14,20,.92); border: 1px solid var(--border2); border-radius: 11px; padding: 14px 16px; }
.kd-tp-timeline { display: flex; flex-direction: column; gap: 8px; }
.kd-tp-item { display: flex; align-items: center; gap: 14px; background: rgba(18,25,36,.55); border-radius: 7px; padding: 8px 12px; border-left: 3px solid rgba(168,85,247,.5); }
.kd-tp-num { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--purple); width: 32px; }
.kd-tp-fields { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.kd-tp-field { display: flex; flex-direction: column; gap: 2px; }
.kd-tp-lbl { font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: .06em; }
.kd-tp-input { font-family: var(--font-mono); font-size: 12px; font-weight: 700; background: rgba(18,28,44,.9); border: 1px solid var(--border2); color: var(--cyan); padding: 4px 8px; border-radius: 5px; outline: none; width: 90px; }
.kd-tp-input:focus { border-color: rgba(0,212,255,.5); }
.kd-tp-marker { flex: 1; height: 1px; background: rgba(168,85,247,.2); }
</style>
