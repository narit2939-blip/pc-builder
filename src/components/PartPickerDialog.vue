<template>
  <q-dialog :model-value="modelValue" :maximized="$q.screen.lt.md" transition-show="slide-up"
    transition-hide="slide-down" @update:model-value="(v) => emit('update:modelValue', v)">
    <q-card class="picker column no-wrap">
      <div class="picker-head">
        <div class="row items-center no-wrap q-gutter-sm">
          <div class="slot-icon icon-sm" :style="{ background: meta.tint, color: meta.color }">
            <q-icon :name="meta.icon" size="22px" />
          </div>
          <div class="text-h6 col">เลือก{{ meta.label }}</div>
          <q-btn v-close-popup flat round dense icon="close" />
        </div>
        <q-input v-model="q" dense filled rounded clearable class="q-mt-sm" placeholder="ค้นหารุ่น เช่น Ryzen, RTX, DDR5">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <div v-if="facets.length > 1" class="row no-wrap q-gutter-xs q-mt-xs" style="overflow-x: auto">
          <q-chip v-for="f in facets" :key="f" clickable color="primary" :outline="facet !== f"
            :text-color="facet === f ? 'white' : undefined" @click="facet = facet === f ? null : f">{{ f }}</q-chip>
        </div>
        <div class="row items-center justify-between q-mt-xs">
          <q-toggle v-model="onlyOk" dense label="เฉพาะที่เข้ากับสเปคของคุณ" />
          <q-select v-model="sort" :options="sorts" dense borderless emit-value map-options />
        </div>
      </div>

      <div class="picker-list">
        <div v-if="hidden" class="text-caption text-grey-7" style="grid-column: 1 / -1">
          ซ่อน {{ hidden }} รุ่นที่เข้ากันไม่ได้ ·
          <a class="text-primary cursor-pointer" @click="onlyOk = false">แสดงทั้งหมด</a>
        </div>
        <div v-for="p in list" :key="p.id" class="pcard" :class="{ on: p.id == current, bad: p.reason }">
          <div class="slot-icon icon-sm" :style="{ background: meta.tint, color: meta.color }">
            <q-icon :name="meta.icon" size="22px" />
          </div>
          <div class="col" style="min-width: 0">
            <div class="slot-name">{{ p.name }}</div>
            <div class="slot-spec">{{ spec(p) }}</div>
            <div v-if="p.score" class="perf">
              ประสิทธิภาพ
              <q-linear-progress :value="Math.min(p.score / 120, 1)" rounded size="6px" color="primary" track-color="blue-1" />
            </div>
            <div v-if="p.reason" class="slot-warn"><q-icon name="block" size="16px" /> {{ p.reason }}</div>
          </div>
          <div class="text-right">
            <div class="slot-price">฿{{ fmt(p.price) }}</div>
            <q-btn rounded no-caps unelevated dense class="q-px-md q-mt-xs" :color="p.id == current ? 'positive' : 'primary'"
              :label="p.id == current ? 'เลือกอยู่' : 'เลือก'" :disable="!!p.reason" @click="choose(p)" />
          </div>
        </div>
        <div v-if="!list.length" class="text-grey-6 text-center q-pa-xl" style="grid-column: 1 / -1">
          ไม่พบรุ่นที่ตรงกับเงื่อนไข ลองล้างคำค้นหา หรือปิด "เฉพาะที่เข้ากับสเปคของคุณ"
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CAT_META, fmt, spec, facetOf, incompatReason } from '@/utils/compat'

const props = defineProps({
  modelValue: Boolean,
  cat: { type: String, default: 'cpu' },
  options: { type: Array, default: () => [] },
  picked: { type: Object, default: () => ({}) },
  current: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue', 'select'])

const meta = computed(() => CAT_META[props.cat])
const q = ref('')
const facet = ref(null)
const onlyOk = ref(true)
const sort = ref('asc')
watch(() => props.modelValue, (open) => {
  if (open) { q.value = ''; facet.value = null; onlyOk.value = true; sort.value = 'asc' }
})

const rows = computed(() => props.options.map((p) => ({ ...p, reason: incompatReason(props.cat, p, props.picked), facet: facetOf(p) })))
const facets = computed(() => [...new Set(rows.value.map((r) => r.facet))])
const sorts = computed(() => [
  { label: 'ราคา: ต่ำ → สูง', value: 'asc' },
  { label: 'ราคา: สูง → ต่ำ', value: 'desc' },
  ...(rows.value.some((r) => r.score) ? [{ label: 'คุ้มค่าที่สุด', value: 'value' }] : []),
])
const filtered = computed(() => rows.value.filter((r) =>
  (!facet.value || r.facet === facet.value) && (!q.value || r.name.toLowerCase().includes(q.value.toLowerCase()))))
const hidden = computed(() => (onlyOk.value ? filtered.value.filter((r) => r.reason).length : 0))
const list = computed(() => {
  const by = {
    asc: (a, b) => a.price - b.price,
    desc: (a, b) => b.price - a.price,
    value: (a, b) => (b.score || 0) / b.price - (a.score || 0) / a.price,
  }
  return filtered.value.filter((r) => !onlyOk.value || !r.reason).sort(by[sort.value])
})

const choose = (p) => {
  emit('select', p.id)
  emit('update:modelValue', false)
}
</script>
