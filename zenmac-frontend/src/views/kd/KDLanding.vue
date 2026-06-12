<template>
  <div class="kd-landing">

    <!-- ── NAVBAR ── -->
    <nav class="l-nav">
      <ul class="l-nav-links">
        <li><a href="#mission">Philosophy</a></li>
        <li><a href="#clients">Clients</a></li>
        <li><a href="#clients" class="l-rnd-btn"><i class="bx bx-flask"></i> R&amp;D</a></li>
        <li><router-link to="/login" class="l-login-btn">Login</router-link></li>
      </ul>
      <div class="l-mqtt-pill" :class="mqttConnected ? 'mqtt-on' : 'mqtt-off'">
        <span class="mqtt-dot"></span>
        {{ mqttConnected ? 'SYSTEM ONLINE' : 'CONNECTING...' }}
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

      <!-- ── CLIENT PORTAL ── -->
      <div class="l-clients" id="clients">
        <div class="l-cl-eyebrow">CLIENT PORTAL</div>

        <div class="l-cl-layout">

          <!-- STA — Featured (active) -->
          <router-link to="/kd/app/overview" class="cl-featured">
            <div class="cl-feat-top">
              <div class="cl-feat-dot"></div>
              <span class="cl-feat-name">STA</span>
              <span class="cl-status cl-active">● ACTIVE</span>
            </div>
            <div class="cl-feat-company">Sri Trang Agro-Industry PCL.</div>
            <div class="cl-feat-industry">Natural Rubber · Latex Processing</div>

            <div class="cl-feat-sep"></div>

            <div class="cl-factory-row">
              <i class="bx bx-building-house cl-fac-icon"></i>
              <div>
                <div class="cl-fac-name">STA-KD</div>
                <div class="cl-fac-desc">Wastewater Treatment · Krabi</div>
              </div>
              <div class="cl-fac-modules">
                <span>Overview</span>
                <span>Executive</span>
                <span>Daily Report</span>
              </div>
              <div class="cl-fac-arrow">→</div>
            </div>

            <div class="cl-feat-foot">1 factory · 4 modules</div>
          </router-link>

          <!-- Right: 2×2 grid -->
          <div class="cl-grid">

            <div class="cl-card cl-dev">
              <div class="cl-card-top">
                <span class="cl-card-name">Betagro</span>
                <span class="cl-status cl-indev">○ IN DEV</span>
              </div>
              <div class="cl-card-company">Betagro PCL.</div>
              <div class="cl-card-ind">Agro-industry · Feed & Food</div>
              <div class="cl-card-foot">Coming soon</div>
            </div>

            <div class="cl-card cl-dev">
              <div class="cl-card-top">
                <span class="cl-card-name">TiiZ KM30</span>
                <span class="cl-status cl-indev">○ IN DEV</span>
              </div>
              <div class="cl-card-company">TiiZ Co., Ltd.</div>
              <div class="cl-card-ind">Natural Rubber Processing</div>
              <div class="cl-card-foot">Coming soon</div>
            </div>

            <div class="cl-card cl-dev">
              <div class="cl-card-top">
                <span class="cl-card-name">Pala Asset</span>
                <span class="cl-status cl-indev">○ IN DEV</span>
              </div>
              <div class="cl-card-company">Pala Asset Co., Ltd.</div>
              <div class="cl-card-ind">Asset Management</div>
              <div class="cl-card-foot">Coming soon</div>
            </div>

            <div class="cl-card cl-rnd">
              <div class="cl-card-top">
                <span class="cl-card-name"><i class="bx bx-flask"></i> R&amp;D</span>
                <span class="cl-status cl-lab">◈ LAB</span>
              </div>
              <div class="cl-card-company">AE²R Research Zone</div>
              <div class="cl-card-ind">Models · Algorithms · Dev</div>
              <div class="cl-card-foot">Internal development</div>
            </div>

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
  computed: {
    ...mapState('staKd', ['mqttConnected']),
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
  height: 52px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px;
  background: rgba(8,11,15,.95);
  border-bottom: 1px solid rgba(255,255,255,.06);
  z-index: 10;
}
.l-nav-links { display: flex; gap: 2px; list-style: none; }
.l-nav-links a {
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,.4);
  text-decoration: none; padding: 5px 14px; border-radius: 6px; transition: all .15s;
}
.l-nav-links a:hover { color: #fff; background: rgba(255,255,255,.05); }
.l-rnd-btn {
  color: #7ab4d4 !important;
  display: flex; align-items: center; gap: 5px;
}
.l-rnd-btn:hover { background: rgba(122,180,212,.08) !important; color: #a8d4f0 !important; }
.l-login-btn {
  color: #111 !important;
  background: linear-gradient(135deg, #d4a040, #f0c060) !important;
  font-weight: 700 !important;
}
.l-login-btn:hover { background: linear-gradient(135deg, #e0b55a, #f5cb75) !important; }
.l-mqtt-pill {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: .08em; padding: 4px 12px; border-radius: 20px;
  display: flex; align-items: center; gap: 6px; border: 1px solid transparent;
}
.mqtt-on  { color: #b8e834; border-color: #b8e83430; background: #b8e83412; }
.mqtt-off { color: #ffb800; border-color: #ffb80030; background: #ffb80012; }
.mqtt-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.mqtt-on .mqtt-dot { animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

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

/* ── CLIENT PORTAL ── */
.l-clients {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,.06);
  background: rgba(0,0,0,.18);
  padding: 12px 40px 14px;
  max-width: 1200px; width: 100%; margin: 0 auto; align-self: stretch;
}
.l-cl-eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: .18em; color: rgba(255,255,255,.16); margin-bottom: 9px; font-weight: 700;
}

/* Layout: featured left + 2×2 right */
.l-cl-layout {
  display: flex; gap: 8px; align-items: stretch;
}

/* ── Featured STA card ── */
.cl-featured {
  flex: 0 0 300px;
  display: flex; flex-direction: column; gap: 8px;
  background: linear-gradient(135deg, rgba(184,232,52,.06) 0%, rgba(212,160,64,.04) 60%, rgba(255,255,255,.02) 100%);
  border: 1px solid rgba(184,232,52,.22);
  border-radius: 12px; padding: 14px 16px;
  text-decoration: none; color: #d0d8e4;
  transition: all .2s;
  position: relative; overflow: hidden;
}
.cl-featured::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #b8e834, #d4a040, transparent);
}
.cl-featured:hover {
  border-color: rgba(184,232,52,.4);
  background: linear-gradient(135deg, rgba(184,232,52,.09) 0%, rgba(212,160,64,.06) 60%, rgba(255,255,255,.03) 100%);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(184,232,52,.08);
}
.cl-feat-top {
  display: flex; align-items: center; gap: 8px;
}
.cl-feat-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #b8e834;
  box-shadow: 0 0 8px #b8e83460;
  animation: blink 2s infinite;
  flex-shrink: 0;
}
.cl-feat-name {
  font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800;
  color: #fff; letter-spacing: .04em;
}
.cl-feat-company {
  font-size: 13px; font-weight: 600; color: rgba(255,255,255,.7);
}
.cl-feat-industry {
  font-size: 11px; color: rgba(255,255,255,.28);
}
.cl-feat-sep {
  height: 1px; background: rgba(255,255,255,.07); margin: 2px 0;
}
.cl-factory-row {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px; padding: 9px 11px;
  transition: all .15s;
}
.cl-featured:hover .cl-factory-row {
  background: rgba(184,232,52,.07);
  border-color: rgba(184,232,52,.18);
}
.cl-fac-icon { font-size: 18px; color: #b8e834; flex-shrink: 0; }
.cl-fac-name { font-size: 13px; font-weight: 700; color: #fff; }
.cl-fac-desc { font-size: 10px; color: rgba(255,255,255,.3); margin-top: 1px; }
.cl-fac-modules {
  display: flex; flex-direction: column; gap: 2px; margin-left: auto;
}
.cl-fac-modules span {
  font-family: 'JetBrains Mono', monospace; font-size: 8px;
  color: rgba(184,232,52,.5); text-align: right; letter-spacing: .04em;
}
.cl-fac-arrow {
  font-size: 16px; font-weight: 700; color: #b8e834;
  opacity: .5; transition: all .2s; flex-shrink: 0;
}
.cl-featured:hover .cl-fac-arrow { opacity: 1; transform: translateX(3px); }
.cl-feat-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: rgba(255,255,255,.18); margin-top: auto;
}

/* ── Status badges ── */
.cl-status {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
  letter-spacing: .07em; padding: 2px 8px; border-radius: 4px;
  border: 1px solid; margin-left: auto;
}
.cl-active { color: #b8e834; border-color: #b8e83430; background: #b8e83410; }
.cl-indev  { color: rgba(255,255,255,.25); border-color: rgba(255,255,255,.1); background: rgba(255,255,255,.03); }
.cl-lab    { color: #7ab4d4; border-color: #7ab4d430; background: #7ab4d410; }

/* ── 2×2 grid ── */
.cl-grid {
  flex: 1;
  display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
  gap: 8px;
}
.cl-card {
  display: flex; flex-direction: column; gap: 4px;
  border-radius: 10px; padding: 12px 14px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: all .2s;
}
.cl-card.cl-dev { cursor: default; }
.cl-card.cl-rnd {
  background: rgba(122,180,212,.04);
  border-color: rgba(122,180,212,.14);
  cursor: pointer;
}
.cl-card.cl-rnd:hover {
  background: rgba(122,180,212,.07);
  border-color: rgba(122,180,212,.25);
}
.cl-card-top {
  display: flex; align-items: center; gap: 8px;
}
.cl-card-name {
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,.55); display: flex; align-items: center; gap: 5px;
}
.cl-card.cl-rnd .cl-card-name { color: #7ab4d4; }
.cl-card-company {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,.32);
}
.cl-card-ind {
  font-size: 10px; color: rgba(255,255,255,.18);
}
.cl-card-foot {
  font-family: 'JetBrains Mono', monospace; font-size: 8px;
  color: rgba(255,255,255,.12); margin-top: auto; padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,.05);
}
.cl-card.cl-rnd .cl-card-foot { color: rgba(122,180,212,.3); border-color: rgba(122,180,212,.1); }

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
.l-cl-eyebrow  { animation: fadeUp .5s ease both .70s; }
.cl-featured   { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .76s; }
.cl-grid > *:nth-child(1) { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .82s; }
.cl-grid > *:nth-child(2) { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .88s; }
.cl-grid > *:nth-child(3) { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both .94s; }
.cl-grid > *:nth-child(4) { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both 1.00s; }

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
