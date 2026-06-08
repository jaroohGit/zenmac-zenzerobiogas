<template>
  <div class="bw-root" :style="themeStyle">

    <!-- ── Header ── -->
    <div class="bw-hdr">
      <div class="bw-hdr-left">
        <div class="bw-title-bar" :style="`background:${t.accent}`"></div>
        <div>
          <div class="bw-title">TURBO BLOWER SYSTEM</div>
          <div class="bw-sub">2 ชุด Turbo Blower — เติมอากาศบ่อ Serum &amp; Latex</div>
        </div>
      </div>
      <div class="bw-hdr-right">
        <div class="bw-theme-row">
          <button v-for="(th,key) in THEMES" :key="key" class="bw-theme-btn"
            :class="{active: currentThemeKey===key}" :title="th.name"
            @click="currentThemeKey=key"
            :style="currentThemeKey===key ? `box-shadow:0 0 0 2px ${th.accent}` : ''">
            <span class="bw-theme-dot" :style="`background:${th.accent}`"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         SECTION 1 — REALTIME MONITORING
    ═══════════════════════════════════════════════ -->
    <div class="bw-sec-hdr">
      <div class="bw-sec-line" :style="`background:${t.accent}`"></div>
      <span class="bw-sec-label" :style="`color:${t.accent}`">REALTIME MONITORING</span>
      <span class="bw-live-dot"></span>
      <span class="bw-live-txt">LIVE</span>
      <div class="bw-sec-line-end" :style="`background:${t.accent}22`"></div>
    </div>

    <div class="bw-rt-row">

      <!-- TB-01 monitor panel -->
      <div class="bw-bl-panel" :style="`--bc:${t.accent}`">
        <div class="bw-bl-name-bar">
          <span class="bw-bl-num" :style="`color:${t.accent}`">TURBO BLOWER No.1</span>
          <span class="bw-bl-badge" :class="statusCls(tb1Status)">● {{ fmtStatus(tb1Status) }}</span>
        </div>

        <!-- Metric grid 3×2 -->
        <div class="bw-metric-grid">
          <div class="bw-mc" :style="`--mc:${t.accent}`">
            <div class="bw-mc-label">OPERATION %</div>
            <div class="bw-mc-big">{{ tb1OpPct }}<span class="bw-mc-unit">%</span></div>
            <div class="bw-mc-track"><div class="bw-mc-fill" :style="`width:${tb1OpPct}%;background:${t.accent}`"></div></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.kwh}`">
            <div class="bw-mc-label">POWER</div>
            <div class="bw-mc-big">{{ tb1Power }}<span class="bw-mc-unit">kW</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.perf}`">
            <div class="bw-mc-label">AIR FLOW</div>
            <div class="bw-mc-big">{{ tb1FlowHr }}<span class="bw-mc-unit">m³/hr</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.cost}`">
            <div class="bw-mc-label">SUCTION TEMP</div>
            <div class="bw-mc-big">{{ tb1OutsideTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.cost}`">
            <div class="bw-mc-label">DISCHARGE TEMP</div>
            <div class="bw-mc-big">{{ tb1DischTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.orpS}`">
            <div class="bw-mc-label">SUCTION PRESS</div>
            <div class="bw-mc-big">{{ tb1SuctPres }}<span class="bw-mc-unit">mmAq</span></div>
          </div>
          <div class="bw-mc bw-mc-wide" :style="`--mc:${t.orpS}`">
            <div class="bw-mc-label">DISCHARGE PRESS</div>
            <div class="bw-mc-big">{{ tb1DischPres }}<span class="bw-mc-unit">mmAq</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.text}`">
            <div class="bw-mc-label">MOTOR TEMP</div>
            <div class="bw-mc-big">{{ tb1MotorTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
        </div>

        <!-- Per-blower 24h trend chart -->
        <div class="bw-trend-hdr">
          <span class="bw-trend-dot" :style="`background:${t.accent}`"></span>
          TREND — Air Flow / Discharge Temp / Pressure (BL-1)
          <span class="bw-trend-legend">
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.perf}`"></span>Air Flow m³/hr</span>
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.cost}`"></span>Discharge Temp °C</span>
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.orpS}`"></span>Discharge Press mmAq</span>
          </span>
        </div>
        <div class="bw-chart-wrap"><canvas ref="chartTrend1"></canvas></div>
      </div>

      <!-- TB-02 monitor panel -->
      <div class="bw-bl-panel" :style="`--bc:${t.kwh}`">
        <div class="bw-bl-name-bar">
          <span class="bw-bl-num" :style="`color:${t.kwh}`">TURBO BLOWER No.2</span>
          <span class="bw-bl-badge" :class="statusCls(tb2Status)">● {{ fmtStatus(tb2Status) }}</span>
        </div>

        <div class="bw-metric-grid">
          <div class="bw-mc" :style="`--mc:${t.kwh}`">
            <div class="bw-mc-label">OPERATION %</div>
            <div class="bw-mc-big">{{ tb2OpPct }}<span class="bw-mc-unit">%</span></div>
            <div class="bw-mc-track"><div class="bw-mc-fill" :style="`width:${tb2OpPct}%;background:${t.kwh}`"></div></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.kwh}`">
            <div class="bw-mc-label">POWER</div>
            <div class="bw-mc-big">{{ tb2Power }}<span class="bw-mc-unit">kW</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.perf}`">
            <div class="bw-mc-label">AIR FLOW</div>
            <div class="bw-mc-big">{{ tb2FlowHr }}<span class="bw-mc-unit">m³/hr</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.cost}`">
            <div class="bw-mc-label">SUCTION TEMP</div>
            <div class="bw-mc-big">{{ tb2OutsideTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.cost}`">
            <div class="bw-mc-label">DISCHARGE TEMP</div>
            <div class="bw-mc-big">{{ tb2DischTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.orpS}`">
            <div class="bw-mc-label">SUCTION PRESS</div>
            <div class="bw-mc-big">{{ tb2SuctPres }}<span class="bw-mc-unit">mmAq</span></div>
          </div>
          <div class="bw-mc bw-mc-wide" :style="`--mc:${t.orpS}`">
            <div class="bw-mc-label">DISCHARGE PRESS</div>
            <div class="bw-mc-big">{{ tb2DischPres }}<span class="bw-mc-unit">mmAq</span></div>
          </div>
          <div class="bw-mc" :style="`--mc:${t.text}`">
            <div class="bw-mc-label">MOTOR TEMP</div>
            <div class="bw-mc-big">{{ tb2MotorTemp }}<span class="bw-mc-unit">°C</span></div>
          </div>
        </div>

        <div class="bw-trend-hdr">
          <span class="bw-trend-dot" :style="`background:${t.kwh}`"></span>
          TREND — Air Flow / Discharge Temp / Pressure (BL-2)
          <span class="bw-trend-legend">
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.perf}`"></span>Air Flow m³/hr</span>
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.cost}`"></span>Discharge Temp °C</span>
            <span class="bw-tleg"><span class="bw-tls" :style="`background:${t.orpS}`"></span>Discharge Press mmAq</span>
          </span>
        </div>
        <div class="bw-chart-wrap"><canvas ref="chartTrend2"></canvas></div>
      </div>

    </div><!-- /bw-rt-row -->

    <!-- ══════════════════════════════════════════════
         SECTION 2 — OPERATION CONTROL
    ═══════════════════════════════════════════════ -->
    <div class="bw-sec-hdr">
      <div class="bw-sec-line" :style="`background:${t.kwh}`"></div>
      <span class="bw-sec-label" :style="`color:${t.kwh}`">BLOWER OPERATION CONTROL</span>
      <div class="bw-sec-line-end" :style="`background:${t.kwh}22`"></div>
    </div>

    <div class="bw-ctrl-row">

      <!-- TB-01 controls -->
      <div class="bw-ctrl-panel" :style="`--bc:${t.accent}`">
        <div class="bw-ctrl-title">
          <span :style="`color:${t.accent}`">TB-01</span>
          <span class="bw-ctrl-sub">TURBO BLOWER 1</span>
          <span class="bw-bl-badge" :class="statusCls(tb1Status)">● {{ fmtStatus(tb1Status) }}</span>
        </div>
        <div class="bw-ctrl-inputs">
          <label class="bw-ctrl-label">SET %
            <div class="bw-ctrl-inp-wrap">
              <input class="bw-ctrl-inp" type="number" v-model.number="op1.pct" min="0" max="100" step="1"
                :style="`border-color:${t.accent}44;color:${t.accent}`"/>
              <span class="bw-ctrl-sfx">%</span>
            </div>
          </label>
          <label class="bw-ctrl-label">SET FLOW
            <div class="bw-ctrl-inp-wrap">
              <input class="bw-ctrl-inp bw-ctrl-inp-wide" type="number" v-model.number="op1.flow" min="0" max="6000" step="100"
                :style="`border-color:${t.accent}44;color:${t.accent}`"/>
              <span class="bw-ctrl-sfx">m³/hr</span>
            </div>
          </label>
        </div>
        <div class="bw-ctrl-btns">
          <button class="bw-btn bw-btn-run" @click="sendCmd(1,'run')" :style="`background:${t.hOk}18;border-color:${t.hOk}55;color:${t.hOk}`">
            <i class="bx bx-play"></i> APPLY
          </button>
          <button class="bw-btn bw-btn-stop" @click="sendCmd(1,'stop')">
            <i class="bx bx-stop"></i> STOP
          </button>
          <button class="bw-btn bw-btn-stby" @click="sendCmd(1,'stby')" :style="`background:${t.hWarn}18;border-color:${t.hWarn}55;color:${t.hWarn}`">
            <i class="bx bx-pause"></i> STBY
          </button>
        </div>
      </div>

      <!-- TB-02 controls -->
      <div class="bw-ctrl-panel" :style="`--bc:${t.kwh}`">
        <div class="bw-ctrl-title">
          <span :style="`color:${t.kwh}`">TB-02</span>
          <span class="bw-ctrl-sub">TURBO BLOWER 2</span>
          <span class="bw-bl-badge" :class="statusCls(tb2Status)">● {{ fmtStatus(tb2Status) }}</span>
        </div>
        <div class="bw-ctrl-inputs">
          <label class="bw-ctrl-label">SET %
            <div class="bw-ctrl-inp-wrap">
              <input class="bw-ctrl-inp" type="number" v-model.number="op2.pct" min="0" max="100" step="1"
                :style="`border-color:${t.kwh}44;color:${t.kwh}`"/>
              <span class="bw-ctrl-sfx">%</span>
            </div>
          </label>
          <label class="bw-ctrl-label">SET FLOW
            <div class="bw-ctrl-inp-wrap">
              <input class="bw-ctrl-inp bw-ctrl-inp-wide" type="number" v-model.number="op2.flow" min="0" max="6000" step="100"
                :style="`border-color:${t.kwh}44;color:${t.kwh}`"/>
              <span class="bw-ctrl-sfx">m³/hr</span>
            </div>
          </label>
        </div>
        <div class="bw-ctrl-btns">
          <button class="bw-btn bw-btn-run" @click="sendCmd(2,'run')" :style="`background:${t.hOk}18;border-color:${t.hOk}55;color:${t.hOk}`">
            <i class="bx bx-play"></i> START
          </button>
          <button class="bw-btn bw-btn-stop" @click="sendCmd(2,'stop')">
            <i class="bx bx-stop"></i> STOP
          </button>
          <button class="bw-btn bw-btn-stby" @click="sendCmd(2,'stby')" :style="`background:${t.hWarn}18;border-color:${t.hWarn}55;color:${t.hWarn}`">
            <i class="bx bx-pause"></i> STBY
          </button>
        </div>
      </div>

    </div><!-- /bw-ctrl-row -->

    <!-- ══════════════════════════════════════════════
         SECTION 3 — SUMMARY
    ═══════════════════════════════════════════════ -->
    <div class="bw-sec-hdr">
      <div class="bw-sec-line" :style="`background:${t.cost}`"></div>
      <span class="bw-sec-label" :style="`color:${t.cost}`">SUMMARY</span>
      <div class="view-sw">
        <button class="view-btn" :class="{active: summaryMode==='daily'}"   @click="setSummaryMode('daily')">DAILY</button>
        <button class="view-btn" :class="{active: summaryMode==='monthly'}" @click="setSummaryMode('monthly')">MONTHLY</button>
      </div>
      <div class="bw-nav">
        <button class="bw-nav-btn" @click="changeOffset(1)" :disabled="summaryOffset>=(summaryMode==='daily'?6:5)">
          <i class="bx bx-chevron-left"></i>
        </button>
        <span class="bw-nav-label">{{ summaryLabel }}</span>
        <button class="bw-nav-btn" @click="changeOffset(-1)" :disabled="summaryOffset<=0">
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>
      <div class="bw-sec-line-end" :style="`background:${t.cost}22`"></div>
    </div>

    <!-- KPI bar -->
    <div class="bw-kpi-bar">
      <div class="bw-kpi-card" v-for="k in summaryKpi" :key="k.tag" :style="`--c:${k.color}`">
        <div class="bw-kpi-tag">{{ k.tag }}</div>
        <div class="bw-kpi-row">
          <span class="bw-kpi-big" :style="`color:${k.color}`">{{ k.big }}</span>
          <span class="bw-kpi-unit" :style="`color:${k.color}`">{{ k.unit }}</span>
        </div>
        <div class="bw-kpi-chips" v-if="k.chips && k.chips.length">
          <span class="bw-kpi-chip" v-for="c in k.chips" :key="c.label" :style="`color:${c.color}`">
            {{ c.label }}: {{ c.val }}
          </span>
        </div>
        <div class="bw-kpi-foot" v-if="k.foot">{{ k.foot }}</div>
      </div>
    </div>

    <!-- Summary charts -->
    <div class="bw-sum-charts">
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.accent}`"></span>
          POWER — {{ summaryMode==='daily' ? 'hourly avg (kW)' : 'daily avg (kW)' }}
          <span class="bw-legend ml">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumPow"></canvas></div>
      </div>
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.perf}`"></span>
          AIR FLOW — {{ summaryMode==='daily' ? 'hourly (m³/hr)' : 'daily avg (m³/hr)' }}
          <span class="bw-legend ml">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumFlow"></canvas></div>
      </div>
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.cost}`"></span>
          ENERGY — {{ summaryMode==='daily' ? 'per hour (kWh)' : 'per day (kWh)' }}
          <span class="bw-legend ml">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumEnergy"></canvas></div>
      </div>

      <!-- Temperature chart -->
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.cost}`"></span>
          TEMPERATURE — Suction vs Discharge (°C)
          <span class="bw-legend ml">
            <span class="bw-ls" :style="`background:${t.accent}88`"></span>TB-01 Suct
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01 Disch
            <span class="bw-ls" :style="`background:${t.kwh}88`"></span>TB-02 Suct
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02 Disch
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumTemp"></canvas></div>
      </div>

      <!-- Pressure chart (dual y-axis) -->
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.orpS}`"></span>
          PRESSURE — Suction (mmAq) / Discharge (mmAq)
          <span class="bw-legend ml">
            <span class="bw-ls bw-ls-dash" :style="`background:${t.accent}`"></span>TB-01 Disch
            <span class="bw-ls bw-ls-dash" :style="`background:${t.kwh}`"></span>TB-02 Disch
            <span class="bw-ls" :style="`background:${t.orpL}`"></span>Suction
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumPress"></canvas></div>
      </div>

      <!-- Pressure ratio / efficiency -->
      <div class="bw-chart-card">
        <div class="bw-ch-hdr">
          <span class="bw-ch-dot" :style="`background:${t.hOk}`"></span>
          PRESSURE RATIO — Discharge ÷ |Suction| (ประสิทธิภาพ)
          <span class="bw-legend ml">
            <span class="bw-ls" :style="`background:${t.accent}`"></span>TB-01
            <span class="bw-ls" :style="`background:${t.kwh}`"></span>TB-02
          </span>
        </div>
        <div class="bw-sum-wrap"><canvas ref="chartSumRatio"></canvas></div>
      </div>

    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ── Themes ────────────────────────────────────────────────────────
const THEMES = {
  slate: {
    name:'Slate & Steel',    accent:'#4a9eba',
    bg:'#0d1117', g1:'rgba(74,158,186,.07)', g2:'rgba(74,124,111,.05)',
    cBg:'rgba(17,24,32,.85)', cBdr:'rgba(30,45,61,.9)',
    text:'rgba(200,216,232,.28)', tick:'#3d5068',
    serum:'#ff7820', latex:'#00e87a', kwh:'#9b8fc0',
    perf:'#6b82a8', cost:'#b8935a', orpS:'#ff7820', orpL:'#00e87a',
    thresh:'#c8a96e', hOk:'#00e87a', hWarn:'#c8a96e', hCrit:'#a86868',
  },
  carbon: {
    name:'Carbon & Copper',  accent:'#b07d56',
    bg:'#0e0f11', g1:'rgba(176,125,86,.07)', g2:'rgba(122,158,142,.05)',
    cBg:'rgba(16,14,12,.88)', cBdr:'rgba(44,32,22,.95)',
    text:'rgba(216,207,200,.28)', tick:'#524438',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8878b0',
    perf:'#7888a0', cost:'#c4a040', orpS:'#ff7820', orpL:'#00e87a',
    thresh:'#c4a050', hOk:'#00e87a', hWarn:'#c4a050', hCrit:'#a87858',
  },
  midnight: {
    name:'Midnight & Sage',  accent:'#5a9e82',
    bg:'#0a0e14', g1:'rgba(90,158,130,.07)', g2:'rgba(90,142,170,.05)',
    cBg:'rgba(12,18,28,.88)', cBdr:'rgba(21,29,40,.95)',
    text:'rgba(176,200,192,.28)', tick:'#385060',
    serum:'#ff7820', latex:'#00e87a', kwh:'#9888c0',
    perf:'#7a8aaa', cost:'#9e8a5a', orpS:'#ff7820', orpL:'#00e87a',
    thresh:'#c0a878', hOk:'#00e87a', hWarn:'#c0a878', hCrit:'#a86060',
  },
  obsidian: {
    name:'Obsidian & Frost', accent:'#6888c8',
    bg:'#0c0c10', g1:'rgba(104,136,200,.07)', g2:'rgba(88,104,168,.05)',
    cBg:'rgba(14,14,22,.88)', cBdr:'rgba(28,28,48,.95)',
    text:'rgba(200,208,232,.28)', tick:'#404060',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8870c8',
    perf:'#8090b8', cost:'#a888a0', orpS:'#ff7820', orpL:'#00e87a',
    thresh:'#a8a0c0', hOk:'#00e87a', hWarn:'#a8a0c0', hCrit:'#a86080',
  },
  dark: {
    name:'Deep Dark',        accent:'#3d8fab',
    bg:'#060810', g1:'rgba(61,143,171,.06)', g2:'rgba(50,120,140,.04)',
    cBg:'rgba(8,12,20,.90)', cBdr:'rgba(20,28,42,.95)',
    text:'rgba(188,208,224,.24)', tick:'#2e4458',
    serum:'#ff7820', latex:'#00e87a', kwh:'#8878a8',
    perf:'#6070a0', cost:'#a08850', orpS:'#ff7820', orpL:'#00e87a',
    thresh:'#c0a060', hOk:'#00e87a', hWarn:'#c0a060', hCrit:'#a06060',
  },
  light: {
    name:'Light',            accent:'#2a7fa8',
    bg:'#eef0f4', g1:'rgba(42,127,168,.09)', g2:'rgba(60,140,110,.07)',
    cBg:'rgba(255,255,255,.88)', cBdr:'rgba(180,200,220,.75)',
    text:'rgba(40,60,80,.58)', tick:'#5a7890',
    serum:'#ff7820', latex:'#00a854', kwh:'#6050b0',
    perf:'#5a7098', cost:'#a07040', orpS:'#ff7820', orpL:'#00a854',
    thresh:'#a08040', hOk:'#00a854', hWarn:'#a08040', hCrit:'#a84848',
  },
};

function h2r(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Trend data: 24hr per blower (Air Flow, Discharge Temp, Discharge Press) ──
function gen24h(bases, amps, shifts) {
  const lbl=Array.from({length:24},(_,h)=>`${String(h).padStart(2,'0')}:00`);
  const datasets=bases.map((base,i)=>Array.from({length:24},(_,h)=>
    Math.round((base+amps[i]*Math.sin((h+shifts[i])*0.32)+Math.random()*amps[i]*0.2)*10)/10
  ));
  return {lbl, datasets};
}

// ── Summary data generators ────────────────────────────────────────
function genDailyData(offset=0) {
  const now=new Date(), todayHr=offset===0?now.getHours():23;
  return Array.from({length:24},(_,h)=>{
    if(h>todayHr) return {
      label:`${String(h).padStart(2,'0')}:00`,
      tb1pow:null,tb2pow:null,tb1flow:null,tb2flow:null,
      tb1suctTemp:null,tb1dischTemp:null,tb2suctTemp:null,tb2dischTemp:null,
      tb1suctPres:null,tb1dischPres:null,tb2suctPres:null,tb2dischPres:null,
    };
    const on=h>=6&&h<=22;
    const r=()=>Math.random();
    return {
      label:`${String(h).padStart(2,'0')}:00`,
      tb1pow:    on?+(74+r()*26).toFixed(1):+(r()*6).toFixed(1),
      tb2pow:    on?+(66+r()*24).toFixed(1):+(r()*5).toFixed(1),
      tb1flow:   on?Math.round(3700+r()*600):Math.round(r()*300),
      tb2flow:   on?Math.round(3400+r()*550):Math.round(r()*250),
      // Temp (°C)
      tb1suctTemp:  on?+(30+r()*8).toFixed(1):+(25+r()*5).toFixed(1),
      tb1dischTemp: on?+(72+r()*13).toFixed(1):+(28+r()*4).toFixed(1),
      tb2suctTemp:  on?+(29+r()*9).toFixed(1):+(24+r()*5).toFixed(1),
      tb2dischTemp: on?+(68+r()*14).toFixed(1):+(27+r()*4).toFixed(1),
      // Pressure (mmAq — negative=suction, positive=discharge)
      tb1suctPres:  on?+(-12-r()*8).toFixed(1):+(r()*(-2)).toFixed(1),
      tb1dischPres: on?+(460+r()*70).toFixed(1):+(r()*10).toFixed(1),
      tb2suctPres:  on?+(-10-r()*7).toFixed(1):+(r()*(-2)).toFixed(1),
      tb2dischPres: on?+(440+r()*65).toFixed(1):+(r()*10).toFixed(1),
    };
  });
}
function genMonthlyData(offset=0) {
  const now=new Date();
  const t=new Date(now.getFullYear(),now.getMonth()-offset,1);
  const dim=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();
  const today=offset===0?now.getDate():dim;
  return Array.from({length:dim},(_,i)=>{
    const d=i+1, r=()=>Math.random();
    if(d>today) return {
      label:`${d}`,
      tb1kwh:null,tb2kwh:null,tb1peakPow:null,tb2peakPow:null,tb1flow:null,tb2flow:null,
      tb1suctTemp:null,tb1dischTemp:null,tb2suctTemp:null,tb2dischTemp:null,
      tb1suctPres:null,tb1dischPres:null,tb2suctPres:null,tb2dischPres:null,
    };
    return {
      label:`${d}`,
      tb1kwh:      Math.round(530+r()*420),
      tb2kwh:      Math.round(475+r()*400),
      tb1peakPow:  +(82+r()*28).toFixed(1),
      tb2peakPow:  +(74+r()*26).toFixed(1),
      tb1flow:     Math.round(3700+r()*600),
      tb2flow:     Math.round(3400+r()*550),
      tb1suctTemp:  +(30+r()*8).toFixed(1),
      tb1dischTemp: +(73+r()*12).toFixed(1),
      tb2suctTemp:  +(29+r()*9).toFixed(1),
      tb2dischTemp: +(69+r()*13).toFixed(1),
      tb1suctPres:  +(-12-r()*7).toFixed(1),
      tb1dischPres: +(460+r()*68).toFixed(1),
      tb2suctPres:  +(-10-r()*6).toFixed(1),
      tb2dischPres: +(442+r()*62).toFixed(1),
    };
  });
}

export default {
  name: 'KDBlower',
  computed: {
    ...mapGetters('staKd', [
      'tb1Power','tb1Current','tb1Flow','tb1SuctPres','tb1DischPres',
      'tb1OutsideTemp','tb1MotorTemp','tb1DriveTemp','tb1DischTemp','tb1OnOff','tb1Status',
      'tb2Power','tb2Current','tb2Flow','tb2SuctPres','tb2DischPres',
      'tb2OutsideTemp','tb2MotorTemp','tb2DriveTemp','tb2DischTemp','tb2OnOff','tb2Status',
    ]),
    t() { return THEMES[this.currentThemeKey]; },
    themeStyle() {
      const t=this.t;
      const li=t.bg[1]>'8';
      const ov=li?'40,60,80':'255,255,255';
      const ob=li?'0,0,0':'255,255,255';
      return {
        background:`radial-gradient(ellipse 60% 45% at 80% 5%,${t.g1},transparent 55%),radial-gradient(ellipse 45% 40% at 8% 92%,${t.g2},transparent 50%),${t.bg}`,
        '--ex-card-bg':   t.cBg,
        '--ex-card-bdr':  t.cBdr,
        '--ex-text':      t.text,
        '--ex-h-ok':      t.hOk,
        '--ex-h-warn':    t.hWarn,
        '--ex-h-crit':    t.hCrit,
        '--ex-accent':    t.accent,
        '--ex-text-sub':  `rgba(${ov},.22)`,
        '--ex-label':     `rgba(${ov},.55)`,
        '--ex-mn-bg':     `rgba(${ob},.04)`,
        '--ex-mn-bdr':    `rgba(${ob},.12)`,
        '--ex-mn-color':  `rgba(${ov},.45)`,
        '--ex-tag-bg':    `rgba(${ob},.05)`,
        '--ex-tag-bdr':   `rgba(${ob},.1)`,
      };
    },
    // Air flow converted m³/min → m³/hr for display
    tb1FlowHr() { const n=parseFloat(this.tb1Flow); return isNaN(n)?'—':Math.round(n*60); },
    tb2FlowHr() { const n=parseFloat(this.tb2Flow); return isNaN(n)?'—':Math.round(n*60); },
    // Operation % derived from flow ratio (max ~10 m³/min)
    tb1OpPct() { const n=parseFloat(this.tb1Flow); return isNaN(n)?0:Math.min(100,Math.round(n/10*100)); },
    tb2OpPct() { const n=parseFloat(this.tb2Flow); return isNaN(n)?0:Math.min(100,Math.round(n/10*100)); },
    summaryLabel() {
      if(this.summaryMode==='daily') {
        const d=new Date(); d.setDate(d.getDate()-this.summaryOffset);
        return d.toLocaleString('en',{weekday:'short',month:'short',day:'numeric'});
      }
      const d=new Date(); d.setMonth(d.getMonth()-this.summaryOffset);
      return d.toLocaleString('en',{month:'long',year:'numeric'});
    },
    summaryStats() {
      const isD=this.summaryMode==='daily';
      if(isD) {
        const rows=this.dailyData.filter(r=>r.tb1pow!==null);
        if(!rows.length) return {tb1kwh:0,tb2kwh:0,peakTb1:'0',peakTb2:'0',avgFlow1:0,avgFlow2:0,runH1:0,runH2:0};
        return {
          tb1kwh:   Math.round(rows.reduce((a,r)=>a+(r.tb1pow||0),0)),
          tb2kwh:   Math.round(rows.reduce((a,r)=>a+(r.tb2pow||0),0)),
          peakTb1:  Math.max(...rows.map(r=>r.tb1pow||0)).toFixed(1),
          peakTb2:  Math.max(...rows.map(r=>r.tb2pow||0)).toFixed(1),
          avgFlow1: Math.round(rows.reduce((a,r)=>a+(r.tb1flow||0),0)/rows.length),
          avgFlow2: Math.round(rows.reduce((a,r)=>a+(r.tb2flow||0),0)/rows.length),
          runH1:    rows.filter(r=>(r.tb1pow||0)>5).length,
          runH2:    rows.filter(r=>(r.tb2pow||0)>5).length,
        };
      }
      const rows=this.monthlyData.filter(r=>r.tb1kwh!==null);
      if(!rows.length) return {tb1kwh:0,tb2kwh:0,peakTb1:'0',peakTb2:'0',avgFlow1:0,avgFlow2:0,runH1:0,runH2:0};
      return {
        tb1kwh:   rows.reduce((a,r)=>a+(r.tb1kwh||0),0),
        tb2kwh:   rows.reduce((a,r)=>a+(r.tb2kwh||0),0),
        peakTb1:  Math.max(...rows.map(r=>r.tb1peakPow||0)).toFixed(1),
        peakTb2:  Math.max(...rows.map(r=>r.tb2peakPow||0)).toFixed(1),
        avgFlow1: Math.round(rows.reduce((a,r)=>a+(r.tb1flow||0),0)/rows.length),
        avgFlow2: Math.round(rows.reduce((a,r)=>a+(r.tb2flow||0),0)/rows.length),
        runH1:    rows.length*16,
        runH2:    rows.length*15,
      };
    },
    summaryKpi() {
      const s=this.summaryStats, t=this.t;
      const f=v=>{const n=parseInt(v);return isNaN(n)?'—':n.toLocaleString();};
      return [
        { tag:'TB-01 ENERGY', big:f(s.tb1kwh), unit:'kWh', color:t.accent, chips:[] },
        { tag:'TB-02 ENERGY', big:f(s.tb2kwh), unit:'kWh', color:t.kwh,   chips:[] },
        { tag:'PEAK POWER',   big:s.peakTb1,   unit:'kW',  color:t.perf,
          chips:[{label:'TB-01',val:`${s.peakTb1} kW`,color:t.accent},{label:'TB-02',val:`${s.peakTb2} kW`,color:t.kwh}] },
        { tag:'AVG AIR FLOW', big:f(s.avgFlow1), unit:'m³/hr', color:t.orpS,
          chips:[{label:'TB-01',val:f(s.avgFlow1),color:t.accent},{label:'TB-02',val:f(s.avgFlow2),color:t.kwh}] },
        { tag:'RUN HOURS',    big:s.runH1,     unit:'hr',  color:t.cost,
          chips:[{label:'TB-01',val:`${s.runH1}h`,color:t.accent},{label:'TB-02',val:`${s.runH2}h`,color:t.kwh}],
          foot:this.summaryMode==='daily'?'hours active':'est. monthly hrs' },
      ];
    },
  },
  data() {
    return {
      currentThemeKey:'slate', THEMES,
      summaryMode:'daily', summaryOffset:0,
      dailyData:[], monthlyData:[],
      op1:{ pct:72, flow:3800 },
      op2:{ pct:0,  flow:0    },
    };
  },
  watch: {
    currentThemeKey() { this.destroyCharts(); this.$nextTick(()=>this.buildCharts()); },
  },
  created() {
    this._cTrend1=null; this._cTrend2=null;
    this._cSumPow=null; this._cSumFlow=null; this._cSumEnergy=null;
    this._cSumTemp=null; this._cSumPress=null; this._cSumRatio=null;
    this.dailyData=genDailyData(0);
    this.monthlyData=genMonthlyData(0);
  },
  mounted()      { this.buildCharts(); },
  beforeUnmount(){ this.destroyCharts(); },
  methods: {
    statusCls(v) {
      const s=String(v||'').toUpperCase();
      if(s.includes('RUN'))  return 'st-ok';
      if(s.includes('STBY')||s.includes('STAND')) return 'st-warn';
      return 'st-off';
    },
    fmtStatus(v) {
      const s=String(v||'—').toUpperCase();
      if(s.includes('RUN'))  return 'RUNNING';
      if(s.includes('STBY')) return 'STANDBY';
      if(s==='—')            return '—';
      return s;
    },
    sendCmd(n, cmd) {
      const speed_pct = n===1 ? this.op1.pct : this.op2.pct;
      this.$store.dispatch('staKd/cmdBlower', { n, cmd, speed_pct });
    },
    destroyCharts() {
      [this._cTrend1,this._cTrend2,this._cSumPow,this._cSumFlow,this._cSumEnergy,
       this._cSumTemp,this._cSumPress,this._cSumRatio].forEach(c=>c?.destroy());
      this._cTrend1=this._cTrend2=null;
      this._cSumPow=this._cSumFlow=this._cSumEnergy=null;
      this._cSumTemp=this._cSumPress=this._cSumRatio=null;
    },
    _baseOpts() {
      const t=this.t;
      return {
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false,bodyFont:{family:'JetBrains Mono',size:11}} },
        scales:{
          x:{ ticks:{color:t.tick,font:{size:9},maxRotation:0}, grid:{color:h2r(t.tick,.16)}, border:{display:false} },
          y:{ ticks:{color:t.tick,font:{size:9}},               grid:{color:h2r(t.tick,.16)}, border:{display:false}, position:'left' },
        },
      };
    },
    buildCharts() {
      this.buildTrendCharts();
      this.buildSummaryCharts();
    },
    buildTrendCharts() {
      const t=this.t;
      const {lbl, datasets:d1}=gen24h([3800,75,450],[320,8,45],[0,3,6]);
      const {datasets:d2}=gen24h([0,0,0],[10,2,8],[0,0,0]);   // TB-02 standby ≈ near zero

      const dualOpts=()=>({
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false,bodyFont:{family:'JetBrains Mono',size:11}} },
        scales:{
          x:{ ticks:{color:t.tick,font:{size:9},maxRotation:0}, grid:{color:h2r(t.tick,.14)}, border:{display:false} },
          yFlow:{
            type:'linear', position:'left',
            ticks:{color:t.perf,font:{size:9}}, grid:{color:h2r(t.tick,.14)}, border:{display:false},
            title:{display:true,text:'m³/hr',color:t.perf,font:{size:8}},
          },
          yRight:{
            type:'linear', position:'right',
            ticks:{color:t.cost,font:{size:9}}, grid:{display:false}, border:{display:false},
            title:{display:true,text:'°C / mmAq',color:t.cost,font:{size:8}},
          },
        },
      });

      this._cTrend1=new Chart(this.$refs.chartTrend1, {
        type:'line',
        data:{ labels:lbl, datasets:[
          {label:'Air Flow m³/hr',    data:d1[0], borderColor:t.perf,  backgroundColor:h2r(t.perf,.05),  borderWidth:1.5, pointRadius:0, tension:0.35, yAxisID:'yFlow'},
          {label:'Discharge Temp °C', data:d1[1], borderColor:t.cost,  backgroundColor:'transparent',     borderWidth:1.5, pointRadius:0, tension:0.35, yAxisID:'yRight'},
          {label:'Discharge Press',   data:d1[2], borderColor:t.orpS,  backgroundColor:'transparent',     borderWidth:1.2, pointRadius:0, tension:0.35, yAxisID:'yRight'},
        ]},
        options:dualOpts(),
      });
      this._cTrend2=new Chart(this.$refs.chartTrend2, {
        type:'line',
        data:{ labels:lbl, datasets:[
          {label:'Air Flow m³/hr',    data:d2[0], borderColor:t.perf,  backgroundColor:h2r(t.perf,.05),  borderWidth:1.5, pointRadius:0, tension:0.35, yAxisID:'yFlow'},
          {label:'Discharge Temp °C', data:d2[1], borderColor:t.cost,  backgroundColor:'transparent',     borderWidth:1.5, pointRadius:0, tension:0.35, yAxisID:'yRight'},
          {label:'Discharge Press',   data:d2[2], borderColor:t.orpS,  backgroundColor:'transparent',     borderWidth:1.2, pointRadius:0, tension:0.35, yAxisID:'yRight'},
        ]},
        options:dualOpts(),
      });
    },
    buildSummaryCharts() {
      const t=this.t, isD=this.summaryMode==='daily';
      const d=isD?this.dailyData:this.monthlyData;
      const labels=d.map(r=>r.label);
      const opts=this._baseOpts();
      const stackOpts={
        ...opts,
        scales:{ x:{...opts.scales.x,stacked:true}, y:{...opts.scales.y,stacked:true} },
      };
      this._cSumPow=new Chart(this.$refs.chartSumPow,{
        type:'line', data:{ labels, datasets:[
          {label:'TB-01 kW',data:isD?d.map(r=>r.tb1pow):d.map(r=>r.tb1peakPow),borderColor:t.accent,backgroundColor:h2r(t.accent,.08),borderWidth:1.5,pointRadius:0,tension:0.3,fill:true},
          {label:'TB-02 kW',data:isD?d.map(r=>r.tb2pow):d.map(r=>r.tb2peakPow),borderColor:t.kwh,  backgroundColor:h2r(t.kwh,.08),  borderWidth:1.5,pointRadius:0,tension:0.3,fill:true},
        ]}, options:opts,
      });
      this._cSumFlow=new Chart(this.$refs.chartSumFlow,{
        type:'line', data:{ labels, datasets:[
          {label:'TB-01 m³/hr',data:d.map(r=>r.tb1flow),borderColor:t.accent,backgroundColor:h2r(t.accent,.08),borderWidth:1.5,pointRadius:0,tension:0.3,fill:true},
          {label:'TB-02 m³/hr',data:d.map(r=>r.tb2flow),borderColor:t.kwh,  backgroundColor:h2r(t.kwh,.08),  borderWidth:1.5,pointRadius:0,tension:0.3,fill:true},
        ]}, options:opts,
      });
      this._cSumEnergy=new Chart(this.$refs.chartSumEnergy,{
        type:'bar', data:{ labels, datasets:[
          {label:'TB-01 kWh',data:isD?d.map(r=>r.tb1pow):d.map(r=>r.tb1kwh),backgroundColor:h2r(t.accent,.75),borderColor:t.accent,borderWidth:0,stack:'bl'},
          {label:'TB-02 kWh',data:isD?d.map(r=>r.tb2pow):d.map(r=>r.tb2kwh),backgroundColor:h2r(t.kwh,.75),  borderColor:t.kwh,  borderWidth:0,stack:'bl'},
        ]}, options:stackOpts,
      });

      // ── Temperature chart (4 lines, single y-axis °C) ──
      this._cSumTemp=new Chart(this.$refs.chartSumTemp,{
        type:'line', data:{ labels, datasets:[
          {label:'TB-01 Suct Temp',  data:d.map(r=>r.tb1suctTemp),  borderColor:h2r(t.accent,.55), borderDash:[4,3], backgroundColor:'transparent', borderWidth:1.5, pointRadius:0, tension:0.3},
          {label:'TB-01 Disch Temp', data:d.map(r=>r.tb1dischTemp), borderColor:t.accent,          backgroundColor:h2r(t.accent,.06), borderWidth:2,   pointRadius:0, tension:0.3, fill:true},
          {label:'TB-02 Suct Temp',  data:d.map(r=>r.tb2suctTemp),  borderColor:h2r(t.kwh,.55),   borderDash:[4,3], backgroundColor:'transparent', borderWidth:1.5, pointRadius:0, tension:0.3},
          {label:'TB-02 Disch Temp', data:d.map(r=>r.tb2dischTemp), borderColor:t.kwh,            backgroundColor:h2r(t.kwh,.06),   borderWidth:2,   pointRadius:0, tension:0.3, fill:true},
        ]}, options:{...opts, scales:{
          x:{...opts.scales.x},
          y:{...opts.scales.y, title:{display:true,text:'°C',color:t.cost,font:{size:8}}},
        }},
      });

      // ── Pressure chart (dual y-axis: Discharge left, Suction right) ──
      this._cSumPress=new Chart(this.$refs.chartSumPress,{
        type:'line', data:{ labels, datasets:[
          {label:'TB-01 Disch',data:d.map(r=>r.tb1dischPres),borderColor:t.accent,backgroundColor:h2r(t.accent,.07),borderWidth:2,  pointRadius:0,tension:0.3,fill:true, yAxisID:'yDisch'},
          {label:'TB-02 Disch',data:d.map(r=>r.tb2dischPres),borderColor:t.kwh,  backgroundColor:h2r(t.kwh,.07),  borderWidth:2,  pointRadius:0,tension:0.3,fill:true, yAxisID:'yDisch'},
          {label:'TB-01 Suct', data:d.map(r=>r.tb1suctPres), borderColor:t.orpL, backgroundColor:'transparent',    borderWidth:1.5,pointRadius:0,tension:0.3,borderDash:[4,3], yAxisID:'ySuct'},
          {label:'TB-02 Suct', data:d.map(r=>r.tb2suctPres), borderColor:h2r(t.orpL,.6),backgroundColor:'transparent',borderWidth:1.2,pointRadius:0,tension:0.3,borderDash:[4,3], yAxisID:'ySuct'},
        ]}, options:{
          responsive:true, maintainAspectRatio:false, animation:false,
          plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,bodyFont:{family:'JetBrains Mono',size:11}}},
          scales:{
            x:{ticks:{color:t.tick,font:{size:9},maxRotation:0},grid:{color:h2r(t.tick,.16)},border:{display:false}},
            yDisch:{type:'linear',position:'left',  ticks:{color:t.accent,font:{size:9}},grid:{color:h2r(t.tick,.16)},border:{display:false},title:{display:true,text:'Disch mmAq',color:t.accent,font:{size:8}}},
            ySuct: {type:'linear',position:'right', ticks:{color:t.orpL, font:{size:9}},grid:{display:false},          border:{display:false},title:{display:true,text:'Suct mmAq', color:t.orpL, font:{size:8}}},
          },
        },
      });

      // ── Pressure Ratio chart: Disch / |Suct| ──
      const ratio=(disch,suct)=>(disch!==null&&suct!==null&&suct!==0) ? +(disch/Math.abs(suct)).toFixed(1) : null;
      this._cSumRatio=new Chart(this.$refs.chartSumRatio,{
        type:'line', data:{ labels, datasets:[
          {label:'TB-01 Ratio',data:d.map(r=>ratio(r.tb1dischPres,r.tb1suctPres)),borderColor:t.accent,backgroundColor:h2r(t.accent,.1),borderWidth:2,pointRadius:0,tension:0.3,fill:true},
          {label:'TB-02 Ratio',data:d.map(r=>ratio(r.tb2dischPres,r.tb2suctPres)),borderColor:t.kwh,  backgroundColor:h2r(t.kwh,.1),  borderWidth:2,pointRadius:0,tension:0.3,fill:true},
        ]}, options:{...opts, scales:{
          x:{...opts.scales.x},
          y:{...opts.scales.y, title:{display:true,text:'Disch/|Suct|',color:t.hOk,font:{size:8}}},
        }},
      });
    },
    setSummaryMode(mode) {
      if(this.summaryMode===mode) return;
      this.summaryMode=mode; this.summaryOffset=0;
      [this._cSumPow,this._cSumFlow,this._cSumEnergy,this._cSumTemp,this._cSumPress,this._cSumRatio].forEach(c=>c?.destroy());
      this._cSumPow=this._cSumFlow=this._cSumEnergy=this._cSumTemp=this._cSumPress=this._cSumRatio=null;
      this.$nextTick(()=>this.buildSummaryCharts());
    },
    changeOffset(dir) {
      const max=this.summaryMode==='daily'?6:5;
      this.summaryOffset=Math.max(0,Math.min(max,this.summaryOffset+dir));
      if(this.summaryMode==='daily') this.dailyData=genDailyData(this.summaryOffset);
      else                           this.monthlyData=genMonthlyData(this.summaryOffset);
      [this._cSumPow,this._cSumFlow,this._cSumEnergy,this._cSumTemp,this._cSumPress,this._cSumRatio].forEach(c=>c?.destroy());
      this._cSumPow=this._cSumFlow=this._cSumEnergy=this._cSumTemp=this._cSumPress=this._cSumRatio=null;
      this.$nextTick(()=>this.buildSummaryCharts());
    },
  },
};
</script>

<style scoped>
/* ── Root ── */
.bw-root {
  display:flex; flex-direction:column; gap:10px;
  padding:14px; min-height:100%;
  font-family:'Inter',sans-serif;
}

/* ── Header ── */
.bw-hdr { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.bw-hdr-left { display:flex; align-items:center; gap:10px; flex:1; }
.bw-title-bar { width:4px; height:30px; border-radius:2px; flex-shrink:0; }
.bw-title { font-size:17px; font-weight:800; letter-spacing:.1em; color:var(--ex-label); }
.bw-sub   { font-size:9px;  color:var(--ex-text-sub); letter-spacing:.06em; margin-top:2px; }
.bw-hdr-right { display:flex; align-items:center; gap:8px; }
.bw-theme-row { display:flex; gap:5px; }
.bw-theme-btn { width:20px; height:20px; border-radius:50%; background:var(--ex-mn-bg); border:1px solid var(--ex-tag-bdr); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .15s; }
.bw-theme-btn.active { transform:scale(1.25); }
.bw-theme-dot { width:11px; height:11px; border-radius:50%; }

/* ── Section header ── */
.bw-sec-hdr { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.bw-sec-line { width:3px; height:16px; border-radius:2px; flex-shrink:0; }
.bw-sec-label { font-size:9px; font-weight:800; letter-spacing:.14em; white-space:nowrap; }
.bw-live-dot  { width:7px; height:7px; border-radius:50%; background:var(--ex-h-ok); box-shadow:0 0 5px var(--ex-h-ok); animation:bwpulse 2s infinite; flex-shrink:0; }
.bw-live-txt  { font-size:9px; font-weight:700; color:var(--ex-h-ok); letter-spacing:.1em; }
.bw-sec-line-end { flex:1; height:1px; }
@keyframes bwpulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── Realtime row ── */
.bw-rt-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

/* ── Blower panel ── */
.bw-bl-panel {
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-top:2px solid var(--bc);
  border-radius:8px; padding:14px;
  display:flex; flex-direction:column; gap:10px;
}
.bw-bl-name-bar { display:flex; align-items:center; gap:10px; }
.bw-bl-num { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:800; letter-spacing:.06em; }
.bw-bl-badge {
  margin-left:auto; font-size:10px; font-weight:700;
  padding:3px 10px; border-radius:4px; letter-spacing:.08em;
}
.st-ok   { color:var(--ex-h-ok);   background:rgba(0,232,122,.1);  border:1px solid rgba(0,232,122,.25); }
.st-warn { color:var(--ex-h-warn); background:rgba(200,169,110,.1); border:1px solid rgba(200,169,110,.25); }
.st-off  { color:var(--ex-text-sub); background:var(--ex-mn-bg); border:1px solid var(--ex-tag-bdr); }

/* ── Metric grid (screenshot style: large cards) ── */
.bw-metric-grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:6px;
}
.bw-mc {
  background:var(--ex-mn-bg); border:1px solid var(--ex-tag-bdr);
  border-left:2px solid var(--mc); border-radius:6px;
  padding:9px 11px; display:flex; flex-direction:column; gap:4px;
}
.bw-mc-wide { grid-column:span 1; }
.bw-mc-label { font-size:8px; font-weight:700; color:var(--ex-text-sub); letter-spacing:.1em; text-transform:uppercase; }
.bw-mc-big {
  font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700;
  color:var(--mc); line-height:1.1;
}
.bw-mc-unit { font-size:11px; font-weight:600; margin-left:3px; opacity:.8; }
.bw-mc-track { height:3px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; margin-top:2px; }
.bw-mc-fill  { height:100%; border-radius:2px; transition:width .5s; }

/* ── Per-blower trend chart ── */
.bw-trend-hdr {
  display:flex; align-items:center; gap:6px; flex-shrink:0;
  font-size:9px; font-weight:700; color:var(--ex-label); letter-spacing:.06em;
}
.bw-trend-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.bw-trend-legend { display:flex; align-items:center; gap:10px; margin-left:auto; }
.bw-tleg { display:flex; align-items:center; gap:4px; font-size:8px; color:var(--ex-text-sub); font-weight:500; }
.bw-tls  { display:inline-block; width:16px; height:2px; border-radius:1px; }
.bw-chart-wrap { height:160px; position:relative; }

/* ── Operation control row ── */
.bw-ctrl-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.bw-ctrl-panel {
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-left:3px solid var(--bc); border-radius:8px;
  padding:14px; display:flex; flex-direction:column; gap:12px;
  filter:brightness(1.2);
}
.bw-ctrl-title {
  display:flex; align-items:center; gap:8px;
  font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700;
}
.bw-ctrl-sub { font-size:9px; color:var(--ex-text-sub); letter-spacing:.07em; }
.bw-ctrl-inputs { display:flex; gap:20px; align-items:flex-end; }
.bw-ctrl-label {
  font-size:9px; font-weight:700; color:var(--ex-text-sub); letter-spacing:.1em;
  display:flex; flex-direction:column; gap:5px;
}
.bw-ctrl-inp-wrap { display:flex; align-items:center; gap:5px; }
.bw-ctrl-inp {
  background:var(--ex-mn-bg); border:1px solid; border-radius:5px;
  padding:5px 10px; font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:700;
  width:70px; text-align:center;
  outline:none;
}
.bw-ctrl-inp-wide { width:90px; }
.bw-ctrl-sfx { font-size:11px; color:var(--ex-text-sub); font-weight:600; }
.bw-ctrl-btns { display:flex; gap:8px; }
.bw-btn {
  padding:7px 18px; border-radius:6px; border:1px solid;
  font-size:11px; font-weight:700; letter-spacing:.08em; cursor:pointer;
  display:flex; align-items:center; gap:5px; transition:filter .15s;
}
.bw-btn:hover { filter:brightness(1.2); }
.bw-btn-stop { background:rgba(168,104,104,.15); border-color:rgba(168,104,104,.4); color:var(--ex-h-crit); }

/* ── View switch & nav (Executive style) ── */
.view-sw { display:flex; background:var(--ex-mn-bg); border:1px solid var(--ex-mn-bdr,var(--ex-tag-bdr)); border-radius:5px; overflow:hidden; }
.view-btn { padding:3px 11px; font-size:9px; font-weight:700; cursor:pointer; color:var(--ex-mn-color); background:transparent; border:none; letter-spacing:.06em; }
.view-btn.active { background:var(--ex-accent); color:rgba(255,255,255,.92); }
.bw-nav { display:flex; align-items:center; gap:4px; }
.bw-nav-btn { background:none; border:none; color:var(--ex-label); cursor:pointer; font-size:16px; padding:0 2px; line-height:1; }
.bw-nav-btn:disabled { opacity:.28; cursor:not-allowed; }
.bw-nav-label { font-size:10px; color:var(--ex-label); min-width:90px; text-align:center; font-weight:600; }

/* ── Summary KPI bar ── */
.bw-kpi-bar {
  display:grid; grid-template-columns:repeat(5,1fr);
  gap:1px; background:var(--ex-card-bdr); border-radius:8px; overflow:hidden;
}
.bw-kpi-card {
  background:var(--ex-card-bg); border-left:3px solid var(--c);
  padding:10px 14px; display:flex; flex-direction:column; gap:5px;
  transition:filter .15s;
}
.bw-kpi-card:hover { filter:brightness(1.08); }
.bw-kpi-tag  { font-size:9px; font-weight:700; color:var(--ex-text-sub); letter-spacing:.08em; text-transform:uppercase; }
.bw-kpi-row  { display:flex; align-items:baseline; gap:5px; }
.bw-kpi-big  { font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; line-height:1; }
.bw-kpi-unit { font-size:12px; font-weight:600; }
.bw-kpi-chips { display:flex; flex-wrap:wrap; gap:4px; }
.bw-kpi-chip  { font-size:9px; padding:2px 7px; border-radius:3px; background:var(--ex-tag-bg); border:1px solid var(--ex-tag-bdr); white-space:nowrap; }
.bw-kpi-foot  { font-size:9px; color:var(--ex-text-sub); }

/* ── Summary charts ── */
.bw-sum-charts { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.bw-chart-card {
  background:var(--ex-card-bg); border:1px solid var(--ex-card-bdr);
  border-radius:8px; padding:10px 12px;
  display:flex; flex-direction:column; gap:6px;
}
.bw-ch-hdr {
  display:flex; align-items:center; gap:6px; flex-shrink:0;
  font-size:9px; font-weight:700; color:var(--ex-label); letter-spacing:.06em;
}
.bw-ch-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.bw-sum-wrap { min-height:155px; position:relative; }
.bw-legend { display:flex; align-items:center; gap:6px; font-weight:500; color:var(--ex-text-sub); }
.bw-ls { display:inline-block; width:18px; height:2px; border-radius:1px; vertical-align:middle; }
.bw-ls-dash { background-image:repeating-linear-gradient(90deg,currentColor 0,currentColor 4px,transparent 4px,transparent 7px); background-color:transparent !important; }
.ml { margin-left:auto; }
</style>
