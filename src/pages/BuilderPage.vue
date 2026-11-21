<template>
  <q-page class="builder">
    <section class="hero">
      <div class="hero-in">
        <div class="hero-title">จัดสเปคคอมของคุณ</div>
        <div class="hero-sub">เลือกทีละชิ้น ระบบตรวจความเข้ากันและรวมราคาให้ทันที ไม่ต้องรู้เรื่องคอมก็จัดได้</div>
        <div class="hero-label">ยังไม่รู้จะเริ่มตรงไหน? ลองสเปคแนะนำ</div>
        <div class="row q-col-gutter-sm">
          <div v-for="p in PRESETS" :key="p.key" class="col-12 col-sm-4">
            <button class="preset" @click="applyPreset(p)">
              <q-icon :name="p.icon" size="26px" />
              <div class="preset-name">{{ p.label }}</div>
              <div class="preset-desc">{{ p.desc }}</div>
              <div class="preset-price">ประมาณ ฿{{ fmt(presetPrice(p)) }}</div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="wrap">
      <div v-if="parts.loading" class="row justify-center q-pa-xl"><q-spinner-dots color="primary" size="40px" /></div>
      <q-banner v-else-if="parts.error" rounded class="bg-red-1 text-negative">
        {{ parts.error }}
        <template #action><q-btn flat label="ลองใหม่" @click="parts.fetchAll()" /></template>
      </q-banner>

      <div v-else class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <div class="sec-title">ชิ้นส่วนหลัก <span>{{ done }}/{{ CATS.length }}</span></div>
          <PartSlot v-for="c in CATS" :key="c" :cat="c" :part="build.picked[c]" :issue="issueOf(c)"
            @pick="openPicker(c)" @clear="build.sel[c] = null" />

          <div class="sec-title q-mt-lg">ระบายความร้อน <small>(ไม่บังคับ)</small></div>
          <PartSlot cat="cooler" :part="build.picked.cooler" :issue="issueOf('cooler')" @pick="openPicker('cooler')"
            @clear="build.sel.cooler = null">
            <div v-if="build.picked.cooler?.coolerType === 'liquid'">
              <div class="slot-spec q-mt-xs">ตำแหน่งติดตั้งหม้อน้ำ</div>
              <q-btn-toggle v-model="build.sel.coolerMount" :options="MOUNTS" dense unelevated no-caps
                toggle-color="primary" color="blue-1" text-color="primary" />
            </div>
          </PartSlot>
          <PartSlot v-for="(s, k) in SLOTS" :key="k" cat="fan" :label="s.label"
            :hint="s.dir === 'in' ? 'ดูดลมเย็นเข้าเคส' : 'ไล่ลมร้อนออกจากเคส'" :part="build.fanParts[k]"
            :qty="build.fans[k].qty" @pick="openPicker('fan', k)" @clear="build.fans[k].id = null">
            <q-btn-toggle v-model="build.fans[k].qty" :options="qtyOptions(s.max)" dense unelevated no-caps
              toggle-color="primary" color="blue-1" text-color="primary" class="q-mt-xs" />
          </PartSlot>
        </div>

        <div id="summary" class="col-12 col-md-4">
          <div class="sticky-side q-gutter-y-md">
            <div class="panel">
              <div class="pill" :class="`pill-${status.level}`"><q-icon :name="status.icon" size="18px" /> {{ status.text }}</div>
              <div class="total-label">ราคารวมทั้งหมด</div>
              <div class="total">฿{{ fmt(build.total) }}</div>
              <q-linear-progress :value="done / CATS.length" rounded size="8px" color="primary" track-color="blue-1" class="q-my-sm" />
              <div v-for="r in lines" :key="r.key" class="line"><span class="ellipsis">{{ r.text }}</span><b>฿{{ fmt(r.price) }}</b></div>
              <div v-if="!lines.length" class="text-grey-6 q-py-sm">
                ยังไม่ได้เลือกชิ้นส่วน กด "เลือก" ได้เลย หรือเริ่มจากสเปคแนะนำด้านบน
              </div>
              <q-list dense class="q-mt-sm">
                <q-item v-for="(c, i) in build.checks" :key="i">
                  <q-item-section avatar><q-icon :name="ICON[c.level][0]" :color="ICON[c.level][1]" /></q-item-section>
                  <q-item-section>{{ c.text }}</q-item-section>
                </q-item>
              </q-list>
              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col"><q-input v-model="buildName" label="ตั้งชื่อสเปคนี้" outlined dense /></div>
                <div class="col-auto">
                  <q-btn color="primary" unelevated rounded no-caps icon="bookmark_add" label="บันทึก"
                    :disable="!buildName || !build.total" :loading="build.loading" @click="save" />
                </div>
              </div>
              <q-btn flat dense no-caps color="grey-7" icon="restart_alt" label="ล้างทั้งหมด" class="q-mt-sm" @click="build.reset()" />
            </div>

            <div class="panel">
              <div class="text-subtitle1 q-mb-sm">ทิศทางลมในเคส</div>
              <AirflowCase :fans="build.fans" :fan-parts="build.fanParts" :airflow="build.airflow" :cooler="build.picked.cooler"
                :mount="build.sel.coolerMount" />
            </div>

            <div v-if="reco" class="panel">
              <div class="text-subtitle1">คู่ที่เหมาะกับ {{ build.picked.cpu.name }}</div>
              <div class="text-caption text-grey-7 q-mt-sm">เมนบอร์ดที่ใช้ได้ (กดเพื่อเลือก)</div>
              <q-chip v-for="b in reco.boards" :key="b.id" clickable color="blue-1" text-color="primary"
                :label="`${b.name} ฿${fmt(b.price)}`" @click="build.sel.motherboard = b.id" />
              <div class="text-caption text-grey-7 q-mt-sm">การ์ดจอเรียงตามความสมดุลและความคุ้มค่า</div>
              <q-list dense separator>
                <q-item v-for="g in reco.gpus.slice(0, 4)" :key="g.id" clickable @click="build.sel.gpu = g.id">
                  <q-item-section>
                    <q-item-label>{{ g.name }} · ฿{{ fmt(g.price) }}</q-item-label>
                    <q-item-label caption>{{ g.balance.text }} · คะแนน {{ g.value }} ต่อ 1,000 บาท</q-item-label>
                  </q-item-section>
                  <q-item-section side><q-icon :name="ICON[g.balance.level][0]" :color="ICON[g.balance.level][1]" /></q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-page-sticky v-if="$q.screen.lt.md" position="bottom" expand>
      <div class="mbar">
        <div>
          <div class="total-label" style="margin: 0">ราคารวม · {{ done }}/{{ CATS.length }} ชิ้น</div>
          <div class="mbar-total">฿{{ fmt(build.total) }}</div>
        </div>
        <q-btn rounded unelevated no-caps color="primary" label="ดูสรุป" icon-right="expand_less" @click="toSummary" />
      </div>
    </q-page-sticky>

    <PartPickerDialog v-model="open" :cat="pick.cat" :options="parts.byCategory(pick.cat)" :picked="build.picked"
      :current="currentId" @select="onSelect" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { usePartsStore } from '@/stores/parts-store'
