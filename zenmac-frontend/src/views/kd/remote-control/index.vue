<template>
  <div class="kd-page-wrap">
    <div class="page-title"><i class="bx bx-joystick"></i>Remote Control — Blower &amp; Pump System</div>

    <!-- Blower section -->
    <div class="section-label">BLOWER SYSTEM</div>
    <div class="ctrl-row">

      <div class="ctrl-card" v-for="b in blowers" :key="b.n">
        <div class="ctrl-card-header">
          <span class="ctrl-acc" :style="{ background: b.statusColor }"></span>
          <span class="ctrl-name">{{ b.name }}</span>
          <span class="ctrl-badge" :class="b.statusCls">{{ b.status }}</span>
        </div>
        <div class="ctrl-params">
          <div class="param"><span class="p-label">POWER</span><span class="p-val c-green">{{ b.power }} kW</span></div>
          <div class="param"><span class="p-label">CURRENT</span><span class="p-val c-cyan">{{ b.current }} A</span></div>
          <div class="param"><span class="p-label">FLOW</span><span class="p-val c-orange">{{ b.flow }} CMM</span></div>
          <div class="param"><span class="p-label">TEMP</span><span class="p-val c-amber">{{ b.temp }} °C</span></div>
        </div>
        <div class="ctrl-speed">
          <span class="speed-label">SPEED</span>
          <input type="range" min="0" max="100" v-model.number="b.speedPct" class="speed-slider" />
          <span class="speed-val">{{ b.speedPct }}%</span>
        </div>
        <div class="ctrl-btns">
          <button class="btn-run" @click="cmdBlower(b.n, 'run')" :disabled="sending">
            <i class="bx bx-play me-1"></i>RUN
          </button>
          <button class="btn-stop" @click="cmdBlower(b.n, 'stop')" :disabled="sending">
            <i class="bx bx-stop me-1"></i>STOP
          </button>
          <button class="btn-set" @click="cmdBlower(b.n, 'speed')" :disabled="sending">
            <i class="bx bx-tachometer me-1"></i>SET SPEED
          </button>
        </div>
      </div>

    </div>

    <!-- Pump section -->
    <div class="section-label">PUMP SYSTEM</div>
    <div class="ctrl-row">

      <div class="ctrl-card" v-for="p in pumps" :key="p.side">
        <div class="ctrl-card-header">
          <span class="ctrl-acc" :style="{ background: p.color }"></span>
          <span class="ctrl-name">{{ p.name }}</span>
          <span class="ctrl-badge" :class="p.statusCls">{{ p.status }}</span>
        </div>
        <div class="ctrl-params">
          <div class="param"><span class="p-label">FLOW</span><span class="p-val" :style="{color:p.color}">{{ p.flow }} m³/hr</span></div>
          <div class="param"><span class="p-label">ORP</span><span class="p-val c-cyan">{{ p.orp }} mV</span></div>
          <div class="param"><span class="p-label">pH</span><span class="p-val c-green">{{ p.ph }}</span></div>
        </div>
        <div class="ctrl-btns">
          <button class="btn-run" @click="cmdPump(p.side, 'run')" :disabled="sending">
            <i class="bx bx-play me-1"></i>RUN
          </button>
          <button class="btn-stop" @click="cmdPump(p.side, 'stop')" :disabled="sending">
            <i class="bx bx-stop me-1"></i>STOP
          </button>
        </div>
      </div>

    </div>

    <!-- Alert -->
    <transition name="fade">
      <div class="ctrl-alert" :class="alertCls" v-if="alertMsg">
        <i class="bx" :class="alertCls === 'alert-ok' ? 'bx-check-circle' : 'bx-error-circle'"></i>
        {{ alertMsg }}
      </div>
    </transition>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'KDRemoteControl',
  data() {
    return {
      sending: false,
      alertMsg: '',
      alertCls: '',
      blowerSpeed: [50, 50],
    };
  },
  computed: {
    ...mapGetters('staKd', [
      'serumFlow','processFlow','serumORP','processORP','serumpH','processpH',
      'tb1Status','tb2Status','tb1Power','tb2Power',
      'tb1Current','tb2Current','tb1Flow','tb2Flow',
      'tb1MotorTemp','tb2MotorTemp',
      'serumPumpStatus','processPumpStatus',
    ]),
    blowers() {
      return [
        {
          n: 1, name: 'BLOWER TB-01',
          status: this.tb1Status || '—',
          statusCls: this.tb1Status === 'RUN' ? 'badge-run' : 'badge-stby',
          statusColor: this.tb1Status === 'RUN' ? '#00e87a' : '#ffb800',
          power: this.fmtNum(this.tb1Power),
          current: this.fmtNum(this.tb1Current),
          flow: this.fmtNum(this.tb1Flow),
          temp: this.fmtNum(this.tb1MotorTemp),
          speedPct: this.blowerSpeed[0],
        },
        {
          n: 2, name: 'BLOWER TB-02',
          status: this.tb2Status || '—',
          statusCls: this.tb2Status === 'RUN' ? 'badge-run' : 'badge-stby',
          statusColor: this.tb2Status === 'RUN' ? '#00e87a' : '#ffb800',
          power: this.fmtNum(this.tb2Power),
          current: this.fmtNum(this.tb2Current),
          flow: this.fmtNum(this.tb2Flow),
          temp: this.fmtNum(this.tb2MotorTemp),
          speedPct: this.blowerSpeed[1],
        },
      ];
    },
    pumps() {
      return [
        {
          side: 'serum', name: 'SERUM PUMP P-01',
          status: this.serumPumpStatus || '—',
          statusCls: this.serumPumpStatus === 'RUN' ? 'badge-run' : 'badge-stby',
          color: '#ff7820',
          flow: this.fmtNum(this.serumFlow),
          orp: this.fmtNum(this.serumORP),
          ph: this.fmtNum(this.serumpH),
        },
        {
          side: 'latex', name: 'LATEX PUMP P-02',
          status: this.processPumpStatus || '—',
          statusCls: this.processPumpStatus === 'RUN' ? 'badge-run' : 'badge-stby',
          color: '#00c8b0',
          flow: this.fmtNum(this.processFlow),
          orp: this.fmtNum(this.processORP),
          ph: this.fmtNum(this.processpH),
        },
      ];
    },
  },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(1); },
    async cmdBlower(n, cmd) {
      const speed_pct = this.blowerSpeed[n - 1];
      this.sending = true;
      try {
        await this.$store.dispatch('staKd/cmdBlower', { n, cmd, speed_pct });
        this.showAlert(`TB-0${n} command "${cmd}" sent`, 'alert-ok');
      } catch (e) {
        this.showAlert(`Failed to send command`, 'alert-err');
      }
      this.sending = false;
    },
    async cmdPump(side, cmd) {
      this.sending = true;
      try {
        await this.$store.dispatch('staKd/cmdPump', { side, cmd });
        this.showAlert(`${side} pump "${cmd}" sent`, 'alert-ok');
      } catch (e) {
        this.showAlert(`Failed to send command`, 'alert-err');
      }
      this.sending = false;
    },
    showAlert(msg, cls) {
      this.alertMsg = msg; this.alertCls = cls;
      setTimeout(() => { this.alertMsg = ''; }, 3000);
    },
  },
};
</script>

