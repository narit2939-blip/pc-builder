import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/boot/axios'
import { useAuthStore } from './auth-store'
import { usePartsStore } from './parts-store'
import { CATS, SLOTS, checkBuild, calcAirflow } from '@/utils/compat'
import { useRequest, getList } from '@/utils/http'

const SEL_KEYS = [...CATS, 'cooler'] // ชิ้นส่วนหลัก 5 ชิ้น + ชุดระบายความร้อน CPU (ไม่บังคับ)
const emptySel = () => ({ ...Object.fromEntries(SEL_KEYS.map((c) => [c, null])), coolerMount: 'front' })
const emptyFans = () => ({ front: { id: null, qty: 2 }, rear: { id: null, qty: 1 }, top: { id: null, qty: 1 } })

export const useBuildStore = defineStore('build', () => {
  const parts = usePartsStore()
  const sel = ref(emptySel()) // เก็บเฉพาะ id ของชิ้นที่เลือก
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

  const owner = () => useAuthStore().user.username
  const fetchSaved = () => run(async () => {
    saved.value = (await getList(api, '/builds', { owner: owner() })).filter((x) => x.owner === owner())
  })
  const save = (name) => run(async () => {
    const { data } = await api.post('/builds', { name, owner: owner(), sel: JSON.stringify(sel.value), fans: JSON.stringify(fans.value), total: total.value })
    saved.value.unshift(data)
  })
  const removeSaved = (id) => run(async () => {
    await api.delete(`/builds/${id}`)
    saved.value = saved.value.filter((b) => b.id != id)
  })
  // sel/fans เก็บเป็นข้อความ JSON เพื่อไม่ต้องพึ่งชนิดข้อมูล Object ของ MockAPI (รองรับข้อมูลเก่าที่เป็น object ด้วย)
  const read = (v) => (typeof v === 'string' ? JSON.parse(v) : v)
  const load = (b) => { sel.value = { ...emptySel(), ...read(b.sel) }; fans.value = JSON.parse(JSON.stringify(read(b.fans))) }
  const applyPreset = (p) => { sel.value = { ...emptySel(), ...p.sel }; fans.value = JSON.parse(JSON.stringify(p.fans)) }
  const reset = () => { sel.value = emptySel(); fans.value = emptyFans() }

  return { sel, fans, saved, loading, error, picked, fanParts, total, checks, airflow, fetchSaved, save, removeSaved, load, reset, applyPreset }
}, { persist: { pick: ['sel', 'fans'] } })