import { useBuildStore } from '@/stores/build-store'
import { CATS, SLOTS, PRESETS, incompatReason, recommend, resolvePreset, fmt } from '@/utils/compat'
import PartSlot from '@/components/PartSlot.vue'
import PartPickerDialog from '@/components/PartPickerDialog.vue'
import AirflowCase from '@/components/AirflowCase.vue'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const parts = usePartsStore()
const build = useBuildStore()
const buildName = ref('')
const MOUNTS = [
  { label: 'ติดหน้าเคส (ลมเข้า)', value: 'front' },
  { label: 'ติดบนเคส (ลมออก)', value: 'top' },
]
const ICON = { ok: ['check_circle', 'positive'], warn: ['warning', 'warning'], error: ['cancel', 'negative'] }

onMounted(parts.fetchAll)

// ---- เลือกชิ้นส่วน ----
const open = ref(false)
const pick = ref({ cat: 'cpu', slot: null })
const currentId = computed(() => (pick.value.slot ? build.fans[pick.value.slot].id : build.sel[pick.value.cat]))
const openPicker = (cat, slot = null) => { pick.value = { cat, slot }; open.value = true }
const onSelect = (id) => {
  if (pick.value.slot) build.fans[pick.value.slot].id = id
  else build.sel[pick.value.cat] = id
}
const issueOf = (c) => (build.picked[c] ? incompatReason(c, build.picked[c], build.picked) : '')
const qtyOptions = (max) => Array.from({ length: max }, (_, i) => ({ label: `${i + 1} ตัว`, value: i + 1 }))

