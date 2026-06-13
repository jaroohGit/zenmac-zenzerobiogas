<template>
  <div class="rd-page">

    <!-- ── Title Bar ── -->
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--purple,#a855f7)"></div>
      <h1 class="kd-page-title">R&amp;D DEMO CONTROL</h1>
      <span class="rd-dev-badge">DEV ONLY</span>
      <span class="kd-breadcrumb">STA-KD / R&amp;D</span>
    </div>

    <ProhibitStatusBar />

    <!-- ── Web Authority Control Panel (same as AutoMode) ── -->
    <div class="wcp-panel">
      <div class="wcp-left">
        <div class="wcp-dot" :class="mqttStore.mqttConnected ? 'wcp-dot-on' : 'wcp-dot-off'"></div>
        <span class="wcp-label">WEB CONTROL</span>
        <span class="wcp-authority-chip" :class="'wcp-auth-' + mqttStore.authorityTier">
          {{ { local: '🖥 LOCAL', hmi: '📺 HMI', web: '🌐 WEB' }[mqttStore.authorityTier] }}
        </span>
        <span class="wcp-status-ts" v-if="statusTs">polled {{ statusTs }}</span>
      </div>
      <div class="wcp-right">
        <button v-if="mqttStore.authorityTier !== 'web'"
                class="wcp-btn wcp-btn-request" @click="requestControl"
                :disabled="loadingBtns['REQUEST']">
          <span v-if="loadingBtns['REQUEST']" class="btn-spin"></span>
          <template v-else><i class="bx bx-upload"></i> REQUEST CONTROL</template>
        </button>
        <button v-else class="wcp-btn wcp-btn-release" @click="releaseControl"
                :disabled="loadingBtns['RELEASE']">
          <span v-if="loadingBtns['RELEASE']" class="btn-spin"></span>
          <template v-else><i class="bx bx-log-out"></i> RELEASE</template>
        </button>
        <button class="wcp-btn wcp-btn-status" @click="queryStatus"
                :disabled="loadingBtns['STATUS']">
          <span v-if="loadingBtns['STATUS']" class="btn-spin"></span>
          <template v-else><i class="bx bx-refresh"></i> STATUS</template>
        </button>
      </div>
    </div>

    <!-- Status expand -->
    <transition name="wcp-fade">
      <div v-if="statusVisible && statusData" class="wcp-status-panel">
        <div class="wcp-status-row">
          <span class="wcp-skey">MQTT</span>
          <span class="wcp-sval" :class="statusData.connected ? 'wcp-ok' : 'wcp-err'">
            {{ statusData.connected ? '● CONNECTED' : '○ DISCONNECTED' }}
          </span>
        </div>
        <div class="wcp-status-row">
          <span class="wcp-skey">AUTHORITY</span>
          <span class="wcp-sval">{{ statusData.authority }}</span>
        </div>
        <div class="wcp-status-row">
          <span class="wcp-skey">ACTIVE MODE</span>
          <span class="wcp-sval">{{ statusData.mode ? statusData.mode.replace(/_/g,'-') : '—' }}</span>
        </div>
        <div class="wcp-status-row">
          <span class="wcp-skey">OPERATIONS</span>
          <span class="wcp-sval">{{ statusData.opCount }} logged</span>
        </div>
        <div class="wcp-status-row">
          <span class="wcp-skey">ACTIVE BLOCKS</span>
          <span class="wcp-sval" :class="statusData.blocks > 0 ? 'wcp-warn' : 'wcp-ok'">
            {{ statusData.blocks > 0 ? '⚠ ' + statusData.blocks : '✓ NONE' }}
          </span>
        </div>
        <div class="wcp-status-row">
          <span class="wcp-skey">QUERIED AT</span>
          <span class="wcp-sval">{{ statusData.ts }}</span>
        </div>
      </div>
    </transition>

    <!-- Active mode bar -->
    <div v-if="prohibitStore.currentMode" class="kd-mode-bar">
      <span class="kd-mode-bar-label">● {{ prohibitStore.currentMode.replace(/_/g, '-') }} ACTIVE</span>
      <button class="kd-mode-bar-disable"
              @click="disableMode(prohibitStore.currentMode)"
              :disabled="loadingBtns['DISABLE_' + prohibitStore.currentMode]">
        <span v-if="loadingBtns['DISABLE_' + prohibitStore.currentMode]" class="btn-spin"></span>
        <template v-else>✕ DISABLE MODE</template>
      </button>
    </div>

    <!-- ── Main body ── -->
    <div class="rd-body">

      <!-- ─── LEFT: Demo Actions ─── -->
      <div class="rd-actions">

        <!-- ORP BANDS -->
        <div class="rd-section">
          <div class="rd-sec-hdr" style="--sc:#00d4ff">
            <div class="rd-sec-dot" style="background:#00d4ff"></div>
            <span>ORP BANDS</span>
            <span class="rd-sec-badge">cooldown 10s · blocks LOOP / TURNING</span>
          </div>
          <div class="rd-btn-row">
            <button class="rd-action-btn rd-btn-cyan"
                    @click="demoSaveOrpBands('1')"
                    :disabled="loadingBtns['ORP_1']">
              <span v-if="loadingBtns['ORP_1']" class="btn-spin"></span>
              <template v-else>SAVE ORP · BL-1</template>
            </button>
            <button class="rd-action-btn rd-btn-cyan"
                    @click="demoSaveOrpBands('2')"
                    :disabled="loadingBtns['ORP_2']">
              <span v-if="loadingBtns['ORP_2']" class="btn-spin"></span>
              <template v-else>SAVE ORP · BL-2</template>
            </button>
          </div>
        </div>

        <!-- LOOP CONTROL -->
        <div class="rd-section">
          <div class="rd-sec-hdr" style="--sc:#a855f7">
            <div class="rd-sec-dot" style="background:#a855f7"></div>
            <span>LOOP CONTROL</span>
            <span class="rd-sec-badge">cooldown 5s · blocks AIRFLOW / TURNING</span>
          </div>
          <div class="rd-btn-row">
            <button class="rd-action-btn rd-btn-purple"
                    @click="demoEnableLoop('1')"
                    :disabled="loadingBtns['LOOP_1']">
              <span v-if="loadingBtns['LOOP_1']" class="btn-spin"></span>
              <template v-else>ENABLE LOOP · BL-1</template>
            </button>
            <button class="rd-action-btn rd-btn-purple"
                    @click="demoEnableLoop('2')"
                    :disabled="loadingBtns['LOOP_2']">
              <span v-if="loadingBtns['LOOP_2']" class="btn-spin"></span>
              <template v-else>ENABLE LOOP · BL-2</template>
            </button>
          </div>
        </div>

        <!-- TURNING POINTS -->
        <div class="rd-section">
          <div class="rd-sec-hdr" style="--sc:#ffb800">
            <div class="rd-sec-dot" style="background:#ffb800"></div>
            <span>TURNING POINTS</span>
            <span class="rd-sec-badge">cooldown 15s · blocks AIRFLOW / LOOP</span>
          </div>
          <div class="rd-btn-row">
            <button class="rd-action-btn rd-btn-amber"
                    @click="demoApplyTurning"
                    :disabled="loadingBtns['TURNING']">
              <span v-if="loadingBtns['TURNING']" class="btn-spin"></span>
              <template v-else>APPLY TURNING POINT</template>
            </button>
          </div>
        </div>

        <!-- AIRFLOW-ORP -->
        <div class="rd-section">
          <div class="rd-sec-hdr" style="--sc:#00e87a">
            <div class="rd-sec-dot" style="background:#00e87a"></div>
            <span>AIRFLOW-ORP</span>
            <span class="rd-sec-badge">cooldown 5s · blocks LOOP / TURNING</span>
          </div>
          <div class="rd-btn-row">
            <button class="rd-action-btn rd-btn-green"
                    @click="demoEnableAirflow('1')"
                    :disabled="loadingBtns['ARP_1']">
              <span v-if="loadingBtns['ARP_1']" class="btn-spin"></span>
              <template v-else>AIRFLOW-ORP · BL-1</template>
            </button>
            <button class="rd-action-btn rd-btn-green"
                    @click="demoEnableAirflow('2')"
                    :disabled="loadingBtns['ARP_2']">
              <span v-if="loadingBtns['ARP_2']" class="btn-spin"></span>
              <template v-else>AIRFLOW-ORP · BL-2</template>
            </button>
          </div>
        </div>

        <!-- ─── SIMULATE HMI (demo only) ─── -->
        <div class="rd-section rd-section-sim">
          <div class="rd-sec-hdr" style="--sc:#ff4040">
            <div class="rd-sec-dot" style="background:#ff4040"></div>
            <span>SIMULATE AUTHORITY</span>
            <span class="rd-sec-badge rd-badge-warn">demo only — no MQTT</span>
          </div>
          <div class="rd-btn-row">
            <button class="rd-action-btn rd-btn-sim rd-sim-web"
                    @click="simAuthority('web')"
                    :class="{ 'rd-sim-active': mqttStore.authorityTier === 'web' }">
              🌐 WEB
            </button>
            <button class="rd-action-btn rd-btn-sim rd-sim-hmi"
                    @click="simAuthority('hmi')"
                    :class="{ 'rd-sim-active': mqttStore.authorityTier === 'hmi' }">
              📺 HMI RECLAIM
            </button>
            <button class="rd-action-btn rd-btn-sim rd-sim-local"
                    @click="simAuthority('local')"
                    :class="{ 'rd-sim-active': mqttStore.authorityTier === 'local' }">
              🖥 LOCAL RECLAIM
            </button>
          </div>
        </div>

      </div><!-- /rd-actions -->

      <!-- ─── RIGHT: Live Prohibit State ─── -->
      <div class="rd-state">

        <div class="rd-state-hdr">
          <div class="rd-sec-dot" style="background:#00d4ff"></div>
          LIVE PROHIBIT STATE
          <span class="rd-live-dot"></span>
        </div>

        <!-- KPIs -->
        <div class="rd-kpi-grid">
          <div class="rd-kpi">
            <div class="rd-kpi-lbl">AUTHORITY</div>
            <div class="rd-kpi-val" :class="'wcp-auth-' + mqttStore.authorityTier">
              {{ mqttStore.authorityTier.toUpperCase() }}
            </div>
          </div>
          <div class="rd-kpi">
            <div class="rd-kpi-lbl">MQTT</div>
            <div class="rd-kpi-val" :class="mqttStore.mqttConnected ? 'rd-ok' : 'rd-err'">
              {{ mqttStore.mqttConnected ? 'ONLINE' : 'OFFLINE' }}
            </div>
          </div>
          <div class="rd-kpi">
            <div class="rd-kpi-lbl">ACTIVE MODE</div>
            <div class="rd-kpi-val rd-val-mode">
              {{ prohibitStore.currentMode ? prohibitStore.currentMode.replace(/_/g,'-') : '—' }}
            </div>
          </div>
          <div class="rd-kpi">
            <div class="rd-kpi-lbl">BLOCKS</div>
            <div class="rd-kpi-val" :class="prohibitStore.activeBlocks.length > 0 ? 'rd-warn' : 'rd-ok'">
              {{ prohibitStore.activeBlocks.length || '—' }}
            </div>
          </div>
        </div>

        <!-- Active blocks list -->
        <div v-if="prohibitStore.activeBlocks.length" class="rd-blocks-list">
          <div class="rd-blocks-title">ACTIVE BLOCKS</div>
          <div v-for="b in prohibitStore.activeBlocks" :key="b.code" class="rd-block-item">
            <span class="rd-block-code">{{ b.code }}</span>
            <span class="rd-block-reason">{{ b.reason }}</span>
          </div>
        </div>

        <!-- Operation log -->
        <div class="rd-oplog">
          <div class="rd-oplog-hdr">
            OPERATION LOG
            <span class="rd-oplog-count">{{ prohibitStore.operationLog.length }}</span>
            <button class="rd-oplog-clear" @click="prohibitStore.operationLog.length = 0"
                    v-if="prohibitStore.operationLog.length">
              CLEAR
            </button>
          </div>
          <div class="rd-oplog-empty" v-if="!prohibitStore.operationLog.length">
            no operations yet
          </div>
          <div v-for="op in prohibitStore.operationLog.slice(0,10)" :key="op.id"
               class="rd-op-row">
            <span class="rd-op-action">{{ op.action }}</span>
            <span class="rd-op-page">{{ op.page }}</span>
            <span class="rd-op-mode">{{ op.mode || '—' }}</span>
            <span class="rd-op-ts">{{ fmtTs(op.ts) }}</span>
          </div>
        </div>

      </div><!-- /rd-state -->
    </div><!-- /rd-body -->

  </div>
