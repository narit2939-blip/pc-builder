export const CATS = ['cpu', 'motherboard', 'gpu', 'ram', 'psu', 'case']
export const CASE_FAN = { front: 'fanFront', rear: 'fanRear', top: 'fanTop' } 
const POS = { front: 'หน้า', rear: 'หลัง', top: 'บน' }
export const SLOTS = {
  front: { label: 'พัดลมหน้าเคส (ดูดลมเข้า)', dir: 'in', max: 3 },
  rear: { label: 'พัดลมหลังเคส (ดันลมออก)', dir: 'out', max: 1 },
  top: { label: 'พัดลมบนเคส (ดันลมออก)', dir: 'out', max: 2 },
}
export const SPEC_FIELDS = {
  cpu: ['socket', 'tdp', 'score'],
  motherboard: ['socket', 'ramType', 'formFactor'],
  gpu: ['tdp', 'psuRec', 'score', 'gpuLength'],
  ram: ['type', 'gb'],
  psu: ['watt'],
  fan: ['fanSize', 'cfm'],
  cooler: ['coolerType', 'sockets', 'maxTdp', 'radiator', 'cfm', 'coolerHeight'],
  case: ['formFactors', 'maxGpuLength', 'maxCoolerHeight', 'fanFront', 'fanTop', 'fanRear'],
}
export const NUMERIC = ['tdp', 'score', 'psuRec', 'gb', 'watt', 'fanSize', 'cfm', 'maxTdp', 'radiator', 'gpuLength',
  'coolerHeight', 'maxGpuLength', 'maxCoolerHeight', 'fanFront', 'fanTop', 'fanRear']
export const FIELD_LABELS = {
  socket: 'ซ็อกเก็ต (ช่องเสียบ CPU)', ramType: 'ชนิดแรมที่รองรับ (DDR4/DDR5)', formFactor: 'ขนาดเมนบอร์ด (ATX/mATX/ITX)',
  tdp: 'กินไฟสูงสุด หรือ TDP (วัตต์)', score: 'คะแนนประสิทธิภาพ (ตัวเลขเปรียบเทียบ)', psuRec: 'PSU ที่แนะนำ (วัตต์)',
  gpuLength: 'ความยาวการ์ดจอ (มม.)', type: 'ชนิดแรม (DDR4/DDR5)', gb: 'ความจุแรม (GB)', watt: 'กำลังไฟ PSU (วัตต์)',
  fanSize: 'ขนาดพัดลม (มม.)', cfm: 'ปริมาณลม หรือ CFM (ลบ.ฟุต/นาที)', coolerType: 'ชนิด (air = ลม, liquid = ชุดน้ำ)',
  sockets: 'ซ็อกเก็ตที่รองรับ (คั่นด้วยจุลภาค เช่น AM4,AM5)', maxTdp: 'รับความร้อนได้สูงสุด (วัตต์)',
  radiator: 'ขนาดหม้อน้ำ (มม. แบบลมใส่ 0)', coolerHeight: 'ความสูงฮีตซิงก์ (มม. ชุดน้ำใส่ 0)',
  formFactors: 'ขนาดเมนบอร์ดที่รองรับ (คั่นด้วยจุลภาค เช่น ATX,mATX)', maxGpuLength: 'การ์ดจอยาวสุดที่ใส่ได้ (มม.)',
  maxCoolerHeight: 'ฮีตซิงก์สูงสุดที่ใส่ได้ (มม.)', fanFront: 'ช่องพัดลมด้านหน้า (ตัว)', fanTop: 'ช่องพัดลมด้านบน (ตัว)', fanRear: 'ช่องพัดลมด้านหลัง (ตัว)',
}
export const fmt = (n) => Number(n || 0).toLocaleString('th-TH')
export const spec = (p) => ({
  cpu: `ซ็อกเก็ต ${p.socket} · กินไฟสูงสุด ${p.tdp}W`,
  motherboard: `ซ็อกเก็ต ${p.socket} · ใช้แรม ${p.ramType} · ขนาด ${p.formFactor || '-'}`,
  gpu: `กินไฟสูงสุด ${p.tdp}W · แนะนำ PSU ${p.psuRec}W ขึ้นไป · ยาว ${p.gpuLength || '-'} มม.`,
  ram: `${p.type} · ความจุ ${p.gb}GB`,
  psu: `จ่ายไฟได้ ${p.watt}W`,
  fan: `ขนาด ${p.fanSize} มม. · ลม ${p.cfm} CFM`,
  cooler: `${p.coolerType === 'liquid' ? `ชุดน้ำ หม้อน้ำ ${p.radiator} มม.` : `ฮีตซิงก์พัดลม สูง ${p.coolerHeight || '-'} มม.`} · รับความร้อนได้ ${p.maxTdp}W`,
  case: `ใส่เมนบอร์ด ${p.formFactors} · การ์ดจอยาวสุด ${p.maxGpuLength} มม.`,
})[p.category]
const inList = (str, v) => (str || '').split(',').map((x) => x.trim()).includes(v)
const supports = (c, socket) => inList(c.sockets, socket)
const maxRadSlots = (c) =>
  Math.max(Math.min(SLOTS.front.max, c.fanFront || 0), Math.min(SLOTS.top.max, c.fanTop || 0))
