import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/boot/axios'
import { useRequest } from '@/utils/http'

export const usePartsStore = defineStore('parts', () => {
  const items = ref([])
  const { loading, error, run } = useRequest()
  const byCategory = (c) => items.value.filter((p) => p.category === c)
  const byId = (id) => items.value.find((p) => p.id == id)

  const fetchAll = () => run(async () => { items.value = (await api.get('/parts')).data })
  const create = (p) => run(async () => { items.value.push((await api.post('/parts', p)).data) })
  const update = (p) => run(async () => {
    const { data } = await api.put(`/parts/${p.id}`, p)
    items.value[items.value.findIndex((x) => x.id == p.id)] = data
  })
  const remove = (id) => run(async () => {
    await api.delete(`/parts/${id}`)
    items.value = items.value.filter((x) => x.id != id)
  })
  return { items, loading, error, byCategory, byId, fetchAll, create, update, remove }
})
