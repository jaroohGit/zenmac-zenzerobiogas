<template>
  <div class="kd-root" :class="{ 'kd-sidebar-open': sidebarOpen }" :style="themeVars">

    <!-- ── OVERLAY (mobile) ──────────────────────────────────────── -->
    <div class="kd-overlay" @click="closeSidebar"></div>

    <!-- ── HEADER ────────────────────────────────────────────────── -->
    <header class="kd-header">
      <!-- Hamburger (mobile only) -->
      <button class="kd-hamburger" @click="toggleSidebar" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      <router-link to="/" class="kd-logo-link" aria-label="Go to home">
        <div class="kd-logo-mark">
          <svg width="44" height="44" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoBox" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ff8c00"/>
                <stop offset="100%" stop-color="#c0392b"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="48" height="48" rx="10" ry="10" fill="#111820" stroke="url(#logoBox)" stroke-width="2.5"/>
            <rect x="8"  y="30" width="5" height="14" rx="2" fill="#c0392b"/>
            <rect x="15" y="24" width="5" height="20" rx="2" fill="#d4511e"/>
            <rect x="22" y="16" width="5" height="28" rx="2" fill="#e87020"/>
            <rect x="29" y="20" width="5" height="24" rx="2" fill="#f59b30"/>
            <rect x="36" y="12" width="5" height="32" rx="2" fill="#ffb800"/>
            <line x1="7" y1="45" x2="45" y2="45" stroke="#ffb80050" stroke-width="1"/>
          </svg>
        </div>

        <div class="kd-logo-text">
          <div class="kd-logo-name">ZenMAC</div>
          <div class="kd-logo-sub">ZENZERO MONITOR ANALYSIS &amp; CONTROL</div>
        </div>
      </router-link>

      <div class="kd-hdr-div kd-hide-sm"></div>
      <span class="kd-site-name kd-hide-sm">STA-KD &rsaquo; Serum &amp; Latex Process &mdash; WASTEWATER TREATMENT</span>

      <div class="kd-hdr-right">
        <!-- Theme picker -->
        <div class="kd-theme-btn" @click.stop="themePickerOpen = !themePickerOpen" title="เลือกธีม">
          <span class="kd-theme-icon">◑</span>
          <span class="kd-hide-xs" style="font-size:10px;letter-spacing:.06em">THEME</span>
          <!-- Dropdown -->
          <div class="kd-theme-drop" v-if="themePickerOpen" @click.stop>
            <div
              v-for="t in themes" :key="t.id"
              class="kd-theme-opt"
              :class="{ active: theme === t.id }"
              @click="setTheme(t.id); themePickerOpen = false"
            >
              <span class="kd-theme-swatch" :style="{ background: t.preview }"></span>
              <span>{{ t.name }}</span>
            </div>
          </div>
        </div>

        <!-- MQTT status dot (compact on mobile) -->
        <div class="kd-mqtt-badge" :class="mqttClass" @click="showMqttInfo = !showMqttInfo" title="MQTT Status">
          <span class="kd-mqtt-dot"></span>
          <span class="kd-mqtt-lbl kd-hide-xs">MQTT</span>
          <span class="kd-mqtt-host kd-hide-sm">{{ mqttBrokerShort }}</span>
        </div>

        <div class="kd-clock">{{ clock }}</div>
        <div class="kd-date kd-hide-sm">{{ dateStr }}</div>
      </div>
    </header>

    <!-- ── BODY ──────────────────────────────────────────────────── -->
    <div class="kd-body">

      <!-- Sidebar (desktop fixed, mobile drawer) -->
      <nav class="kd-sidebar">
        <!-- Logo area inside drawer (mobile only) -->
        <div class="kd-sidebar-brand">
          <span class="kd-sidebar-brand-name">STA-KD</span>
          <span class="kd-sidebar-brand-sub">Wastewater Treatment</span>
        </div>

        <router-link
          v-for="nav in navItems"
          :key="nav.to"
          :to="nav.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <div
            class="kd-nav-item"
            :class="{ active: isActive }"
            @click="onNavClick(navigate)"
          >
            <span class="kd-nav-icon">{{ nav.icon }}</span>
            <span class="kd-nav-label">{{ nav.label }}</span>
          </div>
        </router-link>
      </nav>

      <!-- Main content -->
      <main class="kd-main">
        <router-view />
      </main>
    </div>

    <!-- ── TICKER ─────────────────────────────────────────────────── -->
    <div class="kd-ticker kd-hide-xs">
      <span class="kd-ticker-tag">LIVE</span>
      <div class="kd-ticker-sep"></div>
      <div class="kd-ticker-wrap">
        <span class="kd-ticker-text">
          Process Flow: {{ processFlow }} m³/hr &nbsp;│&nbsp;
          Serum Flow: {{ serumFlow }} m³/hr &nbsp;│&nbsp;
          Process ORP: {{ processORP }} mV &nbsp;│&nbsp;
          Serum ORP: {{ serumORP }} mV &nbsp;│&nbsp;
          TB-01: {{ tb1Status }} &nbsp;│&nbsp;
          TB-02: {{ tb2Status }} &nbsp;│&nbsp;
          Blower Power: {{ blowerTotalPower }} kW
        </span>
      </div>
    </div>

    <!-- ── BOTTOM NAV (mobile only) ──────────────────────────────── -->
    <nav class="kd-bottom-nav">
      <router-link
        v-for="nav in navItems"
        :key="'bn-' + nav.to"
        :to="nav.to"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button class="kd-bn-item" :class="{ active: isActive }" @click="navigate">
          <span class="kd-bn-icon">{{ nav.icon }}</span>
          <span class="kd-bn-label">{{ nav.label }}</span>
        </button>
      </router-link>
    </nav>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