</template>

<script>
import { useProhibit }   from '@/composables/useProhibit';
import { useMqttStore }  from '@/stores/useMqttStore';
import { on, getSocket } from '@/services/staKdSocket';

export default {
  name: 'RdDemoControl',

  setup() {
    const { guardedAction, store } = useProhibit();
    const mqtt = useMqttStore();
    return { guardedAction, prohibitStore: store, mqttStore: mqtt };
  },

  data() {
    return {
      loadingBtns:   {},
      statusVisible: false,
      statusData:    null,
      statusTs:      null,
    };
  },

  mounted() {
    getSocket();
    this._unsubAuthority = on('kd:authority', (data) => {
      if (data && data.tier) {
        this.mqttStore.setAuthorityTier(data.tier);
        if (data.tier !== 'web') this.statusVisible = false;
      }
    });
  },

  beforeUnmount() {
    if (this._unsubAuthority) this._unsubAuthority();
  },

  methods: {
    // ── Authority ────────────────────────────────────────────────────────
    requestControl() {
      this._startLoading('REQUEST');
      this.mqttStore.setAuthorityTier('web');
      this.statusVisible = false;
      console.log('[MQTT] kd:authority:request', { source: 'web', _meta: this._mqttMeta() });
    },
    releaseControl() {
      this._startLoading('RELEASE');
      this.mqttStore.setAuthorityTier('hmi');
      console.log('[MQTT] kd:authority:release', { source: 'web', target_tier: 'hmi', _meta: this._mqttMeta() });
    },
    queryStatus() {
      var self = this;
      this._startLoading('STATUS', 700);
      var ts = new Date().toLocaleTimeString('th-TH', { hour12: false });
      this.statusTs = ts;
      setTimeout(function() {
        self.statusData = {
          connected: self.mqttStore.mqttConnected,
          authority: self.mqttStore.authorityTier.toUpperCase(),
          mode:      self.prohibitStore.currentMode,
          opCount:   self.prohibitStore.operationLog.length,
          blocks:    self.prohibitStore.activeBlocks.length,
          ts:        ts,
        };
        self.statusVisible = true;
      }, 700);
      console.log('[MQTT] kd:status:request', { source: 'web', _meta: this._mqttMeta() });
    },

    // ── Demo guarded actions ─────────────────────────────────────────────
    demoSaveOrpBands(blower) {
      this.guardedAction('SAVE_ORP_BANDS', 'RD_DEMO', () => {
        this._startLoading('ORP_' + blower);
        this.prohibitStore.setMode('ORP_BANDS');
        console.log('[MQTT-DEMO] kd:orp-bands:set', { target: 'BL-' + blower, _meta: this._mqttMeta() });
      }, { cooldownMs: 10000, conflictModes: ['LOOP_CONTROL', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    demoEnableLoop(blower) {
      this.guardedAction('ENABLE_LOOP', 'RD_DEMO', () => {
        this._startLoading('LOOP_' + blower);
        this.prohibitStore.setMode('LOOP_CONTROL');
        console.log('[MQTT-DEMO] kd:loop-control:enable', { target: 'BL-' + blower, _meta: this._mqttMeta() });
      }, { cooldownMs: 5000, conflictModes: ['AIRFLOW_ORP', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    demoApplyTurning() {
      this.guardedAction('APPLY_TURNING_POINT', 'RD_DEMO', () => {
        this._startLoading('TURNING');
        this.prohibitStore.setMode('TURNING_POINTS');
        console.log('[MQTT-DEMO] kd:turning-points:apply', { _meta: this._mqttMeta() });
      }, { cooldownMs: 15000, conflictModes: ['AIRFLOW_ORP', 'LOOP_CONTROL'] });
    },

    demoEnableAirflow(blower) {
      this.guardedAction('ENABLE_AIRFLOW_ORP', 'RD_DEMO', () => {
        this._startLoading('ARP_' + blower);
        this.prohibitStore.setMode('AIRFLOW_ORP');
        console.log('[MQTT-DEMO] kd:airflow-orp:enable', { target: 'BL-' + blower, _meta: this._mqttMeta() });
      }, { cooldownMs: 5000, conflictModes: ['LOOP_CONTROL', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    disableMode(mode) {
      this.guardedAction('DISABLE_MODE', 'RD_DEMO', () => {
        this._startLoading('DISABLE_' + mode);
        this.prohibitStore.clearMode(mode);
        console.log('[MQTT-DEMO] kd:mode:disable', { mode, _meta: this._mqttMeta() });
      }, { cooldownMs: 2000, target: mode });
    },

    // ── Simulate authority (demo only, no MQTT) ──────────────────────────
    simAuthority(tier) {
      this.mqttStore.setAuthorityTier(tier);
      if (tier !== 'web') this.statusVisible = false;
    },

    // ── Helpers ──────────────────────────────────────────────────────────
    _mqttMeta() {
      return { source: 'web', token: null, ts: Date.now(), op_id: this._nanoid(), prohibit_check: 'PASSED' };
    },
    _nanoid(len) {
      var n = len || 8;
      return Math.random().toString(36).slice(2, 2 + n).padEnd(n, '0');
    },
    _startLoading(key, ms) {
      var delay = ms || 500;
      this.loadingBtns[key] = true;
      setTimeout(() => { this.loadingBtns[key] = false; }, delay);
    },
    fmtTs(iso) {
      return new Date(iso).toLocaleTimeString('th-TH', { hour12: false });
    },
  },
};
</script>

<style scoped>
/* ── Page shell ── */
.rd-page { display: flex; flex-direction: column; gap: 9px; }
.kd-page-title-bar { display: flex; align-items: center; gap: 9px; }
.kd-page-accent { width: 4px; height: 22px; border-radius: 2px; }
.kd-page-title {
  font-family: var(--font-ui); font-weight: 700; font-size: 18px; letter-spacing: .1em;
}
.rd-dev-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 800; letter-spacing: .1em;
  padding: 2px 8px; border-radius: 4px;
  background: rgba(168,85,247,.18); color: #c084fc; border: 1px solid rgba(168,85,247,.35);
}
.kd-breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-left: auto; }

/* ── Body split ── */
.rd-body {
  display: grid; grid-template-columns: 380px 1fr; gap: 12px; align-items: start;
}

/* ── Section cards ── */
.rd-actions { display: flex; flex-direction: column; gap: 8px; }

.rd-section {
  background: rgba(10,14,22,.9); border: 1px solid var(--border2); border-radius: 10px;
  padding: 12px 14px;
}
.rd-section-sim { border-color: rgba(255,64,64,.18); background: rgba(255,64,64,.03); }

.rd-sec-hdr {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  letter-spacing: .1em; color: rgba(200,220,240,.8);
}
.rd-sec-dot { width: 4px; height: 18px; border-radius: 2px; flex-shrink: 0; }
.rd-sec-badge {
  margin-left: auto; font-family: var(--font-mono); font-size: 8px;
  color: rgba(200,220,240,.25); letter-spacing: .06em;
}
.rd-badge-warn { color: rgba(255,100,80,.55); }

.rd-btn-row { display: flex; gap: 7px; flex-wrap: wrap; }

/* Action buttons */
.rd-action-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 7px 16px; border-radius: 6px; cursor: pointer; border: 1px solid;
  display: inline-flex; align-items: center; gap: 6px;
  transition: all .15s; letter-spacing: .05em; flex: 1;
  justify-content: center;
}
.rd-action-btn:disabled { opacity: .5; cursor: not-allowed; }

.rd-btn-cyan   { background: rgba(0,212,255,.1);  color: #00d4ff; border-color: rgba(0,212,255,.3); }
.rd-btn-cyan:hover:not(:disabled)   { background: rgba(0,212,255,.18); box-shadow: 0 0 10px rgba(0,212,255,.18); }

.rd-btn-purple { background: rgba(168,85,247,.1); color: #c084fc; border-color: rgba(168,85,247,.3); }
.rd-btn-purple:hover:not(:disabled) { background: rgba(168,85,247,.18); }

.rd-btn-amber  { background: rgba(255,184,0,.1);  color: #ffb800; border-color: rgba(255,184,0,.3); }
.rd-btn-amber:hover:not(:disabled)  { background: rgba(255,184,0,.18); }

.rd-btn-green  { background: rgba(0,232,122,.1);  color: #00e87a; border-color: rgba(0,232,122,.3); }
.rd-btn-green:hover:not(:disabled)  { background: rgba(0,232,122,.18); }

/* Simulate buttons */
.rd-btn-sim {
  background: rgba(255,255,255,.04); color: rgba(200,220,240,.4);
  border-color: rgba(255,255,255,.1); flex: 1;
}
.rd-sim-web.rd-sim-active   { background: rgba(0,212,255,.15);  color: #00d4ff; border-color: rgba(0,212,255,.4); }
.rd-sim-hmi.rd-sim-active   { background: rgba(255,184,0,.15);  color: #ffb800; border-color: rgba(255,184,0,.4); }
.rd-sim-local.rd-sim-active { background: rgba(255,64,64,.15);  color: #ff4040; border-color: rgba(255,64,64,.4); }
.rd-btn-sim:hover:not(.rd-sim-active) { border-color: rgba(255,255,255,.2); color: rgba(200,220,240,.7); }

/* ── Right panel: Live State ── */
.rd-state {
  background: rgba(10,14,22,.9); border: 1px solid var(--border2); border-radius: 10px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;
}

.rd-state-hdr {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  letter-spacing: .1em; color: rgba(200,220,240,.8);
}
.rd-live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #00e87a; margin-left: 2px;
  box-shadow: 0 0 8px rgba(0,232,122,.6);
  animation: rdlive 1.5s ease-in-out infinite;
}
@keyframes rdlive { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

/* KPI grid */
.rd-kpi-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.rd-kpi {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px; padding: 10px 12px;
}
.rd-kpi-lbl {
  font-family: var(--font-mono); font-size: 8px; font-weight: 700;
  color: rgba(200,220,240,.22); letter-spacing: .13em; margin-bottom: 4px;
}
.rd-kpi-val {
  font-family: var(--font-mono); font-size: 16px; font-weight: 800;
  color: rgba(200,220,240,.7); letter-spacing: .04em;
}
.rd-val-mode { font-size: 13px; }

/* re-use authority colors */
.wcp-auth-web   { color: #00d4ff; }
.wcp-auth-hmi   { color: #ffb800; }
.wcp-auth-local { color: #ff4040; }
.rd-ok   { color: #00e87a; }
.rd-err  { color: #ff4040; }
.rd-warn { color: #ffb800; }

/* Active blocks list */
.rd-blocks-list {
  border: 1px solid rgba(255,100,64,.2); border-radius: 7px; padding: 9px 11px;
  background: rgba(255,64,64,.04); display: flex; flex-direction: column; gap: 5px;
}
.rd-blocks-title {
  font-family: var(--font-mono); font-size: 8px; font-weight: 700;
  color: rgba(255,100,80,.5); letter-spacing: .12em; margin-bottom: 3px;
}
.rd-block-item { display: flex; align-items: baseline; gap: 8px; }
.rd-block-code {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  color: #ff6040; white-space: nowrap;
}
.rd-block-reason {
  font-family: var(--font-mono); font-size: 9px; color: rgba(200,220,240,.4);
}

/* Operation log */
.rd-oplog {
  border: 1px solid rgba(255,255,255,.07); border-radius: 7px; overflow: hidden;
}
.rd-oplog-hdr {
  display: flex; align-items: center; gap: 7px; padding: 7px 11px;
  background: rgba(255,255,255,.03);
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  color: rgba(200,220,240,.35); letter-spacing: .1em;
}
.rd-oplog-count {
  font-size: 10px; color: var(--cyan); font-weight: 800;
}
.rd-oplog-clear {
  margin-left: auto; font-family: var(--font-mono); font-size: 8px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px; cursor: pointer;
  background: rgba(255,64,64,.1); color: #ff6060; border: 1px solid rgba(255,64,64,.2);
  transition: all .15s;
}
.rd-oplog-clear:hover { background: rgba(255,64,64,.2); }
.rd-oplog-empty {
  padding: 14px 12px;
  font-family: var(--font-mono); font-size: 10px; color: rgba(200,220,240,.18);
  text-align: center;
}
.rd-op-row {
  display: grid; grid-template-columns: 2fr 1fr 1.2fr auto;
  gap: 6px; padding: 5px 11px;
  border-top: 1px solid rgba(255,255,255,.04);
  font-family: var(--font-mono); font-size: 9px;
}
.rd-op-action { color: #00d4ff; font-weight: 700; }
.rd-op-page   { color: rgba(200,220,240,.35); }
.rd-op-mode   { color: #a855f7; }
.rd-op-ts     { color: rgba(200,220,240,.22); white-space: nowrap; }

/* ══ Shared: Web Control Panel ══ */
.wcp-panel {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px;
  background: linear-gradient(90deg, rgba(0,212,255,.05) 0%, rgba(8,14,26,0) 70%);
  border: 1px solid rgba(0,212,255,.14); border-radius: 10px;
}
.wcp-left  { display: flex; align-items: center; gap: 10px; }
.wcp-right { display: flex; align-items: center; gap: 7px; }
.wcp-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.wcp-dot-on {
  background: #00e87a; box-shadow: 0 0 8px rgba(0,232,122,.6);
  animation: wcpdot 1.8s ease-in-out infinite;
}
.wcp-dot-off { background: #ff4040; }
@keyframes wcpdot { 0%,100%{opacity:1;} 50%{opacity:.35;} }
.wcp-label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  color: rgba(200,220,240,.4); letter-spacing: .1em;
}
.wcp-authority-chip {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; border: 1px solid; letter-spacing: .06em;
}
.wcp-auth-web   { color: #00d4ff; border-color: rgba(0,212,255,.4);  background: rgba(0,212,255,.1); }
.wcp-auth-hmi   { color: #ffb800; border-color: rgba(255,184,0,.4);  background: rgba(255,184,0,.1); }
.wcp-auth-local { color: #ff4040; border-color: rgba(255,64,64,.4);  background: rgba(255,64,64,.1); }
.wcp-status-ts { font-family: var(--font-mono); font-size: 9px; color: rgba(200,220,240,.22); }
.wcp-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 6px 14px; border-radius: 6px; cursor: pointer; border: 1px solid;
  display: inline-flex; align-items: center; gap: 6px;
  transition: all .15s; letter-spacing: .05em;
}
.wcp-btn:disabled { opacity: .5; cursor: not-allowed; }
.wcp-btn-request { background: rgba(0,232,122,.1); color: #00e87a; border-color: rgba(0,232,122,.3); }
.wcp-btn-request:hover:not(:disabled) { background: rgba(0,232,122,.18); box-shadow: 0 0 12px rgba(0,232,122,.2); }
.wcp-btn-release { background: rgba(255,184,0,.1); color: #ffb800; border-color: rgba(255,184,0,.3); }
.wcp-btn-release:hover:not(:disabled) { background: rgba(255,184,0,.18); }
.wcp-btn-status  { background: rgba(0,212,255,.08); color: var(--cyan); border-color: rgba(0,212,255,.25); }
.wcp-btn-status:hover:not(:disabled) { background: rgba(0,212,255,.15); box-shadow: 0 0 10px rgba(0,212,255,.15); }
.wcp-status-panel {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px;
  padding: 12px 16px; background: rgba(0,212,255,.035);
  border: 1px solid rgba(0,212,255,.11); border-radius: 8px;
}
.wcp-status-row  { display: flex; flex-direction: column; gap: 3px; }
.wcp-skey { font-family: var(--font-mono); font-size: 8px; font-weight: 700; color: rgba(200,220,240,.22); letter-spacing: .13em; }
.wcp-sval { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: rgba(200,220,240,.7); }
.wcp-ok   { color: #00e87a !important; }
.wcp-err  { color: #ff4040 !important; }
.wcp-warn { color: #ffb800 !important; }
.wcp-fade-enter-active, .wcp-fade-leave-active { transition: opacity .25s, transform .25s; }
.wcp-fade-enter-from { opacity: 0; transform: translateY(-6px); }
.wcp-fade-leave-to   { opacity: 0; transform: translateY(-4px); }

/* Active mode bar */
.kd-mode-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 14px; background: rgba(0,200,170,.07);
  border: 1px solid rgba(0,200,170,.25); border-radius: 8px;
}
.kd-mode-bar-label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  color: #00c8aa; letter-spacing: .07em;
}
.kd-mode-bar-disable {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 5px 12px; border-radius: 5px; cursor: pointer;
  background: rgba(255,64,64,.1); color: #ff4040; border: 1px solid rgba(255,64,64,.3);
  transition: all .15s; display: inline-flex; align-items: center; gap: 5px;
}
.kd-mode-bar-disable:hover { background: rgba(255,64,64,.18); }
.kd-mode-bar-disable:disabled { opacity: .5; cursor: not-allowed; }

/* Spinner */
.btn-spin {
  display: inline-block; width: 10px; height: 10px;
  border: 2px solid rgba(255,255,255,.25); border-top-color: currentColor;
  border-radius: 50%; animation: btn-spin .5s linear infinite; vertical-align: middle;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
</style>
