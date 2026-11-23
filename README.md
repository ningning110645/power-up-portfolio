# Power Up! Personal Learning Portfolio

CS100 Term Project — Final System & Demo (Submission 2 of 2)
Server-side JSON on AWS EC2 · Portfolio Item Exchange · Real Users

## สถาปัตยกรรมการ deploy (AWS Learner Lab)

```
Browser ── HTTP :80 ──> nginx ──> static files (index.html, css/, js/)
                             └──> api/*.php ── php-fpm ──> /var/www/data/portfolios.json (นอก webroot)
```

- **Webroot** `/var/www/powerup` (repo นี้) · **ข้อมูล** `/var/www/data` — ผู้ใช้เข้าถึงผ่าน URL ตรงไม่ได้ (nginx deny)
- ข้อมูล persist ผ่าน `reboot` เพราะ nginx + php-fpm เป็น systemd service (`systemctl enable`)
- **Public IP เปลี่ยนทุกครั้งที่เปิด Lab ใหม่** — แค่รัน `./deploy.sh` แล้วแจ้ง URL ใหม่ (โจทย์อนุญาตให้ใช้ Public IP ปกติได้)

## วิธี Deploy บน AWS Learner Lab (ทุกครั้งที่ได้เครื่องใหม่)

1. เปิด Learner Lab → เข้า EC2 instance
2. **เปิด Security Group**: Inbound เปิดเฉพาะ SSH (port 22) และ HTTP (port 80) ← ต้องกดใน console เอง (โจทย์: เปิดเฉพาะ port จำเป็น)
3. SSH เข้าเครื่อง แล้วรัน:

```bash
sudo apt-get update && sudo apt-get install -y git   # ถ้ายังไม่มี
git clone https://github.com/ningning110645/power-up-portfolio.git
cd power-up-portfolio
chmod +x deploy.sh
sudo ./deploy.sh --seed     # --seed = ใส่ portfolio ตัวอย่างไว้โชว์ตอน demo (ตัดออกได้)
```

4. จบ script จะปริ้น **Public URL** → ลองเปิดจากมือถือ/คอมเครื่องอื่นยืนยัน
5. แจ้ง URL ใหม่ให้ทีม + บันทึกในเอกสารส่ง

> script นี้ **idempotent** — รันซ้ำได้ ข้อมูลเดิมใน `/var/www/data` ไม่หาย

## วิธีทดสอบระบบ (Functional Tests ตามข้อ 5 ของโจทย์)

| การทดสอบ | วิธีทำ |
|---|---|
| Create Portfolio + Validation | กรอกฟอร์มไม่ครบ/ผิดรูปแบบ → ระบบต้องปฏิเสธ (server-side ตรวจซ้ำอีกชั้น) |
| Save & Load จาก Server | บันทึก → Refresh/ปิดเปิดใหม่ → ข้อมูลยังอยู่ (โหลดจาก server เป็นหลัก) |
| Cross-device | บันทึกจาก Browser A → เปิดด้วย Browser B/เครื่องอื่นด้วย URL เดียวกัน |
| Persistence หลัง Reboot | `sudo reboot` หรือ EC2 console → Instance state → Reboot instance (อย่าใช้ Stop/Start เพราะ IP จะเปลี่ยน) → เปิด URL เดิม ข้อมูลยังอยู่ (ไม่ต้องรัน deploy ซ้ำ) |
| Server Validation | ส่งข้อมูลไม่ครบไปที่ API ตรง ๆ (ไม่ผ่านฟอร์ม) เช่นใน Console: `fetch("api/items.php",{method:"POST",body:new URLSearchParams({portfolioId:"x",title:""})}).then(r=>r.json()).then(console.log)` → ได้ error 400 ไม่บันทึก |
| File Access ถูกปิด | เปิด `http://<IP>/data/portfolios.json` ตรง → ต้องได้ **403** ไม่ใช่เนื้อหา JSON |
| Import JSON (ข้ามกลุ่ม) | Copy JSON จากบูธเพื่อน → วางในช่อง Import → เลือก Portfolio → แก้ Reflection → Save |
| Import JSON ผิดรูปแบบ | วางข้อความที่ไม่ใช่ JSON หรือ JSON ที่ขาด field / type ผิด → ระบบแจ้ง error และไม่กรอกฟอร์ม |
| Import ซ้ำไม่ซ้ำ ID | Import Item JSON เดิมเข้า Portfolio เดิมอีกครั้ง → Server ตรวจ `id` ซ้ำ ตอบกลับ 409 และแจ้งว่า Item นี้มีอยู่แล้ว ไม่สร้างรายการซ้ำ |
| Export My Portfolio | ปุ่ม Export → ได้ `my-portfolio.json` เฉพาะ portfolio ตัวเอง |

