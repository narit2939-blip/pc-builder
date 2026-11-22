import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequest } from '@/utils/http'
import { DEMO_USERS } from '@/data/demo-users'
const SESSION_MS = 2 * 60 * 60 * 1000 
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const expiresAt = ref(0)
  const { loading, error, run } = useRequest()
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const login = (username, password) => run(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400)) 
    const u = DEMO_USERS.find((x) => x.username === username && x.password === password)
    if (!u) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    user.value = { id: u.id, username: u.username, role: u.role }
    token.value = btoa(`${u.username}:${Date.now()}`)
    expiresAt.value = Date.now() + SESSION_MS
  })
  const logout = () => { user.value = null; token.value = null; expiresAt.value = 0; error.value = '' }
  const checkSession = () => {
    if (token.value && Date.now() >= expiresAt.value) {
      logout()
      error.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    }
    return !!token.value
  }
  return { user, token, expiresAt, loading, error, isAuthenticated, isAdmin, login, logout, checkSession }
}, { persist: { storage: sessionStorage } })
