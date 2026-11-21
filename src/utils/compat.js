export const CATS = ['cpu', 'motherboard', 'gpu', 'ram', 'psu']
export const SLOTS = {
  front: { label: 'พัดลมหน้าเคส (ดูดลมเข้า)', dir: 'in', max: 3 },
  rear: { label: 'พัดลมหลังเคส (ดันลมออก)', dir: 'out', max: 1 },
  top: { label: 'พัดลมบนเคส (ดันลมออก)', dir: 'out', max: 2 },
}
export const SPEC_FIELDS = {
  cpu: ['socket', 'tdp', 'score'], motherboard: ['socket', 'ramType'],
  gpu: ['tdp', 'psuRec', 'score'], ram: ['type', 'gb'], psu: ['watt'], fan: ['fanSize', 'cfm'],
  cooler: ['coolerType', 'sockets', 'maxTdp', 'radiator', 'cfm'],
}
export const NUMERIC = ['tdp', 'score', 'psuRec', 'gb', 'watt', 'fanSize', 'cfm', 'maxTdp', 'radiator']
export const fmt = (n) => Number(n || 0).toLocaleString('th-TH')

export const spec = (p) => ({
  cpu: `${p.socket} · ${p.tdp}W`,
  motherboard: `${p.socket} · ${p.ramType}`,
  gpu: `${p.tdp}W · แนะนำ PSU ${p.psuRec}W`,
  ram: `${p.type} · ${p.gb}GB`,
  psu: `${p.watt}W`,
  fan: `${p.fanSize}mm · ${p.cfm} CFM`,
  cooler: `${p.coolerType === 'liquid' ? `ชุดน้ำ ${p.radiator} มม.` : 'ฮีตซิงก์พัดลม'} · รองรับ ${p.maxTdp}W`,
})[p.category]

const supports = (c, socket) => (c.sockets || '').split(',').map((x) => x.trim()).includes(socket)

// คืนเหตุผลภาษาคนทั่วไปถ้าชิ้นนี้เข้ากับสเปคที่เลือกไว้ไม่ได้ (ว่าง = เข้ากันได้)
export function incompatReason(cat, part, p) {
  const { cpu, motherboard: mb, ram, cooler } = p
  if (cat === 'cpu') {
    if (mb && mb.socket !== part.socket) return `ซ็อกเก็ต ${part.socket} ใช้กับเมนบอร์ดที่เลือกไว้ (${mb.socket}) ไม่ได้`
    if (cooler && !supports(cooler, part.socket)) return `ชุดระบายความร้อนที่เลือกไว้ไม่รองรับซ็อกเก็ต ${part.socket}`
    if (cooler && cooler.maxTdp < part.tdp) return `ชุดระบายความร้อนที่เลือกไว้รับความร้อนได้ ${cooler.maxTdp}W แต่ CPU นี้ใช้ ${part.tdp}W`
  }
  if (cat === 'motherboard') {
    if (cpu && cpu.socket !== part.socket) return `เมนบอร์ดนี้ใช้ ${part.socket} แต่ CPU ที่เลือกใช้ ${cpu.socket}`
    if (ram && ram.type !== part.ramType) return `รองรับแรม ${part.ramType} แต่คุณเลือกแรม ${ram.type} ไว้`
  }
  if (cat === 'ram' && mb && mb.ramType !== part.type) return `เมนบอร์ดที่เลือกไว้รองรับแรม ${mb.ramType} เท่านั้น`
  if (cat === 'cooler' && cpu) {
    if (!supports(part, cpu.socket)) return `ไม่รองรับซ็อกเก็ต ${cpu.socket} ของ CPU ที่เลือกไว้`
    if (part.maxTdp < cpu.tdp) return `รับความร้อนได้ ${part.maxTdp}W แต่ ${cpu.name} ใช้ ${cpu.tdp}W`
  }
  return ''
}
export const compatible = (cat, part, p) => !incompatReason(cat, part, p)

const draw = (p) => (p.cpu?.tdp || 0) + (p.gpu?.tdp || 0) + 100 // 100W = เมนบอร์ด/แรม/อื่นๆ
export const needWatt = (p) => Math.round(draw(p) * 1.3) // เผื่อ 30%

export function balance(cpu, gpu) {
  const r = gpu.score / cpu.score
  if (r > 1.6) return { level: 'warn', text: 'CPU อาจเป็นคอขวดของการ์ดจอ' }
  if (r < 0.6) return { level: 'warn', text: 'การ์ดจอยังไม่ทันซีพียู อัปการ์ดจอได้อีก' }
  return { level: 'ok', text: 'CPU และการ์ดจอสมดุลกัน' }
}