<style scoped>
.kd-page-wrap { padding: 16px; font-family: 'Inter','Segoe UI',sans-serif; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.page-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.38); display: flex; align-items: center; gap: 8px; letter-spacing: .06em; text-transform: uppercase; }
.section-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; color: rgba(255,255,255,.2); padding: 4px 0; text-transform: uppercase; }
.ctrl-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
.ctrl-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: border-color .2s; }
.ctrl-card:hover { border-color: rgba(255,255,255,.13); }
.ctrl-card-header { display: flex; align-items: center; gap: 8px; }
.ctrl-acc { width: 4px; height: 18px; border-radius: 2px; flex-shrink: 0; }
.ctrl-name { font-size: 15px; font-weight: 700; color: #fff; flex: 1; }
.ctrl-badge { font-family: 'JetBrains Mono',monospace; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 4px; }
.badge-run  { background: rgba(184,232,52,.15); color: #b8e834; border: 1px solid rgba(184,232,52,.3); }
.badge-stby { background: rgba(255,184,0,.15); color: #ffb800; border: 1px solid rgba(255,184,0,.3); }
.ctrl-params { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.param { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px; }
.p-label { font-size: 9px; font-weight: 600; color: rgba(255,255,255,.2); letter-spacing: .08em; text-transform: uppercase; }
.p-val { font-family: 'JetBrains Mono',monospace; font-size: 13px; font-weight: 700; }
.c-green{color:#b8e834} .c-cyan{color:#00d4ff} .c-orange{color:#ff7820} .c-amber{color:#ffb800}
.ctrl-speed { display: flex; align-items: center; gap: 10px; }
.speed-label { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.2); letter-spacing: .08em; width: 46px; flex-shrink: 0; text-transform: uppercase; }
.speed-slider { flex: 1; accent-color: #d4a040; cursor: pointer; }
.speed-val { font-family: 'JetBrains Mono',monospace; font-size: 13px; font-weight: 700; color: #d4a040; width: 36px; text-align: right; flex-shrink: 0; }
.ctrl-btns { display: flex; gap: 8px; }
.ctrl-btns button { flex: 1; display: flex; align-items: center; justify-content: center; font-family: 'Inter','Segoe UI',sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .04em; padding: 9px 8px; border-radius: 8px; cursor: pointer; border: none; transition: all .15s; }
.ctrl-btns button:disabled { opacity: .35; cursor: not-allowed; }
.btn-run  { background: rgba(184,232,52,.15); color: #b8e834; border: 1px solid rgba(184,232,52,.3) !important; }
.btn-run:hover:not(:disabled)  { background: rgba(184,232,52,.28); }
.btn-stop { background: rgba(255,64,64,.15); color: #ff6060; border: 1px solid rgba(255,64,64,.3) !important; }
.btn-stop:hover:not(:disabled) { background: rgba(255,64,64,.28); }
.btn-set  { background: rgba(212,160,64,.12); color: #d4a040; border: 1px solid rgba(212,160,64,.28) !important; }
.btn-set:hover:not(:disabled)  { background: rgba(212,160,64,.25); }
.ctrl-alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.alert-ok  { background: rgba(184,232,52,.12); color: #b8e834; border: 1px solid rgba(184,232,52,.25); }
.alert-err { background: rgba(255,64,64,.12); color: #ff6060; border: 1px solid rgba(255,64,64,.25); }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