const NAV = [
  { to: '/sta-kd/home',    icon: '⌂',  label: 'HOME'   },
  { to: '/sta-kd/pump',    icon: '⟳',  label: 'PUMP'   },
  { to: '/sta-kd/blower',  icon: '❋',  label: 'BLOWER' },
  { to: '/sta-kd/sensor',  icon: '◈',  label: 'SENSOR' },
  { to: '/sta-kd/control', icon: '⚙',  label: 'CTRL'   },
  { to: '/sta-kd/energy',  icon: '⚡', label: 'ENERGY' },
  { to: '/sta-kd/report',  icon: '📋', label: 'REPORT' },
  { to: '/sta-kd/devices', icon: '⊞',  label: 'DEVICE' },
];

export default {
  name: 'STAKDLayout',
  data() {
    return {
      navItems: NAV,
      clock: '',
      dateStr: '',
      clockTimer: null,
      showMqttInfo: false,
      sidebarOpen: false,
      themePickerOpen: false,
      theme: localStorage.getItem('kd-theme') || 'space',
      themes: [
        { id: 'space',    name: 'Space (default)',  preview: '#07090c' },
        { id: 'navy',     name: 'Midnight Navy',    preview: '#080d14' },
        { id: 'grafana',  name: 'Grafana Dark',     preview: '#111217' },
        { id: 'carbon',   name: 'IBM Carbon',       preview: '#161616' },
        { id: 'ocean',    name: 'Deep Ocean',       preview: '#050e1a' },
        { id: 'datadog',  name: 'Datadog Dark',     preview: '#0a0c10' },
        { id: 'moss',     name: 'Dark Moss',        preview: '#080e08' },
        { id: 'splunk',   name: 'Splunk Dark',      preview: '#0e1117' },
      ],
    };
  },
  computed: {
    ...mapState('staKd', ['mqttConnected', 'mqttBroker', 'mqttReconnecting']),
    ...mapGetters('staKd', [
      'processFlow', 'serumFlow', 'processORP', 'serumORP',
      'tb1Status', 'tb2Status', 'blowerTotalPower',
    ]),
    themeVars() {
      const T = {
        space:   { bg0:'#07090c', bg1:'#0d1117', bg2:'#141b24', bg3:'#1c2535', border:'#1e2a3a', border2:'#28384e' },
        navy:    { bg0:'#080d14', bg1:'#0d1520', bg2:'#13202e', bg3:'#1a2a3c', border:'#1d2e42', border2:'#263c54' },
        grafana: { bg0:'#111217', bg1:'#181b1f', bg2:'#1f2229', bg3:'#272b33', border:'#2c3039', border2:'#373d48' },
        carbon:  { bg0:'#0a0a0a', bg1:'#111111', bg2:'#161616', bg3:'#1e1e1e', border:'#282828', border2:'#363636' },
        ocean:   { bg0:'#050e1a', bg1:'#0a1525', bg2:'#102030', bg3:'#182c3e', border:'#1a3048', border2:'#234060' },
        datadog: { bg0:'#0a0c10', bg1:'#101418', bg2:'#171c22', bg3:'#1e242c', border:'#222a34', border2:'#2c3845' },
        moss:    { bg0:'#080e08', bg1:'#0e160e', bg2:'#141e14', bg3:'#1a271a', border:'#1e2e1e', border2:'#283c28' },
        splunk:  { bg0:'#0e1117', bg1:'#141820', bg2:'#1b2028', bg3:'#222830', border:'#252d38', border2:'#303a48' },
      };
      const c = T[this.theme] || T.space;
      return {
        '--bg0': c.bg0, '--bg1': c.bg1, '--bg2': c.bg2, '--bg3': c.bg3,
        '--border': c.border, '--border2': c.border2,
      };
    },
    mqttClass() {
      if (this.mqttConnected) return 'connected';
      if (this.mqttReconnecting) return 'reconnecting';
      return 'disconnected';
    },
    mqttBrokerShort() {
      if (this.mqttConnected && this.mqttBroker) {
        return this.mqttBroker.replace(/^(mqtt|ws)s?:\/\//, '').split(':')[0];
      }
      return this.mqttReconnecting ? 'reconnecting…' : 'not connected';
    },
  },
  created() {
    this.$store.dispatch('staKd/initSocket');
    this.$store.dispatch('staKd/fetchState');
    this.$store.dispatch('staKd/fetchDevices');
    this.tickClock();
    this.clockTimer = setInterval(this.tickClock, 1000);
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('click', this.closeThemePicker);
  },
  beforeUnmount() {
    clearInterval(this.clockTimer);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('click', this.closeThemePicker);
  },
  methods: {
    tickClock() {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      this.clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      this.dateStr = now.toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar()  { this.sidebarOpen = false; },
    onNavClick(navigate) {
      navigate();
      this.closeSidebar();
    },
    onResize() {
      if (window.innerWidth >= 768) this.closeSidebar();
    },
    setTheme(id) {
      this.theme = id;
      localStorage.setItem('kd-theme', id);
    },
    closeThemePicker() {
      this.themePickerOpen = false;
    },
  },
};
</script>

<style>
/* ── Global STA-KD CSS variables ──────────────────────────────────── */
.kd-root {
  --bg0: #07090c;
  --bg1: #0d1117;
  --bg2: #141b24;
  --bg3: #1c2535;
  --border: #1e2a3a;
  --border2: #28384e;
  --border3: #3a4e62;
  --cyan: #00d4ff;
  --green: #00e87a;
  --green2: #00a050;
  --amber: #ffb800;
  --red: #ff4040;
  --purple: #a855f7;
  --orange: #ff7820;
  --teal: #00c8b0;
  --text: #d8e4f0;
  --text2: #8aa2b8;
  --text3: #3a4e62;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --font-ui: 'Rajdhani', 'Segoe UI', sans-serif;
  --sidebar-w: 76px;
  --header-h: 66px;
  --bottom-nav-h: 0px;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── ROOT ──────────────────────────────────────────────────────────── */
.kd-root {
  display: flex;
  flex-direction: column;
  height: 100dvh;           /* dvh = safer on mobile (hides address bar) */
  overflow: hidden;
  background: var(--bg0);
  color: var(--text);
  font-family: var(--font-ui);
}

/* ── OVERLAY ───────────────────────────────────────────────────────── */
.kd-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  z-index: 490;
}
.kd-sidebar-open .kd-overlay { display: block; }

/* ── HEADER ────────────────────────────────────────────────────────── */
.kd-header {
  height: var(--header-h);
  background: rgba(8,12,18,0.97);
  border-bottom: 2px solid var(--border2);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  flex-shrink: 0;
  z-index: 300;
}

/* Hamburger (hidden on desktop) */
.kd-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px; height: 36px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 7px;
  padding: 6px 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.kd-hamburger span {
  display: block;
  height: 2px; width: 100%;
  background: var(--text2);
  border-radius: 2px;
  transition: all .2s;
}
.kd-sidebar-open .kd-hamburger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.kd-sidebar-open .kd-hamburger span:nth-child(2) { opacity: 0; }
.kd-sidebar-open .kd-hamburger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.kd-logo-mark { width: 50px; height: 50px; flex-shrink: 0; }

.kd-logo-text { display: flex; flex-direction: column; flex-shrink: 0; }
.kd-logo-name {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 28px;
  color: var(--amber);
  letter-spacing: 0.04em;
  line-height: 1;
}
.kd-logo-sub {
  font-family: var(--font-mono);
  font-size: 8.5px;
  color: var(--text3);
  letter-spacing: 0.08em;
}

.kd-hdr-div { width: 1px; height: 32px; background: var(--border2); margin: 0 4px; flex-shrink: 0; }
.kd-site-name {
  font-family: var(--font-ui);
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kd-hdr-right { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* MQTT badge */
.kd-mqtt-badge {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 10px;
  background: var(--bg2); border: 1px solid var(--border2);
  padding: 4px 10px; border-radius: 6px; cursor: pointer;
  transition: border-color .2s;
}
.kd-mqtt-badge:hover { border-color: var(--border3); }
.kd-mqtt-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  transition: background .4s;
}
.kd-mqtt-badge.connected .kd-mqtt-dot    { background: var(--green); box-shadow: 0 0 6px #00e87a88; animation: kd-pulse 2s infinite; }
.kd-mqtt-badge.reconnecting .kd-mqtt-dot { background: var(--amber); animation: kd-pulse 1s infinite; }
.kd-mqtt-badge.disconnected .kd-mqtt-dot { background: var(--red); }
.kd-mqtt-lbl  { color: var(--text2); }
.kd-mqtt-host { color: var(--cyan); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.kd-clock {
  font-family: var(--font-mono); font-size: 14px; color: var(--cyan);
  background: var(--bg2); border: 1px solid var(--border2);
  padding: 4px 12px; border-radius: 6px; letter-spacing: 0.08em; white-space: nowrap;
}
.kd-date { font-family: var(--font-mono); font-size: 9px; color: var(--text2); white-space: nowrap; }

/* ── THEME PICKER ──────────────────────────────────────────────────── */
.kd-theme-btn {
  position: relative;
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 11px; color: var(--text2);
  background: var(--bg2); border: 1px solid var(--border2);
  padding: 4px 10px; border-radius: 6px; cursor: pointer;
  user-select: none;
}
.kd-theme-btn:hover { border-color: var(--border3); color: var(--text); }
.kd-theme-icon { font-size: 14px; line-height: 1; }

.kd-theme-drop {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: var(--bg2); border: 1px solid var(--border3);
  border-radius: 8px; padding: 6px;
  display: flex; flex-direction: column; gap: 3px;
  z-index: 900; min-width: 170px;
  box-shadow: 0 8px 24px rgba(0,0,0,.7);
}
.kd-theme-opt {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px; color: var(--text2);
  padding: 6px 10px; border-radius: 5px; cursor: pointer;
  transition: background .15s;
}
.kd-theme-opt:hover { background: var(--bg3); color: var(--text); }
.kd-theme-opt.active { background: var(--bg3); color: var(--cyan); }
.kd-theme-swatch {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1px solid rgba(255,255,255,.2); flex-shrink: 0;
}

/* ── BODY ──────────────────────────────────────────────────────────── */
.kd-body { display: flex; flex: 1; overflow: hidden; }

/* ── SIDEBAR ───────────────────────────────────────────────────────── */
.kd-sidebar {
  width: var(--sidebar-w);
  background: rgba(8,12,18,0.97);
  border-right: 2px solid var(--border2);
  display: flex; flex-direction: column;
  align-items: center; padding: 8px 0; gap: 3px;
  flex-shrink: 0; overflow-y: auto;
  transition: transform .25s ease;
  scrollbar-width: none;
}
.kd-sidebar::-webkit-scrollbar { display: none; }

/* Brand block — visible only inside mobile drawer */
.kd-sidebar-brand {
  display: none;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 12px;
  width: 100%;
  border-bottom: 1px solid var(--border2);
  margin-bottom: 6px;
}
.kd-sidebar-brand-name {
  font-family: var(--font-mono); font-weight: 700; font-size: 16px; color: var(--amber);
}
.kd-sidebar-brand-sub {
  font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: .06em;
}

.kd-nav-item {
  width: 62px; height: 54px; border-radius: 9px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; gap: 3px; border: 1px solid transparent;
  background: transparent; color: var(--text3);
  transition: all .18s;
  font-family: var(--font-mono); font-size: 8px; font-weight: 700;
  letter-spacing: 0.04em; text-decoration: none;
}
.kd-nav-item:hover  { background: var(--bg3); color: var(--text2); border-color: var(--border2); }
.kd-nav-item.active { background: rgba(0,212,255,.13); color: var(--cyan); border-color: rgba(0,212,255,.32); }
.kd-nav-icon  { font-size: 20px; line-height: 1; }
.kd-nav-label { font-size: 7.5px; }

/* ── MAIN ──────────────────────────────────────────────────────────── */
.kd-main {
  flex: 1; overflow: hidden; padding: 8px;
}
/* pages that need scroll set overflow-y: auto on their own root */

/* ── TICKER ────────────────────────────────────────────────────────── */
.kd-ticker {
  height: 30px; background: rgba(10,14,20,0.9);
  border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 9px;
  padding: 0 14px; overflow: hidden; flex-shrink: 0;
}
.kd-ticker-tag  { font-family: var(--font-mono); font-size: 9px; color: var(--amber); letter-spacing: .1em; white-space: nowrap; }
.kd-ticker-sep  { width: 1px; height: 12px; background: var(--border2); }
.kd-ticker-wrap { flex: 1; overflow: hidden; }
.kd-ticker-text {
  font-family: var(--font-mono); font-size: 10px; color: var(--text2);
  white-space: nowrap; display: inline-block;
  animation: kd-ticker 40s linear infinite;
}

/* ── BOTTOM NAV (mobile only) ──────────────────────────────────────── */
.kd-bottom-nav {
  display: none;
  height: 58px;
  background: rgba(8,12,18,0.98);
  border-top: 2px solid var(--border2);
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}
.kd-bottom-nav::-webkit-scrollbar { display: none; }

/* inner layout when visible */
.kd-bottom-nav-inner {
  display: flex;
  height: 100%;
  min-width: max-content;
}

.kd-bn-item {
  flex: 1;
  min-width: 60px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 4px 4px 6px;
  transition: color .15s;
  font-family: var(--font-mono);
}
.kd-bn-item:active { background: var(--bg2); }
.kd-bn-item.active { color: var(--cyan); }
.kd-bn-icon  { font-size: 18px; line-height: 1; }
.kd-bn-label { font-size: 7px; font-weight: 700; letter-spacing: .05em; }

/* ── VISIBILITY HELPERS ────────────────────────────────────────────── */
/* .kd-hide-sm → hidden below 768px  */
/* .kd-hide-xs → hidden below 576px  */

/* ── ANIMATIONS ────────────────────────────────────────────────────── */
@keyframes kd-ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
@keyframes kd-pulse  { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,232,122,.4); } 50% { opacity: .6; box-shadow: 0 0 0 5px rgba(0,232,122,0); } }

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE — Tablet  768px – 991px
   sidebar collapses to icon-only strip (like welzon sm-hover)
   ════════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) and (max-width: 991px) {
  .kd-sidebar {
    width: 60px;
  }
  .kd-nav-item {
    width: 50px; height: 50px;
  }
  .kd-nav-label {
    display: none;
  }
  .kd-nav-icon { font-size: 22px; }

  .kd-site-name {
    font-size: 13px;
    max-width: 260px;
  }
  .kd-date { display: none; }
}

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE — Mobile  < 768px
   sidebar is a full-height slide-in drawer
   bottom nav replaces sidebar
   ════════════════════════════════════════════════════════════════════ */
@media (max-width: 767.98px) {

  /* Show hamburger */
  .kd-hamburger { display: flex; }

  /* Hide desktop helpers */
  .kd-hide-sm { display: none !important; }

  /* Sidebar becomes fixed drawer */
  .kd-sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 220px;
    z-index: 500;
    transform: translateX(-100%);
    border-right: 2px solid var(--border2);
    align-items: flex-start;
    padding: 0 0 16px;
    overflow-y: auto;
  }
  .kd-sidebar-open .kd-sidebar {
    transform: translateX(0);
  }

  /* Show brand block inside drawer */
  .kd-sidebar-brand { display: flex; }

  /* Nav items stretch full width inside drawer */
  .kd-nav-item {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    height: 48px;
    padding: 0 18px;
    gap: 14px;
    border-radius: 0;
    border-left: 3px solid transparent;
    border-top: none;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .kd-nav-item.active {
    border-left-color: var(--cyan);
    background: rgba(0,212,255,.08);
  }
  .kd-nav-icon  { font-size: 20px; width: 24px; text-align: center; }
  .kd-nav-label { font-size: 12px; font-weight: 600; letter-spacing: .04em; }

  /* Body: no sidebar space */
  .kd-body { overflow: hidden; }
  .kd-main { padding: 8px; }

  /* Ticker hidden on mobile */
  .kd-ticker { display: none; }

  /* Bottom nav visible */
  .kd-bottom-nav {
    display: flex;
    align-items: stretch;
  }

  /* Clock compact */
  .kd-clock { font-size: 12px; padding: 3px 8px; }

  /* Logo smaller */
  .kd-logo-name { font-size: 18px; }
  .kd-logo-sub  { display: none; }
}

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE — Small mobile  < 576px
   ════════════════════════════════════════════════════════════════════ */
@media (max-width: 575.98px) {
  .kd-hide-xs { display: none !important; }

  .kd-header { padding: 0 10px; gap: 8px; }
  .kd-logo-mark { width: 36px; height: 36px; }
  .kd-logo-name { font-size: 16px; }

  /* MQTT badge: dot only */
  .kd-mqtt-badge { padding: 4px 8px; }

  .kd-clock { font-size: 11px; padding: 3px 7px; letter-spacing: 0; }
}
</style>
