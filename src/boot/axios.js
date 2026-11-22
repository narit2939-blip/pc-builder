import axios from 'axios'
import { Notify } from 'quasar'
import { useAuthStore } from '@/stores/auth-store'
const api = axios.create({ baseURL: import.meta.env.QCLI_API_URL || 'http://localhost:3000', timeout: 10000 })
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.checkSession()) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})
export default ({ app, router }) => {
  app.config.globalProperties.$api = api
  api.interceptors.response.use((res) => res, (error) => {
    const auth = useAuthStore()
    if (error.response?.status === 401 && auth.isAuthenticated) {
      auth.logout()
      Notify.create({ type: 'warning', message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' })
      router.replace({ name: 'login' })
    }
    return Promise.reject(error)
  })
}
export { api }
