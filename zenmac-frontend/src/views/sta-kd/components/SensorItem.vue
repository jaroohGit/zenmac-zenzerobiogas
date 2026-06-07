<template>
  <div class="si-item">
    <div class="si-tag">{{ tag }}</div>
    <div class="si-name">{{ name }}</div>
    <div class="si-val" :style="{ color: colorVar }">
      {{ display }}<span class="si-unit">{{ unit }}</span>
    </div>
    <div class="si-status" :class="statusClass">
      <span class="si-dot" :class="statusClass"></span>{{ statusLabel }}
    </div>
  </div>
</template>

<script>
const COLOR_MAP = { cyan: '#00d4ff', green: '#00e87a', amber: '#ffb800', orange: '#ff7820', teal: '#00c8b0', purple: '#a855f7', red: '#ff4040' };

export default {
  name: 'SensorItem',
  props: {
    tag:   { type: String, default: '' },
    name:  { type: String, default: '' },
    val:   { default: '—' },
    unit:  { type: String, default: '' },
    min:   { type: Number, default: 0 },
    max:   { type: Number, default: 100 },
    color: { type: String, default: 'cyan' },
    warnLo:{ type: Number, default: null },
    warnHi:{ type: Number, default: null },
  },
  computed: {
    colorVar() { return COLOR_MAP[this.color] || '#00d4ff'; },
    display() {
      const n = parseFloat(this.val);
      return isNaN(n) ? '—' : n.toFixed(1);
    },
    statusLabel() {
      const n = parseFloat(this.val);
      if (isNaN(n)) return 'NO DATA';
      if (this.warnLo !== null && n < this.warnLo) return 'LOW';
      if (this.warnHi !== null && n > this.warnHi) return 'HIGH';
      return 'NORMAL';
    },
    statusClass() {
      const lbl = this.statusLabel;
      if (lbl === 'NORMAL') return 'ss-ok';
      if (lbl === 'NO DATA') return 'ss-off';
      return 'ss-warn';
    },
  },
};
</script>

<style scoped>
.si-item {
  background: rgba(18,25,36,.6); border: 1px solid rgba(255,255,255,.06);
  border-radius: 7px; padding: 9px 10px;
}
.si-tag  { font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: .07em; margin-bottom: 1px; }
.si-name { font-family: var(--font-ui); font-size: 12px; color: var(--text2); font-weight: 600; }
.si-val  { font-family: var(--font-mono); font-size: 22px; font-weight: 700; line-height: 1.1; display: flex; align-items: baseline; gap: 3px; margin-top: 2px; }
.si-unit { font-size: 10px; font-weight: 400; color: var(--text2); }
.si-status {
  font-family: var(--font-mono); font-size: 8px; margin-top: 4px;
  padding: 2px 6px; border-radius: 3px; display: inline-flex; align-items: center; gap: 3px;
}
.ss-ok   { background: rgba(0,232,122,.1);  color: var(--green);  border: 1px solid rgba(0,232,122,.25); }
.ss-warn { background: rgba(255,184,0,.1);  color: var(--amber);  border: 1px solid rgba(255,184,0,.25); }
.ss-hi   { background: rgba(255,64,64,.1);  color: var(--red);    border: 1px solid rgba(255,64,64,.25); }
.ss-off  { background: rgba(55,75,95,.2);   color: var(--text3);  border: 1px solid rgba(255,255,255,.06); }
.si-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ss-ok .si-dot   { background: var(--green); }
.ss-warn .si-dot { background: var(--amber); }
.ss-hi .si-dot   { background: var(--red); }
.ss-off .si-dot  { background: var(--text3); }
</style>
