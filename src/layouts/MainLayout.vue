<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <div class="brand q-mr-sm"><q-icon name="memory" size="20px" /></div>
        <q-toolbar-title class="text-weight-medium">{{ title }}</q-toolbar-title>
        <q-badge v-if="auth.user" color="primary" class="q-mr-sm gt-xs" :label="`${auth.user.username} (${auth.user.role})`" />
        <q-btn v-if="auth.isAuthenticated" flat dense no-caps icon="logout" label="ออกจากระบบ" @click="onLogout" />
        <q-btn v-else unelevated rounded no-caps color="primary" icon="login" label="เข้าสู่ระบบ" :to="{ name: 'login' }" />
      </q-toolbar>
      <q-tabs align="left" dense no-caps inline-label active-color="primary" indicator-color="primary">
        <q-route-tab :to="{ name: 'builder' }" icon="build" label="จัดสเปค" />
        <q-route-tab v-if="auth.isAuthenticated" :to="{ name: 'saved' }" icon="bookmark" label="สเปคที่บันทึก" />
        <q-route-tab v-if="auth.isAdmin" :to="{ name: 'parts' }" icon="inventory_2" label="จัดการชิ้นส่วน" />
      </q-tabs>
    </q-header>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'

const title = import.meta.env.QCLI_APP_TITLE || 'PC Builder'
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()

const onLogout = () => {
  $q.dialog({ title: 'ออกจากระบบ', message: 'ต้องการออกจากระบบใช่ไหม', cancel: true, persistent: true })
    .onOk(() => { auth.logout(); router.replace({ name: 'builder' }) })
}
</script>