const m = (level, text) => ({ level, text })
export function checkBuild(p, ctx = {}) {
  const r = []
  const { cpu, motherboard: mb, gpu, ram, psu, cooler } = p
  if (cpu && mb) r.push(cpu.socket === mb.socket
    ? m('ok', `ซ็อกเก็ตตรงกัน (${cpu.socket})`)
    : m('error', `ซ็อกเก็ตไม่ตรงกัน: CPU ${cpu.socket} กับเมนบอร์ด ${mb.socket}`))
  if (ram && mb) r.push(ram.type === mb.ramType
    ? m('ok', `แรม ${ram.type} ใช้กับเมนบอร์ดได้`)
    : m('error', `แรม ${ram.type} ใช้กับเมนบอร์ดที่รองรับ ${mb.ramType} ไม่ได้`))
  if (cpu && gpu) r.push(balance(cpu, gpu))
  if (psu && (cpu || gpu)) {
    const need = needWatt(p)
    const lvl = psu.watt >= need ? 'ok' : psu.watt >= draw(p) ? 'warn' : 'error'
    r.push(m(lvl, `PSU ${psu.watt}W เทียบกับที่ควรมี ≥ ${need}W ` +
      (lvl === 'ok' ? '(เพียงพอ)' : lvl === 'warn' ? '(พอใช้ แต่เผื่อไม่พอ)' : '(ไม่พอ)')))
  }
  if (gpu && psu && psu.watt < gpu.psuRec)
    r.push(m('warn', `การ์ดจอรุ่นนี้แนะนำ PSU ≥ ${gpu.psuRec}W`))
  if (cooler && cpu) {
    if (!supports(cooler, cpu.socket)) r.push(m('error', `ชุดระบายความร้อนไม่รองรับซ็อกเก็ต ${cpu.socket}`))
    else {
      const lvl = cooler.maxTdp >= cpu.tdp * 1.15 ? 'ok' : cooler.maxTdp >= cpu.tdp ? 'warn' : 'error'
      r.push(m(lvl, `ชุดระบายความร้อนรับความร้อนได้ ${cooler.maxTdp}W เทียบกับ CPU ${cpu.tdp}W ` +
        (lvl === 'ok' ? '(เพียงพอ)' : lvl === 'warn' ? '(เกือบเต็มกำลัง)' : '(ไม่พอ)')))
    }
  }
  if (cooler?.coolerType === 'liquid') {
    const n = Math.floor(cooler.radiator / 120)
    const at = ctx.mount || 'front'
    const s = SLOTS[at]
    const where = at === 'front' ? 'หน้าเคส' : 'บนเคส'
    if (n > s.max) r.push(m('error', `ติดหม้อน้ำ ${cooler.radiator} มม. ที่${where}ไม่ได้ (รองรับสูงสุด ${s.max * 120} มม.) ลองเปลี่ยนตำแหน่ง`))
    else if (ctx.fanParts?.[at] && n + ctx.fans[at].qty > s.max)
      r.push(m('warn', `หม้อน้ำใช้ ${n} ช่องที่${where} ลดพัดลมเคสตำแหน่งนี้ลง (เหลือได้ ${s.max - n} ตัว)`))
    else r.push(m('ok', `ติดหม้อน้ำ ${cooler.radiator} มม. ที่${where}ได้`))
  }
  return r
}

// จาก CPU ที่เลือก: เมนบอร์ดที่ใช้ได้ + การ์ดจอเรียงตามความสมดุลแล้วความคุ้ม (คะแนนต่อ 1,000 บาท)
export function recommend(cpu, all) {
  const boards = all.filter((x) => x.category === 'motherboard' && x.socket === cpu.socket)
  const gpus = all.filter((x) => x.category === 'gpu')
    .map((g) => ({ ...g, value: +((g.score / g.price) * 1000).toFixed(1), balance: balance(cpu, g) }))
    .sort((a, b) => (b.balance.level === 'ok') - (a.balance.level === 'ok') || b.value - a.value)
  return { boards, gpus }
}

export function calcAirflow(fans, fp, cooler = null, mount = 'front') {
  const flow = (dir) => Object.entries(SLOTS).filter(([, s]) => s.dir === dir)
    .reduce((s, [k]) => s + (fp[k]?.cfm || 0) * fans[k].qty, 0)
  let inn = flow('in')
  let out = flow('out')
  if (cooler?.coolerType === 'liquid') { // พัดลมของหม้อน้ำนับรวมเป็นลมเข้า/ออกตามตำแหน่งที่ติด
    const add = Math.min(Math.floor(cooler.radiator / 120), SLOTS[mount].max) * (cooler.cfm || 0)
    if (SLOTS[mount].dir === 'in') inn += add
    else out += add
  }
  const status = !inn && !out ? 'none'
    : Math.abs(inn - out) <= Math.max(inn, out) * 0.1 ? 'balanced'
    : inn > out ? 'positive' : 'negative'
  return { in: inn, out, status }
}

