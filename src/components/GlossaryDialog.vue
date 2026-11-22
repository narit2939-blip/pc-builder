<template>
  <q-dialog :model-value="modelValue" :maximized="$q.screen.lt.md" @update:model-value="(v) => emit('update:modelValue', v)">
    <q-card class="picker column no-wrap">
      <div class="picker-head">
        <div class="row items-center no-wrap">
          <q-icon name="menu_book" size="26px" color="primary" />
          <div class="text-h6 col q-ml-sm">ศัพท์คอมพิวเตอร์ แบบเข้าใจง่าย</div>
          <q-btn v-close-popup flat round dense icon="close" />
        </div>
        <q-input v-model="q" dense filled rounded clearable class="q-mt-sm" placeholder="ค้นหาคำศัพท์ เช่น TDP, CFM, DDR5">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="picker-list" style="grid-template-columns: 1fr">
        <div v-for="g in list" :key="g.term" class="pcard" style="align-items: flex-start">
          <div>
            <div class="slot-name">{{ g.term }} <span class="text-grey-6 text-weight-regular">{{ g.thai }}</span></div>
            <div class="slot-spec">{{ g.meaning }}</div>
            <div v-if="g.tip" class="text-caption text-primary q-mt-xs">{{ g.tip }}</div>
          </div>
        </div>
        <div v-if="!list.length" class="text-grey-6 text-center q-pa-lg">ไม่พบคำศัพท์ที่ค้นหา</div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, computed } from 'vue'
import { GLOSSARY } from '@/utils/compat'
defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
const q = ref('')
const list = computed(() => {
  const k = (q.value || '').toLowerCase()
  return GLOSSARY.filter((g) => !k || `${g.term} ${g.thai} ${g.meaning}`.toLowerCase().includes(k))
})
</script>
