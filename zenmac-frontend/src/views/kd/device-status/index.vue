<template>
  <div class="dh-wrap">

    <!-- ── HEADER ───────────────────────────────────────────────── -->
    <div class="dh-header">
      <div class="dh-title">
        <i class="bx bx-pulse"></i> Device Health
        <span class="dh-sub">real-time monitoring &amp; error log</span>
      </div>
      <div class="dh-header-actions">
        <span class="dh-mqtt-dot" :class="mqttConnected ? 'dot-ok' : 'dot-err'"
          :title="mqttConnected ? 'MQTT Connected' : 'MQTT Disconnected'"></span>
        <span class="dh-mqtt-lbl">{{ mqttConnected ? 'CONNECTED' : 'OFFLINE' }}</span>
        <button class="dh-btn" @click="exportCSV" title="Export error log as CSV">
          <i class="bx bx-download"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- ── DEVICE STATUS TABLE ───────────────────────────────────── -->
    <div class="dh-section">
      <div class="dh-section-title">Device Status</div>
      <div class="dh-table-wrap">
        <table class="dh-table">
          <thead>
            <tr>
              <th @click="sortDevCol('id')" class="sortable">ID <i class="bx" :class="sortDevIcon('id')"></i></th>
              <th @click="sortDevCol('name')" class="sortable">Name <i class="bx" :class="sortDevIcon('name')"></i></th>
              <th>Type</th>
              <th @click="sortDevCol('status')" class="sortable">Status <i class="bx" :class="sortDevIcon('status')"></i></th>
              <th>Signal</th>
              <th @click="sortDevCol('lastSeen')" class="sortable">Last Seen <i class="bx" :class="sortDevIcon('lastSeen')"></i></th>
              <th>Last Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!devices.length">
              <td colspan="7" class="dh-empty">Loading devices…</td>
            </tr>
            <tr v-for="dev in sortedDevices" :key="dev.id">
              <td class="dh-id">{{ dev.id }}</td>
              <td class="dh-name">{{ dev.name }}</td>
              <td class="dh-type">{{ dev.type || '—' }}</td>
              <td>
                <span class="dh-status-badge" :class="statusClass(dev.id)">
                  {{ statusLabel(dev.id) }}
                </span>
              </td>
              <td>
                <span class="dh-sig-badge" :class="sigClass(dev)">
                  {{ sigLabel(dev) }}
                </span>
              </td>
              <td class="dh-ts">{{ lastSeenStr(dev.id) }}</td>
              <td class="dh-val">{{ lastValStr(dev.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── ERROR LOG ──────────────────────────────────────────────── -->
    <div class="dh-section">
      <div class="dh-section-title">
        Error Log
        <span class="dh-log-counts">
          <span class="dh-lc dh-lc-today">{{ errorsToday }} today</span>
          <span class="dh-lc dh-lc-active">{{ activeErrors }} active</span>
        </span>
        <span v-if="topDevice" class="dh-top-dev">
          Most errors: <b>{{ topDevice }}</b>
        </span>
      </div>

      <!-- Filters -->
      <div class="dh-filters">
        <select v-model="filterStatus" class="dh-sel">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
        <select v-model="filterType" class="dh-sel">
          <option value="">All Types</option>
          <option v-for="t in errorTypes" :key="t" :value="t">{{ t }}</option>
        </select>
        <input v-model="filterDevice" class="dh-input" placeholder="Device ID…" />
        <button class="dh-btn dh-btn-warn" @click="clearResolved">
          <i class="bx bx-trash"></i> Clear Resolved
        </button>
      </div>

      <div class="dh-table-wrap">
        <table class="dh-table">
          <thead>
            <tr>
              <th @click="sortLogCol('ts')" class="sortable">Time <i class="bx" :class="sortLogIcon('ts')"></i></th>
              <th @click="sortLogCol('device_name')" class="sortable">Device <i class="bx" :class="sortLogIcon('device_name')"></i></th>
              <th @click="sortLogCol('error_type')" class="sortable">Type <i class="bx" :class="sortLogIcon('error_type')"></i></th>
              <th>Detail</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredLog.length">
              <td colspan="5" class="dh-empty">No errors recorded.</td>
            </tr>
            <tr v-for="entry in filteredLog" :key="entry.id" :class="{ 'row-resolved': entry.resolved }">
              <td class="dh-ts">{{ formatTs(entry.ts) }}</td>
              <td class="dh-name">{{ entry.device_name || entry.device_id }}</td>
              <td><span class="dh-err-badge" :class="errClass(entry.error_type)">{{ entry.error_type }}</span></td>
              <td class="dh-detail">{{ entry.detail }}</td>
              <td>
                <button v-if="!entry.resolved" class="dh-btn dh-btn-sm" @click="resolve(entry.id)">Resolve</button>
                <span v-else class="dh-resolved-lbl">Resolved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import { on, getSocket } from '@/services/staKdSocket';

const LS_KEY             = 'zenmac_error_log';
const OFFLINE_THRESHOLD  = 60  * 1000;
const NO_DATA_THRESHOLD  = 120 * 1000;
const DEDUP_WINDOW       = 5   * 60 * 1000;
const CHECK_INTERVAL     = 5   * 1000;
const MAX_LOG            = 2000;

const TYPE_KEY = { flow: 'kd', blower: 'kd1', sensor: 'kd4', pump: 'kd5' };

const RANGE = {
  orp:  { min: -200, max: 800  },
  ph:   { min: 3,    max: 11   },
  temp: { min: 0,    max: 80   },
  flow: { min: 0,    max: 500  },
};

function topicKey(dev) {
  if (dev.signal) return dev.signal;
  return TYPE_KEY[dev.type] || 'kd';
}

function sensorKind(dev) {
  const u = (dev.unit || '').toLowerCase();
  const n = (dev.name || '').toLowerCase();
  if (u === 'mv' || n.includes('orp')) return 'orp';
  if (u === 'ph' || n.includes('ph'))  return 'ph';
  if (n.includes('temp') || u === '°c' || u === 'c') return 'temp';
  if (n.includes('flow') || u.includes('m³')) return 'flow';
  return null;
}

function isOutOfRange(kind, val) {
  const r = RANGE[kind];
  if (!r) return false;
  return val < r.min || val > r.max;
}

let _eid = Date.now();
function newId() { return ++_eid; }

export default {
  name: 'DeviceStatusPage',

  computed: {
    ...mapState('staKd', ['devices']),

    sortedDevices() {
      const { devSortKey, devSortDir } = this;
      return [...this.devices].sort((a, b) => {
        let va, vb;
        if (devSortKey === 'status') {
          va = this.statusLabel(a.id); vb = this.statusLabel(b.id);
        } else if (devSortKey === 'lastSeen') {
          const sa = this.deviceStatus[a.id]; const sb = this.deviceStatus[b.id];
          va = sa ? sa.lastSeen : 0; vb = sb ? sb.lastSeen : 0;
        } else {
          va = a[devSortKey] ?? ''; vb = b[devSortKey] ?? '';
        }
        if (va < vb) return devSortDir === 'asc' ? -1 : 1;
        if (va > vb) return devSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    },

    filteredLog() {
      const { filterStatus, filterType, filterDevice, logSortKey, logSortDir } = this;
      let rows = this.errorLog.filter(e => {
        if (filterStatus === 'active'   && e.resolved) return false;
        if (filterStatus === 'resolved' && !e.resolved) return false;
        if (filterType && e.error_type !== filterType) return false;
        if (filterDevice && !String(e.device_id).toLowerCase().includes(filterDevice.toLowerCase())) return false;
        return true;
      });
      rows = rows.slice().sort((a, b) => {
        const va = a[logSortKey] ?? ''; const vb = b[logSortKey] ?? '';
        if (va < vb) return logSortDir === 'asc' ? -1 : 1;
        if (va > vb) return logSortDir === 'asc' ? 1 : -1;
        return 0;
      });
      return rows;
    },

    errorTypes() {
      return [...new Set(this.errorLog.map(e => e.error_type))].sort();
    },

    errorsToday() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return this.errorLog.filter(e => e.ts >= today.getTime()).length;
    },

    activeErrors() {
      return this.errorLog.filter(e => !e.resolved).length;
    },

    topDevice() {
      const cnt = {};
      this.errorLog.forEach(e => { cnt[e.device_id] = (cnt[e.device_id] || 0) + 1; });
      const ids = Object.keys(cnt);
      if (!ids.length) return null;
      return ids.reduce((a, b) => cnt[a] > cnt[b] ? a : b);
    },
  },

  data() {
    return {
      mqttConnected: false,
      deviceStatus:  {},   // { [devId]: { lastSeen, lastVal } }
      sigCounters:   { kd: 0, kd1: 0, kd2: 0, kd4: 0, kd5: 0 },
      sigRates:      { kd: 0, kd1: 0, kd2: 0, kd4: 0, kd5: 0 },
      errorLog:      [],
      filterStatus:  'all',
      filterType:    '',
      filterDevice:  '',
      devSortKey:    'id',
      devSortDir:    'asc',
      logSortKey:    'ts',
      logSortDir:    'desc',
      _startTime:    0,
      _statusTimer:  null,
      _sigTimer:     null,
      _unsubFns:     [],
    };
  },

  mounted() {
    this._startTime = Date.now();
    this.$store.dispatch('staKd/fetchDevices');
    this._loadLog();
    getSocket();

    const u1 = on('kd:update',    this._onUpdate);
    const u2 = on('kd:status',    this._onMqttStatus);
    const u3 = on('ws:disconnect', this._onDisconnect);
    const u4 = on('rawmqtt',      this._onRaw);
    this._unsubFns = [u1, u2, u3, u4];

    this._statusTimer = setInterval(this._checkOffline, CHECK_INTERVAL);
    this._sigTimer    = setInterval(this._snapSig, 60000);
  },

  beforeDestroy() {
    this._unsubFns.forEach(fn => fn());
    clearInterval(this._statusTimer);
    clearInterval(this._sigTimer);
  },

  methods: {
    // ── socket handlers ──────────────────────────────────────────
    _onUpdate(payload) {
      const { key, data } = payload || {};
      if (!key || !data) return;
      const k = String(key);
      if (k in this.sigCounters) this.sigCounters[k]++;

      this.devices.forEach(dev => {
        if (topicKey(dev) !== k) return;
        const val = dev.path ? data[dev.path] : null;
        this.$set(this.deviceStatus, dev.id, {
          lastSeen: Date.now(),
          lastVal:  val != null ? val : (this.deviceStatus[dev.id]?.lastVal ?? null),
        });
        if (val != null) {
          const kind = sensorKind(dev);
          if (kind && isOutOfRange(kind, val)) {
            this._logError(dev, 'OUT_OF_RANGE', `${val} (${dev.unit || kind})`);
          }
        }
      });
    },

    _onMqttStatus({ connected }) {
      this.mqttConnected = !!connected;
      if (!connected) {
        this.devices.forEach(dev => this._logError(dev, 'MQTT_DISCONNECT', 'kd:status connected=false'));
      }
    },

    _onDisconnect() {
      this.mqttConnected = false;
      this.devices.forEach(dev => this._logError(dev, 'MQTT_DISCONNECT', 'ws:disconnect'));
    },

    _onRaw(payload) {
      if (!payload || !payload._parseError) return;
      const topic = payload.topic || payload._raw?.topic || '?';
      const fakeDev = { id: topic, name: topic, type: 'raw' };
      this._logError(fakeDev, 'PARSE_ERROR', payload._parseError);
    },

    _checkOffline() {
      const now     = Date.now();
      const warmup  = now - this._startTime < 30000;
      this.devices.forEach(dev => {
        const st = this.deviceStatus[dev.id];
        if (!st) return;
        const elapsed = now - st.lastSeen;
        if (!warmup && elapsed > NO_DATA_THRESHOLD) {
          this._logError(dev, 'NO_DATA', `No data for ${Math.round(elapsed / 1000)}s`);
        }
      });
    },

    _snapSig() {
      Object.keys(this.sigRates).forEach(k => {
        this.sigRates[k] = this.sigCounters[k];
        this.sigCounters[k] = 0;
      });
    },

    // ── error log ────────────────────────────────────────────────
    _logError(dev, type, detail = '') {
      const now = Date.now();
      const dup = this.errorLog.find(e =>
        e.device_id === dev.id && e.error_type === type && !e.resolved &&
        now - e.ts < DEDUP_WINDOW
      );
      if (dup) return;

      const entry = {
        id:          newId(),
        ts:          now,
        device_id:   dev.id,
        device_name: dev.name,
        error_type:  type,
        detail,
        resolved:    false,
      };
      this.errorLog.unshift(entry);
      if (this.errorLog.length > MAX_LOG) this.errorLog = this.errorLog.slice(0, MAX_LOG);
      this._saveLog();
      this.$emit('device-error', entry);
    },

    _loadLog() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) this.errorLog = JSON.parse(raw);
      } catch { this.errorLog = []; }
    },

    _saveLog() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(this.errorLog)); } catch {}
    },

    // ── UI helpers ───────────────────────────────────────────────
    statusLabel(devId) {
      const st = this.deviceStatus[devId];
      if (!st) return 'UNKNOWN';
      const elapsed = Date.now() - st.lastSeen;
      if (elapsed > OFFLINE_THRESHOLD) return 'OFFLINE';
      return 'ONLINE';
    },

    statusClass(devId) {
      const lbl = this.statusLabel(devId);
      return { 'sb-online': lbl === 'ONLINE', 'sb-offline': lbl === 'OFFLINE', 'sb-unknown': lbl === 'UNKNOWN' };
    },

    sigLabel(dev) {
      const rate = this.sigRates[topicKey(dev)] ?? 0;
      if (rate >= 10) return 'GOOD';
      if (rate >= 3)  return 'FAIR';
      if (rate >= 1)  return 'WEAK';
      return 'NONE';
    },

    sigClass(dev) {
      const lbl = this.sigLabel(dev);
      return { 'sig-good': lbl === 'GOOD', 'sig-fair': lbl === 'FAIR', 'sig-weak': lbl === 'WEAK', 'sig-none': lbl === 'NONE' };
    },

    lastSeenStr(devId) {
      const st = this.deviceStatus[devId];
      if (!st) return '—';
      return new Date(st.lastSeen).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },

    lastValStr(devId) {
      const st = this.deviceStatus[devId];
      if (!st || st.lastVal == null) return '—';
      return String(st.lastVal);
    },

    errClass(type) {
      const m = { NO_DATA: 'et-warn', OUT_OF_RANGE: 'et-warn', MQTT_DISCONNECT: 'et-err', PARSE_ERROR: 'et-err', SENSOR_FAULT: 'et-crit' };
      return m[type] || 'et-info';
    },

    formatTs(ts) {
      const d = new Date(ts);
      const date = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${date} ${time}`;
    },

    resolve(id) {
      const entry = this.errorLog.find(e => e.id === id);
      if (entry) { entry.resolved = true; this._saveLog(); }
    },

    clearResolved() {
      this.errorLog = this.errorLog.filter(e => !e.resolved);
      this._saveLog();
    },

    // ── sort helpers ─────────────────────────────────────────────
    sortDevCol(key) {
      if (this.devSortKey === key) { this.devSortDir = this.devSortDir === 'asc' ? 'desc' : 'asc'; }
      else { this.devSortKey = key; this.devSortDir = 'asc'; }
    },

    sortLogCol(key) {
      if (this.logSortKey === key) { this.logSortDir = this.logSortDir === 'asc' ? 'desc' : 'asc'; }
      else { this.logSortKey = key; this.logSortDir = 'desc'; }
    },

    sortDevIcon(key) { return this._sortIcon(key, this.devSortKey, this.devSortDir); },
    sortLogIcon(key) { return this._sortIcon(key, this.logSortKey, this.logSortDir); },
    _sortIcon(key, cur, dir) {
      if (key !== cur) return 'bx-sort';
      return dir === 'asc' ? 'bx-sort-up' : 'bx-sort-down';
    },

    // ── export ───────────────────────────────────────────────────
    exportCSV() {
      const header = ['Time', 'Device ID', 'Device Name', 'Error Type', 'Detail', 'Resolved'];
      const rows   = this.errorLog.map(e => [
        new Date(e.ts).toISOString(),
        e.device_id,
        e.device_name || '',
        e.error_type,
        (e.detail || '').replace(/,/g, ';'),
        e.resolved ? 'Yes' : 'No',
      ]);
      const csv  = '﻿' + [header, ...rows].map(r => r.join(',')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a'); a.href = url;
      a.download = `device-health-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.dh-wrap {
  display: flex; flex-direction: column; gap: 16px;
  padding: 16px; height: 100%; overflow-y: auto;
  background: var(--ex-bg, #f2f4f7); color: var(--ex-text, #1a1a2e);
  font-family: 'Prompt', 'Sarabun', sans-serif; font-size: 13px;
}

/* header */
.dh-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.dh-title  { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; flex: 1; }
.dh-title i { font-size: 20px; color: var(--ex-accent, #f39c12); }
.dh-sub { font-size: 10px; font-weight: 400; opacity: .6; }
.dh-header-actions { display: flex; align-items: center; gap: 8px; }
.dh-mqtt-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-ok  { background: #2ecc71; box-shadow: 0 0 6px #2ecc71; }
.dot-err { background: #e74c3c; }
.dh-mqtt-lbl { font-size: 10px; font-weight: 600; opacity: .7; }

/* section */
.dh-section { background: var(--ex-card-bg, #fff); border: 1px solid var(--ex-card-bdr, #dde3ec); border-radius: 10px; overflow: hidden; }
.dh-section-title { display: flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec); flex-wrap: wrap; }

/* log counts */
.dh-log-counts { display: flex; gap: 6px; }
.dh-lc { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px; }
.dh-lc-today  { background: #eaf4fd; color: #2980b9; }
.dh-lc-active { background: #fdecea; color: #c0392b; }
.dh-top-dev { font-size: 10px; opacity: .65; margin-left: auto; }

/* buttons */
.dh-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 6px; border: 1px solid var(--ex-card-bdr, #dde3ec); background: var(--ex-card-bg, #fff); color: var(--ex-text, #1a1a2e); font-size: 11px; cursor: pointer; transition: background .15s; white-space: nowrap; }
.dh-btn:hover { background: var(--ex-hover, #eef1f5); }
.dh-btn-warn { color: #c0392b; border-color: #e74c3c33; }
.dh-btn-sm { padding: 2px 8px; font-size: 10px; }

/* filters */
.dh-filters { display: flex; gap: 8px; padding: 8px 12px; flex-wrap: wrap; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec); }
.dh-sel, .dh-input {
  padding: 4px 8px; border-radius: 5px; border: 1px solid var(--ex-card-bdr, #dde3ec);
  background: var(--ex-card-bg, #fff); color: var(--ex-text, #1a1a2e); font-size: 11px;
}

/* table */
.dh-table-wrap { overflow-x: auto; }
.dh-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.dh-table thead tr { background: var(--ex-thead-bg, #f7f9fc); }
.dh-table th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec); }
.dh-table th.sortable { cursor: pointer; user-select: none; }
.dh-table th.sortable:hover { background: var(--ex-hover, #eef1f5); }
.dh-table td { padding: 7px 12px; border-bottom: 1px solid var(--ex-card-bdr, #dde3ec)22; white-space: nowrap; }
.dh-table tr:last-child td { border-bottom: none; }
.dh-table tr.row-resolved { opacity: .5; }
.dh-empty { text-align: center; color: #aaa; padding: 20px; font-style: italic; }

/* badges */
.dh-status-badge, .dh-sig-badge, .dh-err-badge {
  display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 700; letter-spacing: .05em;
}
.sb-online  { background: #d5f5e3; color: #1e8449; }
.sb-offline { background: #fadbd8; color: #922b21; }
.sb-unknown { background: #f0f3f4; color: #7f8c8d; }

.sig-good { background: #d5f5e3; color: #1e8449; }
.sig-fair { background: #fef9e7; color: #9a7d0a; }
.sig-weak { background: #fdebd0; color: #935116; }
.sig-none { background: #f0f3f4; color: #7f8c8d; }

.et-err  { background: #fadbd8; color: #922b21; }
.et-warn { background: #fef9e7; color: #9a7d0a; }
.et-crit { background: #922b21; color: #fff; }
.et-info { background: #eaf4fd; color: #1a5276; }

.dh-ts, .dh-id { opacity: .7; }
.dh-detail { max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.dh-resolved-lbl { font-size: 9px; color: #aaa; }
</style>
