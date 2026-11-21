<template>
  <q-page padding>
    <q-banner v-if="parts.error" rounded class="bg-red-1 text-negative q-mb-md">{{ parts.error }}</q-banner>
    <q-table title="ชิ้นส่วนทั้งหมด" :rows="parts.items" :columns="columns" row-key="id" :loading="parts.loading"
      :filter="filter" flat bordered>
      <template #top-right>
        <q-input v-model="filter" dense outlined debounce="300" placeholder="ค้นหา" class="q-mr-sm" />
        <q-btn color="primary" unelevated icon="add" label="เพิ่มชิ้นส่วน" @click="openForm()" />
      </template>
      <template #body-cell-actions="p">
        <q-td :props="p" auto-width>
          <q-btn flat round dense icon="edit" @click="openForm(p.row)" />
          <q-btn flat round dense icon="delete" color="negative" @click="onDelete(p.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="show" persistent>
      <q-card class="q-pa-md" style="min-width: 320px">
        <div class="text-h6 q-mb-md">{{ form.id ? 'แก้ไข' : 'เพิ่ม' }}ชิ้นส่วน</div>
        <q-form class="q-gutter-sm" @submit="onSave">
          <q-select v-model="form.category" :options="Object.keys(SPEC_FIELDS)" label="ประเภท" outlined dense :disable="!!form.id" />
          <q-input v-model="form.name" label="ชื่อรุ่น" outlined dense :rules="[(v) => !!v || 'กรอกชื่อรุ่น']" />
          <q-input v-model.number="form.price" type="number" label="ราคา (บาท)" outlined dense :rules="[(v) => v > 0 || 'ราคาต้องมากกว่า 0']" />
          <q-input v-for="k in SPEC_FIELDS[form.category]" :key="k" v-model="form[k]" :label="k" outlined dense
            :type="NUMERIC.includes(k) ? 'number' : 'text'" :rules="[(v) => (v !== '' && v != null) || 'จำเป็นต้องกรอก']" />
          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="ยกเลิก" v-close-popup />
            <q-btn type="submit" color="primary" unelevated label="บันทึก" :loading="parts.loading" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsStore } from '@/stores/parts-store'
import { SPEC_FIELDS, NUMERIC, fmt } from '@/utils/compat'

const $q = useQuasar()
const parts = usePartsStore()
const filter = ref('')
const show = ref(false)
const form = ref({ category: 'cpu' })
const columns = [
  { name: 'category', label: 'ประเภท', field: 'category', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อรุ่น', field: 'name', align: 'left', sortable: true },
  { name: 'price', label: 'ราคา', field: 'price', format: fmt, align: 'right', sortable: true },
  { name: 'actions', label: '', field: 'id' },
]

onMounted(() => { if (!parts.items.length) parts.fetchAll() })
const openForm = (row) => { form.value = row ? { ...row } : { category: 'cpu', name: '', price: 0 }; show.value = true }

async function onSave() {
  const f = form.value
  const payload = { category: f.category, name: f.name, price: f.price }
  for (const k of SPEC_FIELDS[f.category]) payload[k] = NUMERIC.includes(k) ? Number(f[k]) : f[k]
  try {
    if (f.id) await parts.update({ ...payload, id: f.id }); else await parts.create(payload)
    $q.notify({ type: 'positive', message: 'บันทึกชิ้นส่วนแล้ว' })
    show.value = false
  } catch { $q.notify({ type: 'negative', message: parts.error }) }
}
const onDelete = (row) => {
  $q.dialog({ title: 'ลบชิ้นส่วน', message: `ลบ ${row.name} ใช่ไหม`, cancel: true, persistent: true })
    .onOk(() => parts.remove(row.id))
}
</script>
