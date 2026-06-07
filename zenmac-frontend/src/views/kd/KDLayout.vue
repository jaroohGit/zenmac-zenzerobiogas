<template>
  <div id="kd-layout-wrapper" :class="{ 'sidebar-collapsed': collapsed }">

    <!-- ── TOP BAR ─────────────────────────────────────────────── -->
    <header class="kd-topbar">
      <div class="kd-topbar-left">
        <button class="kd-toggle-btn" @click="collapsed = !collapsed">
          <i class="bx" :class="collapsed ? 'bx-menu' : 'bx-menu-alt-left'"></i>
        </button>
        <div class="kd-topbar-brand">
          <span class="kd-topbar-system">STA-KD</span>
          <span class="kd-topbar-sep">›</span>
          <span class="kd-topbar-page">{{ currentPageTitle }}</span>
        </div>
      </div>
      <div class="kd-topbar-right">
        <div class="kd-mqtt-pill" :class="mqttClass" title="MQTT Status">
          <span class="kd-mqtt-dot"></span>
          <span class="kd-mqtt-txt">{{ mqttConnected ? 'ONLINE' : (mqttReconnecting ? 'RECONNECTING' : 'OFFLINE') }}</span>
        </div>
        <div class="kd-topbar-clock">{{ clock }}</div>
        <router-link to="/kd" class="kd-topbar-home" title="Landing page">
          <i class="bx bx-home-alt"></i>
        </router-link>
      </div>
    </header>

    <!-- ── SIDEBAR ──────────────────────────────────────────────── -->
    <aside class="kd-sidebar">
      <!-- Logo -->
      <div class="kd-sidebar-logo">
        <div class="kd-logo-icon">
          <div class="lb lb1"></div>
          <div class="lb lb2"></div>
          <div class="lb lb3"></div>
          <div class="lb lb4"></div>
          <div class="lb lb5"></div>
          <div class="lb lb6"></div>
        </div>
        <transition name="fade">
          <div v-if="!collapsed" class="kd-sidebar-logo-text">
            <div class="kd-sidebar-logo-name">ZenMAC</div>
            <div class="kd-sidebar-logo-sub">ZENZERO MONITOR ANALYSIS &amp; CONTROL</div>
          </div>
        </transition>
      </div>

      <div class="kd-sidebar-divider"></div>

      <!-- Menu label -->
      <div class="kd-sidebar-section-label" v-if="!collapsed">MAIN MENU</div>

      <!-- Nav items -->
      <nav class="kd-sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="kd-nav-link"
          :class="{ active: $route.path.startsWith(item.to) }"
          :title="collapsed ? item.label : ''"
        >
          <span class="kd-nav-icon"><i :class="item.icon"></i></span>
          <transition name="fade">
            <span v-if="!collapsed" class="kd-nav-label">{{ item.label }}</span>
          </transition>
          <transition name="fade">
            <span v-if="!collapsed && item.badge" class="kd-nav-badge" :class="item.badgeClass">{{ item.badge }}</span>
          </transition>
        </router-link>
      </nav>

      <!-- Bottom: live status -->
      <div class="kd-sidebar-bottom">
        <div class="kd-sidebar-divider"></div>
        <div class="kd-live-row">
          <span class="kd-live-dot"></span>
          <transition name="fade">
            <span v-if="!collapsed" class="kd-live-label">LIVE DATA</span>
          </transition>
        </div>
        <div v-if="!collapsed" class="kd-sidebar-mini-kpi">
          <div class="mini-kpi-row">
            <span class="mini-kpi-label">Serum</span>
            <span class="mini-kpi-val c-orange">{{ fmtNum(serumFlow) }} m³/hr</span>
          </div>
          <div class="mini-kpi-row">
            <span class="mini-kpi-label">Latex</span>
            <span class="mini-kpi-val c-teal">{{ fmtNum(processFlow) }} m³/hr</span>
          </div>
          <div class="mini-kpi-row">
            <span class="mini-kpi-label">ORP avg</span>
            <span class="mini-kpi-val c-cyan">{{ combinedORP }} mV</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── MAIN CONTENT ─────────────────────────────────────────── -->
    <main class="kd-main-content">
      <!-- Breadcrumb -->
      <div class="kd-breadcrumb">
        <router-link to="/kd" class="bc-link">
          <i class="bx bx-home-alt"></i> Home
        </router-link>
        <span class="bc-sep">›</span>
        <span class="bc-current">{{ currentPageTitle }}</span>
        <div class="bc-right">
          <span class="bc-date">{{ dateStr }}</span>
        </div>
      </div>

      <router-view />
    </main>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

