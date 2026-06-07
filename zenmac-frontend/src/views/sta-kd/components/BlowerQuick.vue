<template>
  <div class="bq-card" :class="statusClass">
    <div class="bq-title">
      <div class="bq-acc" :style="accColor"></div>
      <span>TB-0{{ n }} — BLOWER</span>
      <span class="bq-status-badge" :class="statusClass">{{ statusLabel }}</span>
      <div class="bq-ctrl">
        <button class="bq-btn btn-start" @click="$emit('cmd', { n, cmd: 'start' })">START</button>
        <button class="bq-btn btn-stby"  @click="$emit('cmd', { n, cmd: 'standby' })">STBY</button>
        <button class="bq-btn btn-stop"  @click="$emit('cmd', { n, cmd: 'stop' })">STOP</button>
      </div>
    </div>
    <div class="bq-params">
      <div class="bq-param">
        <div class="bq-p-tag">POWER</div>
        <div class="bq-p-val c-amber">{{ fmtNum(power) }}<span class="bq-p-unit">kW</span></div>
        <div class="bq-bar-bg"><div class="bq-bar" style="background:var(--amber)" :style="{ width: pct(power, 300) + '%' }"></div></div>
      </div>
      <div class="bq-param">
        <div class="bq-p-tag">CURRENT</div>
        <div class="bq-p-val c-cyan">{{ fmtNum(current) }}<span class="bq-p-unit">A</span></div>
        <div class="bq-bar-bg"><div class="bq-bar" style="background:var(--cyan)" :style="{ width: pct(current, 100) + '%' }"></div></div>
      </div>
      <div class="bq-param">
        <div class="bq-p-tag">SUCTION FLOW</div>
        <div class="bq-p-val c-green">{{ fmtNum(flow) }}<span class="bq-p-unit">m³/min</span></div>
        <div class="bq-bar-bg"><div class="bq-bar" style="background:var(--green)" :style="{ width: pct(flow, 10) + '%' }"></div></div>
      </div>
      <div class="bq-param">
        <div class="bq-p-tag">MOTOR TEMP</div>
        <div class="bq-p-val c-orange">{{ fmtNum(motorTemp) }}<span class="bq-p-unit">°C</span></div>
        <div class="bq-bar-bg"><div class="bq-bar" style="background:var(--orange)" :style="{ width: pct(motorTemp, 80) + '%' }"></div></div>
      </div>
      <div class="bq-param">
        <div class="bq-p-tag">OUTSIDE TEMP</div>
        <div class="bq-p-val" style="color:var(--text2)">{{ fmtNum(outsideTemp) }}<span class="bq-p-unit">°C</span></div>
        <div class="bq-bar-bg"><div class="bq-bar" style="background:var(--text3)" :style="{ width: pct(outsideTemp, 50) + '%' }"></div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlowerQuick',
  emits: ['cmd'],
  props: {
    n:          { type: Number, required: true },
    status:     { default: '—' },
    power:      { default: '—' },
    current:    { default: '—' },
    flow:       { default: '—' },
    motorTemp:  { default: '—' },
    outsideTemp:{ default: '—' },
  },
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
    accColor() {
      const s = this.statusLabel;
      if (s === 'RUNNING') return 'background: var(--green)';
      if (s === 'STANDBY') return 'background: var(--amber)';
      return 'background: var(--text3)';
    },
  },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(1); },
    pct(v, max) { const n = parseFloat(v); return isNaN(n) ? 0 : Math.min(100, Math.max(0, (n / max) * 100)); },
  },
};
</script>

<style scoped>
.bq-card { background: rgba(8,12,18,0.92); border: 1px solid var(--border); border-radius: 10px; padding: 13px; }
.bq-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-family: var(--font-ui); font-weight: 700; font-size: 14px; }
.bq-acc { width: 3px; height: 18px; border-radius: 2px; }
.bq-status-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px;
}
.st-on   { background: rgba(0,232,122,.15); color: var(--green); border: 1px solid rgba(0,232,122,.3); }
.st-stby { background: rgba(255,184,0,.15); color: var(--amber); border: 1px solid rgba(255,184,0,.3); }
.st-off  { background: rgba(55,75,95,.2);   color: var(--text3); border: 1px solid rgba(255,255,255,.07); }

.bq-ctrl { margin-left: auto; display: flex; gap: 5px; }
.bq-btn { font-family: var(--font-mono); font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 5px; cursor: pointer; transition: all .15s; border: 1px solid; }
.btn-start { background: rgba(0,232,122,.12); color: var(--green); border-color: rgba(0,232,122,.3); }
.btn-start:hover { background: rgba(0,232,122,.22); }
.btn-stby  { background: rgba(255,184,0,.10); color: var(--amber); border-color: rgba(255,184,0,.28); }
.btn-stby:hover { background: rgba(255,184,0,.18); }
.btn-stop  { background: rgba(255,64,64,.10);  color: var(--red);   border-color: rgba(255,64,64,.28); }
.btn-stop:hover { background: rgba(255,64,64,.18); }

.bq-params { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; }
.bq-param { background: rgba(18,25,36,.65); border: 1px solid rgba(255,255,255,.06); border-radius: 6px; padding: 7px 9px; }
.bq-p-tag { font-family: var(--font-mono); font-size: 7px; color: var(--text3); letter-spacing: .06em; }
.bq-p-val { font-family: var(--font-mono); font-size: 16px; font-weight: 700; line-height: 1.1; display: flex; align-items: baseline; gap: 2px; margin-top: 1px; }
.bq-p-unit { font-size: 9px; font-weight: 400; color: var(--text2); }
.bq-bar-bg { height: 4px; background: rgba(40,55,75,.8); border-radius: 3px; overflow: hidden; margin-top: 4px; }
.bq-bar { height: 100%; border-radius: 3px; transition: width .8s ease; }
.c-cyan { color: var(--cyan); } .c-green { color: var(--green); } .c-amber { color: var(--amber); } .c-orange { color: var(--orange); }
</style>
