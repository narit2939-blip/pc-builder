<template>
  <div class="slot" :class="{ filled: !!part }" @click="emit('pick')">
    <div class="slot-icon" :style="{ background: meta.tint, color: meta.color }">
      <q-icon :name="meta.icon" size="28px" />
    </div>
    <div class="slot-body">
      <div class="slot-label">{{ label || meta.label }}</div>
      <template v-if="part">
        <div class="slot-name ellipsis">{{ part.name }}</div>
        <div class="slot-spec">{{ spec(part) }}</div>
        <div v-if="issue" class="slot-warn"><q-icon name="error_outline" size="16px" /> {{ issue }}</div>
      </template>
      <div v-else class="text-grey-6">{{ hint || meta.hint }}</div>
      <div v-if="part" @click.stop><slot /></div>
    </div>
    <div class="slot-side">
      <div v-if="part" class="slot-price">฿{{ fmt(part.price * qty) }}</div>
      <div class="row items-center justify-end q-gutter-xs">
        <q-btn v-if="part" flat round dense size="sm" icon="close" color="grey-6" @click.stop="emit('clear')">
          <q-tooltip>เอาออก</q-tooltip>
        </q-btn>
        <q-btn rounded no-caps unelevated color="primary" :outline="!!part" :label="part ? 'เปลี่ยน' : 'เลือก'"
          :icon="part ? undefined : 'add'" @click.stop="emit('pick')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CAT_META, fmt, spec } from '@/utils/compat'

const props = defineProps({
  cat: { type: String, required: true },
  part: { type: Object, default: null },
  issue: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  qty: { type: Number, default: 1 },
})
const emit = defineEmits(['pick', 'clear'])
const meta = computed(() => CAT_META[props.cat])
</script>
