import { useProhibitStore } from '@/stores/useProhibitStore'

export function useProhibit() {
  const store = useProhibitStore()

  function guardedAction(action, page, fn, opts = {}) {
    const result = store.canOperate(action, page, opts)
    if (!result.allow) {
      window.dispatchEvent(new CustomEvent('prohibit-block', {
        detail: { code: result.code, reason: result.reason, action, page }
      }))
      return false
    }
    store.recordOp(action, page, store.currentMode)
    if (opts.cooldownMs) store.setCooldown(action+'_'+page, opts.cooldownMs)
    if (opts.setMode)    store.setMode(opts.setMode)
    return fn()
  }

  return { guardedAction, store }
}
