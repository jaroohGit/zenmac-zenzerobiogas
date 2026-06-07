<template>
  <div class="pb-box">
    <div class="pb-tag">{{ tag }}</div>
    <div class="pb-val" :style="{ color: colorVar }">{{ display }}<span class="pb-unit">{{ unit }}</span></div>
    <div class="pb-bar-bg"><div class="pb-bar" :style="{ width: barPct + '%', background: colorVar }"></div></div>
  </div>
</template>

<script>
const COLOR_MAP = {
  cyan: '#00d4ff', green: '#00e87a', amber: '#ffb800', orange: '#ff7820',
  teal: '#00c8b0', purple: '#a855f7', red: '#ff4040', text2: '#8aa2b8',
};
export default {
  name: 'ParamBox',
  props: {
    tag:  { type: String, default: '' },
    val:  { default: '—' },
    unit: { type: String, default: '' },
    color:{ type: String, default: 'cyan' },
    min:  { type: Number, default: 0 },
    max:  { type: Number, default: 100 },
  },
  computed: {
    colorVar() { return COLOR_MAP[this.color] || '#00d4ff'; },
    display() { const n = parseFloat(this.val); return isNaN(n) ? '—' : n.toFixed(1); },
    barPct() {
      const n = parseFloat(this.val);
      if (isNaN(n)) return 0;
      return Math.min(100, Math.max(0, ((n - this.min) / (this.max - this.min)) * 100));
    },
  },
};
</script>

<style scoped>
.pb-box { background: rgba(18,25,36,.65); border: 1px solid rgba(255,255,255,.06); border-radius: 6px; padding: 7px 9px; }
.pb-tag { font-family: var(--font-mono); font-size: 7.5px; color: var(--text3); letter-spacing: .06em; }
.pb-val { font-family: var(--font-mono); font-size: 16px; font-weight: 700; line-height: 1.1; display: flex; align-items: baseline; gap: 2px; margin-top: 1px; }
.pb-unit { font-size: 9px; font-weight: 400; color: var(--text2); }
.pb-bar-bg { height: 4px; background: rgba(40,55,75,.8); border-radius: 3px; overflow: hidden; margin-top: 4px; }
.pb-bar { height: 100%; border-radius: 3px; transition: width .8s ease; }
</style>
