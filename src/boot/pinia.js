import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
export default ({ app }) => {
  const nav = performance.getEntriesByType('navigation')[0]
  if (nav?.type === 'navigate') {
    sessionStorage.clear()
  }
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}
