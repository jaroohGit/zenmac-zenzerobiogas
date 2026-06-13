/**
 * useProhibitStore — Operation Guard for ZenMAC
 *
 * Fail-fast rules (in order):
 *  1. AUTHORITY_BLOCK  — PLC is in control (authorityTier === 'local')
 *  2. OFFLINE_BLOCK    — MQTT not connected
 *  3. MODE_CONFLICT    — conflicting control mode already active
 *  4. DUPLICATE_OP     — same command within 5-second window
 *  5. COOLDOWN_LOCK    — explicit cooldown set after previous command
 */

import { defineStore } from 'pinia';
import { useMqttStore } from './useMqttStore';

export const CONTROL_MODES = /** @type {const} */ ([
  'ORP_BANDS',
  'LOOP_CONTROL',
  'TURNING_POINTS',
  'AIRFLOW_ORP',
]);

const DEDUP_BUCKET_MS = 5_000;
const DEDUP_TTL_MS    = 10_000;

export const useProhibitStore = defineStore('prohibit', {

  state: () => ({
    /** @type {Array<{id:string,action:string,page:string,mode:string|null,ts:string,token:string|null}>} */
    operationLog: [],
    /** @type {Record<string,number>} key='ACTION_PAGE', value=expiresAt */
    cooldownMap:  {},
    /** @type {'ORP_BANDS'|'LOOP_CONTROL'|'TURNING_POINTS'|'AIRFLOW_ORP'|null} */
    currentMode:  null,
    /** @type {object|null} */
    pendingOp:    null,
    _hashSeen:    /** @type {Record<string,number>} */ ({}),
  }),

  getters: {
    /** isInCooldown('ENABLE_ORP_orp-bands') → boolean */
    isInCooldown: (state) => (key) => {
      const exp = state.cooldownMap[key];
      return !!exp && exp > Date.now();
    },

    /** Currently-blocking rules — useful for disabled-button tooltips */
    activeBlocks(state) {
      const mqtt  = useMqttStore();
      const now   = Date.now();
      const blocks = [];

      if (mqtt.authorityTier === 'local')
        blocks.push({ code: 'AUTHORITY_BLOCK', reason: 'PLC กำลัง Control อยู่' });

      if (!mqtt.mqttConnected)
        blocks.push({ code: 'OFFLINE_BLOCK', reason: 'ยังไม่ได้เชื่อมต่อ MQTT' });

      if (state.currentMode)
        blocks.push({ code: 'MODE_ACTIVE', reason: `${state.currentMode} กำลัง Active` });

      Object.entries(state.cooldownMap).forEach(([key, exp]) => {
        if (exp > now) {
          blocks.push({
            code:   'COOLDOWN_LOCK',
            reason: `Cooldown: ${key} (${Math.ceil((exp - now) / 1000)}s)`,
          });
        }
      });

      return blocks;
    },
  },

  actions: {
    /**
     * canOperate — evaluate all rules, return first failure or OK.
     * @param {string} action
     * @param {string} page
     * @param {{ conflictModes?: string[], target?: string }} opts
     * @returns {{ allow: boolean, reason: string, code: string }}
     */
    canOperate(action, page, opts = {}) {
      const mqtt = useMqttStore();

      // 1. AUTHORITY_BLOCK
      if (mqtt.authorityTier === 'local')
        return { allow: false, reason: 'PLC กำลัง Control อยู่', code: 'AUTHORITY_BLOCK' };

      // 2. OFFLINE_BLOCK
      if (!mqtt.mqttConnected)
        return { allow: false, reason: 'ยังไม่ได้เชื่อมต่อ MQTT', code: 'OFFLINE_BLOCK' };

      // 3. MODE_CONFLICT
      if (opts.conflictModes?.length && this.currentMode && opts.conflictModes.includes(this.currentMode))
        return {
          allow:  false,
          reason: `${this.currentMode} กำลัง Active — ไม่สามารถ Enable พร้อมกัน`,
          code:   'MODE_CONFLICT',
        };

      // 4. DUPLICATE_OP
      const bucket = Math.floor(Date.now() / DEDUP_BUCKET_MS);
      const hash   = `${action}_${opts.target ?? page}_${bucket}`;
      if (this._hashSeen[hash] !== undefined)
        return { allow: false, reason: 'ส่งคำสั่งซ้ำ กรุณารอ 5 วินาที', code: 'DUPLICATE_OP' };

      this._hashSeen[hash] = Date.now();
      const cutoff = Date.now() - DEDUP_TTL_MS;
      for (const k of Object.keys(this._hashSeen))
        if (this._hashSeen[k] < cutoff) delete this._hashSeen[k];

      // 5. COOLDOWN_LOCK
      const coolKey = `${action}_${page}`;
      const expires = this.cooldownMap[coolKey];
      if (expires && expires > Date.now()) {
        const remaining = Math.ceil((expires - Date.now()) / 1000);
        return { allow: false, reason: `กรุณารอ Cooldown ก่อน (${remaining}s)`, code: 'COOLDOWN_LOCK' };
      }

      return { allow: true, reason: '', code: 'OK' };
    },

    recordOp(action, page, mode = null) {
      this.operationLog.unshift({
        id:     `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action,
        page,
        mode:   mode ?? this.currentMode,
        ts:     new Date().toISOString(),
        token:  null,
      });
      if (this.operationLog.length > 100) this.operationLog.length = 100;
    },

    setCooldown(key, ms) { this.cooldownMap[key] = Date.now() + ms; },

    setMode(mode)  { this.currentMode = mode; },

    clearMode(mode) { if (this.currentMode === mode) this.currentMode = null; },
  },
});
