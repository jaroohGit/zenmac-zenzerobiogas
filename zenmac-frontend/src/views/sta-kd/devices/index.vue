<template>
  <div class="kd-page">
    <div class="kd-page-title-bar">
      <div class="kd-page-accent" style="background:var(--cyan)"></div>
      <h1 class="kd-page-title">DEVICE REGISTRY</h1>
      <span class="kd-breadcrumb">STA-KD / DEVICES</span>
    </div>

    <!-- Stats -->
    <div class="kd-stats-row">
      <div class="kd-stat-card" v-for="s in stats" :key="s.label">
        <div class="kd-stat-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="kd-stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="kd-filter-bar">
      <input v-model="search" class="kd-search-input" placeholder="🔍  Search device…" />
      <select v-model="filterType" class="kd-filter-sel">
        <option value="">ALL TYPES</option>
        <option value="flow">FLOW</option>
        <option value="sensor">SENSOR</option>
        <option value="pump">PUMP</option>
        <option value="blower">BLOWER</option>
      </select>
      <select v-model="filterTank" class="kd-filter-sel">
        <option value="">ALL TANKS</option>
        <option value="process">PROCESS</option>
        <option value="serum">SERUM</option>
        <option value="latex">LATEX</option>
        <option value="common">COMMON</option>
      </select>
      <div style="margin-left:auto; display:flex; gap:8px;">
        <button class="kd-dm-btn kd-dm-btn-primary" @click="showAddModal = true">+ ADD DEVICE</button>
        <button class="kd-dm-btn" @click="exportJSON">⬇ EXPORT JSON</button>
      </div>
    </div>

    <!-- Device Table -->
    <div class="kd-device-table-card">
      <table class="kd-dtable">
        <thead>
          <tr>
            <th>ID</th><th>NAME</th><th>TYPE</th><th>TANK</th>
            <th>TOPIC (SUB)</th><th>UNIT</th><th>LAST VALUE</th><th>STATUS</th><th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dev in filteredDevices" :key="dev.id">
            <td class="kd-dt-id">{{ dev.id }}</td>
            <td class="kd-dt-name">{{ dev.name }}</td>
            <td><span class="kd-type-badge" :class="'type-' + dev.type">{{ dev.type }}</span></td>
            <td class="kd-dt-tank">{{ dev.tank }}</td>
            <td class="kd-dt-topic" :title="dev.topic_sub">{{ dev.topic_sub }}</td>
            <td class="kd-dt-unit">{{ dev.unit }}</td>
            <td class="kd-dt-val" :style="lastValColor(dev)">{{ dev.lastVal }}</td>
            <td><span class="kd-st-dot" :class="dev.status === 'online' ? 'dot-on' : 'dot-off'"></span>{{ dev.status }}</td>
            <td class="kd-dt-actions">
              <button class="kd-act-btn kd-act-edit" @click="editDev(dev)">EDIT</button>
              <button class="kd-act-btn kd-act-del"  @click="delDev(dev.id)">DEL</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="kd-modal-backdrop" @click.self="showAddModal = false">
      <div class="kd-modal">
        <div class="kd-modal-title">{{ editMode ? 'EDIT DEVICE' : 'ADD DEVICE' }}</div>
        <div class="kd-modal-grid">
          <div class="kd-mf"><label>ID</label><input v-model="form.id" class="kd-mi" :disabled="editMode" /></div>
          <div class="kd-mf"><label>NAME</label><input v-model="form.name" class="kd-mi" /></div>
          <div class="kd-mf"><label>TYPE</label>
            <select v-model="form.type" class="kd-mi">
              <option>flow</option><option>sensor</option><option>pump</option><option>blower</option>
            </select>
          </div>
          <div class="kd-mf"><label>SIGNAL</label><input v-model="form.signal" class="kd-mi" /></div>
          <div class="kd-mf"><label>TANK</label>
            <select v-model="form.tank" class="kd-mi">
              <option>process</option><option>serum</option><option>latex</option><option>common</option>
            </select>
          </div>
          <div class="kd-mf"><label>UNIT</label><input v-model="form.unit" class="kd-mi" /></div>
          <div class="kd-mf" style="grid-column:1/-1"><label>TOPIC SUBSCRIBE</label><input v-model="form.topic_sub" class="kd-mi" style="color:var(--green)" /></div>
          <div class="kd-mf" style="grid-column:1/-1"><label>TOPIC PUBLISH (optional)</label><input v-model="form.topic_pub" class="kd-mi" /></div>
          <div class="kd-mf" style="grid-column:1/-1"><label>JSON PATH</label><input v-model="form.path" class="kd-mi" /></div>
        </div>
        <div class="kd-modal-btns">
          <button class="kd-dm-btn kd-dm-btn-primary" @click="saveDevice">{{ editMode ? 'UPDATE' : 'ADD' }}</button>
          <button class="kd-dm-btn" @click="showAddModal = false">CANCEL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