## วิธีทดลอง Challenge และ Import/Export Portfolio Item

**ฝั่ง Host (บูธของเรา)**
1. เปิดหน้าเว็บ → เลื่อนลงไปที่ส่วน **Challenge Festival** → ส่วน **CSS Challenge** กด **Spin Challenge** เพื่อสุ่มโจทย์
2. Tester แก้ CSS ในช่อง **CSS Editor** ดูผลใน Live Preview แล้วกด **Check CSS** (5-10 นาที)
3. กรอก Challenge Title, Description, Skills, Evidence Links แล้วกด **Complete Challenge**
4. ระบบสร้าง Portfolio Item JSON (โครงสร้างเดิมจาก Checkpoint + `id` และ `schemaVersion`) ในช่อง **Generated Item JSON** → ให้ Tester Copy ไป

**ฝั่ง Tester (Import เข้าเว็บของกลุ่มตัวเอง)**
1. ส่วน **Add Portfolio Item** → วาง JSON ในช่อง **Import Item JSON from a Challenge** (หรือเลือกไฟล์ `.json`) → กด **Fill the form**
2. ระบบตรวจ JSON (parse, field ครบ, type ถูก) แล้วกรอกฟอร์มให้ → เลือก Portfolio ปลายทาง → ตรวจ/แก้ Reflection → Save
3. Refresh หน้าเว็บ → Item ยังอยู่ในส่วน **Preview** (โหลดจาก server)
4. Import JSON เดิมซ้ำเข้า Portfolio เดิม → ระบบแจ้งว่า Item นี้มีอยู่แล้ว ไม่สร้างซ้ำ

**Export My Portfolio**
1. เลือก Portfolio ของตัวเองในฟอร์ม Add Portfolio Item
2. ส่วน **Export my Portfolio** → กด **Export my-portfolio.json** (ดาวน์โหลดไฟล์) หรือ **Copy JSON** → ได้เฉพาะ Portfolio ของตัวเอง

## วิธีเปิดเว็บไซต์บนเครื่องตัวเอง (ระหว่างพัฒนา)
1. Clone repo นี้
2. `php -S localhost:8000` ในโฟลเดอร์โปรเจกต์ (ข้อมูลจะเก็บใน `local-data/`) หรือใช้ Live Server

## วิธีทดลอง (บนเครื่องตัวเอง)
1. การทดสอบ Create Portfolio: ลองกรอกข้อมูลในหน้าฟอร์มสร้าง Portfolio (หากกรอกข้อมูลไม่ครบหรือผิดรูปแบบ ระบบจะแจ้งเตือน)
2. การทดสอบ Add Item: ลองเพิ่มผลงานเข้าไปใน Portfolio
3. การทดสอบ Save & Load: กดบันทึกข้อมูล จากนั้นกด Refresh หน้าเว็บ (F5) หรือปิดแล้วเปิดใหม่ ข้อมูลที่บันทึกไว้จะต้องยังคงแสดงผลอยู่ตามปกติ
4. ระบบรองรับการสร้าง Portfolio ได้หลายคน โดยข้อมูลไม่ปะปนกัน

## โครงสร้างโปรเจกต์

```
index.html, css/, js/       → Frontend (vanilla HTML/CSS/JS)
api/                        → PHP: portfolios.php, items.php, validation.php, storage.php
deploy.sh                   → deploy script (idempotent) บน EC2
deploy/nginx-powerup.conf   → nginx vhost template (deny /data + fastcgi)
sample-portfolio-*.json     → ข้อมูลตัวอย่างสำหรับ --seed / ทดสอบ
```

## สมาชิก
1. นางสาวนภัสสร ยาศรี 6606613948
2. นายจิรายุ เจริญยศ 6609611790
3. นายภูมิ อัศวจำรูญ 6609613291
4. นางสาววิชิดา ลูกจันทร์ 6709611963
5. นายปิยพนธ์ อาจไพวัน 6809611384
6. นายสุวรรณภูมิ ปรุงจิตร 6809611673
7. นายพรพิพัฒน์ ตรีพิพัฒน์ 6709616087
