<template>
  <div class="airflow">
    <svg viewBox="0 -6 360 246" role="img" aria-label="แผนผังทิศทางลมในเคส" style="width: 100%">
      <defs>
        <marker id="ah-in" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#2F80ED" /></marker>
        <marker id="ah-out" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#F2994A" /></marker>
      </defs>
      <rect x="40" y="30" width="280" height="200" rx="10" fill="#fff" stroke="#9aa5b1" stroke-width="2" />
      <rect x="150" y="100" width="110" height="110" rx="4" fill="#eef1f5" />
      <rect x="185" y="128" width="32" height="32" rx="3" fill="#cfd6df" />
      <rect x="150" y="190" width="110" height="14" rx="3" fill="#cfd6df" />
      <rect v-if="radBox" :x="radBox.x" :y="radBox.y" :width="radBox.w" :height="radBox.h" rx="10"
        fill="#e0f7fa" stroke="#0891b2" stroke-width="2" />
      <g v-for="f in fanList" :key="f.key">
        <circle :cx="f.cx" :cy="f.cy" :r="f.r" stroke-width="2"
          :fill="f.on ? (f.kind === 'rad' ? '#bdeefa' : f.dir === 'in' ? '#dbe9fd' : '#fde8d4') : 'none'"
          :stroke="f.on ? color(f.dir) : '#b8c0cc'" :stroke-dasharray="f.on ? '' : '4 3'" />
        <circle v-if="f.on" :cx="f.cx" :cy="f.cy" r="5" :fill="color(f.dir)" />
        <line v-if="f.on" class="flow" stroke-width="3" :stroke="color(f.dir)" :marker-end="`url(#ah-${f.dir})`"
          :x1="f.a[0]" :y1="f.a[1]" :x2="f.a[2]" :y2="f.a[3]" />
      </g>
      <text x="46" y="224" font-size="11" fill="#6b7785">หน้าเคส</text>
      <text x="314" y="224" font-size="11" fill="#6b7785" text-anchor="end">หลังเคส</text>
    </svg>
    <div class="row q-gutter-md text-body2">
      <span><q-icon name="south_east" color="blue" /> ลมเข้า {{ airflow.in }} CFM</span>
      <span><q-icon name="north_east" color="orange" /> ลมออก {{ airflow.out }} CFM</span>
    </div>
    <div class="text-caption text-grey-8 q-mt-xs">{{ statusText[airflow.status] }}</div>
    <div class="text-caption text-grey-7">CFM = ปริมาณลมที่พัดลมพัดได้ต่อนาที ยิ่งตัวเลขสูง ลมยิ่งแรง</div>
    <div v-if="rad" class="text-caption text-grey-8">
      หม้อน้ำ {{ cooler.radiator }} มม. ติด{{ mountKey === 'front' ? 'หน้า' : 'บน' }}เคส (พัดลมของหม้อน้ำนับรวมแล้ว)
    </div>
    <div v-else-if="cooler" class="text-caption text-grey-8">ชุดระบายความร้อนแบบลมติดที่ CPU ไม่นับรวมในลมเข้า–ออกของเคส</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SLOTS } from '@/utils/compat'

const props = defineProps({
  fans: Object, fanParts: Object, airflow: Object,
  cooler: { type: Object, default: null },
  mount: { type: String, default: 'front' },
})
const color = (d) => (d === 'in' ? '#2F80ED' : '#F2994A')
const statusText = {
  none: 'เลือกพัดลมเพื่อดูทิศทางลมในเคส',
  balanced: 'ลมเข้า–ออกสมดุลกัน',
  positive: 'แรงดันบวก: ลมเข้ามากกว่าออก ฝุ่นเข้าเคสน้อย',
  negative: 'แรงดันลบ: ลมออกมากกว่าเข้า ฝุ่นอาจเข้าตามช่องว่าง',
}
const L = {
  front: (i) => ({ cx: 72, cy: 62 + i * 62, r: 26, a: [4, 62 + i * 62, 38, 62 + i * 62] }),
  rear: () => ({ cx: 290, cy: 100, r: 26, a: [322, 100, 356, 100] }),
  top: (i) => ({ cx: 130 + i * 70, cy: 62, r: 22, a: [130 + i * 70, 28, 130 + i * 70, 0] }),
}
const mountKey = computed(() => props.mount || 'front')

const rad = computed(() =>
  props.cooler?.coolerType === 'liquid' ? Math.min(Math.floor(props.cooler.radiator / 120), SLOTS[mountKey.value].max) : 0)
const radBox = computed(() => {
  if (!rad.value) return null
  return mountKey.value === 'front'
    ? { x: 42, y: 32, w: 60, h: (rad.value - 1) * 62 + 60 }
    : { x: 104, y: 34, w: (rad.value - 1) * 70 + 52, h: 56 }
})
const fanList = computed(() => Object.entries(SLOTS).flatMap(([k, s]) => {
  const off = k === mountKey.value ? rad.value : 0 
  return Array.from({ length: s.max }, (_, i) => {
    const isRad = i < off
    return {
      key: k + i, dir: s.dir, kind: isRad ? 'rad' : 'fan',
      on: isRad || (!!props.fanParts[k] && i - off < props.fans[k].qty), ...L[k](i),
    }
  })
}))
</script>