const NAV = [
  { to: '/kd/app/overview',       label: 'Overview',          icon: 'bx bx-map-alt',          badge: 'LIVE', badgeClass: 'badge-live' },
  { to: '/kd/app/executive',      label: 'Executive Summary', icon: 'bx bx-bar-chart-alt-2',  badge: null },
  { to: '/kd/app/daily-report',   label: 'Daily Report',      icon: 'bx bx-file-blank',        badge: null },
  { to: '/kd/app/remote-control', label: 'Remote Control',    icon: 'bx bx-joystick',          badge: null },
];

const PAGE_TITLES = {
  '/kd/app/overview':       'Overview',
  '/kd/app/executive':      'Executive Summary',
  '/kd/app/daily-report':   'Daily Report',
  '/kd/app/remote-control': 'Remote Control',
};

export default {
  name: 'KDLayout',
  data() {
    return {
      navItems: NAV,
      collapsed: false,
      clock: '',
      dateStr: '',
    };
  },
  computed: {
    ...mapState('staKd', ['mqttConnected', 'mqttReconnecting', 'mqttBroker']),
    ...mapGetters('staKd', [
      'serumFlow', 'processFlow', 'blowerTotalPower', 'combinedORP',
    ]),
    mqttClass() {
      if (this.mqttConnected) return 'connected';
      if (this.mqttReconnecting) return 'reconnecting';
      return 'disconnected';
    },
    currentPageTitle() {
      return PAGE_TITLES[this.$route.path] || 'Dashboard';
    },
  },
  created() {
    this.$store.dispatch('staKd/initSocket');
    this.$store.dispatch('staKd/fetchState');
    this.tickClock();
    this._clockTimer = setInterval(this.tickClock, 1000);
  },
  beforeUnmount() {
    clearInterval(this._clockTimer);
  },
  methods: {
    tickClock() {
      const n = new Date();
      const p = v => String(v).padStart(2, '0');
      this.clock = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
      this.dateStr = n.toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    },
    fmtNum(v) {
      const n = parseFloat(v);
      return isNaN(n) ? '—' : n.toFixed(1);
    },
  },
};
</script>

<style>
/* Global reset for kd layout */
#kd-layout-wrapper *, #kd-layout-wrapper *::before, #kd-layout-wrapper *::after {
  box-sizing: border-box;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

/* ── CSS VARS ── */
#kd-layout-wrapper {
  --sidebar-w: 220px;
  --sidebar-w-collapsed: 64px;
  --topbar-h: 56px;
  --bg0: #0a0d11;
  --bg1: #0d1015;
  --bg2: #131720;
  --bg3: #181d26;
  --border: rgba(255,255,255,.07);
  --border2: rgba(255,255,255,.1);
  --cyan: #00d4ff;
  --amber-brand: #d4a040;
  --green: #00e87a;
  --orange: #ff7820;
  --teal: #00c8b0;
  --amber: #ffb800;
  --text: #d0d8e4;
  --text2: rgba(255,255,255,.45);
  --text3: rgba(255,255,255,.22);

  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg0);
  color: var(--text);
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* ── TOPBAR ── */
.kd-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: var(--topbar-h);
  background: rgba(10,15,24,.97);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  backdrop-filter: blur(8px);
}
.kd-topbar-left { display: flex; align-items: center; gap: 12px; }
.kd-toggle-btn {
  background: none; border: 1px solid var(--border2);
  color: var(--text2); border-radius: 6px;
  width: 34px; height: 34px; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.kd-toggle-btn:hover { border-color: var(--cyan); color: var(--cyan); }
.kd-topbar-brand { display: flex; align-items: center; gap: 6px; }
.kd-topbar-system { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: .04em; }
.kd-topbar-sep { color: var(--text3); font-size: 16px; }
.kd-topbar-page { font-size: 14px; color: var(--text2); font-weight: 600; }
.kd-topbar-right { display: flex; align-items: center; gap: 10px; }
.kd-topbar-clock {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; color: var(--amber-brand);
  background: rgba(212,160,64,.07);
  border: 1px solid rgba(212,160,64,.2);
  padding: 3px 10px; border-radius: 5px; letter-spacing: .06em;
}
.kd-topbar-home {
  font-size: 18px; color: var(--text2);
  background: var(--bg2); border: 1px solid var(--border2);
  width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; transition: all .2s;
}
.kd-topbar-home:hover { color: var(--cyan); border-color: var(--cyan); }

/* MQTT pill */
.kd-mqtt-pill {
  display: flex; align-items: center; gap: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  padding: 3px 10px; border-radius: 5px; letter-spacing: .06em;
  border: 1px solid var(--border2); color: var(--text2);
}
.kd-mqtt-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text3); }
.kd-mqtt-pill.connected .kd-mqtt-dot { background: var(--green); box-shadow: 0 0 4px var(--green); }
.kd-mqtt-pill.connected .kd-mqtt-txt { color: var(--green); }
.kd-mqtt-pill.reconnecting .kd-mqtt-dot { background: var(--amber); }
.kd-mqtt-pill.reconnecting .kd-mqtt-txt { color: var(--amber); }