// ---- สรุปผล ----
const done = computed(() => CATS.filter((c) => build.picked[c]).length)
const status = computed(() => {
  const lv = build.checks.map((c) => c.level)
  if (lv.includes('error')) return { level: 'error', icon: 'cancel', text: 'มีชิ้นส่วนที่ไม่เข้ากัน' }
  if (done.value < CATS.length) return { level: 'wait', icon: 'pending', text: `เลือกแล้ว ${done.value} จาก ${CATS.length} ชิ้น` }
  if (lv.includes('warn')) return { level: 'warn', icon: 'warning', text: 'ใช้ได้ แต่มีข้อควรระวัง' }
  return { level: 'ok', icon: 'check_circle', text: 'สเปคนี้พร้อมใช้งาน' }
})
const lines = computed(() => [
  ...[...CATS, 'cooler'].filter((c) => build.picked[c]).map((c) => ({ key: c, text: build.picked[c].name, price: build.picked[c].price })),
  ...Object.keys(SLOTS).filter((k) => build.fanParts[k]).map((k) => ({
    key: k, text: `${build.fanParts[k].name} ×${build.fans[k].qty}`, price: build.fanParts[k].price * build.fans[k].qty,
  })),
])
const reco = computed(() => (build.picked.cpu ? recommend(build.picked.cpu, parts.items) : null))
const toSummary = () => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth' })

// ---- สเปคแนะนำ ----
const presetPrice = (p) => {
  const r = resolvePreset(p, parts.items)
  return Object.values(r.sel).reduce((s, id) => s + (parts.byId(id)?.price || 0), 0) +
    Object.values(r.fans).reduce((s, f) => s + (parts.byId(f.id)?.price || 0) * f.qty, 0)
}
const applyPreset = (p) => {
  const go = () => {
    build.applyPreset(resolvePreset(p, parts.items))
    $q.notify({ type: 'positive', message: `ใช้สเปค "${p.label}" แล้ว ปรับเปลี่ยนได้ตามต้องการ` })
  }
  if (build.total) {
    $q.dialog({ title: 'ใช้สเปคแนะนำ', message: 'สเปคที่เลือกไว้ตอนนี้จะถูกแทนที่ ต้องการทำต่อไหม', cancel: true }).onOk(go)
  } else go()
}

async function save() {
  if (!auth.isAuthenticated) {
    $q.dialog({ title: 'เข้าสู่ระบบเพื่อบันทึกสเปค', message: 'ต้องเข้าสู่ระบบก่อนจึงจะบันทึกได้ สเปคที่เลือกไว้ตอนนี้จะยังอยู่ ไม่หาย', cancel: 'ไว้ก่อน', ok: 'เข้าสู่ระบบ' })
      .onOk(() => router.push({ name: 'login', query: { redirect: '/' } }))
    return
  }
  try {
    await build.save(buildName.value)
    $q.notify({ type: 'positive', message: 'บันทึกสเปคแล้ว' })
    buildName.value = ''
  } catch { $q.notify({ type: 'negative', message: build.error }) }
}
</script>
