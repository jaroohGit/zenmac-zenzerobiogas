import axios from 'axios';
import { getSocket, on } from '@/services/staKdSocket';

const API = process.env.VUE_APP_KD_BACKEND
  || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3323');

export const state = {
  mqttConnected: false,
  mqttBroker: '',
  mqttReconnecting: false,

  kd:  {},
  kd1: {},
  kd2: {},
  kd4: {},
  kd5: {},

  // template-pattern: clean mapped live data
  live: {},
  // template-pattern: 24-hr history
  history: { labels: [], serumFlow: [], processFlow: [], serumORP: [], processORP: [] },

  devices: [],
  lastUpdate: null,
};

export const getters = {
  processFlow:   s => s.kd['Process Flow m3_hr (Real)']  ?? '—',
  serumFlow:     s => s.kd['Serum Flow m3_hr (real)']    ?? '—',

  processORP:    s => s.kd4['Process_ORP_Lock_hr']   ?? '—',
  serumORP:      s => s.kd4['Serum_ORP_Lock_hr']     ?? '—',
  processpH:     s => s.kd4['Process_pH_Lock_hr']    ?? '—',
  serumpH:       s => s.kd4['Serum_PH_Lock_hr']      ?? '—',
  processTemp:   s => s.kd4['Process_Temp_Lock_hr']  ?? '—',
  serumTemp:     s => s.kd4['Serum_Temp_Lock_hr']    ?? '—',

  tb1Power:       s => { const v = parseFloat(s.kd1['TB_1_BLOWER POWER_kW']);         return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1Current:     s => { const v = parseFloat(s.kd1['TB_1_MOTOR CURRENT_A']);         return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1Flow:        s => { const v = parseFloat(s.kd1['TB_1_SUCTION FLOW RATE_CMM']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1SuctPres:    s => { const v = parseFloat(s.kd1['TB_1_Suction_pressure_mmAq']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1DischPres:   s => { const v = parseFloat(s.kd1['TB_1_DISCHARGE PRESSURE_mmAq']); return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1OutsideTemp: s => { const v = parseFloat(s.kd1['TB_1_OUTSIDE TEMPERATURE_C']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1MotorTemp:   s => { const v = parseFloat(s.kd1['TB_1_MOTOR TEMPERATURE_C']);     return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1DriveTemp:   s => { const v = parseFloat(s.kd1['TB_1_DRIVE TEMPERATURE_C']);     return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1DischTemp:   s => { const v = parseFloat(s.kd1['TB_1_DISCHARGE TEMPERATURE_C']); return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb1OnOff:        s => s.kd1['TB_1_Number of ON OFF'] ?? '—',
  tb1KwhToday:     s => s.live?.blower1?.kwhToday     ?? '—',
  tb1RunHoursToday:s => s.live?.blower1?.runHoursToday ?? '—',

  tb2Power:       s => { const v = parseFloat(s.kd1['TB_2_BLOWER POWER_kW']);         return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2Current:     s => { const v = parseFloat(s.kd1['TB_2_MOTOR CURRENT_A']);         return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2Flow:        s => { const v = parseFloat(s.kd1['TB_2_SUCTION FLOW RATE_CMM']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2SuctPres:    s => { const v = parseFloat(s.kd1['TB_2_Suction_pressure_mmAq']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2DischPres:   s => { const v = parseFloat(s.kd1['TB_2_DISCHARGE PRESSURE_mmAq']); return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2OutsideTemp: s => { const v = parseFloat(s.kd1['TB_2_OUTSIDE TEMPERATURE_C']);   return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2MotorTemp:   s => { const v = parseFloat(s.kd1['TB_2_MOTOR TEMPERATURE_C']);     return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2DriveTemp:   s => { const v = parseFloat(s.kd1['TB_2_DRIVE TEMPERATURE_C']);     return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2DischTemp:   s => { const v = parseFloat(s.kd1['TB_2_DISCHARGE TEMPERATURE_C']); return isNaN(v) ? '—' : (v / 10).toFixed(1); },
  tb2OnOff:        s => s.kd1['TB_2_Number of ON OFF'] ?? '—',
  tb2KwhToday:     s => s.live?.blower2?.kwhToday     ?? '—',
  tb2RunHoursToday:s => s.live?.blower2?.runHoursToday ?? '—',

  tb1Status:          s => s.kd5['TB-01_Status']            ?? '—',
  tb2Status:          s => s.kd5['TB-02_Status']            ?? '—',
  processPumpStatus:  s => s.kd5['Process pump_Status']     ?? '—',
  serumPumpStatus:    s => s.kd5['Serum pump_Status']       ?? '—',

  processFlowDay:     s => s.kd5['Process Flow M3_Day_real']       ?? '—',
  serumFlowDay:       s => s.kd5['Serum Flow M3_Day_real']         ?? '—',
  totalFlowDay:       s => s.kd5['Process+Serum Flow M3_Day_real'] ?? '—',

  processFlowYest:    s => s.kd2['Process Flow M3_Day_Lock_yesterday'] ?? '—',
  serumFlowYest:      s => s.kd2['Serum Flow M3_Day_Lock_yesterday']   ?? '—',

  combinedORP(s) {
    const p = parseFloat(s.kd4['Process_ORP_Lock_hr']);
    const q = parseFloat(s.kd4['Serum_ORP_Lock_hr']);
    if (isNaN(p) && isNaN(q)) return '—';
    if (isNaN(p)) return q.toFixed(1);
    if (isNaN(q)) return p.toFixed(1);
    return ((p + q) / 2).toFixed(1);
  },

  blowerTotalPower(s) {
    const p1 = parseFloat(s.kd1['TB_1_BLOWER POWER_kW']) || 0;
    const p2 = parseFloat(s.kd1['TB_2_BLOWER POWER_kW']) || 0;
    return ((p1 + p2) / 10).toFixed(1);
  },
};

export const mutations = {
  SET_MQTT_STATUS(state, { connected, broker, reconnecting }) {
    state.mqttConnected = !!connected;
    if (broker !== undefined) state.mqttBroker = broker;
    state.mqttReconnecting = !!reconnecting;
  },
  SET_TOPIC(state, { key, data }) {
    state[key] = { ...state[key], ...data };
    state.lastUpdate = Date.now();
  },
  SET_SNAPSHOT(state, snapshot) {
    for (const [key, data] of Object.entries(snapshot || {})) {
      if (state[key] !== undefined) state[key] = { ...state[key], ...data };
    }
    state.lastUpdate = Date.now();
  },
  SET_LIVE(state, live) {
    state.live = live;
    state.lastUpdate = Date.now();
  },
  SET_HISTORY(state, history) {
    state.history = history;
  },
  SET_DEVICES(state, list) {
    state.devices = list;
  },
};

export const actions = {
  initSocket({ commit }) {
    getSocket();
    // kd:* domain events
    on('kd:status',   (d) => commit('SET_MQTT_STATUS', d));
    on('kd:snapshot', (d) => commit('SET_SNAPSHOT', d));
    on('kd:update',   ({ key, data }) => commit('SET_TOPIC', { key, data }));
    // template-pattern events
    on('live',    (d) => commit('SET_LIVE', d));
    on('history', (d) => commit('SET_HISTORY', d));
    on('rawmqtt', (d) => commit('SET_SNAPSHOT', d));
  },

  async fetchState({ commit }) {
    try {
      const { data } = await axios.get(`${API}/api/state`);
      commit('SET_SNAPSHOT', data);
    } catch (e) {
      console.warn('[staKd] fetchState error', e.message);
    }
  },

  async fetchDevices({ commit }) {
    try {
      const { data } = await axios.get(`${API}/api/devices`);
      commit('SET_DEVICES', data);
    } catch (e) {
      console.warn('[staKd] fetchDevices error', e.message);
    }
  },

  async saveDevices({ commit }, list) {
    const { data } = await axios.post(`${API}/api/devices`, list);
    commit('SET_DEVICES', data);
  },

  async upsertDevice({ dispatch }, dev) {
    await axios.put(`${API}/api/devices/${dev.id}`, dev);
    dispatch('fetchDevices');
  },

  async deleteDevice({ dispatch }, id) {
    await axios.delete(`${API}/api/devices/${id}`);
    dispatch('fetchDevices');
  },

  async cmdBlower(_, { n, cmd, speed_pct }) {
    await axios.post(`${API}/api/cmd/blower/${n}`, { cmd, speed_pct });
  },

  async cmdPump(_, { side, cmd }) {
    await axios.post(`${API}/api/cmd/pump/${side}`, { cmd });
  },

  async getHistory(_, { topicKey, field }) {
    try {
      const { data } = await axios.get(`${API}/api/history/${topicKey}/${encodeURIComponent(field)}`);
      return data;
    } catch (e) {
      console.warn('[staKd] getHistory error', topicKey, field, e.message);
      return [];
    }
  },
};

export const namespaced = true;
