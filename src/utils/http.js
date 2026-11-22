import { ref } from 'vue'
const STATUS = {
  400: 'ข้อมูลที่ส่งไปไม่ถูกต้อง',
  401: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  403: 'คุณไม่มีสิทธิ์ทำรายการนี้',
  404: 'ไม่พบข้อมูลที่ร้องขอ',
  408: 'เซิร์ฟเวอร์ตอบช้าเกินไป ลองใหม่อีกครั้ง',
  429: 'เรียกใช้งานถี่เกินไป โปรดรอสักครู่แล้วลองใหม่',
}
export const errMsg = (e) => {
  const s = e.response?.status
  if (s) return STATUS[s] || (s >= 500 ? `เซิร์ฟเวอร์ขัดข้อง (${s}) ลองใหม่ภายหลัง` : `เกิดข้อผิดพลาด (${s})`)
  if (e.code === 'ECONNABORTED') return STATUS[408]
  return e.request ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตหรือ API URL' : e.message
}
export function useRequest() {
  const loading = ref(false)
  const error = ref('')
  async function run(fn) {
    loading.value = true
    error.value = ''
    try { return await fn() }
    catch (e) { error.value = errMsg(e); throw e }
    finally { loading.value = false }
  }
  return { loading, error, run }
}
export async function getList(api, url, params) {
  try { return (await api.get(url, { params })).data }
  catch (e) { if (e.response?.status === 404) return []; throw e }
}
