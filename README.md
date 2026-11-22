# PC Builder — เว็บจัดสเปคคอมพิวเตอร์

โปรเจกต์ปลายภาควิชา 968-362 Front-end Development (Vue 3 + Quasar)
เว็บสำหรับจัดสเปคคอมพิวเตอร์ เลือกอุปกรณ์ทีละชิ้น ดูราคารวมทันที ระบบตรวจความเข้ากันของอุปกรณ์ให้ และแสดงทิศทางลมในเคส
ออกแบบให้คนที่ไม่รู้เรื่องคอมพิวเตอร์ก็ใช้ได้ (มีคำอธิบายศัพท์ภาษาไทย สเปคแนะนำสำเร็จรูป และข้อความเตือนที่อ่านง่าย)

- **Production URL:** https://pc-builder-lake.vercel.app
- **GitHub Repository:** `<ใส่ลิงก์ repo ของกลุ่ม>`

## ฟีเจอร์
- เลือกอุปกรณ์ 6 หมวดหลัก: CPU, เมนบอร์ด, การ์ดจอ, แรม, พาวเวอร์ซัพพลาย, เคส และเลือกชุดระบายความร้อน CPU (แบบลม / ชุดน้ำ) กับพัดลมเคสเพิ่มได้
- **ราคารวม** คำนวณทันที พร้อมรายการแยกชิ้น
- **ตรวจความเข้ากัน:** ซ็อกเก็ต CPU↔เมนบอร์ด, ชนิดแรม DDR4/DDR5, กำลังไฟ PSU, ความสมดุล CPU↔การ์ดจอ (คอขวด), ชุดระบายความร้อนรองรับซ็อกเก็ตและความร้อนของ CPU, เคสใส่เมนบอร์ด/การ์ดจอ/ฮีตซิงก์ได้หรือไม่, จำนวนพัดลมที่เคสรองรับ
- **แนะนำคู่ที่คุ้ม:** เลือก CPU แล้วแสดงเมนบอร์ดที่ใช้ได้ และการ์ดจอที่สมดุลและคุ้มค่า
- **แผนผังทิศทางลมในเคส:** แสดงลมเข้า/ออก ปริมาณลม (CFM) และแรงดันบวก/ลบ รวมหม้อน้ำของชุดน้ำ
- **สเปคแนะนำ 3 แบบ** (ประหยัด / เล่นเกม / แรงสุด) กดครั้งเดียวได้สเปคครบ
- **ศัพท์คอมแบบเข้าใจง่าย** อธิบายคำอย่าง TDP, CFM, ซ็อกเก็ต, DDR5 เป็นภาษาไทย
- ระบบสมาชิก: ผู้เยี่ยมชมจัดสเปคได้เลย, **ผู้ใช้ (user)** บันทึกและเปิดสเปคที่บันทึกไว้, **ผู้ดูแล (admin)** เพิ่ม/แก้/ลบชิ้นส่วนได้
- ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ (Responsive)

## เกณฑ์การให้คะแนน กับสิ่งที่ทำ
| เกณฑ์ | สิ่งที่ทำในโปรเจกต์ |
|---|---|
| Application Design & UI/UX | ธีมสะอาด การ์ดชิ้นส่วน หน้าต่างเลือกสินค้าที่ค้นหา/กรอง/เรียงได้ ซ่อนรุ่นที่เข้ากันไม่ได้ บอกเหตุผลเป็นภาษาไทย |
| Component & Structure | Quasar components, Vue Router, แยก pages / layouts / components / stores / utils |
| State Management | Pinia 3 store: `auth`, `parts`, `build` (เก็บใน sessionStorage: F5 ไม่หาย, เปิดเว็บใหม่เริ่มใหม่) |
| API Integration | Axios + MockAPI: GET / POST / PUT / DELETE, สถานะ Loading / Error, จัดการ 401/404/500 |
| Authentication / Authorization | Login, token (จำลอง) พร้อมเวลาหมดอายุ, Route Guard, สิทธิ์ตามบทบาท user/admin |
| Deployment | Build เป็น SPA, ตั้ง `QCLI_API_URL` เป็น Environment Variable, deploy บน Vercel จาก GitHub |

## เทคโนโลยี
Vue 3 (Composition API, `<script setup>`), Quasar (Vite), Vue Router, Pinia + pinia-plugin-persistedstate, Axios, MockAPI.io, Vercel

## โครงสร้างโปรเจกต์
```
src/
  boot/         axios (interceptor: แนบ token, จัดการ 401), pinia
  components/   PartSlot, PartPickerDialog, PartThumb, AirflowCase, GlossaryDialog
  layouts/      MainLayout
  pages/        BuilderPage, SavedBuildsPage, PartsAdminPage, LoginPage
  router/       routes + route guard
  stores/       auth-store, parts-store, build-store
  utils/        compat.js (กฎความเข้ากัน, ศัพท์, สเปคแนะนำ), http.js (จัดการ error)
mockapi/        ข้อมูลตัวอย่างสำหรับนำเข้า MockAPI (parts.json)
db.json         ข้อมูลสำหรับ json-server ตอนพัฒนา
```

## วิธีรันในเครื่อง
1. `npm install`
2. สร้างไฟล์ `.env` ที่โฟลเดอร์หลัก
   ```
   QCLI_API_URL=<URL ของ API>
   QCLI_APP_TITLE=PC Builder
   ```
   ตอนพัฒนาใช้ json-server ได้: `npm i -g json-server@0.17.4` แล้ว `json-server db.json` และตั้ง `QCLI_API_URL=http://localhost:3000`
3. `npx quasar dev`

## API (MockAPI)
มี 2 resource: `parts` (ข้อมูลอุปกรณ์) และ `builds` (สเปคที่ผู้ใช้บันทึก)

## บัญชีทดลอง
| ผู้ใช้ | รหัสผ่าน | สิทธิ์ |
|---|---|---|
| user | 123456 | จัดสเปค บันทึกและเปิดสเปค |
| admin | 123456 | ทุกอย่างของ user และจัดการชิ้นส่วน |

## ข้อจำกัด
- ราคาและสเปคอุปกรณ์เป็น **ข้อมูลตัวอย่างโดยประมาณ** สำหรับสาธิตระบบ ไม่ใช่ราคาขายจริง
- ระบบ Login เป็นการจำลองฝั่ง Front-end (ไม่มี Backend จริง) token ไม่ได้ผ่านการตรวจโดยเซิร์ฟเวอร์
- Mock API ไม่มีการป้องกันสิทธิ์ ผู้ที่รู้ URL เรียกใช้ API ได้โดยตรง
- ค่า "คะแนนประสิทธิภาพ" เป็นตัวเลขเปรียบเทียบที่ตั้งขึ้นเอง ไม่ใช่คะแนนเบนช์มาร์กจริง

## ภาพหน้าจอ
`<ใส่ภาพหน้าจอ: หน้าจัดสเปค, หน้าต่างเลือกสินค้า, ผลตรวจความเข้ากัน, แผนผังทิศทางลม, หน้า admin>`

## ผู้จัดทำ
`<ชื่อ-รหัสนักศึกษาของสมาชิกในกลุ่ม>`
