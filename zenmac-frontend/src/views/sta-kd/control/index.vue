<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--orange)"></div>
      <h1 class="kd-page-title">PROCESS CONTROL</h1>
      <span class="kd-breadcrumb">STA-KD / CONTROL</span>
    </div>
    <ProhibitStatusBar />

    <!-- ── Web Authority Control Panel ── -->
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
        <!-- REQUEST: available when authority is not 'web' -->
        <button v-if="mqttStore.authorityTier !== 'web'"
                class="wcp-btn wcp-btn-request"
                @click="requestControl"
                :disabled="loadingBtns['REQUEST']">
          <span v-if="loadingBtns['REQUEST']" class="btn-spin"></span>
          <template v-else><i class="bx bx-upload"></i> REQUEST CONTROL</template>
        </button>
        <!-- RELEASE: shown when web is already in control -->
        <button v-else
                class="wcp-btn wcp-btn-release"
                @click="releaseControl"
                :disabled="loadingBtns['RELEASE']">
          <span v-if="loadingBtns['RELEASE']" class="btn-spin"></span>
          <template v-else><i class="bx bx-log-out"></i> RELEASE</template>
        </button>
        <!-- STATUS: always available -->
        <button class="wcp-btn wcp-btn-status"
                @click="queryStatus"
                :disabled="loadingBtns['STATUS']">
          <span v-if="loadingBtns['STATUS']" class="btn-spin"></span>
          <template v-else><i class="bx bx-refresh"></i> STATUS</template>
        </button>
      </div>
    </div>

    <!-- Status detail panel (expands after STATUS query) -->
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

    <!-- Active mode indicator + disable button -->
    <div v-if="prohibitStore.currentMode" class="kd-mode-bar">
      <span class="kd-mode-bar-label">● {{ prohibitStore.currentMode.replace(/_/g, '-') }} ACTIVE</span>
      <button class="kd-mode-bar-disable"
              @click="disableMode(prohibitStore.currentMode)"
              :disabled="loadingBtns['DISABLE_' + prohibitStore.currentMode]">
        <span v-if="loadingBtns['DISABLE_' + prohibitStore.currentMode]" class="btn-spin"></span>
        <template v-else>✕ DISABLE MODE</template>
      </button>
    </div>

    <!-- Control Tabs -->
    <div class="kd-tab-bar">
      <button v-for="t in tabs" :key="t.id" class="kd-tab-btn"
              :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
        <i class="bx" :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <!-- ══ TAB 1: ORP BANDS ══ -->
    <div v-if="activeTab === 'orp'" class="kd-ctrl-grid">
      <div class="kd-ctrl-card">
        <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--cyan)"></div>Process ORP Bands</div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Target ORP</div><div class="kd-set-sub">Target setpoint for Process</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpTarget" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Upper Band</div><div class="kd-set-sub">Upper ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpHi" class="kd-num-input amber" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Lower Band</div><div class="kd-set-sub">Lower ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="proc.orpLo" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-info-box kd-info-cyan">Current: {{ processORP }} mV &nbsp;|&nbsp; Target: {{ proc.orpTarget }} mV</div>
        <button class="kd-save-btn kd-save-cyan" @click="saveOrpBands('1')" :disabled="loadingBtns['ORP_1']">
          <span v-if="loadingBtns['ORP_1']" class="btn-spin"></span>
          <template v-else>SAVE PROCESS SETTINGS</template>
        </button>
      </div>

      <div class="kd-ctrl-card">
        <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--green)"></div>Serum ORP Bands</div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Target ORP</div><div class="kd-set-sub">Target setpoint for Serum</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpTarget" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Upper Band</div><div class="kd-set-sub">Upper ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpHi" class="kd-num-input amber" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-set-row">
          <div><div class="kd-set-label">Lower Band</div><div class="kd-set-sub">Lower ORP alarm level</div></div>
          <div class="kd-set-right"><input v-model.number="serum.orpLo" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
        </div>
        <div class="kd-info-box kd-info-green">Current: {{ serumORP }} mV &nbsp;|&nbsp; Target: {{ serum.orpTarget }} mV</div>
        <button class="kd-save-btn kd-save-green" @click="saveOrpBands('2')" :disabled="loadingBtns['ORP_2']">
          <span v-if="loadingBtns['ORP_2']" class="btn-spin"></span>
          <template v-else>SAVE SERUM SETTINGS</template>
        </button>
      </div>
    </div>

    <!-- ══ TAB 2: LOOP CONTROL ══ -->
    <div v-if="activeTab === 'loop'" class="kd-ctrl-card">
      <div class="kd-ctrl-title"><div class="kd-ctrl-dot" style="background:var(--cyan)"></div>Loop Control Settings</div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Loop Interval</div><div class="kd-set-sub">Frequency of control loop evaluation</div></div>
        <div class="kd-set-right"><input v-model.number="loop.interval" class="kd-num-input" type="number" /><span class="kd-num-unit">min</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Deadband</div><div class="kd-set-sub">No action within ±deadband of target</div></div>
        <div class="kd-set-right"><input v-model.number="loop.deadband" class="kd-num-input" type="number" /><span class="kd-num-unit">mV</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Min Blower Speed</div><div class="kd-set-sub">Minimum blower setpoint</div></div>
        <div class="kd-set-right"><input v-model.number="loop.minSpeed" class="kd-num-input green" type="number" /><span class="kd-num-unit">%</span></div>
      </div>
      <div class="kd-set-row">
        <div><div class="kd-set-label">Max Blower Speed</div><div class="kd-set-sub">Maximum blower setpoint</div></div>
        <div class="kd-set-right"><input v-model.number="loop.maxSpeed" class="kd-num-input amber" type="number" /><span class="kd-num-unit">%</span></div>
      </div>
      <button class="kd-save-btn kd-save-cyan" @click="enableLoopControl('1')" :disabled="loadingBtns['LOOP_1']">
        <span v-if="loadingBtns['LOOP_1']" class="btn-spin"></span>
        <template v-else>SAVE LOOP SETTINGS</template>
      </button>
    </div>

    <!-- ══ TAB 3: TURNING POINTS ══ -->
    <div v-if="activeTab === 'turning'" class="lp-wrap">

      <!-- ── Loop Timeline Visualization ── -->
      <div class="lp-chart-card">
        <div class="lp-chart-hdr">
          <div class="lp-chart-accent"></div>
          <span class="lp-chart-title">LOOP TIMELINE VISUALIZATION</span>
          <span class="lp-chart-dur">Loop duration: {{ activeLoopParams.loopDuration }} hr</span>
        </div>

        <div class="lp-phase-bar">
          <div class="lp-phase-seg lp-phase-rise" :style="`flex:${riseHr}`">
            <span>↑ RISE~{{ riseHr.toFixed(1) }}hr</span>
          </div>
          <div class="lp-phase-seg lp-phase-hold" :style="`flex:${(activeLoopParams.holdHigh||90)/60}`">
            <span>⏸ HOLD HIGH{{ activeLoopParams.holdHigh }}min</span>
          </div>
          <div class="lp-phase-seg lp-phase-drop" :style="`flex:${activeLoopParams.dropDuration||3}`">
            <span>↓ DROP~{{ activeLoopParams.dropDuration||3 }}hr</span>
          </div>
          <div class="lp-phase-seg lp-phase-mid" :style="`flex:${(activeLoopParams.middleDuration||60)/60}`">
            <span>= MIDDLE{{ activeLoopParams.middleDuration }}min</span>
          </div>
          <div class="lp-phase-seg lp-phase-rise" style="flex:0.4;opacity:.5">
            <span>↑ next+</span>
          </div>
        </div>

        <canvas ref="loopCanvas" class="lp-canvas"></canvas>
      </div>

      <!-- ── Loop Parameters ── -->
      <div class="lp-params-card">
        <div class="lp-params-hdr">
          <div class="lp-chart-accent" style="background:linear-gradient(180deg,#a855f7,#a855f755)"></div>
          <span class="lp-params-title">LOOP PARAMETERS</span>
          <span class="lp-params-sub">ตั้งค่าแยก On-Peak / Off-Peak</span>
        </div>

        <!-- Time range pickers -->
        <div class="lp-time-row">
          <div class="lp-time-group">
            <i class="bx bx-bell lp-time-icon" style="color:#ffcc44"></i>
            <span class="lp-time-lbl">On-Peak :</span>
            <input type="time" v-model="onPeak.startTime" class="lp-time-inp" />
            <span class="lp-time-arrow">→</span>
            <input type="time" v-model="onPeak.endTime" class="lp-time-inp" />
          </div>
          <div class="lp-time-sep"></div>
          <div class="lp-time-group">
            <i class="bx bx-moon lp-time-icon" style="color:#aa88ff"></i>
            <span class="lp-time-lbl">Off-Peak :</span>
            <input type="time" v-model="offPeak.startTime" class="lp-time-inp" />
            <span class="lp-time-arrow">→</span>
            <input type="time" v-model="offPeak.endTime" class="lp-time-inp" />
          </div>
        </div>

        <!-- ON-PEAK / OFF-PEAK toggle -->
        <div class="lp-tab-bar">
          <button class="lp-tab-btn" :class="loopTab==='on-peak'?'lp-tab-on':''" @click="loopTab='on-peak'">
            <i class="bx bx-sun"></i> ON-PEAK
          </button>
          <button class="lp-tab-btn" :class="loopTab==='off-peak'?'lp-tab-off':''" @click="loopTab='off-peak'">
            <i class="bx bx-moon"></i> OFF-PEAK
          </button>
        </div>

        <!-- 4×2 Parameter grid -->
        <div class="lp-param-grid">
          <div class="lp-param-card">
            <div class="lp-param-lbl">ORP TARGET HIGH (HH)</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-amber" v-model.number="activeLoopParams.orpHigh" />
              <span class="lp-param-unit">mV</span>
            </div>
            <div class="lp-param-desc">เป้าหมาย Rise phase</div>
          </div>
          <div class="lp-param-card">
            <div class="lp-param-lbl">HOLD TIME AT HIGH</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-cyan" v-model.number="activeLoopParams.holdHigh" />
              <span class="lp-param-unit">min</span>
            </div>
            <div class="lp-param-desc">คงที่ที่ High ก่อน Drop</div>
          </div>

          <div class="lp-param-card">
            <div class="lp-param-lbl">BLOWER MIN % (DROP)</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-green" v-model.number="activeLoopParams.blowerMin" />
              <span class="lp-param-unit">%</span>
            </div>
            <div class="lp-param-desc">หรี่สุด Drop phase</div>
          </div>
          <div class="lp-param-card">
            <div class="lp-param-lbl">ORP TARGET LOW (LL)</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-purple" v-model.number="activeLoopParams.orpLow" />
              <span class="lp-param-unit">mV</span>
            </div>
            <div class="lp-param-desc">เป้าหมาย Drop phase</div>
          </div>

          <div class="lp-param-card">
            <div class="lp-param-lbl">MIDDLE DURATION</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-purple" v-model.number="activeLoopParams.middleDuration" />
              <span class="lp-param-unit">min</span>
            </div>
            <div class="lp-param-desc">คงค่ากลาง ก่อน Rise ใหม่</div>
          </div>
          <div class="lp-param-card">
            <div class="lp-param-lbl">BLOWER MID % (MIDDLE)</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-cyan" v-model.number="activeLoopParams.blowerMid" />
              <span class="lp-param-unit">%</span>
            </div>
            <div class="lp-param-desc">กำลัง Blower ใน Middle phase</div>
          </div>

          <div class="lp-param-card">
            <div class="lp-param-lbl">LOOP DURATION</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-cyan" v-model.number="activeLoopParams.loopDuration" />
              <span class="lp-param-unit">hr</span>
            </div>
            <div class="lp-param-desc">ระยะเวลา 1 Loop รวม</div>
          </div>
          <div class="lp-param-card">
            <div class="lp-param-lbl">BLOWER MAX % (RISE)</div>
            <div class="lp-param-inp-row">
              <input type="number" class="lp-param-inp lp-inp-amber" v-model.number="activeLoopParams.blowerMax" />
              <span class="lp-param-unit">%</span>
            </div>
            <div class="lp-param-desc">กำลัง Blower สูงสุดใน Rise</div>
          </div>
        </div>

        <button class="kd-save-btn kd-save-cyan" @click="applyTurningPoint" :disabled="loadingBtns['TURNING']">
          <span v-if="loadingBtns['TURNING']" class="btn-spin"></span>
          <template v-else>SAVE LOOP PARAMETERS</template>
        </button>
      </div>

    </div><!-- /turning tab -->

    <!-- ══ TAB 4: AIRFLOW-ORP MODE ══ -->
    <div v-if="activeTab === 'airflow'" class="arp-wrap">

      <!-- Description -->
      <div class="arp-desc">
        <i class="bx bx-info-circle"></i>
        <span>Airflow-ORP Mode: ระบบตรวจค่า ORP แบบ real-time แล้วเปรียบเทียบกับ 5 Band ที่ตั้งไว้ (HH / H / ZERO / L / LL) → Blower จะปรับ Air Flow อัตโนมัติตาม Band ที่ ORP ตกอยู่ในขณะนั้น → HH (เกิน +150) = หรี่ Blower สุด | LL (ต่ำกว่า -150) = เปิด Blower เต็มที่</span>
      </div>

      <!-- Two panels -->
      <div class="arp-grid">

        <!-- ─ BL-1 SERUM panel ─ -->
        <div class="arp-panel" style="--pcolor:#ff7820">
          <div class="arp-panel-hdr">
            <div class="arp-panel-accent" style="background:linear-gradient(180deg,#ff7820 0%,#ff782055 100%)"></div>
            <div class="arp-panel-titles">
              <div class="arp-panel-name">
                AIRFLOW-ORP MODE
                <span class="arp-bl-badge" style="background:#ff782015;color:#ff9848;border-color:#ff782042">BL-1</span>
              </div>
              <div class="arp-panel-sub">SERUM (AT-1) · 5-Band ORP → Air Flow Control</div>
            </div>
            <div class="arp-panel-status-chip" :class="arpActive1 ? 'arp-psc-on' : 'arp-psc-off'">
              {{ arpActive1 ? '◉ ENABLED' : '○ OFF' }}
            </div>
          </div>

          <!-- Current ORP indicator -->
          <div class="arp-cur-row"
               :style="`border-left-color:${activeBandColor(activeSerumBand,'serum')};background:${activeBandColor(activeSerumBand,'serum')}12`">
            <i class="bx bx-pulse arp-cur-icon"></i>
            <span class="arp-cur-lbl">SERUM ORP</span>
            <span class="arp-cur-val" :style="`color:${activeBandColor(activeSerumBand,'serum')};text-shadow:0 0 14px ${activeBandColor(activeSerumBand,'serum')}66`">{{ serumORP }} mV</span>
            <div class="arp-cur-spacer"></div>
            <span class="arp-cur-zone" :style="`color:${activeBandColor(activeSerumBand,'serum')};border-color:${activeBandColor(activeSerumBand,'serum')}55;background:${activeBandColor(activeSerumBand,'serum')}18;box-shadow:0 0 10px ${activeBandColor(activeSerumBand,'serum')}30`">
              {{ arpBandsSerum[activeSerumBand]?.zone || '—' }}
            </span>
          </div>

          <table class="arp-table">
            <thead>
              <tr>
                <th>ZONE</th>
                <th>ORP LOW (mV)</th>
                <th>ORP HIGH (mV)</th>
                <th class="th-cmm">TURBO FLOW SET (CMM)</th>
                <th class="th-rt">REAL-TIME (CMM)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in arpBandsSerum" :key="i"
                  :class="i===activeSerumBand ? 'arp-row-active' : ''"
                  :style="i===activeSerumBand ? `border-left:2px solid ${b.color};background:${b.color}10` : ''">
                <td>
                  <span class="zone-bdg" :style="`background:${b.color}20;color:${b.color};border:1px solid ${b.color}50;box-shadow:0 0 8px ${b.color}28`">{{ b.zone }}</span>
                </td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_lo" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_hi" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp arp-inp-cmm" v-model.number="b.flow_cmm" min="0" max="200" step="0.1" /></td>
                <td>
                  <span v-if="i===activeSerumBand" class="arp-rt-val">
                    <span class="arp-rt-dot"></span>{{ rtCmm1 !== null ? rtCmm1 : '—' }}
                  </span>
                  <span v-else class="arp-rt-idle">—</span>
                </td>
                <td>
                  <span class="arp-status" :class="i===activeSerumBand ? 'arp-active' : 'arp-idle'">
                    {{ i===activeSerumBand ? '● ACTIVE' : 'IDLE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Band bar -->
          <div class="arp-band-bar">
            <div v-for="(b, i) in arpBandsSerum.slice().reverse()" :key="i"
                 class="arp-band-seg"
                 :style="`background:linear-gradient(180deg,${b.color}44 0%,${b.color}1e 100%);border-color:${b.color}50;${arpBandsSerum.length-1-i===activeSerumBand?'box-shadow:inset 0 0 20px '+b.color+'40,0 0 8px '+b.color+'30;':''}`"
                 :class="arpBandsSerum.length-1-i === activeSerumBand ? 'arp-seg-active' : ''">
              <span class="arp-band-zone"
                    :style="`color:${b.color};${arpBandsSerum.length-1-i===activeSerumBand?'text-shadow:0 0 8px '+b.color+'99;':''}`">{{ b.zone }}</span>
              <span class="arp-band-range">{{ bandRangeLabel(b, i, arpBandsSerum.length) }}</span>
            </div>
          </div>

          <div class="arp-footer">
            <label class="arp-toggle-wrap">
              <div class="arp-toggle" :class="arpActive1 ? 'arp-toggle-on' : ''" @click="arpActive1=!arpActive1">
                <div class="arp-toggle-knob"></div>
              </div>
              <span class="arp-toggle-lbl" :style="arpActive1 ? 'color:#00e87a' : ''">
                AIRFLOW-ORP MODE {{ arpActive1 ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </label>
            <button class="arp-save-btn" @click="enableAirflowORP('1')" :disabled="loadingBtns['ARP_1']">
              <span v-if="loadingBtns['ARP_1']" class="btn-spin"></span>
              <template v-else><i class="bx bx-save"></i> SAVE BL-1</template>
            </button>
          </div>
        </div>

        <!-- ─ BL-2 LATEX panel ─ -->
        <div class="arp-panel" style="--pcolor:#00e87a">
          <div class="arp-panel-hdr">
            <div class="arp-panel-accent" style="background:linear-gradient(180deg,#00e87a 0%,#00e87a55 100%)"></div>
            <div class="arp-panel-titles">
              <div class="arp-panel-name">
                AIRFLOW-ORP MODE
                <span class="arp-bl-badge" style="background:#00e87a15;color:#00e87a;border-color:#00e87a42">BL-2</span>
              </div>
              <div class="arp-panel-sub">LATEX (AT-2) · 5-Band ORP → Air Flow Control</div>
            </div>
            <div class="arp-panel-status-chip" :class="arpActive2 ? 'arp-psc-on' : 'arp-psc-off'">
              {{ arpActive2 ? '◉ ENABLED' : '○ OFF' }}
            </div>
          </div>

          <div class="arp-cur-row"
               :style="`border-left-color:${activeBandColor(activeLatexBand,'latex')};background:${activeBandColor(activeLatexBand,'latex')}12`">
            <i class="bx bx-pulse arp-cur-icon"></i>
            <span class="arp-cur-lbl">LATEX ORP</span>
            <span class="arp-cur-val" :style="`color:${activeBandColor(activeLatexBand,'latex')};text-shadow:0 0 14px ${activeBandColor(activeLatexBand,'latex')}66`">{{ processORP }} mV</span>
            <div class="arp-cur-spacer"></div>
            <span class="arp-cur-zone" :style="`color:${activeBandColor(activeLatexBand,'latex')};border-color:${activeBandColor(activeLatexBand,'latex')}55;background:${activeBandColor(activeLatexBand,'latex')}18;box-shadow:0 0 10px ${activeBandColor(activeLatexBand,'latex')}30`">
              {{ arpBandsLatex[activeLatexBand]?.zone || '—' }}
            </span>
          </div>

          <table class="arp-table">
            <thead>
              <tr>
                <th>ZONE</th>
                <th>ORP LOW (mV)</th>
                <th>ORP HIGH (mV)</th>
                <th class="th-cmm">TURBO FLOW SET (CMM)</th>
                <th class="th-rt">REAL-TIME (CMM)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in arpBandsLatex" :key="i"
                  :class="i===activeLatexBand ? 'arp-row-active' : ''"
                  :style="i===activeLatexBand ? `border-left:2px solid ${b.color};background:${b.color}10` : ''">
                <td>
                  <span class="zone-bdg" :style="`background:${b.color}20;color:${b.color};border:1px solid ${b.color}50;box-shadow:0 0 8px ${b.color}28`">{{ b.zone }}</span>
                </td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_lo" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp" v-model.number="b.orp_hi" :style="`color:${b.color}`" /></td>
                <td><input type="number" class="arp-inp arp-inp-cmm" v-model.number="b.flow_cmm" min="0" max="200" step="0.1" /></td>
                <td>
                  <span v-if="i===activeLatexBand" class="arp-rt-val">
                    <span class="arp-rt-dot"></span>{{ rtCmm2 !== null ? rtCmm2 : '—' }}
                  </span>
                  <span v-else class="arp-rt-idle">—</span>
                </td>
                <td>
                  <span class="arp-status" :class="i===activeLatexBand ? 'arp-active' : 'arp-idle'">
                    {{ i===activeLatexBand ? '● ACTIVE' : 'IDLE' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="arp-band-bar">
            <div v-for="(b, i) in arpBandsLatex.slice().reverse()" :key="i"
                 class="arp-band-seg"
                 :style="`background:linear-gradient(180deg,${b.color}44 0%,${b.color}1e 100%);border-color:${b.color}50;${arpBandsLatex.length-1-i===activeLatexBand?'box-shadow:inset 0 0 20px '+b.color+'40,0 0 8px '+b.color+'30;':''}`"
                 :class="arpBandsLatex.length-1-i === activeLatexBand ? 'arp-seg-active' : ''">
              <span class="arp-band-zone"
                    :style="`color:${b.color};${arpBandsLatex.length-1-i===activeLatexBand?'text-shadow:0 0 8px '+b.color+'99;':''}`">{{ b.zone }}</span>
              <span class="arp-band-range">{{ bandRangeLabel(b, i, arpBandsLatex.length) }}</span>
            </div>
          </div>

          <div class="arp-footer">
            <label class="arp-toggle-wrap">
              <div class="arp-toggle" :class="arpActive2 ? 'arp-toggle-on' : ''" @click="arpActive2=!arpActive2">
                <div class="arp-toggle-knob"></div>
              </div>
              <span class="arp-toggle-lbl" :style="arpActive2 ? 'color:#00e87a' : ''">
                AIRFLOW-ORP MODE {{ arpActive2 ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </label>
            <button class="arp-save-btn" @click="enableAirflowORP('2')" :disabled="loadingBtns['ARP_2']">
              <span v-if="loadingBtns['ARP_2']" class="btn-spin"></span>
              <template v-else><i class="bx bx-save"></i> SAVE BL-2</template>
            </button>
          </div>
        </div>

      </div><!-- /arp-grid -->
    </div><!-- /airflow tab -->

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useProhibit }    from '@/composables/useProhibit';
import { useMqttStore }   from '@/stores/useMqttStore';

const DEFAULT_BANDS = () => [
  { zone:'HH', color:'#dd4444', orp_lo:150,  orp_hi:999,  flow_cmm:20.0 },
  { zone:'H',  color:'#cc8833', orp_lo:75,   orp_hi:150,  flow_cmm:45.0 },
  { zone:'ZERO',color:'#2a8a7a',orp_lo:-75,  orp_hi:75,   flow_cmm:63.3 },
  { zone:'L',  color:'#44aa55', orp_lo:-150, orp_hi:-75,  flow_cmm:83.3 },
  { zone:'LL', color:'#8844cc', orp_lo:-999, orp_hi:-150, flow_cmm:100.0 },
];

export default {
  name: 'StaKdControl',

  setup() {
    const { guardedAction, store } = useProhibit();
    const mqtt = useMqttStore();
    return { guardedAction, prohibitStore: store, mqttStore: mqtt };
  },

  data() {
    return {
      activeTab: 'orp',
      tabs: [
        { id: 'orp',     label: 'ORP BANDS',       icon: 'bx-pulse' },
        { id: 'loop',    label: 'LOOP CONTROL',     icon: 'bx-slider' },
        { id: 'turning', label: 'TURNING POINTS',   icon: 'bx-git-branch' },
        { id: 'airflow', label: 'AIRFLOW-ORP MODE', icon: 'bx-wind' },
      ],
      proc:  { orpTarget: 50, orpHi: 120, orpLo: -50 },
      serum: { orpTarget: 30, orpHi: 100, orpLo: -60 },
      loop:  { interval: 5, deadband: 10, minSpeed: 30, maxSpeed: 100 },
      loopTab: 'on-peak',
      onPeak: {
        startTime: '06:00', endTime: '10:00',
        orpHigh: 150, orpLow: -150,
        holdHigh: 90, dropDuration: 3,
        blowerMin: 20, blowerMax: 95, blowerMid: 60,
        middleDuration: 60, loopDuration: 12,
      },
      offPeak: {
        startTime: '10:00', endTime: '06:00',
        orpHigh: 120, orpLow: -120,
        holdHigh: 60, dropDuration: 3,
        blowerMin: 15, blowerMax: 80, blowerMid: 50,
        middleDuration: 60, loopDuration: 12,
      },
      // AIRFLOW-ORP MODE
      arpActive1: true,
      arpActive2: true,
      arpBandsSerum: DEFAULT_BANDS(),
      arpBandsLatex: DEFAULT_BANDS(),
      loadingBtns:   {},
      statusVisible: false,
      statusData:    null,
      statusTs:      null,
    };
  },
  computed: {
    ...mapGetters('staKd', ['processORP', 'serumORP', 'tb1Flow', 'tb2Flow']),
    activeLoopParams() { return this.loopTab === 'on-peak' ? this.onPeak : this.offPeak; },
    riseHr() {
      const p = this.activeLoopParams;
      return Math.max(0.5, (p.loopDuration||12) - (p.holdHigh||90)/60 - (p.dropDuration||3) - (p.middleDuration||60)/60);
    },
    rtCmm1() { const n=parseFloat(this.tb1Flow); return isNaN(n)?null:+n.toFixed(1); },
    rtCmm2() { const n=parseFloat(this.tb2Flow); return isNaN(n)?null:+n.toFixed(1); },
    activeSerumBand() {
      const v = parseFloat(this.serumORP);
      if (isNaN(v)) return 2;
      const b = this.arpBandsSerum;
      if (v >= b[0].orp_lo) return 0;
      if (v >= b[1].orp_lo) return 1;
      if (v >= b[2].orp_lo) return 2;
      if (v >= b[3].orp_lo) return 3;
      return 4;
    },
    activeLatexBand() {
      const v = parseFloat(this.processORP);
      if (isNaN(v)) return 2;
      const b = this.arpBandsLatex;
      if (v >= b[0].orp_lo) return 0;
      if (v >= b[1].orp_lo) return 1;
      if (v >= b[2].orp_lo) return 2;
      if (v >= b[3].orp_lo) return 3;
      return 4;
    },
  },
  watch: {
    activeTab(val) {
      if (val === 'turning') this.$nextTick(this.drawLoopChart);
    },
    loopTab() {
      if (this.activeTab === 'turning') this.$nextTick(this.drawLoopChart);
    },
    onPeak:  { deep: true, handler() { if (this.activeTab === 'turning') this.$nextTick(this.drawLoopChart); } },
    offPeak: { deep: true, handler() { if (this.activeTab === 'turning') this.$nextTick(this.drawLoopChart); } },
  },
  methods: {
    // ── Guarded control actions ───────────────────────────────────────────
    saveOrpBands(blower) {
      this.guardedAction('SAVE_ORP_BANDS', 'AUTO_MODE', () => {
        this._startLoading('ORP_' + blower);
        this.prohibitStore.setMode('ORP_BANDS');
        const settings = blower === '1' ? { ...this.proc } : { ...this.serum };
        const payload = { target: 'BL-' + blower, ...settings, _meta: this._mqttMeta() };
        console.log('[MQTT] kd:orp-bands:set', payload);
      }, { cooldownMs: 10000, conflictModes: ['LOOP_CONTROL', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    enableLoopControl(blower) {
      this.guardedAction('ENABLE_LOOP', 'AUTO_MODE', () => {
        this._startLoading('LOOP_' + blower);
        this.prohibitStore.setMode('LOOP_CONTROL');
        const payload = { target: 'BL-' + blower, ...this.loop, _meta: this._mqttMeta() };
        console.log('[MQTT] kd:loop-control:enable', payload);
      }, { cooldownMs: 5000, conflictModes: ['AIRFLOW_ORP', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    applyTurningPoint() {
      this.guardedAction('APPLY_TURNING_POINT', 'AUTO_MODE', () => {
        this._startLoading('TURNING');
        this.prohibitStore.setMode('TURNING_POINTS');
        const params = this.loopTab === 'on-peak' ? { ...this.onPeak } : { ...this.offPeak };
        const payload = { schedule: this.loopTab, params, _meta: this._mqttMeta() };
        console.log('[MQTT] kd:turning-points:apply', payload);
      }, { cooldownMs: 15000, conflictModes: ['AIRFLOW_ORP', 'LOOP_CONTROL'] });
    },

    enableAirflowORP(blower) {
      this.guardedAction('ENABLE_AIRFLOW_ORP', 'AUTO_MODE', () => {
        this._startLoading('ARP_' + blower);
        this.prohibitStore.setMode('AIRFLOW_ORP');
        const bands  = blower === '1' ? this.arpBandsSerum : this.arpBandsLatex;
        const active = blower === '1' ? this.arpActive1    : this.arpActive2;
        const payload = {
          target: 'BL-' + blower, enabled: active,
          bands: bands.map(b => ({ ...b })),
          _meta: this._mqttMeta(),
        };
        console.log('[MQTT] kd:airflow-orp:enable', payload);
      }, { cooldownMs: 5000, conflictModes: ['LOOP_CONTROL', 'TURNING_POINTS'], target: 'BL-' + blower });
    },

    disableMode(mode) {
      this.guardedAction('DISABLE_MODE', 'AUTO_MODE', () => {
        this._startLoading('DISABLE_' + mode);
        this.prohibitStore.clearMode(mode);
        const payload = { mode, _meta: this._mqttMeta() };
        console.log('[MQTT] kd:mode:disable', payload);
      }, { cooldownMs: 2000, target: mode });
    },

    // ── Authority & status ───────────────────────────────────────────────
    requestControl() {
      this._startLoading('REQUEST');
      this.mqttStore.setAuthorityTier('web');
      this.statusVisible = false;
      var payload = { action: 'REQUEST_CONTROL', source: 'web', _meta: this._mqttMeta() };
      console.log('[MQTT] kd:authority:request', payload);
    },

    releaseControl() {
      this._startLoading('RELEASE');
      this.mqttStore.setAuthorityTier('hmi');
      var payload = { action: 'RELEASE_CONTROL', source: 'web', _meta: this._mqttMeta() };
      console.log('[MQTT] kd:authority:release', payload);
    },

    queryStatus() {
      var self = this;
      this._startLoading('STATUS', 700);
      var now = new Date();
      var ts  = now.toLocaleTimeString('th-TH', { hour12: false });
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
      var payload = { action: 'STATUS_REQUEST', source: 'web', _meta: this._mqttMeta() };
      console.log('[MQTT] kd:status:request', payload);
    },

    // ── Helpers ──────────────────────────────────────────────────────────
    _mqttMeta() {
      return {
        source:          'web',
        token:           null,
        ts:              Date.now(),
        op_id:           this._nanoid(),
        prohibit_check:  'PASSED',
      };
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

    drawLoopChart() {
      const canvas = this.$refs.loopCanvas;
      if (!canvas) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const p       = this.activeLoopParams;
      const holdHr  = (p.holdHigh || 90) / 60;
      const midHr   = (p.middleDuration || 60) / 60;
      const dropHr  = p.dropDuration || 3;
      const riseHr  = this.riseHr;
      const orpHi   = p.orpHigh || 150;
      const orpLo   = p.orpLow  || -150;
      const orpSpan = orpHi - orpLo;

      // display 1.45 cycles
      const t0 = 0,  t1 = riseHr, t2 = t1 + holdHr, t3 = t2 + dropHr, t4 = t3 + midHr;
      const displayEnd = t4 + riseHr * 0.45;

      const PL = 52, PR = 12, PT = 22, PB = 14;
      const cW = W - PL - PR, cH = H - PT - PB;
      const yMin = orpLo - orpSpan * 0.18, yMax = orpHi + orpSpan * 0.18;

      const xOf = hr => PL + (hr / displayEnd) * cW;
      const yOf = mv => PT + (1 - (mv - yMin) / (yMax - yMin)) * cH;

      ctx.clearRect(0, 0, W, H);

      // Background gradient (subtle)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, 'rgba(30,50,30,.06)');
      bgGrad.addColorStop(0.5, 'rgba(8,12,22,.0)');
      bgGrad.addColorStop(1, 'rgba(60,20,80,.06)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Reference lines
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 0.8;
      [
        { v: orpHi, color: 'rgba(204,136,51,.28)' },
        { v: 0,     color: 'rgba(200,220,240,.1)'  },
        { v: orpLo, color: 'rgba(136,68,204,.28)'  },
      ].forEach(({ v, color }) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(PL, yOf(v));
        ctx.lineTo(W - PR, yOf(v));
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.textBaseline = 'bottom';
      ctx.font = `bold 9px monospace`;
      [
        { v: orpHi, text: `HIGH ${orpHi >= 0 ? '+' : ''}${orpHi}`, color: 'rgba(204,136,51,.75)' },
        { v: 0,     text: 'MID _0',                                   color: 'rgba(200,220,240,.4)' },
        { v: orpLo, text: `LOW ${orpLo}`,                             color: 'rgba(136,68,204,.75)' },
      ].forEach(({ v, text, color }) => {
        ctx.fillStyle = color;
        ctx.fillText(text, 2, yOf(v) - 2);
      });

      // Helper: smooth bezier through point array
      const bezier = (pts, color, lw = 2.5) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.moveTo(xOf(pts[0].t), yOf(pts[0].v));
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const cx = (xOf(a.t) + xOf(b.t)) / 2;
          ctx.bezierCurveTo(cx, yOf(a.v), cx, yOf(b.v), xOf(b.t), yOf(b.v));
        }
        ctx.stroke();
      };

      // RISE (green)
      bezier([
        { t: t0, v: 0 },
        { t: t0 + riseHr * 0.25, v: orpHi * 0.1 },
        { t: t0 + riseHr * 0.7,  v: orpHi * 0.85 },
        { t: t1, v: orpHi },
      ], '#44cc88');

      // HOLD (teal flat)
      bezier([{ t: t1, v: orpHi }, { t: t2, v: orpHi }], '#00b8d0');

      // DROP (red → purple gradient)
      const dg = ctx.createLinearGradient(xOf(t2), 0, xOf(t3), 0);
      dg.addColorStop(0, '#dd4444'); dg.addColorStop(0.5, '#cc4488'); dg.addColorStop(1, '#9944bb');
      ctx.beginPath(); ctx.strokeStyle = dg; ctx.lineWidth = 2.5;
      ctx.moveTo(xOf(t2), yOf(orpHi));
      const cx3 = (xOf(t2) + xOf(t3)) / 2;
      ctx.bezierCurveTo(cx3, yOf(orpHi), cx3, yOf(orpLo), xOf(t3), yOf(orpLo));
      ctx.stroke();

      // MIDDLE (purple → mid 0)
      bezier([
        { t: t3, v: orpLo },
        { t: t3 + midHr * 0.55, v: orpLo * 0.35 },
        { t: t4, v: 0 },
      ], '#9955dd');

      // Next RISE (green, faded)
      const t5 = t4 + riseHr * 0.45;
      const frac = (t5 - t4) / riseHr;
      bezier([
        { t: t4, v: 0 },
        { t: t4 + (t5 - t4) * 0.6, v: orpHi * frac * 0.55 },
        { t: t5, v: orpHi * frac },
      ], 'rgba(68,204,136,.55)', 2);
    },
    saveArp(n) { this.enableAirflowORP(String(n)); },
    activeBandColor(idx, side) {
      const bands = side === 'serum' ? this.arpBandsSerum : this.arpBandsLatex;
      return bands[idx]?.color || '#888';
    },
    bandRangeLabel(b, reversedIdx, total) {
      // reversedIdx: 0=LL, 1=L, 2=ZERO, 3=H, 4=HH in reversed slice
      if (reversedIdx === 0)         return `(←${b.orp_hi})`;
      if (reversedIdx === total - 1) return `(>${b.orp_lo})`;
      return `(${b.orp_lo} to ${b.orp_hi})`;
    },
  },
};
</script>

<style scoped>
.kd-page { display: flex; flex-direction: column; gap: 9px; }
.kd-page-title-bar { display: flex; align-items: center; gap: 9px; }
.kd-page-accent { width: 4px; height: 22px; border-radius: 2px; }
.kd-page-title { font-family: var(--font-ui); font-weight: 700; font-size: 18px; letter-spacing: .1em; }
.kd-breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-left: auto; }

.kd-tab-bar { display: flex; gap: 6px; }
.kd-tab-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 6px 14px; border-radius: 6px; cursor: pointer;
  border: 1px solid var(--border2); background: var(--bg2); color: var(--text2);
  transition: all .15s; display: flex; align-items: center; gap: 6px;
}
.kd-tab-btn.active { background: rgba(0,212,255,.13); color: var(--cyan); border-color: rgba(0,212,255,.32); }
.kd-tab-btn:hover:not(.active) { border-color: var(--border3); }

.kd-ctrl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.kd-ctrl-card { background: rgba(10,14,20,.92); border: 1px solid var(--border2); border-radius: 11px; padding: 14px 16px; }
.kd-ctrl-title { font-family: var(--font-ui); font-weight: 700; font-size: 15px; letter-spacing: .06em; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
.kd-ctrl-dot { width: 4px; height: 20px; border-radius: 2px; }

.kd-set-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
.kd-set-row:last-of-type { border-bottom: none; }
.kd-set-label { font-family: var(--font-ui); font-size: 13px; color: var(--text2); font-weight: 500; }
.kd-set-sub { font-family: var(--font-mono); font-size: 8.5px; color: var(--text3); margin-top: 2px; }
.kd-set-right { display: flex; align-items: center; gap: 8px; }
.kd-num-input { width: 74px; font-family: var(--font-mono); font-size: 14px; font-weight: 700; background: rgba(18,28,44,.85); border: 1px solid var(--border2); color: var(--cyan); padding: 5px 8px; border-radius: 6px; outline: none; text-align: center; }
.kd-num-input:focus { border-color: rgba(0,212,255,.5); }
.kd-num-input.amber { color: var(--amber); }
.kd-num-input.green { color: var(--green); }
.kd-num-unit { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
.kd-info-box { font-family: var(--font-mono); font-size: 10px; line-height: 1.55; padding: 9px 12px; border-radius: 7px; margin-top: 8px; }
.kd-info-cyan  { background: rgba(0,212,255,.06); border: 1px solid rgba(0,212,255,.18); color: #70b8d0; }
.kd-info-green { background: rgba(0,232,122,.06); border: 1px solid rgba(0,232,122,.18); color: #60b880; }
.kd-save-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all .15s; border: 1px solid; margin-top: 12px; }
.kd-save-cyan  { background: rgba(0,212,255,.1); color: var(--cyan); border-color: rgba(0,212,255,.3); }
.kd-save-cyan:hover  { background: rgba(0,212,255,.18); }
.kd-save-green { background: rgba(0,232,122,.1); color: var(--green); border-color: rgba(0,232,122,.3); }
.kd-save-green:hover { background: rgba(0,232,122,.18); }

/* ══ LOOP TIMELINE (Turning Points tab) ══ */
.lp-wrap { display: flex; flex-direction: column; gap: 10px; }

.lp-chart-card {
  background: linear-gradient(155deg, rgba(12,18,30,.97) 0%, rgba(8,12,20,.99) 100%);
  border: 1px solid rgba(255,255,255,.1); border-top: 1px solid rgba(255,255,255,.18);
  border-radius: 12px; padding: 14px 16px; gap: 10px;
  display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
}
.lp-chart-hdr { display: flex; align-items: center; gap: 10px; }
.lp-chart-accent {
  width: 3px; height: 22px; border-radius: 2px; flex-shrink: 0;
  background: linear-gradient(180deg, #44cc88, #44cc8844);
}
.lp-chart-title {
  font-family: var(--font-mono); font-size: 12px; font-weight: 800;
  letter-spacing: .1em; color: rgba(220,235,250,.9);
}
.lp-chart-dur {
  margin-left: auto; font-family: var(--font-mono); font-size: 10px;
  color: rgba(200,220,240,.35); letter-spacing: .05em;
}

.lp-phase-bar {
  display: flex; border-radius: 6px; overflow: hidden; height: 28px;
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 2px 10px rgba(0,0,0,.3);
}
.lp-phase-seg {
  display: flex; align-items: center; justify-content: center; min-width: 0;
  font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .05em;
  border-right: 1px solid rgba(0,0,0,.3); overflow: hidden; transition: flex .35s;
}
.lp-phase-seg:last-child { border-right: none; }
.lp-phase-seg span { white-space: nowrap; padding: 0 7px; }
.lp-phase-rise { background: rgba(38,130,65,.55);  color: #88ffaa; }
.lp-phase-hold { background: rgba(0,130,145,.5);   color: #88eeff; }
.lp-phase-drop { background: rgba(130,38,38,.55);  color: #ffaaaa; }
.lp-phase-mid  { background: rgba(100,38,160,.5);  color: #ddaaff; }

.lp-canvas {
  width: 100%; height: 165px; display: block;
  border-radius: 6px; background: rgba(255,255,255,.015);
}

/* Parameters card */
.lp-params-card {
  background: linear-gradient(155deg, rgba(14,20,32,.97) 0%, rgba(9,13,22,.99) 100%);
  border: 1px solid rgba(255,255,255,.1); border-top: 1px solid rgba(255,255,255,.18);
  border-radius: 12px; padding: 16px 18px; gap: 12px;
  display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
}
.lp-params-hdr {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06);
}
.lp-params-title {
  font-family: var(--font-mono); font-size: 12px; font-weight: 800;
  letter-spacing: .1em; color: rgba(220,235,250,.9);
}
.lp-params-sub {
  margin-left: auto; font-family: var(--font-mono); font-size: 9px;
  color: rgba(200,220,240,.28); letter-spacing: .04em;
}

/* Time pickers */
.lp-time-row {
  display: flex; gap: 0; align-items: center;
  background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px; padding: 10px 16px;
}
.lp-time-group { display: flex; align-items: center; gap: 8px; flex: 1; }
.lp-time-sep { width: 1px; height: 26px; background: rgba(255,255,255,.08); margin: 0 16px; flex-shrink: 0; }
.lp-time-icon { font-size: 14px; flex-shrink: 0; }
.lp-time-lbl {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  color: rgba(200,220,240,.45); letter-spacing: .06em; white-space: nowrap;
}
.lp-time-inp {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  background: rgba(14,20,34,.88); border: 1px solid rgba(255,255,255,.1);
  color: var(--cyan); padding: 5px 8px; border-radius: 6px; outline: none;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.3);
}
.lp-time-inp:focus { border-color: rgba(0,212,255,.45); }
.lp-time-arrow {
  font-family: var(--font-mono); font-size: 13px; color: rgba(200,220,240,.25); flex-shrink: 0;
}

/* ON-PEAK / OFF-PEAK tabs */
.lp-tab-bar { display: flex; gap: 6px; }
.lp-tab-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  padding: 7px 20px; border-radius: 6px; cursor: pointer; letter-spacing: .08em;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04);
  color: rgba(200,220,240,.3); transition: all .2s;
  display: flex; align-items: center; gap: 6px;
}
.lp-tab-on {
  background: rgba(204,140,0,.16); color: #ffcc44;
  border-color: rgba(204,140,0,.38); box-shadow: 0 0 12px rgba(204,140,0,.18);
}
.lp-tab-off {
  background: rgba(88,48,180,.18); color: #aa88ff;
  border-color: rgba(120,72,210,.35); box-shadow: 0 0 12px rgba(100,56,200,.18);
}

/* Parameter grid */
.lp-param-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.lp-param-card {
  background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px; padding: 11px 13px;
  display: flex; flex-direction: column; gap: 5px;
  transition: background .15s, border-color .15s;
}
.lp-param-card:hover { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.11); }
.lp-param-lbl {
  font-family: var(--font-mono); font-size: 7.5px; font-weight: 700;
  color: rgba(200,215,230,.28); letter-spacing: .13em; text-transform: uppercase;
}
.lp-param-inp-row { display: flex; align-items: baseline; gap: 7px; }
.lp-param-inp {
  width: 72px; font-family: var(--font-mono); font-size: 20px; font-weight: 800;
  background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,.1);
  outline: none; padding: 2px 0; letter-spacing: .02em; transition: border-color .15s;
}
.lp-param-inp:focus { border-bottom-color: rgba(0,212,255,.5); }
.lp-param-unit {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: rgba(200,215,230,.38); padding-bottom: 2px;
}
.lp-param-desc { font-family: var(--font-mono); font-size: 8.5px; color: rgba(200,215,230,.25); }
.lp-inp-amber  { color: var(--amber); }
.lp-inp-cyan   { color: var(--cyan);  }
.lp-inp-green  { color: var(--green); }
.lp-inp-purple { color: #a855f7; }

/* ══ AIRFLOW-ORP MODE ══ */
.arp-wrap { display: flex; flex-direction: column; gap: 12px; }

.arp-desc {
  font-family: var(--font-mono); font-size: 10px; line-height: 1.65;
  background: linear-gradient(90deg, rgba(0,212,255,.07) 0%, rgba(0,212,255,.02) 100%);
  border: 1px solid rgba(0,212,255,.16); border-left: 3px solid rgba(0,212,255,.45);
  border-radius: 8px; padding: 10px 14px; color: rgba(200,220,240,.48);
  display: flex; gap: 8px; align-items: flex-start;
  box-shadow: 0 2px 14px rgba(0,0,0,.22);
}
.arp-desc i { font-size: 14px; color: rgba(0,212,255,.6); flex-shrink: 0; margin-top: 1px; }

.arp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.arp-panel {
  background: linear-gradient(155deg, rgba(16,22,36,.97) 0%, rgba(9,13,22,.99) 100%);
  border: 1px solid rgba(255,255,255,.1); border-top: 1px solid rgba(255,255,255,.16);
  box-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
  border-radius: 12px; padding: 16px 18px;
  display: flex; flex-direction: column; gap: 12px;
  position: relative; overflow: hidden;
}
.arp-panel::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(90deg, transparent 0%, var(--pcolor, rgba(0,212,255,.6)) 35%, transparent 100%);
}

.arp-panel-hdr {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06);
}
.arp-panel-accent { width: 3px; height: 34px; border-radius: 2px; flex-shrink: 0; }
.arp-panel-titles { flex: 1; min-width: 0; }
.arp-panel-name {
  font-family: var(--font-mono); font-size: 11.5px; font-weight: 700;
  letter-spacing: .07em; color: rgba(222,232,248,.9);
  display: flex; align-items: center; gap: 8px;
}
.arp-panel-sub { font-family: var(--font-mono); font-size: 8.5px; color: rgba(200,215,230,.28); margin-top: 3px; letter-spacing: .04em; }
.arp-bl-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 800;
  padding: 2px 8px; border-radius: 4px; border: 1px solid; letter-spacing: .12em;
}
.arp-panel-status-chip {
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; border: 1px solid; letter-spacing: .07em;
  flex-shrink: 0; transition: all .2s;
}
.arp-psc-on  { color: #00e87a; border-color: rgba(0,232,122,.32); background: rgba(0,232,122,.1); box-shadow: 0 0 10px rgba(0,232,122,.18); }
.arp-psc-off { color: rgba(200,215,230,.22); border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.03); }

/* Current ORP indicator */
.arp-cur-row {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono);
  border: 1px solid rgba(255,255,255,.07); border-left: 3px solid;
  border-radius: 8px; padding: 9px 13px;
  box-shadow: 0 2px 10px rgba(0,0,0,.2);
  transition: border-left-color .3s;
}
.arp-cur-icon { font-size: 15px; color: rgba(200,215,230,.28); flex-shrink: 0; }
.arp-cur-lbl {
  font-size: 8.5px; font-weight: 700; color: rgba(200,215,230,.32);
  letter-spacing: .1em; text-transform: uppercase;
}
.arp-cur-val { font-size: 17px; font-weight: 800; letter-spacing: .02em; margin-left: 2px; }
.arp-cur-spacer { flex: 1; }
.arp-cur-zone {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  padding: 3px 11px; border-radius: 5px; border: 1px solid; letter-spacing: .1em;
}

/* Table */
.arp-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 10px; }
.arp-table th {
  font-size: 8px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(200,215,230,.24); padding: 5px 8px; text-align: left;
  border-bottom: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.012);
}
.arp-table td { padding: 5px 8px; vertical-align: middle; }
.arp-table tr { border-bottom: 1px solid rgba(255,255,255,.034); transition: background .12s; }
.arp-table tbody tr:hover { background: rgba(255,255,255,.024); }
.arp-row-active { /* left border + bg injected inline per zone color */ }

.zone-bdg {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  padding: 3px 10px; border-radius: 5px; letter-spacing: .06em;
  display: inline-block; text-align: center; min-width: 44px;
}

.arp-inp {
  width: 70px; font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  background: rgba(14,20,34,.88); border: 1px solid rgba(255,255,255,.09);
  color: rgba(200,220,240,.75); padding: 4px 6px; border-radius: 5px;
  outline: none; text-align: center; transition: all .15s;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.28);
}
.arp-inp:focus {
  border-color: rgba(0,212,255,.42); background: rgba(20,30,50,.92);
  box-shadow: inset 0 1px 3px rgba(0,0,0,.28), 0 0 0 2px rgba(0,212,255,.08);
}
.th-cmm { color: var(--cyan) !important; letter-spacing: .08em; }
.th-rt  { color: #00e87a !important; letter-spacing: .08em; }
.arp-inp-cmm {
  color: var(--cyan) !important; border-color: rgba(0,212,255,.2) !important;
  background: rgba(0,212,255,.05) !important; width: 76px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.2), 0 0 0 1px rgba(0,212,255,.05) !important;
}
.arp-inp-cmm:focus {
  border-color: rgba(0,212,255,.52) !important; background: rgba(0,212,255,.1) !important;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.2), 0 0 0 2px rgba(0,212,255,.1) !important;
}
.arp-rt-val {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 800;
  color: #00e87a; letter-spacing: .02em;
}
.arp-rt-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #00e87a; flex-shrink: 0;
  animation: rtpulse 1.4s ease-in-out infinite;
}
@keyframes rtpulse {
  0%,100% { box-shadow: 0 0 8px #00e87a, 0 0 16px rgba(0,232,122,.4); opacity: 1; }
  50%      { box-shadow: 0 0 3px #00e87a, 0 0 6px rgba(0,232,122,.2);  opacity: .5; }
}
.arp-rt-idle { color: rgba(200,215,230,.15); font-family: var(--font-mono); font-size: 12px; }

.arp-status {
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
  padding: 2px 9px; border-radius: 20px; letter-spacing: .06em; display: inline-block;
}
.arp-active {
  color: #00e87a; background: rgba(0,232,122,.1);
  border: 1px solid rgba(0,232,122,.28); box-shadow: 0 0 8px rgba(0,232,122,.18);
}
.arp-idle {
  color: rgba(200,215,230,.2); background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
}

/* Band visualization bar */
.arp-band-bar {
  display: flex; border-radius: 8px; overflow: hidden; height: 52px;
  border: 1px solid rgba(255,255,255,.07);
  box-shadow: 0 3px 14px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.04);
}
.arp-band-seg {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  border-right: 1px solid rgba(0,0,0,.35); cursor: default;
  transition: filter .15s, transform .12s;
  position: relative;
}
.arp-band-seg:last-child { border-right: none; }
.arp-band-seg:hover { filter: brightness(1.22); }
.arp-seg-active { filter: brightness(1.55) !important; transform: scaleY(1.05); z-index: 1; outline: 1px solid rgba(255,255,255,.28); }
.arp-band-zone { font-family: var(--font-mono); font-size: 10px; font-weight: 800; letter-spacing: .06em; }
.arp-band-range { font-family: var(--font-mono); font-size: 7px; color: rgba(255,255,255,.38); }

/* Footer: toggle + save */
.arp-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid rgba(255,255,255,.06);
}
.arp-toggle-wrap { display: flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; }
.arp-toggle {
  width: 40px; height: 22px; border-radius: 11px;
  background: rgba(255,255,255,.1); position: relative;
  transition: background .25s, box-shadow .25s; cursor: pointer; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.12);
}
.arp-toggle-on {
  background: rgba(0,232,122,.28); border-color: rgba(0,232,122,.42);
  box-shadow: 0 0 14px rgba(0,232,122,.22), inset 0 0 8px rgba(0,232,122,.12);
}
.arp-toggle-knob {
  position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%;
  background: rgba(188,205,225,.6); box-shadow: 0 1px 4px rgba(0,0,0,.4);
  transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .22s;
}
.arp-toggle-on .arp-toggle-knob {
  transform: translateX(18px); background: #00e87a;
  box-shadow: 0 0 8px rgba(0,232,122,.55), 0 1px 3px rgba(0,0,0,.3);
}
.arp-toggle-lbl {
  font-family: var(--font-mono); font-size: 9.5px; font-weight: 700;
  color: rgba(200,215,230,.32); letter-spacing: .07em; transition: color .2s;
}

.arp-save-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 7px 16px; border-radius: 7px; cursor: pointer;
  background: rgba(0,212,255,.08); color: var(--cyan);
  border: 1px solid rgba(0,212,255,.28);
  display: flex; align-items: center; gap: 6px;
  transition: all .15s;
  box-shadow: 0 2px 8px rgba(0,0,0,.22);
}
.arp-save-btn:hover {
  background: rgba(0,212,255,.16); border-color: rgba(0,212,255,.48);
  box-shadow: 0 0 14px rgba(0,212,255,.18), 0 2px 8px rgba(0,0,0,.22);
}
.arp-save-btn:disabled,
.kd-save-btn:disabled { opacity: .55; cursor: not-allowed; }

/* ── Button loading spinner ── */
.btn-spin {
  display: inline-block;
  width: 10px; height: 10px;
  border: 2px solid rgba(255,255,255,.25);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.5s linear infinite;
  vertical-align: middle;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }

/* ── Active mode bar ── */
.kd-mode-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 14px;
  background: rgba(0,200,170,.07);
  border: 1px solid rgba(0,200,170,.25);
  border-radius: 8px;
}
.kd-mode-bar-label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  color: #00c8aa; letter-spacing: .07em;
}
.kd-mode-bar-disable {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 5px 12px; border-radius: 5px; cursor: pointer;
  background: rgba(255,64,64,.1); color: #ff4040;
  border: 1px solid rgba(255,64,64,.3); transition: all .15s;
  display: inline-flex; align-items: center; gap: 5px;
}
.kd-mode-bar-disable:hover { background: rgba(255,64,64,.18); }
.kd-mode-bar-disable:disabled { opacity: .5; cursor: not-allowed; }

/* ══ Web Control Panel ══ */
.wcp-panel {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px;
  background: linear-gradient(90deg, rgba(0,212,255,.05) 0%, rgba(8,14,26,0) 70%);
  border: 1px solid rgba(0,212,255,.14);
  border-radius: 10px;
}
.wcp-left  { display: flex; align-items: center; gap: 10px; }
.wcp-right { display: flex; align-items: center; gap: 7px; }

.wcp-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.wcp-dot-on {
  background: #00e87a; box-shadow: 0 0 8px rgba(0,232,122,.6);
  animation: wcpdot 1.8s ease-in-out infinite;
}
.wcp-dot-off { background: #ff4040; box-shadow: 0 0 6px rgba(255,64,64,.4); }
@keyframes wcpdot { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

.wcp-label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 800;
  color: rgba(200,220,240,.4); letter-spacing: .1em;
}
.wcp-authority-chip {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; border: 1px solid; letter-spacing: .06em;
  transition: all .2s;
}
.wcp-auth-web   { color: #00d4ff; border-color: rgba(0,212,255,.4);  background: rgba(0,212,255,.1); }
.wcp-auth-hmi   { color: #ffb800; border-color: rgba(255,184,0,.4);  background: rgba(255,184,0,.1); }
.wcp-auth-local { color: #ff4040; border-color: rgba(255,64,64,.4);  background: rgba(255,64,64,.1); }

.wcp-status-ts {
  font-family: var(--font-mono); font-size: 9px; color: rgba(200,220,240,.22);
}

.wcp-btn {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700;
  padding: 6px 14px; border-radius: 6px; cursor: pointer; border: 1px solid;
  display: inline-flex; align-items: center; gap: 6px;
  transition: all .15s; letter-spacing: .05em;
}
.wcp-btn:disabled { opacity: .5; cursor: not-allowed; }

.wcp-btn-request {
  background: rgba(0,232,122,.1); color: #00e87a; border-color: rgba(0,232,122,.3);
}
.wcp-btn-request:hover:not(:disabled) {
  background: rgba(0,232,122,.18); box-shadow: 0 0 12px rgba(0,232,122,.2);
}
.wcp-btn-release {
  background: rgba(255,184,0,.1); color: #ffb800; border-color: rgba(255,184,0,.3);
}
.wcp-btn-release:hover:not(:disabled) { background: rgba(255,184,0,.18); }

.wcp-btn-status {
  background: rgba(0,212,255,.08); color: var(--cyan); border-color: rgba(0,212,255,.25);
}
.wcp-btn-status:hover:not(:disabled) {
  background: rgba(0,212,255,.15); box-shadow: 0 0 10px rgba(0,212,255,.15);
}

/* Status detail grid */
.wcp-status-panel {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px;
  padding: 12px 16px;
  background: rgba(0,212,255,.035);
  border: 1px solid rgba(0,212,255,.11);
  border-radius: 8px;
}
.wcp-status-row { display: flex; flex-direction: column; gap: 3px; }
.wcp-skey {
  font-family: var(--font-mono); font-size: 8px; font-weight: 700;
  color: rgba(200,220,240,.22); letter-spacing: .13em;
}
.wcp-sval {
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  color: rgba(200,220,240,.7); letter-spacing: .04em;
}
.wcp-ok   { color: #00e87a !important; }
.wcp-err  { color: #ff4040 !important; }
.wcp-warn { color: #ffb800 !important; }

/* Status panel enter/leave */
.wcp-fade-enter-active, .wcp-fade-leave-active { transition: opacity .25s, transform .25s; }
.wcp-fade-enter-from  { opacity: 0; transform: translateY(-6px); }
.wcp-fade-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>
