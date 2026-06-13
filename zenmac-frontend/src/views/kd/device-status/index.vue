<template>
  <div class="dh-outer" :class="{'dh-light': lightTheme}">

    <!-- ── SUMMARY BAR ─────────────────────────────────────────── -->
    <div class="summary-bar">
      <div class="sb-item">
        <div class="sb-num" style="color:var(--dh-cyan)">{{ registry.length }}</div>
        <div class="sb-lbl">TOTAL DEVICES</div>
      </div>
      <div class="sb-item">
        <div class="sb-num" style="color:var(--dh-green)">{{ onlineCount }}</div>
        <div class="sb-lbl">ONLINE</div>
      </div>
      <div class="sb-item">
        <div class="sb-num" style="color:var(--dh-red)">{{ offlineCount }}</div>
        <div class="sb-lbl">OFFLINE</div>
      </div>
      <div class="sb-item">
        <div class="sb-num" style="color:var(--dh-text3)">{{ unknownCount }}</div>
        <div class="sb-lbl">UNKNOWN</div>
      </div>
      <div class="sb-item sb-sep">
        <div class="sb-num" style="color:var(--dh-red)">{{ activeErrors }}</div>
        <div class="sb-lbl">ACTIVE ERRORS</div>
      </div>
      <div class="sb-item" style="min-width:180px">
        <div class="sb-sublbl">MOST FREQUENT</div>
        <div class="sb-text" style="color:var(--dh-amber)">{{ mostFreqDevice }}</div>
      </div>
      <div class="sb-item" style="min-width:130px">
        <div class="sb-sublbl">ERRORS TODAY</div>
        <div class="sb-num" style="color:var(--dh-orange);font-size:20px">{{ errorsToday }}</div>
      </div>
      <div class="sb-spacer"></div>
      <div class="sb-actions">
        <span class="refresh-dot" v-show="refreshing"></span>
        <button class="act-btn btn-theme" @click="lightTheme=!lightTheme" :title="lightTheme?'Switch to Dark':'Switch to Light'">
          {{ lightTheme ? '🌙 Dark' : '☀️ Light' }}
        </button>
        <button class="act-btn btn-cyan"  @click="exportCSV">↓ Export CSV</button>
        <button class="act-btn btn-amber" @click="clearResolved">🗑 Clear Resolved</button>
        <button class="act-btn btn-green" @click="simulateSampleErrors" title="สร้าง sample errors เพื่อทดสอบ">🧪 Demo Errors</button>
      </div>
    </div>

    <!-- ── TWO-PANEL AREA ──────────────────────────────────────── -->
    <div class="panels">

      <!-- LEFT: DEVICE STATUS TABLE -->
      <div class="panel-left">
        <div class="panel-hdr">
          <span style="color:var(--dh-cyan)">📡</span>
          <span class="panel-title" style="color:var(--dh-cyan)">DEVICE STATUS</span>
          <span class="panel-count">{{ filteredDevices.length }} devices</span>
          <div class="ph-right">
            <span class="ph-meta">Timeout: 60s | No-data: 120s</span>
            <span class="mqtt-dot-sm" :class="mqttConnected ? 'mdot-ok':'mdot-err'"></span>
            <span class="ph-meta" :style="{color: mqttConnected ? 'var(--dh-green)' : 'var(--dh-red)'}">
              {{ mqttConnected ? 'MQTT OK' : 'MQTT OFF' }}
            </span>
          </div>
        </div>

        <div class="filter-row">
          <button class="f-btn"       :class="{active:devFilter==='all'}"    @click="devFilter='all'">ทั้งหมด</button>
          <button class="f-btn f-grn" :class="{active:devFilter==='online'}" @click="devFilter='online'">🟢 Online</button>
          <button class="f-btn f-red" :class="{active:devFilter==='offline'}" @click="devFilter='offline'">🔴 Offline</button>
          <button class="f-btn f-amb" :class="{active:devFilter==='error'}"  @click="devFilter='error'">⚠ มี Error</button>
          <button class="f-btn"       :class="{active:devFilter==='sensor'}" @click="devFilter='sensor'">Sensor</button>
          <button class="f-btn"       :class="{active:devFilter==='blower'}" @click="devFilter='blower'">Blower</button>
          <button class="f-btn"       :class="{active:devFilter==='pump'}"   @click="devFilter='pump'">Pump</button>
          <div class="f-spacer"></div>
          <input class="f-search" v-model="devSearch" type="text" placeholder="🔍 ค้นหา...">
        </div>

        <div class="tbl-scroll">
          <table class="dh-table">
            <thead>
              <tr>
                <th>สถานะ</th>
                <th>Device ID</th>
                <th>ชื่อ</th>
                <th>ประเภท</th>
                <th>Topic</th>
                <th>ค่าล่าสุด</th>
                <th>Last Seen</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredDevices.length">
                <td colspan="8">
                  <div class="empty-state">
                    <div class="es-icon">📭</div>
                    <div>ไม่มี Device ที่ตรงกับ filter</div>
                  </div>
                </td>
              </tr>
              <tr v-for="d in filteredDevices" :key="d.id"
                  :class="rowClass(d)">
                <td>
                  <span class="badge" :class="statusBadge(d.status)">
                    <span class="bdot" :class="statusBadge(d.status)+'d'"></span>
                    {{ d.status.toUpperCase() }}
                  </span>
                  <span v-if="errDevSet.has(d.id)" style="color:var(--dh-red);margin-left:4px;font-size:10px">⚠</span>
                </td>
                <td><span class="dev-id">{{ d.id }}</span></td>
                <td class="dev-name-cell" :title="d.name">{{ typeIcon(d.type) }} {{ d.name }}</td>
                <td><span class="dev-type">{{ d.type }}</span></td>
                <td class="dev-topic-cell" :title="d.topic_sub">{{ d.topic_sub }}</td>
                <td>
                  <span class="dev-val" :class="d.lastVal!=='—'?'val-live':''">{{ d.lastVal }}</span>
                  <span class="dev-unit" v-if="d.lastVal!=='—'"> {{ d.unit }}</span>
                </td>
                <td>
                  <span class="last-seen" :class="lastSeenClass(d.lastSeen)">{{ lastSeenLabel(d.lastSeen) }}</span>
                </td>
                <td>
                  <div class="sq-wrap">
                    <div class="sq-bar">
                      <div class="sq-fill" :style="{width:sigQ(d)+'%',background:sigColor(sigQ(d))}"></div>
                    </div>
                    <span class="sq-pct" :style="{color:sigColor(sigQ(d))}">{{ sigQ(d) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RIGHT: ERROR LOG -->
      <div class="panel-right">
        <div class="panel-hdr">
          <span style="color:var(--dh-red)">🚨</span>
          <span class="panel-title" style="color:var(--dh-red)">ERROR HISTORY LOG</span>
          <span class="panel-count">{{ filteredErrors.length }} errors</span>
          <div class="ph-right">
            <span class="ph-meta">localStorage: zenmac_error_log</span>
          </div>
        </div>

        <div class="filter-row">
          <button class="f-btn"       :class="{active:errFilter==='all'}"      @click="errFilter='all'">ทั้งหมด</button>
          <button class="f-btn f-red" :class="{active:errFilter==='active'}"   @click="errFilter='active'">🔴 Active</button>
          <button class="f-btn f-grn" :class="{active:errFilter==='resolved'}" @click="errFilter='resolved'">✅ Resolved</button>
          <div class="f-spacer"></div>
          <select v-model="errTypeFilter" class="f-select">
            <option value="">ทุก Error Type</option>
            <option value="NO_DATA">NO_DATA</option>
            <option value="OUT_OF_RANGE">OUT_OF_RANGE</option>
            <option value="PARSE_ERROR">PARSE_ERROR</option>
            <option value="MQTT_DISCONNECT">MQTT_DISCONNECT</option>
            <option value="SENSOR_FAULT">SENSOR_FAULT</option>
          </select>
          <select v-model="errDevFilter" class="f-select" style="max-width:130px">
            <option value="">ทุก Device</option>
            <option v-for="id in errDeviceIds" :key="id" :value="id">{{ id }}</option>
          </select>
        </div>

        <div class="tbl-scroll">
          <table class="dh-table">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>Device ID</th>
                <th>Error Type</th>
                <th>รายละเอียด</th>
                <th>ค่า</th>
                <th>สถานะ</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredErrors.length">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="es-icon">✅</div>
                    <div>ไม่มี Error ที่ตรงกับ filter</div>
                  </div>
                </td>
              </tr>
              <tr v-for="e in filteredErrors" :key="e.id"
                  :class="{'row-resolved':e.resolved}">
                <td class="ts-cell">{{ tsDisplay(e.ts) }}</td>
                <td>
                  <span class="dev-id">{{ e.device_id }}</span>
                  <br><span class="dev-name-sm">{{ e.device_name }}</span>
                </td>
                <td><span class="badge" :class="errBadgeClass(e.error_type)">{{ errTypeIcon(e.error_type) }} {{ e.error_type }}</span></td>
                <td class="detail-cell" :title="e.detail">{{ e.detail }}</td>
                <td><span class="err-val">{{ e.value || '—' }}</span></td>
                <td>
                  <span class="badge" :class="e.resolved ? 'b-resolved':'b-active-err'">
                    {{ e.resolved ? '✅ RESOLVED' : '🔴 ACTIVE' }}
                  </span>
                </td>
                <td>
                  <button class="res-btn" @click="resolveError(e.id)" :disabled="e.resolved">✓ Resolve</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { on, getSocket } from '@/services/staKdSocket';

// ── Device Registry (28 devices mirroring STA-KD topology) ─────────
const DEFAULT_DEVICES = [
  { id:'KD_AT1_FM01',        name:'Process Flow',           type:'flow',   topic_sub:'zenzero/hmi/kd',  unit:'m³/hr',  path:'Process Flow m3_hr (Real)',              min:0,    max:500  },
  { id:'KD_AT1_ORP-01',      name:'Process ORP',            type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'mV',     path:'Process_ORP_Lock_hr',                    min:-200, max:800  },
  { id:'KD_AT1_pH-01',       name:'Process pH',             type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'pH',     path:'Process_pH_Lock_hr',                     min:3,    max:11   },
  { id:'KD_AT1_Temp-01',     name:'Process Temp',           type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'°C',     path:'Process_Temp_Lock_hr',                   min:0,    max:80   },
  { id:'KD_AT2_FM01',        name:'Serum Flow',             type:'flow',   topic_sub:'zenzero/hmi/kd',  unit:'m³/hr',  path:'Serum Flow m3_hr (real)',                 min:0,    max:500  },
  { id:'KD_AT2_ORP-01',      name:'Serum ORP',              type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'mV',     path:'Serum_ORP_Lock_hr',                      min:-200, max:800  },
  { id:'KD_AT2_pH-01',       name:'Serum pH',               type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'pH',     path:'Serum_PH_Lock_hr',                       min:3,    max:11   },
  { id:'KD_AT2_Temp-01',     name:'Serum Temp',             type:'sensor', topic_sub:'zenzero/hmi/kd4', unit:'°C',     path:'Serum_Temp_Lock_hr',                     min:0,    max:80   },
  { id:'KD_TB01_Kw',         name:'TB-01 Power',            type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'kW',     path:'TB_1_BLOWER POWER_kW',                   min:0,    max:300  },
  { id:'KD_TB01_Cr',         name:'TB-01 Current',          type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'A',      path:'TB_1_MOTOR CURRENT_A',                   min:0,    max:100  },
  { id:'KD_TB01_STFR',       name:'TB-01 Suction Flow',     type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'m³/min', path:'TB_1_SUCTION FLOW RATE_CMM',             min:0,    max:10   },
  { id:'KD_TB01_MTmp',       name:'TB-01 Motor Temp',       type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'°C',     path:'TB_1_MOTOR TEMPERATURE_C',               min:0,    max:80   },
  { id:'KD_TB01_DTmp',       name:'TB-01 Drive Temp',       type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'°C',     path:'TB_1_DRIVE TEMPERATURE_C',               min:0,    max:80   },
  { id:'KD_TB01_ONOFF',      name:'TB-01 Start Count',      type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'count',  path:'TB_1_Number of ON OFF',                  min:0,    max:100  },
  { id:'KD_TB02_Kw',         name:'TB-02 Power',            type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'kW',     path:'TB_2_BLOWER POWER_kW',                   min:0,    max:300  },
  { id:'KD_TB02_Cr',         name:'TB-02 Current',          type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'A',      path:'TB_2_MOTOR CURRENT_A',                   min:0,    max:100  },
  { id:'KD_TB02_STFR',       name:'TB-02 Suction Flow',     type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'m³/min', path:'TB_2_SUCTION FLOW RATE_CMM',             min:0,    max:10   },
  { id:'KD_TB02_MTmp',       name:'TB-02 Motor Temp',       type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'°C',     path:'TB_2_MOTOR TEMPERATURE_C',               min:0,    max:80   },
  { id:'KD_TB02_DTmp',       name:'TB-02 Drive Temp',       type:'blower', topic_sub:'zenzero/hmi/kd1', unit:'°C',     path:'TB_2_DRIVE TEMPERATURE_C',               min:0,    max:80   },
  { id:'KD_TB01_Status',     name:'TB-01 Status',           type:'blower', topic_sub:'zenzero/hmi/kd5', unit:'on/off', path:'TB-01_Status',                           min:0,    max:1    },
  { id:'KD_TB02_Status',     name:'TB-02 Status',           type:'blower', topic_sub:'zenzero/hmi/kd5', unit:'on/off', path:'TB-02_Status',                           min:0,    max:1    },
  { id:'KD_ProcPump_Status', name:'Process Pump',           type:'pump',   topic_sub:'zenzero/hmi/kd5', unit:'on/off', path:'Process pump_Status',                    min:0,    max:1    },
  { id:'KD_SerumPump_Status',name:'Serum Pump',             type:'pump',   topic_sub:'zenzero/hmi/kd5', unit:'on/off', path:'Serum pump_Status',                      min:0,    max:1    },
  { id:'KD_ProcFlow_Day',    name:'Process Flow/Day',       type:'flow',   topic_sub:'zenzero/hmi/kd5', unit:'m³/day', path:'Process Flow M3_Day_real',               min:0,    max:5000 },
  { id:'KD_SerumFlow_Day',   name:'Serum Flow/Day',         type:'flow',   topic_sub:'zenzero/hmi/kd5', unit:'m³/day', path:'Serum Flow M3_Day_real',                 min:0,    max:5000 },
  { id:'KD_TotalFlow_Day',   name:'Total Flow/Day',         type:'flow',   topic_sub:'zenzero/hmi/kd5', unit:'m³/day', path:'Process+Serum Flow M3_Day_real',         min:0,    max:10000},
  { id:'KD_ProcFlow_Yest',   name:'Process Flow Yesterday', type:'flow',   topic_sub:'zenzero/hmi/kd2', unit:'m³/day', path:'Process Flow M3_Day_Lock_yesterday',     min:0,    max:5000 },
  { id:'KD_SerumFlow_Yest',  name:'Serum Flow Yesterday',   type:'flow',   topic_sub:'zenzero/hmi/kd2', unit:'m³/day', path:'Serum Flow M3_Day_Lock_yesterday',       min:0,    max:5000 },
];

const LS_KEY     = 'zenmac_error_log';
const MAX_LOG    = 2000;
const OFFLINE_MS = 60  * 1000;
const NODATA_MS  = 120 * 1000;
const NODATA_REPEAT = 300 * 1000;

export default {
  name: 'DeviceStatusPage',

  computed: {
    ...mapState('staKd', ['mqttConnected']),

    onlineCount()  { return this.registry.filter(d => d.status === 'online').length;  },
    offlineCount() { return this.registry.filter(d => d.status === 'offline').length; },
    unknownCount() { return this.registry.filter(d => d.status === 'unknown').length; },

    activeErrors() { return this.errorLog.filter(e => !e.resolved).length; },

    errorsToday() {
      const today = new Date().toDateString();
      return this.errorLog.filter(e => new Date(e.ts).toDateString() === today).length;
    },

    mostFreqDevice() {
      const cnt = {};
      this.errorLog.filter(e => !e.resolved).forEach(e => { cnt[e.device_id] = (cnt[e.device_id]||0)+1; });
      const top = Object.entries(cnt).sort((a,b) => b[1]-a[1])[0];
      return top ? `${top[0]} (${top[1]}x)` : '—';
    },

    errDevSet() {
      return new Set(this.errorLog.filter(e => !e.resolved).map(e => e.device_id));
    },

    errDeviceIds() {
      return [...new Set(this.errorLog.map(e => e.device_id))].sort();
    },

    filteredDevices() {
      void this.tickClock;
      const errDevs = this.errDevSet;
      const q = this.devSearch.toLowerCase();
      let list = this.registry.filter(d => {
        if (this.devFilter === 'online'  && d.status !== 'online')  return false;
        if (this.devFilter === 'offline' && d.status !== 'offline') return false;
        if (this.devFilter === 'error'   && !errDevs.has(d.id))     return false;
        if (this.devFilter === 'sensor'  && d.type !== 'sensor')    return false;
        if (this.devFilter === 'blower'  && d.type !== 'blower')    return false;
        if (this.devFilter === 'pump'    && d.type !== 'pump')      return false;
        if (q && !d.id.toLowerCase().includes(q) && !d.name.toLowerCase().includes(q) && !(d.topic_sub||'').includes(q)) return false;
        return true;
      });
      list.sort((a,b) => {
        const ord = { offline:0, unknown:1, online:2 };
        return (ord[a.status]??1) - (ord[b.status]??1);
      });
      return list;
    },

    filteredErrors() {
      return this.errorLog.filter(e => {
        if (this.errFilter === 'active'   && e.resolved)  return false;
        if (this.errFilter === 'resolved' && !e.resolved) return false;
        if (this.errTypeFilter && e.error_type !== this.errTypeFilter) return false;
        if (this.errDevFilter  && e.device_id  !== this.errDevFilter)  return false;
        return true;
      }).slice(0, 200);
    },
  },

  data() {
    return {
      registry:      [],
      errorLog:      [],
      devFilter:     'all',
      errFilter:     'all',
      errTypeFilter: '',
      errDevFilter:  '',
      devSearch:     '',
      lightTheme:    false,
      refreshing:    false,
      tickClock:     0,
    };
  },

  mounted() {
    this._noDataTs        = {};
    this._rangeTs         = {};
    this._rdTimer         = null;
    this._checkTimer      = null;
    this.tickClockTimer   = null;
    this._unsubFns        = [];
    this._mqttConnectedAt = null;

    // init registry with runtime state
    this.registry = DEFAULT_DEVICES.map(d => ({
      ...d, status:'unknown', lastSeen:null, lastVal:'—', msgCount:0, errCount:0,
    }));

    this._loadLog();
    const sock = getSocket();

    const u1 = on('kd:update',    this._onUpdate);
    const u2 = on('kd:status',    this._onMqttStatus);
    const u3 = on('ws:disconnect', this._onDisconnect);
    const u4 = on('rawmqtt',      this._onRaw);
    const u5 = on('kd:snapshot',  this._onSnapshot);
    const u6 = on('ws:connect',   this._onWsConnect);
    this._unsubFns = [u1, u2, u3, u4, u5, u6];

    // request snapshot immediately if already connected
    if (sock.connected) this._requestSnapshot();

    this._checkTimer    = setInterval(this._checkOffline, 10000);
    this.tickClockTimer = setInterval(() => { this.tickClock++; }, 5000);
  },

  beforeUnmount() {
    this._unsubFns.forEach(fn => fn());
    clearInterval(this._checkTimer);
    clearInterval(this.tickClockTimer);
    clearTimeout(this._rdTimer);
  },

  methods: {
    // ── snapshot request ─────────────────────────────────────────
    _requestSnapshot() {
      this._mqttConnectedAt = Date.now();
      getSocket().emit('request:snapshot');
    },

    _onWsConnect() {
      this._requestSnapshot();
    },

    // ── socket handlers ─────────────────────────────────────────
    _onUpdate({ key, data }) {
      if (!key || !data) return;
      this._flashRefresh();
      const now = Date.now();
      this.registry.forEach(d => {
        if (d.topic_sub.split('/').pop() !== key) return;
        d.lastSeen = now;
        d.status   = 'online';
        d.msgCount = (d.msgCount || 0) + 1;

        const raw = data[d.path];
        if (raw !== undefined && raw !== null) {
          if (d.unit === 'on/off') {
            const on = raw === 1 || raw === true || raw === '1' || String(raw).toLowerCase() === 'true';
            d.lastVal = on ? 'Run' : 'Off';
          } else {
            const num = parseFloat(raw);
            const disp = !isNaN(num) ? (Number.isInteger(num) ? String(num) : num.toFixed(2)) : String(raw);
            d.lastVal = disp;
            this._validateRange(d, num);
          }
        }

        if (data.fault === true || data.fault === 1 || data.error === true) {
          this._debounce('fault_' + d.id, 60000, () => {
            this._logError(d.id, 'SENSOR_FAULT', 'Sensor fault flag ถูกตั้งค่า — ตรวจสอบหัว sensor', data.fault_code || '');
          });
        }
      });
    },

    _onSnapshot(snap) {
      if (!snap) return;
      Object.entries(snap).forEach(([key, data]) => {
        if (!data || typeof data !== 'object') return;
        this._onUpdate({ key, data });
      });
    },

    _onMqttStatus({ connected }) {
      if (!connected) {
        this._debounce('mqttdisc', 120000, () => {
          this._logError('SYSTEM', 'MQTT_DISCONNECT', 'MQTT Broker offline/unreachable — ตรวจสอบ network', '');
        });
      }
    },

    _onDisconnect() {
      this._debounce('wsdisc', 120000, () => {
        this._logError('SYSTEM', 'MQTT_DISCONNECT', 'WebSocket disconnect — backend ถูกตัดการเชื่อมต่อ', '');
      });
    },

    _onRaw(payload) {
      if (!payload || !payload._parseError) return;
      const topic = payload.topic || '?';
      this._debounce('parse_' + topic, 60000, () => {
        this._logError(topic, 'PARSE_ERROR', `JSON parse fail: ${payload._parseError}`, '');
      });
    },

    // ── offline / no-data check ──────────────────────────────────
    _checkOffline() {
      const now = Date.now();
      let changed = false;
      const connectedMs = this._mqttConnectedAt ? now - this._mqttConnectedAt : 0;

      this.registry.forEach(d => {
        // UNKNOWN → OFFLINE after 30s of MQTT connected with no data
        if (d.status === 'unknown' && this.mqttConnected && connectedMs > 30000) {
          d.status = 'offline';
          changed = true;
          return;
        }

        if (!d.lastSeen) return;

        if (now - d.lastSeen > OFFLINE_MS && d.status === 'online') {
          d.status = 'offline';
          changed = true;
        }

        if (now - d.lastSeen > NODATA_MS) {
          this._debounce('nodata_' + d.id, NODATA_REPEAT, () => {
            this._logError(d.id, 'NO_DATA',
              `ไม่ได้รับข้อมูลนานกว่า ${Math.round((now-d.lastSeen)/60000)} นาที — ตรวจสอบ connection หรือ sensor`, '');
          });
        }
      });
      if (changed) this.tickClock++;
    },

    _validateRange(d, num) {
      if (isNaN(num)) return;
      if (d.min !== undefined && d.max !== undefined && (num < d.min || num > d.max)) {
        this._debounce('range_' + d.id, 60000, () => {
          const sig = d.path.split('_')[0] || d.type;
          this._logError(d.id, 'OUT_OF_RANGE',
            `${sig} = ${num} ${d.unit} นอกช่วง [${d.min}, ${d.max}]`, num);
        });
      }
    },

    // ── error log ────────────────────────────────────────────────
    _logError(device_id, error_type, detail, value = '') {
      const d = this.registry.find(x => x.id === device_id);
      const entry = {
        id:          Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        ts:          new Date().toISOString(),
        device_id,
        device_name: d ? d.name : device_id,
        error_type,
        detail,
        value:       String(value),
        resolved:    false,
      };
      this.errorLog.unshift(entry);
      if (this.errorLog.length > MAX_LOG) this.errorLog = this.errorLog.slice(0, MAX_LOG);
      if (d) d.errCount = (d.errCount || 0) + 1;
      this._saveLog();
    },

    _debounce(key, ms, fn) {
      const ts = this._noDataTs[key] || 0;
      if (Date.now() - ts > ms) {
        this._noDataTs[key] = Date.now();
        fn();
      }
    },

    _loadLog() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) this.errorLog = JSON.parse(raw);
      } catch { this.errorLog = []; }
    },

    _saveLog() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(this.errorLog)); } catch (_e) { /* quota exceeded — ignore */ }
    },

    // ── error actions ────────────────────────────────────────────
    resolveError(id) {
      const e = this.errorLog.find(x => x.id === id);
      if (e) {
        e.resolved    = true;
        e.resolved_at = new Date().toISOString();
        this._saveLog();
      }
    },

    clearResolved() {
      if (!confirm('ลบ Error ที่ Resolved ทั้งหมด?')) return;
      this.errorLog = this.errorLog.filter(e => !e.resolved);
      this._saveLog();
    },

    // ── demo errors ──────────────────────────────────────────────
    simulateSampleErrors() {
      const samples = [
        { id:'KD_AT2_ORP-01',      type:'OUT_OF_RANGE',    detail:'Serum ORP = 850 mV — นอกช่วง [-200, 800]',          val:'850' },
        { id:'KD_AT1_pH-01',       type:'OUT_OF_RANGE',    detail:'Process pH = 2.1 — นอกช่วง [3, 11]',               val:'2.1' },
        { id:'KD_AT1_FM01',        type:'NO_DATA',         detail:'ไม่ได้รับข้อมูลนานกว่า 5 นาที — ตรวจสอบ connection', val:''  },
        { id:'KD_TB01_Kw',         type:'OUT_OF_RANGE',    detail:'TB-01 Power = 320 kW — นอกช่วง [0, 300]',           val:'320' },
        { id:'KD_AT2_pH-01',       type:'PARSE_ERROR',     detail:'JSON parse fail: "ERR:TIMEOUT" — ข้อมูล corrupt',   val:'ERR:TIMEOUT' },
        { id:'KD_TB02_Status',     type:'SENSOR_FAULT',    detail:'Sensor fault flag ถูกตั้งค่า — ตรวจสอบหัว sensor',  val:'1'  },
        { id:'KD_SerumPump_Status',type:'MQTT_DISCONNECT', detail:'Broker offline/unreachable — connection lost',       val:''   },
      ];
      const count = Math.floor(Math.random() * 3) + 3;
      const chosen = [...samples].sort(() => Math.random() - .5).slice(0, count);
      chosen.forEach(s => this._logError(s.id, s.type, s.detail, s.val));

      // simulate some devices going online
      ['KD_AT2_ORP-01','KD_TB01_Kw','KD_AT1_pH-01'].forEach(id => {
        const d = this.registry.find(x => x.id === id);
        if (d) {
          d.status   = 'online';
          d.lastSeen = Date.now() - Math.random() * 30000;
          d.msgCount = (d.msgCount || 0) + 5;
        }
      });
      this.tickClock++;
    },

    // ── export ───────────────────────────────────────────────────
    exportCSV() {
      const rows = [['Timestamp','Device ID','Device Name','Error Type','Detail','Value','Resolved','Resolved At']];
      this.errorLog.forEach(e => rows.push([
        e.ts, e.device_id, e.device_name, e.error_type,
        '"' + (e.detail||'').replace(/"/g,'""') + '"',
        e.value, e.resolved ? 'YES' : 'NO', e.resolved_at || '',
      ]));
      const csv  = '﻿' + rows.map(r => r.join(',')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `zenmac_error_log_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // ── ui helpers ───────────────────────────────────────────────
    _flashRefresh() {
      this.refreshing = true;
      clearTimeout(this._rdTimer);
      this._rdTimer = setTimeout(() => { this.refreshing = false; }, 500);
    },

    statusBadge(s) {
      return { online:'b-online', offline:'b-offline', unknown:'b-unknown' }[s] || 'b-unknown';
    },

    rowClass(d) {
      const hasErr = this.errDevSet.has(d.id);
      return { 'row-err': hasErr && d.status === 'offline', 'row-warn': hasErr && d.status !== 'offline' };
    },

    typeIcon(t) {
      return { sensor:'💡', flow:'💧', blower:'💨', pump:'⚙️' }[t] || '📦';
    },

    sigQ(d) { return Math.min(100, (d.msgCount || 0) * 8); },
    sigColor(q) {
      if (q >= 75) return 'var(--dh-green)';
      if (q >= 40) return 'var(--dh-amber)';
      return 'var(--dh-red)';
    },

    lastSeenLabel(ts) {
      if (!ts) return '—';
      const s = Math.round((Date.now() - ts) / 1000);
      if (s < 15)  return '< 15s';
      if (s < 60)  return `${s}s ago`;
      return `${Math.round(s/60)}m ago`;
    },

    lastSeenClass(ts) {
      if (!ts) return '';
      const s = Math.round((Date.now() - ts) / 1000);
      if (s < 60)  return 'ls-recent';
      if (s < 300) return 'ls-stale';
      return 'ls-dead';
    },

    errBadgeClass(t) {
      return {
        NO_DATA:         'b-err-nodata',
        OUT_OF_RANGE:    'b-err-range',
        PARSE_ERROR:     'b-err-parse',
        MQTT_DISCONNECT: 'b-err-mqtt',
        SENSOR_FAULT:    'b-err-fault',
      }[t] || 'b-err-nodata';
    },

    errTypeIcon(t) {
      return { NO_DATA:'⏱', OUT_OF_RANGE:'📊', PARSE_ERROR:'⚡', MQTT_DISCONNECT:'📡', SENSOR_FAULT:'🔥' }[t] || '⚠';
    },

    tsDisplay(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString('th-TH', { day:'2-digit', month:'2-digit' }) + ' ' +
             d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    },
  },
};
</script>

<style scoped>
/* ── dark theme vars ─────────────────────────────────────────── */
.dh-outer {
  --dh-bg0:   #07090c;
  --dh-bg1:   #0d1117;
  --dh-bg2:   #141b24;
  --dh-bg3:   #1c2535;
  --dh-bdr:   #1e2a3a;
  --dh-bdr2:  #28384e;
  --dh-bdr3:  #3a4e62;
  --dh-cyan:  #00d4ff;
  --dh-green: #00e87a;
  --dh-amber: #ffb800;
  --dh-red:   #ff4040;
  --dh-orange:#ff7820;
  --dh-purple:#a855f7;
  --dh-text:  #d8e4f0;
  --dh-text2: #8aa2b8;
  --dh-text3: #3a4e62;
  --dh-mono:  'JetBrains Mono', 'Courier New', monospace;

  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  background: var(--dh-bg0); color: var(--dh-text);
  font-family: var(--dh-mono);
}

/* ── summary bar ─────────────────────────────────────────────── */
.summary-bar {
  display: flex; align-items: stretch; flex-shrink: 0;
  background: rgba(8,12,18,.95); border-bottom: 2px solid var(--dh-bdr2);
}
.sb-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 18px; border-right: 1px solid var(--dh-bdr2); gap: 2px; min-width: 90px;
}
.sb-sep { border-right: 2px solid var(--dh-bdr2); }
.sb-num { font-family: var(--dh-mono); font-weight: 700; font-size: 22px; line-height: 1; }
.sb-lbl { font-family: var(--dh-mono); font-size: 8.5px; color: var(--dh-text3); letter-spacing: .07em; }
.sb-sublbl { font-size: 8.5px; color: var(--dh-text3); letter-spacing: .06em; margin-bottom: 2px; }
.sb-text { font-size: 10px; font-weight: 700; }
.sb-spacer { flex: 1; }
.sb-actions { display: flex; align-items: center; gap: 8px; padding: 0 14px; }

/* ── action buttons ──────────────────────────────────────────── */
.act-btn {
  font-family: var(--dh-mono); font-size: 10px; font-weight: 700;
  padding: 6px 12px; border-radius: 6px; cursor: pointer; border: 1px solid;
  transition: background .15s; white-space: nowrap;
}
.btn-cyan  { background: rgba(0,212,255,.10); color:var(--dh-cyan);  border-color:rgba(0,212,255,.28); }
.btn-cyan:hover  { background: rgba(0,212,255,.20); }
.btn-amber { background: rgba(255,184,0,.10);  color:var(--dh-amber); border-color:rgba(255,184,0,.28); }
.btn-amber:hover { background: rgba(255,184,0,.20); }
.btn-green { background: rgba(0,232,122,.10);  color:var(--dh-green); border-color:rgba(0,232,122,.28); }
.btn-green:hover { background: rgba(0,232,122,.20); }

.refresh-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--dh-cyan); animation: dhpulse 1s infinite; display: inline-block;
}
@keyframes dhpulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── panels ──────────────────────────────────────────────────── */
.panels { display: flex; flex: 1; overflow: hidden; }
.panel-left  { width: 55%; display: flex; flex-direction: column; border-right: 2px solid var(--dh-bdr2); overflow: hidden; }
.panel-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.panel-hdr {
  display: flex; align-items: center; gap: 8px; padding: 9px 14px; flex-shrink: 0;
  background: rgba(10,14,20,.9); border-bottom: 1px solid var(--dh-bdr2);
}
.panel-title { font-family: var(--dh-mono); font-size: 10px; font-weight: 700; letter-spacing: .08em; }
.panel-count { font-family: var(--dh-mono); font-size: 9px; color: var(--dh-text3); background: var(--dh-bg3); padding: 2px 7px; border-radius: 10px; margin-left: 4px; }
.ph-right { margin-left: auto; display: flex; align-items: center; gap: 7px; }
.ph-meta  { font-size: 8px; color: var(--dh-text3); }
.mqtt-dot-sm { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.mdot-ok  { background: var(--dh-green); box-shadow: 0 0 5px #00e87a88; animation: dhpulse 2s infinite; }
.mdot-err { background: var(--dh-red); }

/* ── filter row ──────────────────────────────────────────────── */
.filter-row {
  display: flex; align-items: center; gap: 5px; padding: 6px 12px;
  background: rgba(8,12,18,.85); border-bottom: 1px solid var(--dh-bdr); flex-shrink: 0; flex-wrap: wrap;
}
.f-btn {
  font-family: var(--dh-mono); font-size: 9px; font-weight: 700;
  padding: 3px 9px; border-radius: 12px; cursor: pointer;
  border: 1px solid var(--dh-bdr2); background: transparent;
  color: var(--dh-text3); transition: all .15s;
}
.f-btn:hover { color: var(--dh-text2); border-color: var(--dh-bdr3); }
.f-btn.active { background: rgba(0,212,255,.12); color:var(--dh-cyan); border-color:rgba(0,212,255,.35); }
.f-btn.f-grn.active { background: rgba(0,232,122,.10); color:var(--dh-green); border-color:rgba(0,232,122,.32); }
.f-btn.f-red.active { background: rgba(255,64,64,.12);  color:var(--dh-red);   border-color:rgba(255,64,64,.35); }
.f-btn.f-amb.active { background: rgba(255,184,0,.10);  color:var(--dh-amber); border-color:rgba(255,184,0,.30); }
.f-spacer { flex: 1; }
.f-search {
  font-family: var(--dh-mono); font-size: 10px;
  background: rgba(18,28,44,.85); border: 1px solid var(--dh-bdr2);
  color: var(--dh-text); padding: 3px 8px; border-radius: 5px; outline: none; width: 150px;
}
.f-search:focus { border-color: rgba(0,212,255,.4); }
.f-select {
  font-family: var(--dh-mono); font-size: 9px;
  background: rgba(18,28,44,.85); border: 1px solid var(--dh-bdr2);
  color: var(--dh-text2); padding: 3px 6px; border-radius: 5px; outline: none;
}

/* ── table ───────────────────────────────────────────────────── */
.tbl-scroll { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--dh-bdr2) transparent; }
.dh-table { width: 100%; border-collapse: collapse; font-family: var(--dh-mono); }
.dh-table thead th {
  position: sticky; top: 0; background: rgba(13,17,23,.98); z-index: 2;
  padding: 7px 10px; font-size: 8.5px; color: var(--dh-text3); letter-spacing: .07em;
  font-weight: 700; border-bottom: 1px solid var(--dh-bdr2); text-align: left; white-space: nowrap;
}
.dh-table tbody tr { border-bottom: 1px solid rgba(255,255,255,.04); transition: background .15s; }
.dh-table tbody tr:hover { background: rgba(25,38,55,.5); }
.dh-table td { padding: 7px 10px; font-size: 9.5px; vertical-align: middle; white-space: nowrap; }

.row-err  { background: rgba(255,64,64,.04)  !important; }
.row-warn { background: rgba(255,120,32,.03) !important; }
.row-resolved { opacity: .5; }

/* ── badges ──────────────────────────────────────────────────── */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 10px; font-size: 8.5px; font-weight: 700;
  letter-spacing: .05em; white-space: nowrap; border: 1px solid;
}
.bdot { width: 6px; height: 6px; border-radius: 50%; }
.b-online  { background: rgba(0,232,122,.12);  color:var(--dh-green); border-color:rgba(0,232,122,.28); }
.b-online  .bdot { background:var(--dh-green); animation:dhpulse 2s infinite; }
.b-offline { background: rgba(255,64,64,.12);  color:var(--dh-red);   border-color:rgba(255,64,64,.28); }
.b-offline .bdot { background:var(--dh-red);   }
.b-unknown { background: rgba(58,78,98,.3);    color:var(--dh-text3); border-color:var(--dh-bdr2);      }
.b-unknown .bdot { background:var(--dh-text3); }

.b-active-err { background:rgba(255,64,64,.10); color:var(--dh-red);   border-color:rgba(255,64,64,.25); }
.b-resolved   { background:rgba(0,232,122,.08); color:var(--dh-green); border-color:rgba(0,232,122,.20); opacity:.65; }

.b-err-nodata { background:rgba(255,120,32,.12); color:var(--dh-orange); border-color:rgba(255,120,32,.28); }
.b-err-range  { background:rgba(255,64,64,.12);  color:var(--dh-red);    border-color:rgba(255,64,64,.28); }
.b-err-parse  { background:rgba(168,85,247,.12); color:var(--dh-purple); border-color:rgba(168,85,247,.28); }
.b-err-mqtt   { background:rgba(255,184,0,.12);  color:var(--dh-amber);  border-color:rgba(255,184,0,.28); }
.b-err-fault  { background:rgba(255,64,64,.14);  color:var(--dh-red);    border-color:rgba(255,64,64,.35); }

/* ── device table cells ──────────────────────────────────────── */
.dev-id    { font-family:var(--dh-mono); font-size:9px; color:var(--dh-cyan); }
.dev-name-cell { max-width:155px; overflow:hidden; text-overflow:ellipsis; font-size:11px; color:var(--dh-text); }
.dev-type  { font-size:9px; color:var(--dh-text3); }
.dev-topic-cell { max-width:140px; overflow:hidden; text-overflow:ellipsis; color:var(--dh-text3); font-size:8.5px; }
.dev-val   { font-size:10px; color:var(--dh-text3); }
.dev-val.val-live { color:var(--dh-amber); }
.dev-unit  { font-size:8px; color:var(--dh-text3); }
.err-flag  { color:var(--dh-red); font-size:10px; margin-left:4px; }

/* ── signal quality ──────────────────────────────────────────── */
.sq-wrap { display:flex; align-items:center; gap:5px; }
.sq-bar  { width:50px; height:4px; background:rgba(40,55,75,.7); border-radius:2px; overflow:hidden; }
.sq-fill { height:100%; border-radius:2px; transition:width .6s ease; }
.sq-pct  { font-size:9px; min-width:24px; text-align:right; }

/* ── last seen ───────────────────────────────────────────────── */
.last-seen { font-size:8.5px; color:var(--dh-text3); }
.ls-recent { color:var(--dh-green) !important; }
.ls-stale  { color:var(--dh-amber) !important; }
.ls-dead   { color:var(--dh-red)   !important; }

/* ── error log cells ─────────────────────────────────────────── */
.ts-cell     { font-size:8.5px; color:var(--dh-text3); white-space:nowrap; }
.dev-name-sm { font-size:8px; color:var(--dh-text3); }
.detail-cell { max-width:175px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dh-text2); font-size:9px; }
.err-val     { font-size:9px; color:var(--dh-orange); font-family:var(--dh-mono); }

/* ── resolve button ──────────────────────────────────────────── */
.res-btn {
  font-family:var(--dh-mono); font-size:8px; font-weight:700;
  padding:2px 8px; border-radius:4px; cursor:pointer;
  border:1px solid rgba(0,232,122,.25); background:rgba(0,232,122,.07);
  color:var(--dh-green); transition:all .15s; white-space:nowrap;
}
.res-btn:hover:not(:disabled) { background:rgba(0,232,122,.15); }
.res-btn:disabled { opacity:.35; cursor:default; }

/* ── empty state ─────────────────────────────────────────────── */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  height:100px; gap:6px; color:var(--dh-text3); font-size:10px;
}
.es-icon { font-size:26px; opacity:.4; }

/* ── theme toggle button ─────────────────────────────────────── */
.btn-theme {
  background: rgba(255,255,255,.08); color:var(--dh-text2);
  border-color: var(--dh-bdr2);
}
.btn-theme:hover { background: rgba(255,255,255,.15); }

/* ── LIGHT THEME overrides ───────────────────────────────────── */
.dh-light {
  --dh-bg0:   #f0f2f5;
  --dh-bg1:   #ffffff;
  --dh-bg2:   #f7f9fc;
  --dh-bg3:   #eef1f6;
  --dh-bdr:   #dde3ec;
  --dh-bdr2:  #c8d3e0;
  --dh-bdr3:  #a0b0c4;
  --dh-cyan:  #0088bb;
  --dh-green: #1a8a50;
  --dh-amber: #b07800;
  --dh-red:   #cc2222;
  --dh-orange:#cc5500;
  --dh-purple:#7c3aed;
  --dh-text:  #1a2535;
  --dh-text2: #4a5f78;
  --dh-text3: #8aa0b8;
  background: var(--dh-bg0); color: var(--dh-text);
}
.dh-light .summary-bar { background: #ffffff; border-bottom-color: var(--dh-bdr2); }
.dh-light .panel-hdr   { background: #f7f9fc; border-bottom-color: var(--dh-bdr2); }
.dh-light .filter-row  { background: #f0f2f5; border-bottom-color: var(--dh-bdr);  }
.dh-light .dh-table thead th { background: #eef1f6; color: var(--dh-text2); }
.dh-light .dh-table tbody tr:hover { background: rgba(0,136,187,.05); }
.dh-light .dh-table tbody tr { border-bottom-color: rgba(0,0,0,.06); }
.dh-light .panel-left  { border-right-color: var(--dh-bdr2); }
.dh-light .sb-item     { border-right-color: var(--dh-bdr2); }
.dh-light .sb-sep      { border-right-color: var(--dh-bdr3); }

.dh-light .f-btn       { color: var(--dh-text2); border-color: var(--dh-bdr2); }
.dh-light .f-btn:hover { background: rgba(0,0,0,.05); color: var(--dh-text); }
.dh-light .f-btn.active       { background: rgba(0,136,187,.12); color:var(--dh-cyan); border-color:rgba(0,136,187,.4); }
.dh-light .f-btn.f-grn.active { background: rgba(26,138,80,.10);  color:var(--dh-green); border-color:rgba(26,138,80,.35); }
.dh-light .f-btn.f-red.active { background: rgba(204,34,34,.10);  color:var(--dh-red);   border-color:rgba(204,34,34,.35); }
.dh-light .f-btn.f-amb.active { background: rgba(176,120,0,.10);  color:var(--dh-amber); border-color:rgba(176,120,0,.35); }

.dh-light .f-search,
.dh-light .f-select {
  background: #ffffff; color: var(--dh-text);
  border-color: var(--dh-bdr2);
}

.dh-light .act-btn { border-color: var(--dh-bdr2); }
.dh-light .btn-theme  { background: rgba(0,0,0,.05); color:var(--dh-text2); border-color:var(--dh-bdr2); }
.dh-light .btn-cyan   { background: rgba(0,136,187,.10); color:var(--dh-cyan);  border-color:rgba(0,136,187,.3); }
.dh-light .btn-amber  { background: rgba(176,120,0,.10);  color:var(--dh-amber); border-color:rgba(176,120,0,.3); }
.dh-light .btn-green  { background: rgba(26,138,80,.10);  color:var(--dh-green); border-color:rgba(26,138,80,.3);  }

.dh-light .b-online  { background: rgba(26,138,80,.12);  color:var(--dh-green); border-color:rgba(26,138,80,.3);  }
.dh-light .b-offline { background: rgba(204,34,34,.10);  color:var(--dh-red);   border-color:rgba(204,34,34,.3);  }
.dh-light .b-unknown { background: rgba(0,0,0,.06);      color:var(--dh-text3); border-color:var(--dh-bdr2);      }
.dh-light .b-active-err { background:rgba(204,34,34,.09); color:var(--dh-red);   border-color:rgba(204,34,34,.25); }
.dh-light .b-resolved   { background:rgba(26,138,80,.08);  color:var(--dh-green); border-color:rgba(26,138,80,.22); }
.dh-light .b-err-nodata { background:rgba(204,85,0,.10);   color:var(--dh-orange); border-color:rgba(204,85,0,.28); }
.dh-light .b-err-range  { background:rgba(204,34,34,.10);  color:var(--dh-red);    border-color:rgba(204,34,34,.28); }
.dh-light .b-err-parse  { background:rgba(124,58,237,.10); color:var(--dh-purple); border-color:rgba(124,58,237,.28); }
.dh-light .b-err-mqtt   { background:rgba(176,120,0,.10);  color:var(--dh-amber);  border-color:rgba(176,120,0,.28); }
.dh-light .b-err-fault  { background:rgba(204,34,34,.12);  color:var(--dh-red);    border-color:rgba(204,34,34,.35); }

.dh-light .panel-count { background: var(--dh-bg3); color: var(--dh-text2); }
.dh-light .dev-id      { color: var(--dh-cyan); }
.dh-light .dev-val.val-live { color: var(--dh-amber); }
.dh-light .ts-cell,
.dh-light .dev-name-sm { color: var(--dh-text3); }
.dh-light .detail-cell { color: var(--dh-text2); }
.dh-light .err-val     { color: var(--dh-orange); }
.dh-light .res-btn { border-color:rgba(26,138,80,.3); background:rgba(26,138,80,.07); color:var(--dh-green); }
.dh-light .res-btn:hover:not(:disabled) { background:rgba(26,138,80,.15); }
.dh-light .row-err  { background: rgba(204,34,34,.04)  !important; }
.dh-light .row-warn { background: rgba(204,85,0,.03)   !important; }
.dh-light .sq-bar   { background: rgba(0,0,0,.1); }
.dh-light .refresh-dot { background: var(--dh-cyan); }
</style>