export function incompatReason(cat, part, p) {
  const { cpu, motherboard: mb, ram, cooler, gpu, case: pcCase } = p
  if (cat === 'cpu') {
    if (mb && mb.socket !== part.socket) return `ซ็อกเก็ต ${part.socket} ใช้กับเมนบอร์ดที่เลือกไว้ (${mb.socket}) ไม่ได้`
    if (cooler && !supports(cooler, part.socket)) return `ชุดระบายความร้อนที่เลือกไว้ไม่รองรับซ็อกเก็ต ${part.socket}`
    if (cooler && cooler.maxTdp < part.tdp) return `ชุดระบายความร้อนที่เลือกไว้รับความร้อนได้ ${cooler.maxTdp}W แต่ CPU นี้ใช้ ${part.tdp}W`
  }
  if (cat === 'motherboard') {
    if (cpu && cpu.socket !== part.socket) return `เมนบอร์ดนี้ใช้ ${part.socket} แต่ CPU ที่เลือกใช้ ${cpu.socket}`
    if (ram && ram.type !== part.ramType) return `รองรับแรม ${part.ramType} แต่คุณเลือกแรม ${ram.type} ไว้`
    if (pcCase && part.formFactor && !inList(pcCase.formFactors, part.formFactor)) return `เคสที่เลือกไว้ใส่เมนบอร์ดขนาด ${part.formFactor} ไม่ได้`
  }
  if (cat === 'ram' && mb && mb.ramType !== part.type) return `เมนบอร์ดที่เลือกไว้รองรับแรม ${mb.ramType} เท่านั้น`
  if (cat === 'gpu' && pcCase && part.gpuLength > pcCase.maxGpuLength)
    return `การ์ดจอยาว ${part.gpuLength} มม. เกินที่เคสที่เลือกไว้รองรับ (${pcCase.maxGpuLength} มม.)`
  if (cat === 'cooler') {
    if (cpu && !supports(part, cpu.socket)) return `ไม่รองรับซ็อกเก็ต ${cpu.socket} ของ CPU ที่เลือกไว้`
    if (cpu && part.maxTdp < cpu.tdp) return `รับความร้อนได้ ${part.maxTdp}W แต่ ${cpu.name} ใช้ ${cpu.tdp}W`
    if (pcCase && part.coolerType === 'air' && part.coolerHeight > pcCase.maxCoolerHeight)
      return `สูง ${part.coolerHeight} มม. เกินที่เคสที่เลือกไว้รองรับ (${pcCase.maxCoolerHeight} มม.)`
    if (pcCase && part.coolerType === 'liquid') {
      const need = Math.floor(part.radiator / 120)
      const cap = maxRadSlots(pcCase)
      if (need > cap) return `หม้อน้ำ ${part.radiator} มม. ใหญ่เกินที่เคสที่เลือกไว้รองรับ (สูงสุด ${cap * 120} มม.)`
    }
  }
  if (cat === 'case') {
    if (mb?.formFactor && !inList(part.formFactors, mb.formFactor)) return `ใส่เมนบอร์ดขนาด ${mb.formFactor} ที่เลือกไว้ไม่ได้`
    if (gpu?.gpuLength > part.maxGpuLength) return `ใส่การ์ดจอยาว ${gpu.gpuLength} มม. ไม่ได้ (เคสนี้ไม่เกิน ${part.maxGpuLength} มม.)`
    if (cooler?.coolerType === 'air' && cooler.coolerHeight > part.maxCoolerHeight)
      return `ใส่ฮีตซิงก์สูง ${cooler.coolerHeight} มม. ไม่ได้ (เคสนี้ไม่เกิน ${part.maxCoolerHeight} มม.)`
    if (cooler?.coolerType === 'liquid') {
      const need = Math.floor(cooler.radiator / 120)
      const cap = maxRadSlots(part)
      if (need > cap) return `ใส่หม้อน้ำ ${cooler.radiator} มม. ที่เลือกไว้ไม่ได้ (เคสนี้รองรับสูงสุด ${cap * 120} มม.)`
    }
  }
  return ''
}
export const compatible = (cat, part, p) => !incompatReason(cat, part, p)

