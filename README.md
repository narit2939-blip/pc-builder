# PC Builder (Vue 3 + Quasar)

เว็บจัดสเปคคอม: เลือก CPU / เมนบอร์ด / การ์ดจอ / แรม / PSU / พัดลม พร้อมราคารวม
ตรวจความเข้ากัน (ซ็อกเก็ต, ชนิดแรม, วัตต์ PSU, ความสมดุล CPU–GPU), แนะนำคู่ที่คุ้ม และแผนผังทิศทางลมในเคส

## ติดตั้ง
1. `npm init quasar` (Quasar CLI with Vite, JavaScript, Composition API `<script setup>`, SCSS, ESLint) แล้ว `npm i axios pinia pinia-plugin-persistedstate`
2. คัดลอกโฟลเดอร์ `src/`, `.env`, `vercel.json`, `db.json` ทับในโปรเจกต์ (ลบ boot/store เดิมที่ชนกัน)
3. `quasar.config.js`: `boot: ['pinia', 'axios']`, `framework.plugins: ['Notify', 'Dialog']`, `vueRouterMode: 'history'`
4. `src/router/index.js`: ใส่โค้ดจาก `src/router/guard.snippet.js` (ต้อง import `useAuthStore` และ `Notify`)
5. `src/css/quasar.variables.scss`: `$primary: #1F4FD8;` และ `$generic-border-radius: 8px;`

## รัน (Dev)
- `npm i -g json-server@0.17.4` แล้ว `json-server db.json` (พอร์ต 3000)
- `quasar dev` แล้วเข้าด้วย `user` / `admin` รหัส `123456`

## Deploy (Production)
1. สร้างโปรเจกต์บน MockAPI.io สร้าง resource `parts`, `users`, `builds` แล้ววางข้อมูลจาก `db.json` (ลบฟิลด์ `id` ออก ให้ระบบสร้างเอง)
2. push ขึ้น GitHub (`.env`, `dist/`, `node_modules/` อยู่ใน `.gitignore`)
3. Vercel: Build `npm run build`, Output `dist/spa`, Environment Variables: `QCLI_API_URL` = URL ของ MockAPI และ `QCLI_APP_TITLE`

## หมายเหตุ
- ราคา/สเปคใน `db.json` เป็นข้อมูลตัวอย่างโดยประมาณ ให้แก้ผ่านหน้า "จัดการชิ้นส่วน" (admin)
- Login เป็นการจำลอง (ตรวจจากตาราง users และสร้าง token ฝั่ง Front-end) เหมาะกับงานในวิชา ไม่ใช่ระบบความปลอดภัยจริง
