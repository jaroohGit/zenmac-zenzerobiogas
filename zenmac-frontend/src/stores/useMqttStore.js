/**
 * useMqttStore — Pinia bridge to Vuex staKd MQTT state
 *
 * Exposes mqttConnected and authorityTier as reactive refs
 * so Pinia-based stores (useProhibitStore etc.) can read them
 * without depending on the Vuex $store instance directly.
 *
 * authorityTier: call setAuthorityTier() when the backend sends
 *   the current control authority (e.g. on kd:status socket event).
 */

import { defineStore } from 'pinia';
import { computed, ref }  from 'vue';
import vuexStore from '@/state/store';    // Vuex 4 store instance

export const useMqttStore = defineStore('mqtt', () => {

  // ── Read mqttConnected directly from Vuex staKd module ──────────────────
  const mqttConnected = computed(
    () => vuexStore.state.staKd?.mqttConnected ?? false
  );

  // ── authorityTier — not yet in Vuex; managed here in Pinia ──────────────
  // Values: 'local' (PLC controls) | 'hmi' (HMI panel) | 'web' (this dashboard)
  // Default 'web' until backend reports otherwise.
  const authorityTier = ref('web');

  function setAuthorityTier(tier) {
    if (['local', 'hmi', 'web'].includes(tier)) authorityTier.value = tier;
  }

  return { mqttConnected, authorityTier, setAuthorityTier };
});