const draw = (p) => (p.cpu?.tdp || 0) + (p.gpu?.tdp || 0) + 100 
export const needWatt = (p) => Math.round(draw(p) * 1.3) 

export function balance(cpu, gpu) {
  const r = gpu.score / cpu.score
  if (r > 1.6) return { level: 'warn', text: 'CPU อาจเป็นคอขวดของการ์ดจอ' }
  if (r < 0.6) return { level: 'warn', text: 'การ์ดจอยังไม่ทันซีพียู อัปการ์ดจอได้อีก' }
  return { level: 'ok', text: 'CPU และการ์ดจอสมดุลกัน' }
}

const m = (level, text) => ({ level, text })
export function checkBuild(p, ctx = {}) {
  const r = []
  const { cpu, motherboard: mb, gpu, ram, psu, cooler, case: pcCase } = p
  const capOf = (k) => Math.min(SLOTS[k].max, pcCase ? (pcCase[CASE_FAN[k]] ?? SLOTS[k].max) : SLOTS[k].max)
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
    const s = { max: capOf(at) }
    const where = at === 'front' ? 'หน้าเคส' : 'บนเคส'
    if (n > s.max) r.push(m('error', `ติดหม้อน้ำ ${cooler.radiator} มม. ที่${where}ไม่ได้ (รองรับสูงสุด ${s.max * 120} มม.) ลองเปลี่ยนตำแหน่ง`))
    else if (ctx.fanParts?.[at] && n + ctx.fans[at].qty > s.max)
      r.push(m('warn', `หม้อน้ำใช้ ${n} ช่องที่${where} ลดพัดลมเคสตำแหน่งนี้ลง (เหลือได้ ${s.max - n} ตัว)`))
    else r.push(m('ok', `ติดหม้อน้ำ ${cooler.radiator} มม. ที่${where}ได้`))
  }
  if (pcCase) {
    if (mb?.formFactor) r.push(inList(pcCase.formFactors, mb.formFactor)
      ? m('ok', `เคสใส่เมนบอร์ดขนาด ${mb.formFactor} ได้`)
      : m('error', `เคสนี้ใส่เมนบอร์ดขนาด ${mb.formFactor} ไม่ได้ (รองรับ ${pcCase.formFactors})`))
    if (gpu?.gpuLength) r.push(gpu.gpuLength <= pcCase.maxGpuLength
      ? m('ok', `การ์ดจอยาว ${gpu.gpuLength} มม. ใส่เคสได้ (เคสรองรับ ${pcCase.maxGpuLength} มม.)`)
      : m('error', `การ์ดจอยาว ${gpu.gpuLength} มม. ใส่เคสไม่ได้ (เคสรองรับไม่เกิน ${pcCase.maxGpuLength} มม.)`))
    if (cooler?.coolerType === 'air' && cooler.coolerHeight) r.push(cooler.coolerHeight <= pcCase.maxCoolerHeight
      ? m('ok', `ฮีตซิงก์สูง ${cooler.coolerHeight} มม. ใส่เคสได้`)
      : m('error', `ฮีตซิงก์สูง ${cooler.coolerHeight} มม. เกินที่เคสรองรับ (${pcCase.maxCoolerHeight} มม.)`))
    for (const k of Object.keys(SLOTS)) {
      const q = ctx.fanParts?.[k] ? ctx.fans[k].qty : 0
      if (q > capOf(k)) r.push(m('warn', `เคสนี้ติดพัดลมด้าน${POS[k]}ได้ ${capOf(k)} ตัว แต่เลือกไว้ ${q} ตัว`))
    }
  }
  return r
}
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
  if (cooler?.coolerType === 'liquid') { 
    const at = mount || 'front'
    const add = Math.min(Math.floor(cooler.radiator / 120), SLOTS[at].max) * (cooler.cfm || 0)
    if (SLOTS[at].dir === 'in') inn += add
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
  case: { label: 'เคสคอม (Case)', icon: 'computer', color: '#475569', tint: '#EEF1F5', hint: 'กล่องที่ใส่ทุกชิ้นส่วน ต้องใส่เมนบอร์ดและการ์ดจอได้' },
  cooler: { label: 'ชุดระบายความร้อน CPU', icon: 'ac_unit', color: '#0369A1', tint: '#E0F2FE', hint: 'แบบลมหรือชุดน้ำ ช่วยให้ CPU เย็น (ไม่บังคับ)' },
  fan: { label: 'พัดลมเคส', icon: 'air', color: '#0891B2', tint: '#DDF4F9', hint: 'ช่วยระบายความร้อนออกจากเคส' },
}
export const facetOf = (p) => ({
  cpu: p.socket?.startsWith('AM') ? 'AMD' : 'Intel',
  motherboard: p.socket,
  gpu: /geforce|rtx|gtx/i.test(p.name) ? 'NVIDIA' : 'AMD',
  ram: p.type,
  psu: `${p.watt}W`,
  fan: `${p.fanSize}mm`,
  case: (p.formFactors || '').split(',')[0] || 'เคส',
  cooler: p.coolerType === 'liquid' ? 'ชุดน้ำ' : 'ลม',
})[p.category]
const fansOf = (a, b) => ({ front: { name: a, qty: 2 }, rear: { name: a, qty: 1 }, top: { name: b, qty: 1 } })
export const PRESETS = [
  { key: 'budget', icon: 'savings', label: 'ประหยัดคุ้มค่า', desc: 'เกมออนไลน์ ทำงานเอกสาร ใช้งานทั่วไป',
    sel: { cpu: 'AMD Ryzen 5 5600', motherboard: 'MSI B550M PRO', gpu: 'Radeon RX 7600 8GB', ram: 'DDR4 16GB (2x8) 3200', psu: 'PSU 550W 80+ Bronze', cooler: 'ID-Cooling SE-214-XT', case: 'Deepcool CC560' },
    fans: fansOf('Arctic P12', 'Arctic P12') },
  { key: 'gaming', icon: 'sports_esports', label: 'เล่นเกมลื่นๆ', desc: 'เกมใหม่ตั้งค่าสูง จอ Full HD ถึง 2K',
    sel: { cpu: 'AMD Ryzen 5 7600', motherboard: 'Gigabyte B650M', gpu: 'GeForce RTX 4060 Ti 8GB', ram: 'DDR5 16GB (2x8) 6000', psu: 'PSU 650W 80+ Gold', cooler: 'Thermalright Peerless Assassin 120 SE', case: 'Montech AIR 903 MAX' },
    fans: fansOf('Cooler Master SickleFlow 120', 'Arctic P12') },
  { key: 'pro', icon: 'rocket_launch', label: 'แรงสุด ทำงานหนัก', desc: 'เกม 4K ตัดต่อวิดีโอ สตรีมมิ่ง (ชุดน้ำ 240)',
    sel: { cpu: 'AMD Ryzen 7 7800X3D', motherboard: 'Gigabyte B650M', gpu: 'GeForce RTX 4070 SUPER', ram: 'DDR5 32GB (2x16) 6000', psu: 'PSU 750W 80+ Gold', cooler: 'Arctic Liquid Freezer III 240', case: 'Lian Li LANCOOL 216' },
    coolerMount: 'top', 
    fans: { front: { name: 'Cooler Master SickleFlow 120', qty: 3 }, rear: { name: 'Cooler Master SickleFlow 120', qty: 1 }, top: { name: null, qty: 1 } } },
]
export function resolvePreset(p, items) {
  const idOf = (name) => items.find((x) => x.name === name)?.id ?? null
  return {
    sel: { ...Object.fromEntries(Object.entries(p.sel).map(([c, n]) => [c, idOf(n)])), coolerMount: p.coolerMount || 'front' },
    fans: Object.fromEntries(Object.entries(p.fans).map(([k, f]) => [k, { id: idOf(f.name), qty: f.qty }])),
  }
}
export const GLOSSARY = [
  { term: 'CPU', thai: 'ซีพียู', meaning: 'สมองของคอมพิวเตอร์ ทำหน้าที่คำนวณและสั่งงานทุกอย่าง', tip: 'ยิ่งแรง เปิดโปรแกรมและเล่นเกมได้ลื่นขึ้น' },
  { term: 'เมนบอร์ด', thai: '(Mainboard)', meaning: 'แผงวงจรหลักที่ทุกชิ้นส่วนมาเสียบเชื่อมต่อกัน', tip: 'ต้องเข้ากับ CPU และแรมที่เลือก' },
  { term: 'การ์ดจอ', thai: '(GPU)', meaning: 'ตัวประมวลผลภาพ ใช้เล่นเกม ตัดต่อวิดีโอ และงานกราฟิก', tip: 'ถ้าไม่เล่นเกมหนักๆ ไม่จำเป็นต้องเลือกรุ่นแรงมาก' },
  { term: 'แรม', thai: '(RAM)', meaning: 'หน่วยความจำชั่วคราว ยิ่งมาก ยิ่งเปิดหลายโปรแกรมพร้อมกันได้ลื่น', tip: 'ปัจจุบัน 16GB เพียงพอสำหรับคนส่วนใหญ่' },
  { term: 'PSU', thai: 'พาวเวอร์ซัพพลาย', meaning: 'ตัวแปลงและจ่ายไฟให้ทุกชิ้นส่วนในเครื่อง', tip: 'วัตต์ต้องพอ และควรเหลือไว้ประมาณ 30%' },
  { term: 'เคส', thai: '(Case)', meaning: 'กล่องที่ใส่ชิ้นส่วนทั้งหมดไว้ข้างใน', tip: 'ต้องใส่เมนบอร์ดและการ์ดจอได้ และมีที่ติดพัดลมพอ' },
  { term: 'ซ็อกเก็ต', thai: '(Socket) เช่น AM4, AM5, LGA1700', meaning: 'ช่องเสียบ CPU บนเมนบอร์ด รูปร่างแต่ละแบบเสียบสลับกันไม่ได้', tip: 'CPU กับเมนบอร์ดต้องใช้ซ็อกเก็ตชื่อเดียวกันเท่านั้น' },
  { term: 'DDR4 / DDR5', thai: 'รุ่นของแรม', meaning: 'แรมแต่ละรุ่นมีรูปแบบขาไม่เหมือนกัน เสียบสลับรุ่นกันไม่ได้', tip: 'เมนบอร์ดหนึ่งตัวรองรับแรมได้รุ่นเดียว' },
  { term: 'TDP', thai: 'กำลังไฟ/ความร้อนสูงสุด', meaning: 'ปริมาณไฟ (และความร้อน) สูงสุดที่ชิ้นส่วนนั้นใช้ หน่วยเป็นวัตต์', tip: 'ใช้คำนวณว่า PSU และชุดระบายความร้อนต้องรับไหวแค่ไหน' },
  { term: 'วัตต์ (W)', thai: '', meaning: 'หน่วยวัดกำลังไฟ ตัวเลขยิ่งมาก จ่ายไฟได้มากหรือใช้ไฟมาก' },
  { term: 'CFM', thai: 'ปริมาณลมของพัดลม', meaning: 'ปริมาณลมที่พัดลมพัดได้ต่อนาที (ลูกบาศก์ฟุตต่อนาที)', tip: 'ตัวเลขยิ่งสูง ลมยิ่งแรง' },
  { term: 'ชุดระบายความร้อน CPU', thai: '(CPU Cooler)', meaning: 'ตัวพาความร้อนออกจาก CPU มี 2 แบบ คือฮีตซิงก์พัดลม (แบบลม) และชุดน้ำ', tip: 'CPU ที่กินไฟสูง ควรเลือกชุดที่รับความร้อนได้มากกว่าเสมอ' },
  { term: 'ชุดน้ำ AIO / หม้อน้ำ', thai: '(Radiator)', meaning: 'ชุดระบายความร้อนด้วยน้ำสำเร็จรูป หม้อน้ำติดที่ผนังเคสพร้อมพัดลม ขนาด 120/240/360 มม.', tip: 'ขนาด 240 ใช้พัดลม 2 ตัว 360 ใช้ 3 ตัว' },
  { term: 'แรงดันบวก / ลบ', thai: '(ลมในเคส)', meaning: 'ลมเข้ามากกว่าลมออก = แรงดันบวก ฝุ่นเข้าเคสน้อย / ลมออกมากกว่าเข้า = แรงดันลบ ฝุ่นอาจเข้าตามช่องว่าง', tip: 'แบบสมดุลหรือบวกเล็กน้อยกำลังดี' },
  { term: 'ขนาดเมนบอร์ด', thai: 'ATX / mATX / ITX', meaning: 'ATX ใหญ่สุด ช่องเสียบเยอะ, mATX เล็กลง, ITX เล็กที่สุด', tip: 'เคสต้องรองรับขนาดของเมนบอร์ดที่เลือก' },
  { term: 'ความยาวการ์ดจอ', thai: '(มม.)', meaning: 'การ์ดจอแต่ละรุ่นยาวไม่เท่ากัน ถ้ายาวเกินที่เคสรองรับจะใส่ไม่ได้' },
  { term: 'คอขวด', thai: '(Bottleneck)', meaning: 'ชิ้นส่วนหนึ่งช้ากว่าอีกชิ้นจนฉุดให้ทั้งเครื่องช้าลง เช่น CPU อ่อนเกินไปสำหรับการ์ดจอแรงๆ', tip: 'ระบบจะเตือนให้เมื่อ CPU กับการ์ดจอไม่สมดุลกัน' },
  { term: 'คะแนนประสิทธิภาพ', thai: '', meaning: 'ตัวเลขเปรียบเทียบความแรงที่ระบบตั้งไว้ใช้ประกอบคำแนะนำ ไม่ใช่คะแนนเบนช์มาร์กจริง' },
  { term: '80+ Bronze / Gold', thai: 'ระดับของ PSU', meaning: 'ยิ่งระดับสูง (Gold > Bronze) ยิ่งแปลงไฟได้มีประสิทธิภาพ ร้อนน้อยและประหยัดไฟกว่า' },
]