<template>
  <div class="bd-card">
    <div class="bd-title">
      <div class="bd-acc" :style="accStyle"></div>
      <span>TB-0{{ n }} — TURBO BLOWER</span>
      <span class="bd-badge" :class="statusClass">{{ statusLabel }}</span>
      <div class="bd-ctrl">
        <input v-model.number="setpoint" class="bd-sp-input" type="number" min="0" max="100" />
        <span class="bd-sp-unit">%</span>
        <button class="bd-btn btn-start" @click="$emit('cmd', { cmd: 'start', speed_pct: setpoint })">START</button>
        <button class="bd-btn btn-stby"  @click="$emit('cmd', { cmd: 'standby', speed_pct: 0 })">STBY</button>
        <button class="bd-btn btn-stop"  @click="$emit('cmd', { cmd: 'stop', speed_pct: 0 })">STOP</button>
      </div>
    </div>

    <div class="bd-params">
      <ParamBox tag="POWER"        :val="power"      unit="kW"      color="amber" :max="300" />
      <ParamBox tag="CURRENT"      :val="current"    unit="A"       color="cyan"  :max="100" />
      <ParamBox tag="SUCT FLOW"    :val="flow"       unit="m³/min"  color="green" :max="10"  />
      <ParamBox tag="SUCT PRES"    :val="suctPres"   unit="mmAq"    color="teal"  :max="600" />
      <ParamBox tag="DISCH PRES"   :val="dischPres"  unit="mmAq"    color="teal"  :max="600" />
      <ParamBox tag="OUTSIDE TEMP" :val="outsideTemp" unit="°C"     color="text2" :max="50"  />
      <ParamBox tag="MOTOR TEMP"   :val="motorTemp"  unit="°C"      color="orange" :max="80" />
      <ParamBox tag="DRIVE TEMP"   :val="driveTemp"  unit="°C"      color="orange" :max="80" />
      <ParamBox tag="DISCH TEMP"   :val="dischTemp"  unit="°C"      color="orange" :max="80" />
      <ParamBox tag="ON/OFF CNT"   :val="onOff"      unit="×"       color="purple" :max="100" />
    </div>
  </div>
</template>

<script>
import ParamBox from './ParamBox.vue';

export default {
  name: 'BlowerDetail',
  components: { ParamBox },
  emits: ['cmd'],
  props: {
    n:          { type: Number, required: true },
    status:     { default: '—' },
    power:      { default: '—' }, current:    { default: '—' },
    flow:       { default: '—' }, suctPres:   { default: '—' },
    dischPres:  { default: '—' }, outsideTemp:{ default: '—' },
    motorTemp:  { default: '—' }, driveTemp:  { default: '—' },
    dischTemp:  { default: '—' }, onOff:      { default: '—' },
  },
  data() { return { setpoint: 80 }; },
  computed: {
    statusLabel() {
      const s = String(this.status).toLowerCase();
      if (s === 'on' || s === '1' || s === 'run') return 'RUNNING';
      if (s === 'standby' || s === 'stby') return 'STANDBY';
      if (s === 'off' || s === '0') return 'OFF';
      return this.status === '—' ? 'NO DATA' : String(this.status).toUpperCase();
    },
    statusClass() {
      const s = this.statusLabel;
      if (s === 'RUNNING') return 'st-on';
      if (s === 'STANDBY') return 'st-stby';
      return 'st-off';
    },
    accStyle() {
      const s = this.statusLabel;
      if (s === 'RUNNING') return 'background:var(--green)';
      if (s === 'STANDBY') return 'background:var(--amber)';
      return 'background:var(--text3)';
    },
  },
};
</script>

<style scoped>
.bd-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
.bd-title { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-family: var(--font-ui); font-weight: 700; font-size: 14px; }
.bd-acc { width: 3px; height: 20px; border-radius: 2px; }
.bd-badge { font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
.st-on   { background:rgba(0,232,122,.15); color:var(--green); border:1px solid rgba(0,232,122,.3); }
.st-stby { background:rgba(255,184,0,.15); color:var(--amber); border:1px solid rgba(255,184,0,.3); }
.st-off  { background:rgba(55,75,95,.2);  color:var(--text3); border:1px solid rgba(255,255,255,.07); }
.bd-ctrl { margin-left: auto; display: flex; align-items: center; gap: 5px; }
.bd-sp-input { width: 56px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; background: rgba(18,28,44,.85); border: 1px solid var(--border2); color: var(--green); padding: 3px 7px; border-radius: 5px; outline: none; text-align: center; }
.bd-sp-unit { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
.bd-btn { font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 5px; cursor: pointer; transition: all .15s; border: 1px solid; }
.btn-start { background:rgba(0,232,122,.12); color:var(--green); border-color:rgba(0,232,122,.3); }
.btn-start:hover { background:rgba(0,232,122,.22); }
.btn-stby  { background:rgba(255,184,0,.10); color:var(--amber); border-color:rgba(255,184,0,.28); }
.btn-stby:hover { background:rgba(255,184,0,.18); }
.btn-stop  { background:rgba(255,64,64,.10);  color:var(--red);  border-color:rgba(255,64,64,.28); }
.btn-stop:hover { background:rgba(255,64,64,.18); }
.bd-params { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; }
</style>
