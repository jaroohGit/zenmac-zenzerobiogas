<template>
  <div class="kd-landing">

    <!-- ── NAVBAR ── -->
    <nav class="l-nav">

      <!-- Logo mark -->
      <router-link to="/" class="l-nav-logo">
        <div class="nl-bars">
          <span class="nl-b b1"></span><span class="nl-b b2"></span>
          <span class="nl-b b3"></span><span class="nl-b b4"></span>
        </div>
        <span class="nl-name">ZenMAC</span>
      </router-link>

      <div class="l-nav-divider"></div>

      <!-- Company menu -->
      <ul class="l-nav-companies">

        <!-- STA — ACTIVE -->
        <li class="nc-item" @mouseenter="openMenu('sta')" @mouseleave="closeMenu">
          <button class="nc-btn nc-active">
            <span class="nc-dot"></span>
            STA
            <i class="bx bx-chevron-down nc-arrow"></i>
          </button>
          <div class="nc-dropdown" v-show="activeMenu==='sta'">
            <div class="ncd-label">SRI TRANG AGRO-INDUSTRY</div>
            <router-link to="/kd/app/overview" class="ncd-plant ncd-live">
              <div class="ncdp-left">
                <span class="ncdp-dot live"></span>
                <div>
                  <div class="ncdp-name">STA-KD</div>
                  <div class="ncdp-desc">Wastewater Treatment</div>
                </div>
              </div>
              <span class="ncdp-arrow">→</span>
            </router-link>
            <div class="ncd-plant ncd-soon">
              <div class="ncdp-left">
                <span class="ncdp-dot soon"></span>
                <div>
                  <div class="ncdp-name">STA-XX</div>
                  <div class="ncdp-desc">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </li>

        <!-- Betagro -->
        <li class="nc-item" @mouseenter="openMenu('betagro')" @mouseleave="closeMenu">
          <button class="nc-btn nc-dev">
            Betagro
            <i class="bx bx-chevron-down nc-arrow"></i>
          </button>
          <div class="nc-dropdown" v-show="activeMenu==='betagro'">
            <div class="ncd-label">BETAGRO PCL.</div>
            <div class="ncd-empty">No plants configured yet</div>
          </div>
        </li>

        <!-- TiiZ -->
        <li class="nc-item" @mouseenter="openMenu('tiiz')" @mouseleave="closeMenu">
          <button class="nc-btn nc-dev">
            TIZ KM30
            <i class="bx bx-chevron-down nc-arrow"></i>
          </button>
          <div class="nc-dropdown" v-show="activeMenu==='tiiz'">
            <div class="ncd-label">TIZ CO., LTD.</div>
            <div class="ncd-empty">No plants configured yet</div>
          </div>
        </li>

        <!-- Pala -->
        <li class="nc-item" @mouseenter="openMenu('pala')" @mouseleave="closeMenu">
          <button class="nc-btn nc-dev">
            Pala Asset
            <i class="bx bx-chevron-down nc-arrow"></i>
          </button>
          <div class="nc-dropdown" v-show="activeMenu==='pala'">
            <div class="ncd-label">PALA ASSET CO., LTD.</div>
            <div class="ncd-empty">No plants configured yet</div>
          </div>
        </li>

        <!-- R&D -->
        <li class="nc-item nc-rnd-item">
          <button class="nc-btn nc-rnd">
            <i class="bx bx-flask"></i> R&amp;D
          </button>
        </li>

      </ul>

      <div class="l-nav-right">
        <div class="l-mqtt-pill" :class="mqttConnected ? 'mqtt-on' : 'mqtt-off'">
          <span class="mqtt-dot"></span>
          {{ mqttConnected ? 'ONLINE' : 'CONNECTING' }}
        </div>
        <router-link to="/login" class="l-login-btn">Login</router-link>
      </div>

    </nav>

    <!-- ── BODY ── -->
    <div class="l-body">

      <!-- Main 2-col -->
      <div class="l-main" id="mission">

        <!-- LEFT -->
        <div class="l-left">
          <router-link to="/" class="l-logo-wrap" aria-label="Go to home">
            <div class="l-logo-icon">
              <div class="bar b1"></div>
              <div class="bar b2"></div>
              <div class="bar b3"></div>
              <div class="bar b4"></div>
              <div class="bar b5"></div>
              <div class="bar b6"></div>
            </div>
            <div class="l-logo-text">
              <div class="l-logo-name">ZenMAC</div>
              <div class="l-logo-tagline">ZENZERO MONITOR ANALYSIS &amp; CONTROL</div>
            </div>
          </router-link>

          <div class="l-divider"></div>

          <div class="l-company-row">
            <div class="l-company-info">
              <div class="co-label">A PLATFORM BY</div>
              <div class="co-name">Zenzerobiogas Co., Ltd.</div>
              <div class="co-sub">Environmental Engineering &amp; Research</div>
            </div>
            <div class="l-aer-badge">AE<sup>2</sup>R</div>
          </div>

          <div class="l-stats-row">
            <div class="l-stat"><div class="st-val">4</div><div class="st-lbl">Clients</div></div>
            <div class="st-sep"></div>
            <div class="l-stat"><div class="st-val c-green">1</div><div class="st-lbl">Active</div></div>
            <div class="st-sep"></div>
            <div class="l-stat"><div class="st-val">24/7</div><div class="st-lbl">Real-time</div></div>
            <div class="st-sep"></div>
            <div class="l-stat"><div class="st-val">MQTT</div><div class="st-lbl">Protocol</div></div>
          </div>
        </div>

        <!-- CENTER LINE -->
        <div class="l-col-line"></div>

        <!-- RIGHT -->
        <div class="l-right">
          <div class="l-eyebrow"><span class="ey-line"></span> PHILOSOPHY</div>

          <blockquote class="l-quote">
            <span class="q-brand">ZenMAC </span>
            <span class="q-open">"It's not about sensors or displays, </span>
            <span class="q-green">but about using data from research and development
            and real-world system operation methods
            to improve system more efficiency and save energy."</span>
          </blockquote>

          <div class="l-right-sep"></div>

          <div class="l-eyebrow"><span class="ey-line"></span> DESIGNED FOR</div>
          <div class="l-about-headline"><strong>Natural Rubber Industry</strong> (NRI)</div>
          <p class="l-about-body">
            Designed through research and development to be suitable for the Natural Rubber Industry
            by a team of <strong>Applied Environmental Engineer Researcher (AE²R)</strong>
          </p>
          <div class="l-about-tags">
            <span class="l-tag">Wastewater Treatment</span>
            <span class="l-tag">IoT Monitoring</span>
            <span class="l-tag">Energy Efficiency</span>
          </div>
        </div>

      </div>

      <!-- ── FOOTER ── -->
      <footer class="l-footer">
        <router-link to="/" class="l-footer-logo" aria-label="Go to home">ZenMAC</router-link>
        <span class="l-sep">·</span>
        <span>Zenzerobiogas Co., Ltd. · AE²R Team</span>
        <span class="l-sep">·</span>
        <span>Client Platform · v2.1</span>
      </footer>

    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'KDLanding',
  data() {
    return { activeMenu: null };
  },
  computed: {
    ...mapState('staKd', ['mqttConnected']),
  },
  methods: {
    openMenu(key) { this.activeMenu = key; },
    closeMenu()   { this.activeMenu = null; },
  },
  created() {
    this.$store.dispatch('staKd/initSocket');
    this.$store.dispatch('staKd/fetchState');
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.kd-landing {
  height: 100vh;
  overflow: hidden;
  background: #0a0d11;
  color: #d0d8e4;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

/* ── NAVBAR ── */
.l-nav {
  height: 52px; flex-shrink: 0;
  display: flex; align-items: center; gap: 0;
  padding: 0 28px;
  background: rgba(8,11,15,.97);
  border-bottom: 1px solid rgba(255,255,255,.06);
  z-index: 100;
}

/* Logo */
.l-nav-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none; flex-shrink: 0; padding-right: 20px;
}
.nl-bars { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
.nl-b { display: block; width: 4px; border-radius: 2px 2px 0 0; background: #d4a040; }
.b1 { height: 40%; } .b2 { height: 70%; } .b3 { height: 100%; } .b4 { height: 60%; }
.nl-name {
  font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 800;
  letter-spacing: .06em;
  background: linear-gradient(135deg, #e8a020, #f0c060);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.l-nav-divider { width: 1px; height: 26px; background: rgba(255,255,255,.08); flex-shrink: 0; }

/* Company nav */
.l-nav-companies { display: flex; align-items: stretch; list-style: none; height: 100%; }
.nc-item { position: relative; display: flex; align-items: center; }

.nc-btn {
  height: 100%; padding: 0 16px;
  display: flex; align-items: center; gap: 6px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,.35); transition: all .15s;
  white-space: nowrap; position: relative;
}
.nc-btn:hover { color: rgba(255,255,255,.8); background: rgba(255,255,255,.04); }
.nc-btn::after {
  content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 2px;
  border-radius: 2px 2px 0 0; background: transparent; transition: background .15s;
}
.nc-btn:hover::after { background: rgba(255,255,255,.12); }

/* Active company (STA) */
.nc-active { color: #b8e834 !important; }
.nc-active:hover { background: rgba(184,232,52,.05) !important; }
.nc-active::after { background: #b8e834 !important; }
.nc-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #b8e834; flex-shrink: 0;
  box-shadow: 0 0 6px #b8e83480; animation: blink 2s infinite;
}

/* DEV companies */
.nc-dev { opacity: .7; }

/* R&D */
.nc-rnd-item { margin-left: 4px; }
.nc-rnd { color: #7ab4d4 !important; gap: 5px; }
.nc-rnd:hover { background: rgba(122,180,212,.07) !important; }
.nc-rnd::after { background: #7ab4d430 !important; }

.nc-arrow { font-size: 14px; opacity: .5; transition: transform .2s; }
.nc-item:hover .nc-arrow { transform: rotate(180deg); }

/* Dropdown */
.nc-dropdown {
  position: absolute; top: calc(100% + 1px); left: 0;
  min-width: 240px;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,.1);
  border-top: 2px solid #b8e834;
  border-radius: 0 0 10px 10px;
  padding: 10px 0;
  box-shadow: 0 16px 40px rgba(0,0,0,.6);
  z-index: 200;
}
.nc-item.nc-rnd-item .nc-dropdown,
.nc-item:not(:first-child) .nc-dropdown { border-top-color: rgba(255,255,255,.18); }

.ncd-label {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700;
  letter-spacing: .14em; color: rgba(255,255,255,.22);
  padding: 4px 16px 8px; text-transform: uppercase;
}

/* Plant row */
.ncd-plant {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 16px; text-decoration: none; color: rgba(255,255,255,.55);
  transition: all .15s; gap: 12px;
}
.ncd-plant:hover { background: rgba(255,255,255,.05); color: #fff; }
.ncd-live:hover  { background: rgba(184,232,52,.07); }
.ncdp-left { display: flex; align-items: center; gap: 10px; }
.ncdp-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ncdp-dot.live { background: #b8e834; box-shadow: 0 0 6px #b8e83480; animation: blink 2s infinite; }
.ncdp-dot.soon { background: rgba(255,255,255,.18); }
.ncdp-name { font-size: 13px; font-weight: 700; color: #fff; }
.ncdp-desc { font-size: 10px; color: rgba(255,255,255,.3); margin-top: 1px; }
.ncdp-arrow { font-size: 14px; color: #b8e834; opacity: 0; transition: all .15s; }
.ncd-plant:hover .ncdp-arrow { opacity: 1; transform: translateX(3px); }

.ncd-empty {
  padding: 10px 16px;
  font-size: 11px; color: rgba(255,255,255,.2); font-style: italic;
}

/* Right side */
.l-nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.l-mqtt-pill {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: .07em; padding: 3px 10px; border-radius: 20px;
  display: flex; align-items: center; gap: 5px; border: 1px solid transparent;
}
.mqtt-on  { color: #b8e834; border-color: #b8e83430; background: #b8e83412; }
.mqtt-off { color: #ffb800; border-color: #ffb80030; background: #ffb80012; }
.mqtt-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.mqtt-on .mqtt-dot { animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
.l-login-btn {
  font-size: 13px; font-weight: 700; color: #111;
  background: linear-gradient(135deg, #d4a040, #f0c060);
  padding: 5px 16px; border-radius: 6px; text-decoration: none; transition: all .15s;
  white-space: nowrap;
}
.l-login-btn:hover { background: linear-gradient(135deg, #e0b55a, #f5cb75); }

/* ── BODY ── */
.l-body {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  background:
    radial-gradient(ellipse 50% 80% at 12% 50%, rgba(212,160,64,.05) 0%, transparent 60%),
    radial-gradient(ellipse 45% 60% at 88% 45%, rgba(106,170,136,.04) 0%, transparent 60%),
    #0a0d11;
}

/* ── MAIN 2-COL ── */
.l-main {
  flex: 1; min-height: 0;
  display: grid; grid-template-columns: 1fr 1px 1fr;
  padding: 0 40px;
  max-width: 1200px; width: 100%; margin: 0 auto; align-self: stretch;
}

/* ── LEFT ── */
.l-left {
  display: flex; flex-direction: column;
  justify-content: center; gap: 20px;
  padding: 28px 48px 28px 0;
}

.l-logo-wrap { display: flex; align-items: center; gap: 20px; text-decoration: none; color: inherit; }
.l-logo-icon {
  width: 80px; height: 80px;
  background: #12161e; border-radius: 20px;
  border: 1px solid rgba(255,255,255,.08);
  display: flex; align-items: flex-end; justify-content: center;
  gap: 5px; padding: 14px 12px; flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05);
}
.bar { border-radius: 3px 3px 0 0; width: 7px; flex-shrink: 0; transform-origin: bottom center; animation: growBar .55s cubic-bezier(.34,1.56,.64,1) both .3s; }
.b1 { height: 52%; background: linear-gradient(to top, #6a0e0e, #a82828); animation-delay: .30s; }
.b2 { height: 82%; background: linear-gradient(to top, #a82828, #cc3818); animation-delay: .40s; }
.b3 { height: 100%; background: linear-gradient(to top, #cc3818, #e06020); animation-delay: .52s; }
.b4 { height: 76%; background: linear-gradient(to top, #e07020, #d4a040); animation-delay: .46s; }
.b5 { height: 60%; background: linear-gradient(to top, #c89030, #c8a040); animation-delay: .36s; }
.b6 { height: 40%; background: linear-gradient(to top, #886010, #a88020); animation-delay: .28s; }

.l-logo-text { display: flex; flex-direction: column; gap: 5px; }
.l-logo-name {
  font-size: 66px; font-weight: 900; letter-spacing: -.03em; line-height: 1;
  background: linear-gradient(135deg, #e8a020 0%, #d4a040 30%, #f0c060 60%, #c89030 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.l-logo-tagline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .12em; color: rgba(255,255,255,.25); font-weight: 700;
}

.l-divider { height: 1px; background: linear-gradient(to right, rgba(212,160,64,.22), transparent); }

.l-company-row { display: flex; align-items: center; gap: 16px; }
.l-company-info { flex: 1; }
.co-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .14em; color: rgba(255,255,255,.2); margin-bottom: 3px; }
.co-name  { font-size: 17px; font-weight: 700; color: rgba(255,255,255,.8); }
.co-sub   { font-size: 13px; color: rgba(255,255,255,.28); margin-top: 1px; }
.l-aer-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 900;
  color: #d4a040; background: rgba(212,160,64,.07);
  border: 1px solid rgba(212,160,64,.25); border-radius: 10px;
  padding: 10px 20px; line-height: 1; flex-shrink: 0;
}
.l-aer-badge sup { font-size: 15px; }

.l-stats-row { display: flex; align-items: center; }
.l-stat { padding: 0 16px; }
.l-stat:first-child { padding-left: 0; }
.st-val { font-family: 'JetBrains Mono', monospace; font-size: 21px; font-weight: 700; color: rgba(255,255,255,.6); }
.st-lbl { font-size: 11px; color: rgba(255,255,255,.2); margin-top: 1px; }
.st-sep { width: 1px; height: 30px; background: rgba(255,255,255,.07); }
.c-green { color: #b8e834 !important; }

/* ── CENTER LINE ── */
.l-col-line { background: rgba(255,255,255,.07); margin: 40px 0; }

/* ── RIGHT ── */
.l-right {
  display: flex; flex-direction: column;
  justify-content: center; gap: 16px;
  padding: 28px 0 28px 48px;
}
.l-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .16em; color: rgba(255,255,255,.22);
  display: flex; align-items: center; gap: 10px; font-weight: 700;
}
.ey-line { width: 24px; height: 1px; background: #6aaa88; flex-shrink: 0; }
.l-quote { font-size: 21px; font-weight: 600; line-height: 1.75; letter-spacing: -.01em; }
.q-brand { color: #d4a040; font-weight: 900; font-size: 23px; }
.q-open  { color: rgba(255,255,255,.62); }
.q-green { color: #6aaa88; }
.l-right-sep { height: 1px; background: rgba(255,255,255,.06); }
.l-about-headline { font-size: 18px; font-weight: 700; color: rgba(255,255,255,.75); }
.l-about-headline strong { color: #fff; }
.l-about-body { font-size: 15px; color: rgba(255,255,255,.34); line-height: 1.8; }
.l-about-body strong { color: rgba(255,255,255,.62); font-weight: 600; }
.l-about-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.l-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .05em;
  color: rgba(255,255,255,.3); background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08); padding: 4px 12px; border-radius: 16px;
}


/* ── FOOTER ── */
.l-footer {
  flex-shrink: 0;
  background: #07090c; padding: 10px 40px;
  border-top: 1px solid rgba(255,255,255,.04);
  display: flex; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,.13);
}
.l-footer-logo { color: #d4a040; font-weight: 700; letter-spacing: .1em; text-decoration: none; }
.l-sep { color: rgba(255,255,255,.08); }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes growBar {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}

.l-nav            { animation: fadeUp .5s ease both .05s; }
.l-logo-wrap      { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .1s; }
.l-divider        { animation: fadeUp .5s ease both .28s; }
.l-company-row    { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .36s; }
.l-stats-row      { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .48s; }
.l-right > *:nth-child(1) { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .18s; }
.l-right > *:nth-child(2) { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .30s; }
.l-right > *:nth-child(3) { animation: fadeUp .5s ease both .44s; }
.l-right > *:nth-child(4) { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .50s; }
.l-right > *:nth-child(5) { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .56s; }
.l-right > *:nth-child(6) { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both .62s; }
/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .kd-landing { height: auto; overflow: auto; }
  .l-main { grid-template-columns: 1fr; padding: 0 20px; }
  .l-col-line { display: none; }
  .l-left { padding: 24px 0 0; }
  .l-right { padding: 0 0 24px; }
  .l-clients { padding: 12px 20px; }
  .l-cl-layout { flex-direction: column; }
  .cl-featured { flex: none; }
  .cl-grid { grid-template-columns: 1fr 1fr; }
}
</style>