/* ── SIDEBAR ── */
.kd-sidebar {
  position: fixed; top: var(--topbar-h); left: 0; bottom: 0; z-index: 100;
  width: var(--sidebar-w);
  background: rgba(10,15,24,.98);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow: hidden;
  transition: width .25s ease;
}
.sidebar-collapsed .kd-sidebar { width: var(--sidebar-w-collapsed); }

.kd-sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 14px 12px;
  flex-shrink: 0;
}

/* CSS bar chart icon — same as Landing page */
.kd-logo-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: #12161e;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  display: flex; align-items: flex-end; justify-content: center;
  gap: 3px; padding: 7px 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.05);
}
.lb { border-radius: 1.5px 1.5px 0 0; width: 4px; flex-shrink: 0; }
.lb1 { height: 52%; background: linear-gradient(to top, #6a0e0e, #a82828); }
.lb2 { height: 82%; background: linear-gradient(to top, #a82828, #cc3818); }
.lb3 { height: 100%; background: linear-gradient(to top, #cc3818, #e06020); }
.lb4 { height: 76%; background: linear-gradient(to top, #e07020, #d4a040); }
.lb5 { height: 60%; background: linear-gradient(to top, #c89030, #c8a040); }
.lb6 { height: 40%; background: linear-gradient(to top, #886010, #a88020); }

.kd-sidebar-logo-name {
  font-family: 'Inter', sans-serif;
  font-size: 20px; font-weight: 900; letter-spacing: -.02em; line-height: 1;
  background: linear-gradient(135deg, #e8a020 0%, #d4a040 35%, #f0c060 65%, #c89030 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.kd-sidebar-logo-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 6.5px; color: var(--text3); letter-spacing: .08em; margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 148px;
}

.kd-sidebar-divider { height: 1px; background: var(--border); margin: 0 12px; flex-shrink: 0; }

.kd-sidebar-section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: .12em; color: var(--text3);
  padding: 10px 16px 4px; flex-shrink: 0;
}

/* Nav links */
.kd-sidebar-nav { flex: 1; padding: 6px 8px; overflow-y: auto; scrollbar-width: none; }
.kd-sidebar-nav::-webkit-scrollbar { display: none; }

.kd-nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 10px; border-radius: 8px; margin-bottom: 3px;
  text-decoration: none; color: var(--text2);
  font-size: 14px; font-weight: 600; letter-spacing: .02em;
  transition: all .18s; white-space: nowrap; overflow: hidden;
  border: 1px solid transparent;
}
.kd-nav-link:hover { background: var(--bg2); color: var(--text); border-color: var(--border); }
.kd-nav-link.active {
  background: rgba(212,160,64,.1);
  color: var(--amber-brand); border-color: rgba(212,160,64,.25);
}
.kd-nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
.kd-nav-label { flex: 1; }
.kd-nav-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px; letter-spacing: .08em;
  padding: 2px 6px; border-radius: 3px;
}
.badge-live { background: rgba(0,232,122,.2); color: var(--green); border: 1px solid rgba(0,232,122,.35); }

/* Bottom KPI */
.kd-sidebar-bottom { flex-shrink: 0; padding: 8px; }
.kd-live-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 8px 4px;
}
.kd-live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--green); box-shadow: 0 0 5px var(--green);
  animation: blink 2s infinite; flex-shrink: 0;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
.kd-live-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .1em; color: var(--text3); }

.kd-sidebar-mini-kpi { padding: 4px 8px 8px; }
.mini-kpi-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
.mini-kpi-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text3); }
.mini-kpi-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; }
.c-orange { color: #ff7820; }
.c-teal   { color: #00c8b0; }
.c-cyan   { color: #00d4ff; }

/* ── MAIN ── */
.kd-main-content {
  margin-left: var(--sidebar-w);
  margin-top: var(--topbar-h);
  flex: 1;
  overflow-y: auto;
  transition: margin-left .25s ease;
  display: flex; flex-direction: column;
  min-height: calc(100vh - var(--topbar-h));
}
.sidebar-collapsed .kd-main-content { margin-left: var(--sidebar-w-collapsed); }

/* Breadcrumb */
.kd-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  background: var(--bg1);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.bc-link {
  color: var(--text2); text-decoration: none;
  display: flex; align-items: center; gap: 4px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
}
.bc-link:hover { color: var(--cyan); }
.bc-sep { color: var(--text3); }
.bc-current { color: var(--text); font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.bc-right { margin-left: auto; }
.bc-date { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3); }

/* ── TRANSITION ── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  :root { --sidebar-w: 200px; }
  .kd-mqtt-txt { display: none; }
}
</style>