export const CAT_META = {
  cpu: { label: 'ซีพียู (CPU)', icon: 'memory', color: '#2F5BFF', tint: '#E8EDFF', hint: 'สมองของคอมพิวเตอร์ แนะนำให้เลือกเป็นอย่างแรก' },
  motherboard: { label: 'เมนบอร์ด', icon: 'developer_board', color: '#7C3AED', tint: '#F1E9FF', hint: 'แผงที่เชื่อมทุกชิ้นส่วนเข้าด้วยกัน' },
  gpu: { label: 'การ์ดจอ (GPU)', icon: 'videogame_asset', color: '#059669', tint: '#E3F7EE', hint: 'ยิ่งแรง เล่นเกมและตัดต่อยิ่งลื่น' },
  ram: { label: 'แรม (RAM)', icon: 'sd_card', color: '#D97706', tint: '#FFF3DD', hint: 'ยิ่งมาก เปิดหลายโปรแกรมพร้อมกันได้ลื่น' },
  psu: { label: 'พาวเวอร์ซัพพลาย (PSU)', icon: 'bolt', color: '#DC2626', tint: '#FEE9E9', hint: 'จ่ายไฟให้ทุกชิ้นส่วน ต้องมีวัตต์พอ' },
  cooler: { label: 'ชุดระบายความร้อน CPU', icon: 'ac_unit', color: '#0369A1', tint: '#E0F2FE', hint: 'แบบลมหรือชุดน้ำ ช่วยให้ CPU เย็น (ไม่บังคับ)' },
  fan: { label: 'พัดลมเคส', icon: 'air', color: '#0891B2', tint: '#DDF4F9', hint: 'ช่วยระบายความร้อนออกจากเคส' },
}

// ตัวกรองด่วนในหน้าเลือกสินค้า
export const facetOf = (p) => ({
  cpu: p.socket?.startsWith('AM') ? 'AMD' : 'Intel',
  motherboard: p.socket,
  gpu: /geforce|rtx|gtx/i.test(p.name) ? 'NVIDIA' : 'AMD',
  ram: p.type,
  psu: `${p.watt}W`,
  fan: `${p.fanSize}mm`,
  cooler: p.coolerType === 'liquid' ? 'ชุดน้ำ' : 'ลม',
})[p.category]

// สเปคแนะนำ: อ้างอิงด้วย "ชื่อรุ่น" (ไม่ผูกกับ id) เพื่อให้ใช้ได้ทั้ง json-server และ MockAPI
const fansOf = (a, b) => ({ front: { name: a, qty: 2 }, rear: { name: a, qty: 1 }, top: { name: b, qty: 1 } })
export const PRESETS = [
  { key: 'budget', icon: 'savings', label: 'ประหยัดคุ้มค่า', desc: 'เกมออนไลน์ ทำงานเอกสาร ใช้งานทั่วไป',
    sel: { cpu: 'AMD Ryzen 5 5600', motherboard: 'MSI B550M PRO', gpu: 'Radeon RX 7600 8GB', ram: 'DDR4 16GB (2x8) 3200', psu: 'PSU 550W 80+ Bronze', cooler: 'ID-Cooling SE-214-XT' },
    fans: fansOf('Arctic P12', 'Arctic P12') },
  { key: 'gaming', icon: 'sports_esports', label: 'เล่นเกมลื่นๆ', desc: 'เกมใหม่ตั้งค่าสูง จอ Full HD ถึง 2K',
    sel: { cpu: 'AMD Ryzen 5 7600', motherboard: 'Gigabyte B650M', gpu: 'GeForce RTX 4060 Ti 8GB', ram: 'DDR5 16GB (2x8) 6000', psu: 'PSU 650W 80+ Gold', cooler: 'Thermalright Peerless Assassin 120 SE' },
    fans: fansOf('Cooler Master SickleFlow 120', 'Arctic P12') },
  { key: 'pro', icon: 'rocket_launch', label: 'แรงสุด ทำงานหนัก', desc: 'เกม 4K ตัดต่อวิดีโอ สตรีมมิ่ง (ชุดน้ำ 240)',
    sel: { cpu: 'AMD Ryzen 7 7800X3D', motherboard: 'Gigabyte B650M', gpu: 'GeForce RTX 4070 SUPER', ram: 'DDR5 32GB (2x16) 6000', psu: 'PSU 750W 80+ Gold', cooler: 'Arctic Liquid Freezer III 240' },
    coolerMount: 'top', // หม้อน้ำติดบนเคส จึงไม่ใส่พัดลมเคสด้านบน
    fans: { front: { name: 'Cooler Master SickleFlow 120', qty: 3 }, rear: { name: 'Cooler Master SickleFlow 120', qty: 1 }, top: { name: null, qty: 1 } } },
]

// แปลงชื่อรุ่นในสเปคแนะนำเป็น id ของข้อมูลจริง (ถ้าชื่อไม่เจอจะเป็น null)
export function resolvePreset(p, items) {
  const idOf = (name) => items.find((x) => x.name === name)?.id ?? null
  return {
    sel: { ...Object.fromEntries(Object.entries(p.sel).map(([c, n]) => [c, idOf(n)])), coolerMount: p.coolerMount || 'front' },
    fans: Object.fromEntries(Object.entries(p.fans).map(([k, f]) => [k, { id: idOf(f.name), qty: f.qty }])),
  }
}
