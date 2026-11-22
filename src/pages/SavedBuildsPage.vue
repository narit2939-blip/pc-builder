<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">สเปคที่บันทึกไว้</div>
    <div v-if="build.loading" class="row justify-center q-mt-xl"><q-spinner-dots color="primary" size="40px" /></div>
    <q-banner v-else-if="build.error && !build.saved.length" rounded class="bg-red-1 text-negative">
      {{ build.error }}<template #action><q-btn flat label="ลองใหม่" @click="reload" /></template>
    </q-banner>
    <q-list v-else-if="build.saved.length" bordered separator class="bg-white">
      <q-item v-for="b in build.saved" :key="b.id">
        <q-item-section>
          <q-item-label>{{ b.name }}</q-item-label>
          <q-item-label caption>฿{{ fmt(b.total) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn flat dense no-caps icon="open_in_new" label="เปิด" @click="open(b)" />
            <q-btn flat dense no-caps color="negative" icon="delete" label="ลบ" @click="onRemove(b)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else class="text-center text-grey-7 q-pa-xl">
      <q-icon name="bookmark_border" size="48px" />
      <div class="q-my-sm">ยังไม่มีสเปคที่บันทึก จัดสเปคแล้วกดบันทึกเพื่อเก็บไว้ที่นี่</div>
      <q-btn color="primary" unelevated label="ไปจัดสเปค" :to="{ name: 'builder' }" />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBuildStore } from '@/stores/build-store'
import { fmt } from '@/utils/compat'

const $q = useQuasar()
const build = useBuildStore()
const router = useRouter()
const reload = () => build.fetchSaved().catch(() => {})
onMounted(reload)
const open = (b) => { build.load(b); router.push({ name: 'builder' }) }

const onRemove = (b) => {
  $q.dialog({ title: 'ลบสเปคนี้', message: `ต้องการลบ "${b.name}" ใช่ไหม`, cancel: 'ยกเลิก', ok: { label: 'ลบ', color: 'negative' }, persistent: true })
    .onOk(async () => {
      try {
        await build.removeSaved(b.id)
        $q.notify({ type: 'positive', message: 'ลบสเปคแล้ว' })
      } catch {
        $q.notify({ type: 'negative', message: `ลบไม่สำเร็จ: ${build.error}` })
      }
    })
}
</script>
