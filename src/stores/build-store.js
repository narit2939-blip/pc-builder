import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/boot/axios'
import { useAuthStore } from './auth-store'
import { usePartsStore } from './parts-store'
import { CATS, SLOTS, checkBuild, calcAirflow } from '@/utils/compat'
import { useRequest, getList } from '@/utils/http'

const SEL_KEYS = [...CATS, 'cooler']
const emptySel = () => ({ ...Object.fromEntries(SEL_KEYS.map((c) => [c, null])), coolerMount: 'front' })
const emptyFans = () => ({ front: { id: null, qty: 2 }, rear: { id: null, qty: 1 }, top: { id: null, qty: 1 } })

export const useBuildStore = defineStore('build', () => {
  const parts = usePartsStore()
  const sel = ref(emptySel())
  const fans = ref(emptyFans())
  const saved = ref([])
  const { loading, error, run } = useRequest()

  const picked = computed(() => Object.fromEntries(SEL_KEYS.map((c) => [c, parts.byId(sel.value[c])])))
  const fanParts = computed(() => Object.fromEntries(Object.keys(SLOTS).map((k) => [k, parts.byId(fans.value[k].id)])))
  const total = computed(() =>
    SEL_KEYS.reduce((s, c) => s + (picked.value[c]?.price || 0), 0) +
    Object.keys(SLOTS).reduce((s, k) => s + (fanParts.value[k]?.price || 0) * fans.value[k].qty, 0))
  const checks = computed(() => checkBuild(picked.value, { mount: sel.value.coolerMount, fans: fans.value, fanParts: fanParts.value }))
  const airflow = computed(() => calcAirflow(fans.value, fanParts.value, picked.value.cooler, sel.value.coolerMount))

  const owner = () => useAuthStore().user?.username || ''
  const fetchSaved = () => run(async () => {
    const me = owner()
    if (!me) { saved.value = []; return }
    saved.value = (await getList(api, '/builds', { owner: me })).filter((x) => x.owner === me)
  })
  const save = (name) => run(async () => {
    const me = owner()
    if (!me) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
    const { data } = await api.post('/builds', {
      name,
      owner: me,
      sel: JSON.stringify(sel.value),
      fans: JSON.stringify(fans.value),
      total: total.value,
    })
    saved.value.unshift(data)
  })
  const removeSaved = (id) => run(async () => {
    if (!id) throw new Error('ไม่พบรหัสของสเปคนี้ กรุณาตรวจสอบ resource builds ใน MockAPI')
    try { await api.delete(`/builds/${id}`) }
    catch (e) { if (e.response?.status !== 404) throw e }
    saved.value = saved.value.filter((b) => String(b.id) !== String(id))
  })

  const read = (v) => {
    try { return typeof v === 'string' ? JSON.parse(v || '{}') : (v || {}) }
    catch { return {} }
  }
  const load = (b) => {
    sel.value = { ...emptySel(), ...read(b.sel) }
    fans.value = { ...emptyFans(), ...JSON.parse(JSON.stringify(read(b.fans))) }
  }
  const applyPreset = (p) => { sel.value = { ...emptySel(), ...p.sel }; fans.value = JSON.parse(JSON.stringify(p.fans)) }
  const reset = () => { sel.value = emptySel(); fans.value = emptyFans() }

  return { sel, fans, saved, loading, error, picked, fanParts, total, checks, airflow, fetchSaved, save, removeSaved, load, reset, applyPreset }
}, { persist: { pick: ['sel', 'fans'], storage: sessionStorage } })