<template>
  <div class="kd-page-wrap">
    <div class="page-header">
      <div class="page-title"><i class="bx bx-file-blank"></i>Daily Report — {{ todayStr }}</div>
      <button class="btn-export"><i class="bx bx-download me-1"></i>Export CSV</button>
    </div>

    <!-- Day summary -->
    <div class="day-summary">
      <div class="ds-card ds-orange">
        <div class="ds-label">SERUM FLOW TODAY</div>
        <div class="ds-val">{{ fmtNum(serumFlowDay) }}<span class="ds-unit">m³</span></div>
        <div class="ds-sub">Yesterday: {{ fmtNum(serumFlowYest) }} m³</div>
      </div>
      <div class="ds-card ds-teal">
        <div class="ds-label">LATEX FLOW TODAY</div>
        <div class="ds-val">{{ fmtNum(processFlowDay) }}<span class="ds-unit">m³</span></div>
        <div class="ds-sub">Yesterday: {{ fmtNum(processFlowYest) }} m³</div>
      </div>
      <div class="ds-card ds-green">
        <div class="ds-label">TOTAL FLOW TODAY</div>
        <div class="ds-val">{{ fmtNum(totalFlowDay) }}<span class="ds-unit">m³</span></div>
        <div class="ds-sub">Serum + Latex combined</div>
      </div>
      <div class="ds-card ds-cyan">
        <div class="ds-label">AVG ORP (24 hr)</div>
        <div class="ds-val">{{ combinedORP }}<span class="ds-unit">mV</span></div>
        <div class="ds-sub">S: {{ fmtNum(serumORP) }} | L: {{ fmtNum(processORP) }} mV</div>
      </div>
    </div>

    <!-- Hourly table -->
    <div class="report-card">
      <div class="report-card-title"><i class="bx bx-time me-2"></i>Hourly Data Log ({{ rows.length }} records)</div>
      <div class="table-wrap">
        <table class="report-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Serum ORP (mV)</th>
              <th>Latex ORP (mV)</th>
              <th>Serum pH</th>
              <th>Latex pH</th>
              <th>Serum Flow (m³)</th>
              <th>Latex Flow (m³)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.time">
              <td class="td-time">{{ r.time }}</td>
              <td class="c-orange">{{ r.serumORP }}</td>
              <td class="c-teal">{{ r.latexORP }}</td>
              <td class="c-green">{{ r.serumpH }}</td>
              <td class="c-green">{{ r.latexpH }}</td>
              <td class="c-orange">{{ r.serumFlow }}</td>
              <td class="c-teal">{{ r.latexFlow }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="7" class="no-data">กำลังโหลดข้อมูล...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'KDDailyReport',
  data() { return { rows: [] }; },
  computed: {
    ...mapGetters('staKd', [
      'serumFlow','processFlow','serumFlowDay','processFlowDay','totalFlowDay',
      'serumFlowYest','processFlowYest',
      'combinedORP','serumORP','processORP','serumpH','processpH',
    ]),
    todayStr() {
      return new Date().toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    },
  },
  mounted() { this.loadHistory(); },
  methods: {
    fmtNum(v) { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(2); },
    async loadHistory() {
      try {
        const [sO, lO, sF, lF, sPH, lPH] = await Promise.all([
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Serum_ORP_Lock_hr' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Process_ORP_Lock_hr' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Serum Flow M3_Day_real' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd5', field:'Process Flow M3_Day_real' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Serum_PH_Lock_hr' }),
          this.$store.dispatch('staKd/getHistory', { topicKey:'kd4', field:'Process_pH_Lock_hr' }),
        ]);
        const maxLen = Math.max(sO.length, lO.length, sF.length, lF.length);
        this.rows = Array.from({ length: Math.min(maxLen, 24) }, (_, i) => {
          const ri = maxLen - Math.min(maxLen,24) + i;
          const fmt = v => { const n=parseFloat(v); return isNaN(n)?'—':n.toFixed(2); };
          const ts = sO[ri]?.ts || lO[ri]?.ts;
          const t = ts ? new Date(ts).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : `${String(i).padStart(2,'0')}:00`;
          return {
            time: t,
            serumORP:  fmt(sO[ri]?.value),
            latexORP:  fmt(lO[ri]?.value),
            serumpH:   fmt(sPH[ri]?.value),
            latexpH:   fmt(lPH[ri]?.value),
            serumFlow: fmt(sF[ri]?.value),
            latexFlow: fmt(lF[ri]?.value),
          };
        }).reverse();
      } catch (e) { this.rows = []; }
    },
  },
};
</script>

<style scoped>
.kd-page-wrap { padding: 16px; font-family: 'Inter','Segoe UI',sans-serif; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.38); display: flex; align-items: center; gap: 8px; letter-spacing: .06em; text-transform: uppercase; }
.btn-export { background: rgba(212,160,64,.1); border: 1px solid rgba(212,160,64,.25); color: #d4a040; font-size: 12px; font-weight: 600; padding: 6px 16px; border-radius: 7px; cursor: pointer; display: flex; align-items: center; transition: all .2s; }
.btn-export:hover { background: rgba(212,160,64,.2); }
.day-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.ds-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 14px 16px; }
.ds-label { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.22); letter-spacing: .1em; margin-bottom: 4px; text-transform: uppercase; }
.ds-val { font-family: 'JetBrains Mono',monospace; font-size: 26px; font-weight: 700; line-height: 1.1; }
.ds-orange .ds-val{color:#ff7820} .ds-teal .ds-val{color:#00c8b0} .ds-green .ds-val{color:#b8e834} .ds-cyan .ds-val{color:#00d4ff}
.ds-unit { font-size: 12px; font-weight: 400; color: rgba(255,255,255,.28); margin-left: 4px; }
.ds-sub { font-size: 10px; color: rgba(255,255,255,.2); margin-top: 4px; }
.report-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 14px; }
.report-card-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.35); letter-spacing: .04em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.table-wrap { overflow-x: auto; }
.report-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.report-table th { font-size: 10px; font-weight: 600; letter-spacing: .06em; color: rgba(255,255,255,.22); padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,.07); text-align: right; white-space: nowrap; text-transform: uppercase; }
.report-table th:first-child { text-align: left; }
.report-table td { font-family: 'JetBrains Mono',monospace; font-size: 12px; padding: 7px 12px; border-bottom: 1px solid rgba(255,255,255,.04); text-align: right; color: rgba(255,255,255,.38); }
.report-table td:first-child { text-align: left; }
.report-table tr:last-child td { border-bottom: none; }
.report-table tr:hover td { background: rgba(255,255,255,.02); }
.td-time { color: rgba(255,255,255,.25) !important; }
.no-data { text-align: center !important; color: rgba(255,255,255,.15); padding: 20px !important; }
.c-orange{color:#ff7820!important} .c-teal{color:#00c8b0!important} .c-green{color:#b8e834!important} .c-cyan{color:#00d4ff!important}
</style>
