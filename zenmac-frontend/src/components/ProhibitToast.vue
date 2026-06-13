<template>
  <teleport to="body">
    <div class="prohibit-toast-container" aria-live="assertive" aria-atomic="false">
      <transition-group name="toast-slide" tag="div" class="prohibit-toast-stack">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="prohibit-toast"
          role="alert"
        >
          <div class="prohibit-toast__header">
            <span class="prohibit-toast__badge" :style="{ color: badgeColor(t.code) }">
              {{ t.code }}
            </span>
            <span class="prohibit-toast__time">{{ t.time }}</span>
            <button class="prohibit-toast__close" @click="dismiss(t.id)" aria-label="Close">×</button>
          </div>
          <div class="prohibit-toast__reason">{{ t.reason }}</div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
const BADGE_COLORS = {
  AUTHORITY_BLOCK: '#ff4040',
  OFFLINE_BLOCK:   '#8aa2b8',
  MODE_CONFLICT:   '#ffb800',
  DUPLICATE_OP:    '#a855f7',
  COOLDOWN_LOCK:   '#00d4ff',
};
const MAX_TOASTS  = 3;
const AUTO_DISMISS = 4000;

let _uid = 0;

export default {
  name: 'ProhibitToast',

  data() {
    return {
      toasts: [],
    };
  },

  mounted() {
    this._timers = {};
    this._handler = (e) => this.push(e.detail);
    window.addEventListener('prohibit-block', this._handler);
  },

  beforeUnmount() {
    window.removeEventListener('prohibit-block', this._handler);
    Object.values(this._timers).forEach(clearTimeout);
  },

  methods: {
    push({ code, reason }) {
      if (this.toasts.length >= MAX_TOASTS) {
        const oldest = this.toasts[this.toasts.length - 1];
        this.dismiss(oldest.id);
      }

      const id = ++_uid;
      const now = new Date();
      const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      this.toasts.unshift({ id, code, reason, time });

      this._timers[id] = setTimeout(() => this.dismiss(id), AUTO_DISMISS);
    },

    dismiss(id) {
      clearTimeout(this._timers[id]);
      delete this._timers[id];
      const idx = this.toasts.findIndex((t) => t.id === id);
      if (idx !== -1) this.toasts.splice(idx, 1);
    },

    badgeColor(code) {
      return BADGE_COLORS[code] ?? '#8aa2b8';
    },
  },
};
</script>

<style scoped>
.prohibit-toast-container {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.prohibit-toast-stack {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 8px;
}

.prohibit-toast {
  pointer-events: all;
  min-width: 320px;
  max-width: 480px;
  padding: 12px 14px 10px;
  background: rgba(255, 64, 64, 0.12);
  border: 1px solid rgba(255, 64, 64, 0.35);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}

.prohibit-toast__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.prohibit-toast__badge {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex: 1 1 auto;
}

.prohibit-toast__time {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  color: #8aa2b8;
  white-space: nowrap;
}

.prohibit-toast__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #8aa2b8;
  font-size: 16px;
  line-height: 1;
  padding: 0 2px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.prohibit-toast__close:hover { color: #ff4040; }

.prohibit-toast__reason {
  font-family: 'Rajdhani', 'Sarabun', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #c8d8e8;
  line-height: 1.4;
}

/* transition */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.toast-slide-move {
  transition: transform 0.25s ease;
}
</style>
