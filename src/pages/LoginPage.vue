<template>
  <div class="flex flex-center q-pa-md" style="min-height: 100vh">
    <q-card flat bordered class="q-pa-lg" style="width: 100%; max-width: 380px">
      <div class="text-h5">PC Builder</div>
      <div class="text-grey-7 q-mb-md">เข้าสู่ระบบเพื่อจัดสเปคคอม</div>
      <q-form class="q-gutter-md" @submit="onLogin">
        <q-input v-model="username" label="ชื่อผู้ใช้" outlined dense :rules="[(v) => !!v || 'กรอกชื่อผู้ใช้']" />
        <q-input v-model="password" type="password" label="รหัสผ่าน" outlined dense :rules="[(v) => !!v || 'กรอกรหัสผ่าน']" />
        <q-banner v-if="auth.error" rounded class="bg-red-1 text-negative">{{ auth.error }}</q-banner>
        <q-btn type="submit" color="primary" unelevated class="full-width" label="เข้าสู่ระบบ" :loading="auth.loading" />
      </q-form>
      <div class="text-caption text-grey-7 q-mt-md">บัญชีทดลอง: user หรือ admin รหัสผ่าน 123456</div>
      <q-btn flat dense no-caps class="q-mt-sm" icon="arrow_back" label="กลับไปจัดสเปค (ไม่ต้องเข้าสู่ระบบ)" :to="{ name: 'builder' }" />
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')

const onLogin = async () => {
  try {
    await auth.login(username.value, password.value)
    router.push(route.query.redirect || { name: 'builder' })
  } catch { /* ข้อความ error แสดงจาก auth.error */ }
}
</script>