const BLANK = { id:'', name:'', type:'sensor', signal:'', tank:'process', unit:'', topic_sub:'', topic_pub:'', path:'' };

export default {
  name: 'StaKdDevices',
  data() {
    return {
      search: '', filterType: '', filterTank: '',
      showAddModal: false, editMode: false,
      form: { ...BLANK },
    };
  },
  computed: {
    ...mapState('staKd', ['devices']),
    filteredDevices() {
      return this.devices.filter(d => {
        if (this.search && !JSON.stringify(d).toLowerCase().includes(this.search.toLowerCase())) return false;
        if (this.filterType && d.type !== this.filterType) return false;
        if (this.filterTank && d.tank !== this.filterTank) return false;
        return true;
      });
    },
    stats() {
      const all = this.devices;
      return [
        { label: 'TOTAL DEVICES', value: all.length, color: 'var(--cyan)' },
        { label: 'SENSORS',       value: all.filter(d => d.type === 'sensor').length, color: 'var(--teal)' },
        { label: 'FLOW METERS',   value: all.filter(d => d.type === 'flow').length,   color: 'var(--green)' },
        { label: 'PUMPS',         value: all.filter(d => d.type === 'pump').length,   color: 'var(--amber)' },
        { label: 'BLOWERS',       value: all.filter(d => d.type === 'blower').length, color: 'var(--orange)' },
        { label: 'ONLINE',        value: all.filter(d => d.status === 'online').length, color: 'var(--green)' },
      ];
    },
  },
  created() { this.$store.dispatch('staKd/fetchDevices'); },
  methods: {
    lastValColor(dev) {
      if (dev.status === 'online') return 'color: var(--cyan)';
      return 'color: var(--text3)';
    },
    editDev(dev) {
      this.form = { ...dev };
      this.editMode = true;
      this.showAddModal = true;
    },
    async delDev(id) {
      if (!confirm(`Delete device ${id}?`)) return;
      await this.$store.dispatch('staKd/deleteDevice', id);
    },
    async saveDevice() {
      if (!this.form.id) return alert('ID required');
      await this.$store.dispatch('staKd/upsertDevice', { ...this.form });
      this.showAddModal = false;
      this.form = { ...BLANK };
      this.editMode = false;
    },
    exportJSON() {
      const json = JSON.stringify({ devices: this.devices, exported: new Date().toISOString(), project: 'STA-KD' }, null, 2);
      const a = document.createElement('a');
      a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
      a.download = `sta-kd-devices-${Date.now()}.json`;
      a.click();
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

.kd-stats-row { display: flex; gap: 9px; flex-wrap: wrap; }
.kd-stat-card { background: rgba(10,14,20,.92); border: 1px solid var(--border); border-radius: 10px; padding: 10px 18px; display: flex; flex-direction: column; align-items: center; min-width: 100px; }
.kd-stat-val   { font-family: var(--font-mono); font-size: 28px; font-weight: 700; line-height: 1; }
.kd-stat-label { font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: .08em; margin-top: 3px; }

.kd-filter-bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.kd-search-input { font-family: var(--font-mono); font-size: 11px; background: rgba(18,28,44,.85); border: 1px solid var(--border2); color: var(--text); padding: 6px 12px; border-radius: 6px; outline: none; width: 220px; }
.kd-search-input:focus { border-color: rgba(0,212,255,.4); }
.kd-filter-sel  { font-family: var(--font-mono); font-size: 10px; background: rgba(18,28,44,.85); border: 1px solid var(--border2); color: var(--text2); padding: 6px 10px; border-radius: 6px; outline: none; }
.kd-dm-btn { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 6px 14px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border2); background: var(--bg2); color: var(--text2); transition: all .15s; }
.kd-dm-btn:hover { border-color: var(--border3); }
.kd-dm-btn-primary { background: rgba(0,212,255,.12); color: var(--cyan); border-color: rgba(0,212,255,.3); }
.kd-dm-btn-primary:hover { background: rgba(0,212,255,.2); }

.kd-device-table-card { background: rgba(8,12,18,.92); border: 1px solid var(--border); border-radius: 10px; padding: 12px; overflow-x: auto; }
.kd-dtable { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 10px; min-width: 900px; }
.kd-dtable th { color: var(--text3); font-size: 8.5px; letter-spacing: .07em; padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
.kd-dtable td { padding: 7px 8px; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
.kd-dtable tr:hover td { background: rgba(25,35,50,.4); }
.kd-dt-id    { color: var(--amber); font-size: 9px; }
.kd-dt-name  { font-family: var(--font-ui); font-size: 12px; font-weight: 600; }
.kd-dt-tank  { color: var(--text2); font-size: 9px; }
.kd-dt-topic { color: var(--text3); font-size: 9px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kd-dt-unit  { color: var(--text2); }
.kd-dt-val   { font-weight: 700; }
.kd-dt-actions { display: flex; gap: 4px; }
.kd-type-badge { font-family: var(--font-mono); font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
.type-sensor  { background:rgba(0,200,176,.15); color:var(--teal);   border:1px solid rgba(0,200,176,.3); }
.type-flow    { background:rgba(0,232,122,.13); color:var(--green);  border:1px solid rgba(0,232,122,.3); }
.type-pump    { background:rgba(255,184,0,.13); color:var(--amber);  border:1px solid rgba(255,184,0,.3); }
.type-blower  { background:rgba(0,212,255,.12); color:var(--cyan);   border:1px solid rgba(0,212,255,.28); }
.kd-st-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }
.dot-on  { background: var(--green); }
.dot-off { background: var(--text3); }
.kd-act-btn { font-family: var(--font-mono); font-size: 8px; font-weight: 700; padding: 2px 7px; border-radius: 3px; cursor: pointer; border: 1px solid; }
.kd-act-edit { background:rgba(0,212,255,.1); color:var(--cyan); border-color:rgba(0,212,255,.28); }
.kd-act-del  { background:rgba(255,64,64,.1);  color:var(--red);  border-color:rgba(255,64,64,.25); }

/* Modal */
.kd-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 900; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.kd-modal { background: var(--bg1); border: 1px solid var(--border2); border-radius: 14px; padding: 22px 26px; width: 520px; max-width: 95vw; font-family: var(--font-mono); }
.kd-modal-title { font-family: var(--font-ui); font-weight: 700; font-size: 16px; color: var(--cyan); margin-bottom: 16px; }
.kd-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.kd-mf { display: flex; flex-direction: column; gap: 4px; }
.kd-mf label { font-size: 9px; color: var(--text3); letter-spacing: .08em; }
.kd-mi { font-family: var(--font-mono); font-size: 12px; background: rgba(18,28,44,.9); border: 1px solid var(--border2); color: var(--text); padding: 6px 9px; border-radius: 5px; outline: none; }
.kd-mi:focus { border-color: rgba(0,212,255,.4); }
.kd-modal-btns { display: flex; gap: 8px; }
</style>
