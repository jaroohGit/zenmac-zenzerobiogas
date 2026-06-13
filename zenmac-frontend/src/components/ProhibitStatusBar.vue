<template>
  <div class="psb-bar">
    <!-- ── LEFT ── -->
    <div class="psb-left">
      <!-- Authority pill -->
      <span class="psb-pill" :style="authorityStyle">{{ authorityLabel }}</span>

      <!-- Mode pill (only when set) -->
      <span v-if="store.currentMode" class="psb-pill psb-pill-mode">
        <span class="psb-pulse-dot"></span>
        {{ store.currentMode.replace(/_/g, '-') }}
      </span>
    </div>

    <!-- ── RIGHT ── -->
    <div class="psb-right">
      <!-- Active blocks badge -->
      <span v-if="blockCount > 0" class="psb-blocks">
        ⚠ {{ blockCount }} BLOCK{{ blockCount > 1 ? 'S' : '' }}
      </span>

      <!-- Last 3 ops -->
      <span
        v-for="op in recentOps"
        :key="op.id"
        class="psb-op-chip"
        :title="op.action + ' @ ' + op.page"
      >{{ op.action }}&nbsp;<span class="psb-op-time">{{ fmtTime(op.ts) }}</span></span>
    </div>
  </div>
</template>

<script>
import { useProhibitStore } from '@/stores/useProhibitStore';
import { useMqttStore }     from '@/stores/useMqttStore';

const AUTHORITY_STYLES = {
  local: { background: 'rgba(255,64,64,0.22)',   color: '#ff4040', border: '1px solid rgba(255,64,64,0.45)' },
  hmi:   { background: 'rgba(255,184,0,0.18)',   color: '#ffb800', border: '1px solid rgba(255,184,0,0.4)' },
  web:   { background: 'rgba(0,212,255,0.12)',   color: '#00d4ff', border: '1px solid rgba(0,212,255,0.35)' },
};
const AUTHORITY_LABELS = { local: '🖥 LOCAL', hmi: '📺 HMI', web: '🌐 WEB' };

export default {
  name: 'ProhibitStatusBar',

  setup() {
    return {
      store: useProhibitStore(),
      mqtt:  useMqttStore(),
    };
  },

  computed: {
    authorityStyle() {
      return AUTHORITY_STYLES[this.mqtt.authorityTier] ?? AUTHORITY_STYLES.web;
    },
    authorityLabel() {
      return AUTHORITY_LABELS[this.mqtt.authorityTier] ?? '🌐 WEB';
    },
    blockCount() {
      return this.store.activeBlocks.length;
    },
    recentOps() {
      return this.store.operationLog.slice(0, 3);
    },
  },

  methods: {
    fmtTime(iso) {
      const d = new Date(iso);
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    },
  },
};
</script>

<style scoped>
.psb-bar {
  display:          flex;
  align-items:      center;
  justify-content:  space-between;
  height:           32px;
  padding:          0 14px;
  border-bottom:    1px solid var(--border2, rgba(255,255,255,0.07));
  background:       var(--bg1, #0d1117);
  font-family:      'JetBrains Mono', 'Courier New', monospace;
  font-size:        9px;
  letter-spacing:   0.04em;
  overflow:         hidden;
  flex-shrink:      0;
}

.psb-left,
.psb-right {
  display:     flex;
  align-items: center;
  gap:         6px;
  overflow:    hidden;
}

/* ── Pills ── */
.psb-pill {
  display:       inline-flex;
  align-items:   center;
  gap:           4px;
  padding:       2px 7px;
  border-radius: 4px;
  font-weight:   700;
  font-size:     9px;
  white-space:   nowrap;
}

.psb-pill-mode {
  background: rgba(0,200,170,0.14);
  color:      #00c8aa;
  border:     1px solid rgba(0,200,170,0.35);
}

/* pulse dot */
.psb-pulse-dot {
  width:            6px;
  height:           6px;
  border-radius:    50%;
  background:       #00c8aa;
  flex-shrink:      0;
  animation:        psb-pulse 1.4s ease-in-out infinite;
}

@keyframes psb-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.7); }
}

/* ── Right side ── */
.psb-blocks {
  color:       #ff4040;
  font-weight: 700;
  white-space: nowrap;
  padding:     2px 6px;
  border-radius: 4px;
  background:  rgba(255,64,64,0.1);
  border:      1px solid rgba(255,64,64,0.3);
}

.psb-op-chip {
  padding:       2px 6px;
  border-radius: 3px;
  background:    rgba(255,255,255,0.04);
  border:        1px solid rgba(255,255,255,0.08);
  color:         var(--text2, #8aa2b8);
  white-space:   nowrap;
  max-width:     200px;
  overflow:      hidden;
  text-overflow: ellipsis;
}

.psb-op-time {
  color: var(--text3, #5a7080);
}
</style>
