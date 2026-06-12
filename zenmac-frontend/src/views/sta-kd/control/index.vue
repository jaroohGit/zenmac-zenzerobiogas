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
              :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
        <i class="bx" :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <!-- ══ TAB 1: ORP BANDS ══ -->
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

    <!-- ══ TAB 2: LOOP CONTROL ══ -->
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

    <!-- ══ TAB 3: TURNING POINTS ══ -->
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

    <!-- ══ TAB 4: AIRFLOW-ORP MODE ══ -->
    <div v-if="activeTab === 'airflow'" class="arp-wrap">

      <!-- Description -->
      <div class="arp-desc">
        <i class="bx bx-info-circle"></i>
        Airflow-ORP Mode: ระบบตรวจค่า ORP แบบ real-time แล้วเปรียบเทียบกับ 5 Band ที่ตั้งไว้ (HH / H / ZERO / L / LL) → Blower จะปรับ Air Flow อัตโนมัติตาม Band ที่ ORP ตกอยู่ในขณะนั้น → HH (เกิน +150) = หรี่ Blower สุด (Aeration ลด) | LL (ต่ำกว่า -150) = เปิด Blower เต็มที่
      </div>

      <!-- Two panels -->
      <div class="arp-grid">

        <!-- ─ BL-1 SERUM panel ─ -->
        <div class="arp-panel">
          <div class="arp-panel-hdr">
            <div class="arp-panel-accent" style="background:#ff7820"></div>
            <div class="arp-panel-titles">
              <div class="arp-panel-name">AIRFLOW-ORP MODE — SERUM (AT-1)</div>
              <div class="arp-panel-sub">5-Band ORP → Air Flow</div>
            </div>
          </div>

          <!-- Current ORP indicator -->
          <div class="arp-cur-row">
            <span class="arp-cur-lbl">Current Serum ORP:</span>
            <span class="arp-cur-val" :style="`color:${activeBandColor(activeSerumBand, 'serum')}`">{{ serumORP }} mV</span>
            <span class="arp-cur-zone" :style="`color:${activeBandColor(activeSerumBand,'serum')};border-color:${activeBandColor(activeSerumBand,'serum')}55;background:${activeBandColor(activeSerumBand,'serum')}18`">
              {{ arpBandsSerum[activeSerumBand]?.zone || '—' }}
            </span>
          </div>

          <table class="arp-table">
            <thead>
              <tr>
                <th>ZONE</th>
                <th>ORP LOW (mV)</th>
                <th>ORP HIGH (mV)</th>
                <th class="th-cmm">TURBO FLOW SET (CMM)</th>
                <th class="th-rt">REAL-TIME (CMM)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in arpBandsSerum" :key="i" :class="i===activeSerumBand ? 'arp-row-active' : ''">
                <td>
                  <span class="zone-bdg" :style="`background:${b.color}22;color:${b.color};border:1px solid ${b.color}55`">{{ b.zone }}</span>
                </td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_lo" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_hi" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp arp-inp-cmm" v-model.number="b.flow_cmm" min="0" max="200" step="0.1" /></td>
                <td>
                  <span v-if="i===activeSerumBand" class="arp-rt-val">
                    <span class="arp-rt-dot"></span>{{ rtCmm1 !== null ? rtCmm1 : '—' }}
                  </span>
                  <span v-else class="arp-rt-idle">—</span>
                </td>
                <td>
                  <span class="arp-status" :class="i===activeSerumBand ? 'arp-active' : 'arp-idle'">
                    {{ i===activeSerumBand ? '● ACTIVE' : 'IDLE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Band bar -->
          <div class="arp-band-bar">
            <div v-for="(b, i) in arpBandsSerum.slice().reverse()" :key="i"
                 class="arp-band-seg" :style="`background:${b.color}33;border-color:${b.color}66`"
                 :class="arpBandsSerum.length-1-i === activeSerumBand ? 'arp-seg-active' : ''">
              <span class="arp-band-zone" :style="`color:${b.color}`">{{ b.zone }}</span>
              <span class="arp-band-range">{{ bandRangeLabel(b, i, arpBandsSerum.length) }}</span>
            </div>
          </div>

          <div class="arp-footer">
            <label class="arp-toggle-wrap">
              <div class="arp-toggle" :class="arpActive1 ? 'arp-toggle-on' : ''" @click="arpActive1=!arpActive1">
                <div class="arp-toggle-knob"></div>
              </div>
              <span class="arp-toggle-lbl" :style="arpActive1 ? 'color:#00e87a' : ''">
                AIRFLOW-ORP MODE {{ arpActive1 ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </label>
            <button class="arp-save-btn" @click="saveArp(1)">
              <i class="bx bx-save"></i> SAVE BL-1 (Serum)
            </button>
          </div>
        </div>

        <!-- ─ BL-2 LATEX panel ─ -->
        <div class="arp-panel">
          <div class="arp-panel-hdr">
            <div class="arp-panel-accent" style="background:#00e87a"></div>
            <div class="arp-panel-titles">
              <div class="arp-panel-name">AIRFLOW-ORP MODE — LATEX (AT-2)</div>
              <div class="arp-panel-sub">5-Band ORP → Air Flow</div>
            </div>
          </div>

          <div class="arp-cur-row">
            <span class="arp-cur-lbl">Current Latex ORP:</span>
            <span class="arp-cur-val" :style="`color:${activeBandColor(activeLatexBand,'latex')}`">{{ processORP }} mV</span>
            <span class="arp-cur-zone" :style="`color:${activeBandColor(activeLatexBand,'latex')};border-color:${activeBandColor(activeLatexBand,'latex')}55;background:${activeBandColor(activeLatexBand,'latex')}18`">
              {{ arpBandsLatex[activeLatexBand]?.zone || '—' }}
            </span>
          </div>

          <table class="arp-table">
            <thead>
              <tr>
                <th>ZONE</th>
                <th>ORP LOW (mV)</th>
                <th>ORP HIGH (mV)</th>
                <th class="th-cmm">TURBO FLOW SET (CMM)</th>
                <th class="th-rt">REAL-TIME (CMM)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in arpBandsLatex" :key="i" :class="i===activeLatexBand ? 'arp-row-active' : ''">
                <td>
                  <span class="zone-bdg" :style="`background:${b.color}22;color:${b.color};border:1px solid ${b.color}55`">{{ b.zone }}</span>
                </td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_lo" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_hi" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp arp-inp-cmm" v-model.number="b.flow_cmm" min="0" max="200" step="0.1" /></td>
                <td>
                  <span v-if="i===activeLatexBand" class="arp-rt-val">
                    <span class="arp-rt-dot"></span>{{ rtCmm2 !== null ? rtCmm2 : '—' }}
                  </span>
                  <span v-else class="arp-rt-idle">—</span>
                </td>
                <td>
                  <span class="arp-status" :class="i===activeLatexBand ? 'arp-active' : 'arp-idle'">
                    {{ i===activeLatexBand ? '● ACTIVE' : 'IDLE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="arp-band-bar">
            <div v-for="(b, i) in arpBandsLatex.slice().reverse()" :key="i"
                 class="arp-band-seg" :style="`background:${b.color}33;border-color:${b.color}66`"
                 :class="arpBandsLatex.length-1-i === activeLatexBand ? 'arp-seg-active' : ''">
              <span class="arp-band-zone" :style="`color:${b.color}`">{{ b.zone }}</span>
              <span class="arp-band-range">{{ bandRangeLabel(b, i, arpBandsLatex.length) }}</span>
            </div>
          </div>

          <div class="arp-footer">
            <label class="arp-toggle-wrap">
              <div class="arp-toggle" :class="arpActive2 ? 'arp-toggle-on' : ''" @click="arpActive2=!arpActive2">
                <div class="arp-toggle-knob"></div>
              </div>
              <span class="arp-toggle-lbl" :style="arpActive2 ? 'color:#00e87a' : ''">
                AIRFLOW-ORP MODE {{ arpActive2 ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </label>
            <button class="arp-save-btn" @click="saveArp(2)">
              <i class="bx bx-save"></i> SAVE BL-2 (Latex)
            </button>
          </div>
        </div>

      </div><!-- /arp-grid -->
    </div><!-- /airflow tab -->

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

const DEFAULT_BANDS = () => [
  { zone:'HH', color:'#dd4444', orp_lo:150,  orp_hi:999,  flow_cmm:20.0 },
  { zone:'H',  color:'#cc8833', orp_lo:75,   orp_hi:150,  flow_cmm:45.0 },
  { zone:'ZERO',color:'#2a8a7a',orp_lo:-75,  orp_hi:75,   flow_cmm:63.3 },
  { zone:'L',  color:'#44aa55', orp_lo:-150, orp_hi:-75,  flow_cmm:83.3 },
  { zone:'LL', color:'#8844cc', orp_lo:-999, orp_hi:-150, flow_cmm:100.0 },
];

export default {
  name: 'StaKdControl',
  data() {
    return {
      activeTab: 'orp',
      tabs: [
        { id: 'orp',     label: 'ORP BANDS',       icon: 'bx-pulse' },
        { id: 'loop',    label: 'LOOP CONTROL',     icon: 'bx-slider' },
        { id: 'turning', label: 'TURNING POINTS',   icon: 'bx-git-branch' },
        { id: 'airflow', label: 'AIRFLOW-ORP MODE', icon: 'bx-wind' },
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
      // AIRFLOW-ORP MODE
      arpActive1: true,
      arpActive2: true,
      arpBandsSerum: DEFAULT_BANDS(),
      arpBandsLatex: DEFAULT_BANDS(),
    };
  },
  computed: {
    ...mapGetters('staKd', ['processORP', 'serumORP', 'tb1Flow', 'tb2Flow']),
    rtCmm1() { const n=parseFloat(this.tb1Flow); return isNaN(n)?null:+n.toFixed(1); },
    rtCmm2() { const n=parseFloat(this.tb2Flow); return isNaN(n)?null:+n.toFixed(1); },
    activeSerumBand() {
      const v = parseFloat(this.serumORP);
      if (isNaN(v)) return 2;
      const b = this.arpBandsSerum;
      if (v >= b[0].orp_lo) return 0;
      if (v >= b[1].orp_lo) return 1;
      if (v >= b[2].orp_lo) return 2;
      if (v >= b[3].orp_lo) return 3;
      return 4;
    },
    activeLatexBand() {
      const v = parseFloat(this.processORP);
      if (isNaN(v)) return 2;
      const b = this.arpBandsLatex;
      if (v >= b[0].orp_lo) return 0;
      if (v >= b[1].orp_lo) return 1;
      if (v >= b[2].orp_lo) return 2;
      if (v >= b[3].orp_lo) return 3;
      return 4;
    },
  },
  methods: {
    saveProc()    { alert('Process ORP settings saved (integration pending)'); },
    saveSerum()   { alert('Serum ORP settings saved (integration pending)'); },
    saveLoop()    { alert('Loop control settings saved (integration pending)'); },
    saveTurning() { alert('Turning points saved (integration pending)'); },
    saveArp(n) {
      const label = n === 1 ? 'BL-1 Serum' : 'BL-2 Latex';
      alert(`AIRFLOW-ORP MODE — ${label} settings saved (integration pending)`);
    },
    activeBandColor(idx, side) {
      const bands = side === 'serum' ? this.arpBandsSerum : this.arpBandsLatex;
      return bands[idx]?.color || '#888';
    },
    bandRangeLabel(b, reversedIdx, total) {
      // reversedIdx: 0=LL, 1=L, 2=ZERO, 3=H, 4=HH in reversed slice
      if (reversedIdx === 0)         return `(←${b.orp_hi})`;
      if (reversedIdx === total - 1) return `(>${b.orp_lo})`;
      return `(${b.orp_lo} to ${b.orp_hi})`;
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

.kd-tab-bar { display: flex; gap: 6px; }
.kd-tab-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 6px 14px; border-radius: 6px; cursor: pointer;
  border: 1px solid var(--border2); background: var(--bg2); color: var(--text2);
  transition: all .15s; display: flex; align-items: center; gap: 6px;
}
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

/* ══ AIRFLOW-ORP MODE ══ */
.arp-wrap { display: flex; flex-direction: column; gap: 10px; }

.arp-desc {
  font-family: var(--font-mono); font-size: 10px; line-height: 1.6;
  background: rgba(0,212,255,.05); border: 1px solid rgba(0,212,255,.15);
  border-left: 3px solid rgba(0,212,255,.4);
  border-radius: 7px; padding: 10px 14px; color: rgba(200,220,240,.55);
  display: flex; gap: 8px; align-items: flex-start;
}
.arp-desc i { font-size: 14px; color: rgba(0,212,255,.6); flex-shrink: 0; margin-top: 1px; }

.arp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.arp-panel {
  background: rgba(8,12,20,.95); border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
}

.arp-panel-hdr { display: flex; align-items: center; gap: 10px; }
.arp-panel-accent { width: 4px; height: 32px; border-radius: 2px; flex-shrink: 0; }
.arp-panel-name {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  letter-spacing: .08em; color: rgba(220,230,245,.85);
}
.arp-panel-sub { font-family: var(--font-mono); font-size: 9px; color: rgba(200,215,230,.3); margin-top: 2px; }

/* Current ORP indicator */
.arp-cur-row {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 10px;
  background: rgba(255,255,255,.03); border-radius: 6px; padding: 6px 10px;
}
.arp-cur-lbl { color: rgba(200,215,230,.35); }
.arp-cur-val { font-size: 13px; font-weight: 700; }
.arp-cur-zone {
  font-size: 10px; font-weight: 800; padding: 2px 8px;
  border-radius: 4px; border: 1px solid; letter-spacing: .08em; margin-left: 4px;
}

/* Table */
.arp-table {
  width: 100%; border-collapse: collapse;
  font-family: var(--font-mono); font-size: 10px;
}
.arp-table th {
  font-size: 8.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(200,215,230,.28); padding: 6px 8px; text-align: left;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.arp-table td { padding: 5px 8px; vertical-align: middle; }
.arp-table tr { border-bottom: 1px solid rgba(255,255,255,.04); transition: background .15s; }
.arp-table tr:hover { background: rgba(255,255,255,.03); }
.arp-row-active { background: rgba(255,255,255,.05) !important; }

.zone-bdg {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  padding: 3px 10px; border-radius: 5px; letter-spacing: .06em;
  display: inline-block; text-align: center; min-width: 44px;
}

.arp-inp {
  width: 70px; font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  background: rgba(18,28,44,.8); border: 1px solid rgba(255,255,255,.1);
  color: rgba(200,220,240,.8); padding: 4px 6px; border-radius: 5px;
  outline: none; text-align: center; transition: border-color .15s;
}
.arp-inp:focus { border-color: rgba(0,212,255,.4); background: rgba(22,35,55,.9); }
.th-cmm { color: var(--cyan) !important; letter-spacing: .08em; }
.th-rt  { color: #00e87a !important; letter-spacing: .08em; }
.arp-inp-cmm {
  color: var(--cyan) !important;
  border-color: rgba(0,212,255,.25) !important;
  background: rgba(0,212,255,.06) !important;
  width: 76px;
}
.arp-inp-cmm:focus { border-color: rgba(0,212,255,.6) !important; background: rgba(0,212,255,.12) !important; }
.arp-rt-val {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  color: #00e87a;
}
.arp-rt-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #00e87a;
  box-shadow: 0 0 6px #00e87a;
  animation: rtpulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes rtpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
.arp-rt-idle { color: rgba(200,215,230,.18); font-family: var(--font-mono); font-size: 12px; }

.arp-status {
  font-size: 9px; font-weight: 700; padding: 3px 9px;
  border-radius: 4px; letter-spacing: .06em; display: inline-block;
}
.arp-active {
  color: #00e87a; background: rgba(0,232,122,.1);
  border: 1px solid rgba(0,232,122,.3);
}
.arp-idle {
  color: rgba(200,215,230,.25); background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
}

/* Band visualization bar */
.arp-band-bar {
  display: flex; border-radius: 6px; overflow: hidden;
  height: 40px; border: 1px solid rgba(255,255,255,.08);
}
.arp-band-seg {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  border-right: 1px solid rgba(0,0,0,.3); cursor: default;
  transition: filter .15s;
}
.arp-band-seg:last-child { border-right: none; }
.arp-band-seg:hover { filter: brightness(1.3); }
.arp-seg-active { filter: brightness(1.4) !important; outline: 1px solid rgba(255,255,255,.25); }
.arp-band-zone { font-family: var(--font-mono); font-size: 10px; font-weight: 800; letter-spacing: .06em; }
.arp-band-range { font-family: var(--font-mono); font-size: 7.5px; color: rgba(255,255,255,.45); }

/* Footer: toggle + save */
.arp-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 4px;
}
.arp-toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.arp-toggle {
  width: 38px; height: 20px; border-radius: 10px;
  background: rgba(255,255,255,.12); position: relative;
  transition: background .2s; cursor: pointer; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.15);
}
.arp-toggle-on { background: rgba(0,232,122,.35); border-color: rgba(0,232,122,.5); }
.arp-toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(200,215,230,.6); transition: transform .2s, background .2s;
}
.arp-toggle-on .arp-toggle-knob {
  transform: translateX(18px); background: #00e87a;
}
.arp-toggle-lbl { font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: rgba(200,215,230,.4); letter-spacing: .06em; transition: color .2s; }

.arp-save-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 7px 16px; border-radius: 6px; cursor: pointer;
  background: rgba(0,212,255,.1); color: var(--cyan);
  border: 1px solid rgba(0,212,255,.35);
  display: flex; align-items: center; gap: 6px;
  transition: background .15s;
}
.arp-save-btn:hover { background: rgba(0,212,255,.2); }
</style>
