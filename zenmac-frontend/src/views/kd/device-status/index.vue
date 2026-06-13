<template>
  <div class="dh-wrap">

    <!-- ── STATS BAR ───────────────────────────────────────────────── -->
    <div class="dh-stats-bar">
      <div class="dh-stat" :class="mqttConnected ? 'stat-ok' : 'stat-err'">
        <div class="ds-val">{{ mqttConnected ? 'CONNECTED' : 'OFFLINE' }}</div>
        <div class="ds-lbl">MQTT Broker</div>
      </div>
      <div class="dh-stat">
        <div class="ds-val">{{ activeTopics }}<span class="ds-of">/5</span></div>
        <div class="ds-lbl">Topics Active</div>
      </div>
      <div class="dh-stat">
        <div class="ds-val">{{ totalFields }}</div>
        <div class="ds-lbl">Data Points</div>
      </div>
      <div class="dh-stat" :class="lastUpdateTs ? 'stat-ok' : ''">
        <div class="ds-val">{{ lastUpdateTs || '—' }}</div>
        <div class="ds-lbl">Last Update</div>
      </div>
      <div class="dh-stat-spacer"></div>
      <button class="dh-btn" @click="exportCSV">
        <i class="bx bx-download"></i> Export CSV
      </button>
    </div>

    <!-- ── TOPIC PANELS ────────────────────────────────────────────── -->
    <div class="dh-topics">

      <!-- kd — Flow Meters -->
      <div class="dh-topic-card" :class="topicStatusClass('kd')">
        <div class="dtc-header">
          <span class="dtc-dot" :class="topicDotClass('kd')"></span>
          <span class="dtc-name">FLOW METERS</span>
          <span class="dtc-topic">zenzero/hmi/kd</span>
          <span class="dtc-status">{{ topicStatus('kd') }}</span>
          <span class="dtc-ts">{{ topicTs('kd') }}</span>
        </div>
        <div class="dtc-fields">
          <div class="dtc-row" v-for="f in flowFields" :key="f.key">
            <span class="dtc-field">{{ f.label }}</span>
            <span class="dtc-val" :class="valClass(kd[f.key])">{{ fmt(kd[f.key], f.unit) }}</span>
          </div>
        </div>
      </div>

      <!-- kd4 — Sensors -->
      <div class="dh-topic-card" :class="topicStatusClass('kd4')">
        <div class="dtc-header">
          <span class="dtc-dot" :class="topicDotClass('kd4')"></span>
          <span class="dtc-name">SENSORS</span>
          <span class="dtc-topic">zenzero/hmi/kd4</span>
          <span class="dtc-status">{{ topicStatus('kd4') }}</span>
          <span class="dtc-ts">{{ topicTs('kd4') }}</span>
        </div>
        <div class="dtc-fields">
          <div class="dtc-row" v-for="f in sensorFields" :key="f.key">
            <span class="dtc-field">{{ f.label }}</span>
            <span class="dtc-val" :class="valClass(kd4[f.key])">{{ fmt(kd4[f.key], f.unit) }}</span>
          </div>
        </div>
      </div>

      <!-- kd1 — Blowers -->
      <div class="dh-topic-card wide" :class="topicStatusClass('kd1')">
        <div class="dtc-header">
          <span class="dtc-dot" :class="topicDotClass('kd1')"></span>
          <span class="dtc-name">BLOWERS (TB-01 / TB-02)</span>
          <span class="dtc-topic">zenzero/hmi/kd1</span>
          <span class="dtc-status">{{ topicStatus('kd1') }}</span>
          <span class="dtc-ts">{{ topicTs('kd1') }}</span>
        </div>
        <div class="dtc-fields dtc-two-col">
          <div class="dtc-group">
            <div class="dtc-group-title">TB-01</div>
            <div class="dtc-row" v-for="f in blower1Fields" :key="f.key">
              <span class="dtc-field">{{ f.label }}</span>
              <span class="dtc-val" :class="valClass(kd1[f.key])">{{ fmt(kd1[f.key], f.unit) }}</span>
            </div>
          </div>
          <div class="dtc-group">
            <div class="dtc-group-title">TB-02</div>
            <div class="dtc-row" v-for="f in blower2Fields" :key="f.key">
              <span class="dtc-field">{{ f.label }}</span>
              <span class="dtc-val" :class="valClass(kd1[f.key])">{{ fmt(kd1[f.key], f.unit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- kd5 — Pumps & Daily Totals -->
      <div class="dh-topic-card" :class="topicStatusClass('kd5')">
        <div class="dtc-header">
          <span class="dtc-dot" :class="topicDotClass('kd5')"></span>
          <span class="dtc-name">PUMPS &amp; DAILY TOTALS</span>
          <span class="dtc-topic">zenzero/hmi/kd5</span>
          <span class="dtc-status">{{ topicStatus('kd5') }}</span>
          <span class="dtc-ts">{{ topicTs('kd5') }}</span>
        </div>
        <div class="dtc-fields">
          <div class="dtc-row" v-for="f in pumpFields" :key="f.key">
            <span class="dtc-field">{{ f.label }}</span>
            <span class="dtc-val" :class="valClass(kd5[f.key])">{{ fmt(kd5[f.key], f.unit) }}</span>
          </div>
        </div>
      </div>

      <!-- kd2 — Yesterday -->
      <div class="dh-topic-card" :class="topicStatusClass('kd2')">
        <div class="dtc-header">
          <span class="dtc-dot" :class="topicDotClass('kd2')"></span>
          <span class="dtc-name">YESTERDAY</span>
          <span class="dtc-topic">zenzero/hmi/kd2</span>
          <span class="dtc-status">{{ topicStatus('kd2') }}</span>
          <span class="dtc-ts">{{ topicTs('kd2') }}</span>
        </div>
        <div class="dtc-fields">
          <div class="dtc-row" v-for="f in yestFields" :key="f.key">
            <span class="dtc-field">{{ f.label }}</span>
            <span class="dtc-val" :class="valClass(kd2[f.key])">{{ fmt(kd2[f.key], f.unit) }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ── RAW DUMP toggle ─────────────────────────────────────────── -->
    <div class="dh-raw-toggle" @click="showRaw = !showRaw">
      <i class="bx" :class="showRaw ? 'bx-chevron-up' : 'bx-chevron-down'"></i>
      RAW MQTT DATA ({{ showRaw ? 'hide' : 'show all fields' }})
    </div>
    <div class="dh-raw" v-if="showRaw">
      <div class="dh-raw-block" v-for="(topic, tk) in rawTopics" :key="tk">
        <div class="drb-title">{{ tk }}</div>
        <div class="drb-row" v-for="(v, k) in topic" :key="k">
          <span class="drb-key">{{ k }}</span>
          <span class="drb-val">{{ v }}</span>
        </div>
        <div class="drb-empty" v-if="!Object.keys(topic).length">— no data —</div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import { on, getSocket } from '@/services/staKdSocket';

const OFFLINE_THRESHOLD = 90 * 1000;

export default {
  name: 'DeviceStatusPage',

  data() {
    return {
      topicLastSeen: { kd: null, kd1: null, kd2: null, kd4: null, kd5: null },
      _ticker: null,
      _unsubFns: [],
      showRaw: false,
      _tick: 0,

      flowFields: [
        { key: 'Process Flow m3_hr (Real)',  label: 'Process Flow',  unit: 'm³/hr' },
        { key: 'Serum Flow m3_hr (real)',    label: 'Serum Flow',    unit: 'm³/hr' },
      ],

      sensorFields: [
        { key: 'Process_ORP_Lock_hr',  label: 'Process ORP',  unit: 'mV'  },
        { key: 'Serum_ORP_Lock_hr',    label: 'Serum ORP',    unit: 'mV'  },
        { key: 'Process_pH_Lock_hr',   label: 'Process pH',   unit: 'pH'  },
        { key: 'Serum_PH_Lock_hr',     label: 'Serum pH',     unit: 'pH'  },
        { key: 'Process_Temp_Lock_hr', label: 'Process Temp', unit: '°C'  },
        { key: 'Serum_Temp_Lock_hr',   label: 'Serum Temp',   unit: '°C'  },
      ],

      blower1Fields: [
        { key: 'TB_1_BLOWER POWER_kW',          label: 'Power',          unit: 'kW'    },
        { key: 'TB_1_MOTOR CURRENT_A',           label: 'Current',        unit: 'A'     },
        { key: 'TB_1_SUCTION FLOW RATE_CMM',     label: 'Suction Flow',   unit: 'CMM'   },
        { key: 'TB_1_Suction_pressure_mmAq',     label: 'Suction Press',  unit: 'mmAq'  },
        { key: 'TB_1_DISCHARGE PRESSURE_mmAq',   label: 'Discharge Press',unit: 'mmAq'  },
        { key: 'TB_1_MOTOR TEMPERATURE_C',       label: 'Motor Temp',     unit: '°C'    },
        { key: 'TB_1_DRIVE TEMPERATURE_C',       label: 'Drive Temp',     unit: '°C'    },
        { key: 'TB_1_DISCHARGE TEMPERATURE_C',   label: 'Discharge Temp', unit: '°C'    },
        { key: 'TB_1_OUTSIDE TEMPERATURE_C',     label: 'Outside Temp',   unit: '°C'    },
        { key: 'TB_1_Number of ON OFF',          label: 'ON/OFF Count',   unit: ''      },
      ],

      blower2Fields: [
        { key: 'TB_2_BLOWER POWER_kW',          label: 'Power',          unit: 'kW'    },
        { key: 'TB_2_MOTOR CURRENT_A',           label: 'Current',        unit: 'A'     },
        { key: 'TB_2_SUCTION FLOW RATE_CMM',     label: 'Suction Flow',   unit: 'CMM'   },
        { key: 'TB_2_Suction_pressure_mmAq',     label: 'Suction Press',  unit: 'mmAq'  },
        { key: 'TB_2_DISCHARGE PRESSURE_mmAq',   label: 'Discharge Press',unit: 'mmAq'  },
        { key: 'TB_2_MOTOR TEMPERATURE_C',       label: 'Motor Temp',     unit: '°C'    },
        { key: 'TB_2_DRIVE TEMPERATURE_C',       label: 'Drive Temp',     unit: '°C'    },
        { key: 'TB_2_DISCHARGE TEMPERATURE_C',   label: 'Discharge Temp', unit: '°C'    },
        { key: 'TB_2_OUTSIDE TEMPERATURE_C',     label: 'Outside Temp',   unit: '°C'    },
        { key: 'TB_2_Number of ON OFF',          label: 'ON/OFF Count',   unit: ''      },
      ],

      pumpFields: [
        { key: 'TB-01_Status',                    label: 'TB-01 Status',        unit: '' },
        { key: 'TB-02_Status',                    label: 'TB-02 Status',        unit: '' },
        { key: 'Process pump_Status',             label: 'Process Pump Status', unit: '' },
        { key: 'Serum pump_Status',               label: 'Serum Pump Status',   unit: '' },
        { key: 'Process Flow M3_Day_real',        label: 'Process Flow/Day',    unit: 'm³'  },
        { key: 'Serum Flow M3_Day_real',          label: 'Serum Flow/Day',      unit: 'm³'  },
        { key: 'Process+Serum Flow M3_Day_real',  label: 'Total Flow/Day',      unit: 'm³'  },
      ],

      yestFields: [
        { key: 'Process Flow M3_Day_Lock_yesterday', label: 'Process Flow Yesterday', unit: 'm³' },
        { key: 'Serum Flow M3_Day_Lock_yesterday',   label: 'Serum Flow Yesterday',   unit: 'm³' },
      ],
    };
  },

  computed: {
    ...mapState('staKd', ['kd', 'kd1', 'kd2', 'kd4', 'kd5', 'mqttConnected', 'lastUpdate']),

    activeTopics() {
      void this._tick;
      return Object.values(this.topicLastSeen).filter(ts => ts && Date.now() - ts < OFFLINE_THRESHOLD).length;
    },

    totalFields() {
      return this.flowFields.length + this.sensorFields.length +
             this.blower1Fields.length + this.blower2Fields.length +
             this.pumpFields.length + this.yestFields.length;
    },

    lastUpdateTs() {
      if (!this.lastUpdate) return null;
      return new Date(this.lastUpdate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },

    rawTopics() {
      return { kd: this.kd, kd1: this.kd1, kd2: this.kd2, kd4: this.kd4, kd5: this.kd5 };
    },
  },

  mounted() {
    getSocket();
    const u1 = on('kd:update', ({ key }) => {
      if (key in this.topicLastSeen) {
        this.$set(this.topicLastSeen, key, Date.now());
      }
    });
    const u2 = on('kd:snapshot', (snap) => {
      const keys = Object.keys(snap || {});
      keys.forEach(k => {
        if (k in this.topicLastSeen && snap[k] && Object.keys(snap[k]).length) {
          this.$set(this.topicLastSeen, k, Date.now());
        }
      });
    });
    this._unsubFns = [u1, u2];
    this._ticker = setInterval(() => { this._tick++; }, 5000);
  },

  beforeDestroy() {
    this._unsubFns.forEach(fn => fn());
    clearInterval(this._ticker);
  },

  methods: {
    topicStatus(key) {
      void this._tick;
      const ts = this.topicLastSeen[key];
      if (!ts) return 'WAITING';
      return Date.now() - ts < OFFLINE_THRESHOLD ? 'LIVE' : 'STALE';
    },

    topicStatusClass(key) {
      const s = this.topicStatus(key);
      return { 'tc-live': s === 'LIVE', 'tc-stale': s === 'STALE', 'tc-wait': s === 'WAITING' };
    },

    topicDotClass(key) {
      const s = this.topicStatus(key);
      return { 'dot-live': s === 'LIVE', 'dot-stale': s === 'STALE', 'dot-wait': s === 'WAITING' };
    },

    topicTs(key) {
      const ts = this.topicLastSeen[key];
      if (!ts) return '—';
      return new Date(ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },

    fmt(val, unit) {
      if (val == null || val === '') return '—';
      const n = Number(val);
      if (!Number.isNaN(n)) {
        const s = Number.isInteger(n) ? String(n) : n.toFixed(2);
        return unit ? `${s} ${unit}` : s;
      }
      return String(val) + (unit ? ` ${unit}` : '');
    },

    valClass(val) {
      if (val == null || val === '') return 'v-null';
      const n = Number(val);
      if (!Number.isNaN(n) && n === 0) return 'v-zero';
      return 'v-ok';
    },

    exportCSV() {
      const rows = [['Topic', 'Field', 'Value', 'Unit']];
      const add = (topic, fields, state) =>
        fields.forEach(f => rows.push([topic, f.label, state[f.key] ?? '', f.unit]));

      add('kd',  this.flowFields,    this.kd);
      add('kd4', this.sensorFields,  this.kd4);
      add('kd1', this.blower1Fields, this.kd1);
      add('kd1', this.blower2Fields, this.kd1);
      add('kd5', this.pumpFields,    this.kd5);
      add('kd2', this.yestFields,    this.kd2);

      const csv  = '﻿' + rows.map(r => r.join(',')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `device-health-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.dh-wrap {
  display: flex; flex-direction: column; gap: 12px;
  padding: 14px; height: 100%; overflow-y: auto;
  background: var(--ex-bg, #f2f4f7);
  font-family: 'Prompt', 'Sarabun', sans-serif; font-size: 13px;
  color: var(--ex-text, #1a1a2e);
}

/* stats bar */
.dh-stats-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: var(--ex-card-bg, #fff);
  border: 1px solid var(--ex-card-bdr, #dde3ec);
  border-radius: 10px; padding: 10px 16px;
}
.dh-stat { text-align: center; min-width: 90px; }
.ds-val { font-size: 18px; font-weight: 800; line-height: 1; }
.ds-of  { font-size: 11px; font-weight: 400; opacity: .5; }
.ds-lbl { font-size: 9px; opacity: .55; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
.stat-ok .ds-val { color: #27ae60; }
.stat-err .ds-val { color: #e74c3c; }
.dh-stat-spacer { flex: 1; }

/* btn */
.dh-btn {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 7px; border: 1px solid var(--ex-card-bdr, #dde3ec);
  background: var(--ex-card-bg, #fff); color: var(--ex-text, #1a1a2e);
  font-size: 11px; cursor: pointer; transition: background .15s; white-space: nowrap;
}
.dh-btn:hover { background: var(--ex-hover, #eef1f5); }

/* topic grid */
.dh-topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}
.dh-topic-card.wide { grid-column: span 2; }

/* topic card */
.dh-topic-card {
  background: var(--ex-card-bg, #fff);
  border: 2px solid var(--ex-card-bdr, #dde3ec);
  border-radius: 10px; overflow: hidden;
  transition: border-color .3s;
}
.dh-topic-card.tc-live  { border-color: #27ae60; }
.dh-topic-card.tc-stale { border-color: #e67e22; }
.dh-topic-card.tc-wait  { border-color: var(--ex-card-bdr, #dde3ec); }

.dtc-header {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 12px; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec);
  background: var(--ex-thead-bg, #f7f9fc);
}
.dtc-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  animation: none;
}
.dot-live  { background: #27ae60; box-shadow: 0 0 5px #27ae60; animation: pulse 1.5s infinite; }
.dot-stale { background: #e67e22; }
.dot-wait  { background: #bdc3c7; }
@keyframes pulse {
  0%, 100% { opacity: 1; } 50% { opacity: .4; }
}
.dtc-name  { font-size: 11px; font-weight: 700; letter-spacing: .04em; }
.dtc-topic { font-size: 9px; opacity: .5; font-family: monospace; }
.dtc-status {
  margin-left: auto; font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 8px;
}
.tc-live  .dtc-status { background: #d5f5e3; color: #1e8449; }
.tc-stale .dtc-status { background: #fdebd0; color: #935116; }
.tc-wait  .dtc-status { background: #f0f3f4; color: #7f8c8d; }
.dtc-ts { font-size: 9px; opacity: .5; }

/* fields */
.dtc-fields { padding: 8px 12px 10px; }
.dtc-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 3px 0; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec)44;
}
.dtc-row:last-child { border-bottom: none; }
.dtc-field { font-size: 10px; opacity: .7; flex: 1; padding-right: 8px; }
.dtc-val   { font-size: 11px; font-weight: 600; font-family: monospace; white-space: nowrap; }
.v-ok   { color: var(--ex-text, #1a1a2e); }
.v-zero { color: #aaa; }
.v-null { color: #ccc; font-style: italic; }

/* two-column blower layout */
.dtc-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.dtc-group { }
.dtc-group-title { font-size: 10px; font-weight: 700; opacity: .5; text-transform: uppercase; letter-spacing: .08em; padding-bottom: 4px; border-bottom: 2px solid var(--ex-card-bdr, #dde3ec); margin-bottom: 4px; }

/* raw dump */
.dh-raw-toggle {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; opacity: .55; cursor: pointer; padding: 4px 2px;
  user-select: none; text-transform: uppercase; letter-spacing: .05em;
}
.dh-raw-toggle:hover { opacity: .85; }
.dh-raw {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px;
}
.dh-raw-block {
  background: var(--ex-card-bg, #fff);
  border: 1px solid var(--ex-card-bdr, #dde3ec);
  border-radius: 8px; padding: 10px; font-size: 10px; font-family: monospace;
}
.drb-title { font-weight: 700; font-size: 11px; margin-bottom: 6px; color: var(--ex-accent, #f39c12); }
.drb-row { display: flex; gap: 8px; padding: 1px 0; }
.drb-key { opacity: .6; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.drb-val { font-weight: 600; white-space: nowrap; }
.drb-empty { opacity: .4; font-style: italic; }
</style>
