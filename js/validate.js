// Validate form input (required fields, URL, date)

// ---------- ตรวจข้อมูล Portfolio Item ----------
const data = new FormData(form);
const errors = [];

// อ่านค่าและตัดช่องว่างหน้า-หลังออก (ใส่แต่ช่องว่าง = ว่าง)
const title = (data.get("title") || "").trim();
const type = (data.get("type") || "").trim();
const date = (data.get("date") || "").trim();
const role = (data.get("role") || "").trim();
const description = (data.get("description") || "").trim();
const skillsText = (data.get("skills") || "").trim();
const whatIDid = (data.get("whatIDid") || "").trim();
const whatILearned = (data.get("whatILearned") || "").trim();
const challenge = (data.get("challenge") || "").trim();
const nextStep = (data.get("nextStep") || "").trim();
const evidenceText = (data.get("evidence") || "").trim();

// ช่องที่ต้องกรอก
if (title === "") errors.push("กรุณากรอก Title");
if (type === "") errors.push("กรุณากรอก Type");
if (role === "") errors.push("กรุณากรอก Role");
if (description === "") errors.push("กรุณากรอก Description");
if (whatIDid === "") errors.push("กรุณากรอก What I did");
if (whatILearned === "") errors.push("กรุณากรอก What I learned");
if (challenge === "") errors.push("กรุณากรอก Challenge");
if (nextStep === "") errors.push("กรุณากรอก Next step");

// วันที่ ต้องเป็น YYYY-MM-DD และเป็นวันที่มีจริง
if (date === "") {
  errors.push("กรุณากรอกวันที่");
} else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  errors.push("รูปแบบวันที่ไม่ถูกต้อง ใช้ YYYY-MM-DD เช่น 2026-10-18");
} else {
  const parts = date.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const check = new Date(y, m - 1, d);
  if (check.getFullYear() !== y || check.getMonth() !== m - 1 || check.getDate() !== d) {
    errors.push("วันที่นี้ไม่มีจริง กรุณาตรวจสอบอีกครั้ง");
  }
}

// Skills คั่นด้วยคอมมา ต้องมีอย่างน้อย 1 ค่า
const skills = [];
const skillParts = skillsText.split(",");
for (let i = 0; i < skillParts.length; i++) {
  const s = skillParts[i].trim();
  if (s !== "") skills.push(s);
}
if (skills.length === 0) errors.push("กรุณากรอกอย่างน้อย 1 ทักษะ (คั่นด้วยเครื่องหมายคอมมา)");

// Evidence คั่นด้วยคอมมา ต้องมีอย่างน้อย 1 ลิงก์ และทุกลิงก์ต้องถูกรูปแบบ
const evidence = [];
const evidenceParts = evidenceText.split(",");
for (let i = 0; i < evidenceParts.length; i++) {
  const e = evidenceParts[i].trim();
  if (e !== "") evidence.push(e);
}
if (evidence.length === 0) {
  errors.push("กรุณาใส่ลิงก์หลักฐานอย่างน้อย 1 รายการ");
} else {
  for (let i = 0; i < evidence.length; i++) {
    if (!/^https?:\/\/\S+\.\S+$/.test(evidence[i])) {
      errors.push("ลิงก์ไม่ถูกต้อง: " + evidence[i] + " (ต้องขึ้นต้นด้วย http:// หรือ https://)");
    }
  }
}

// ถ้ามี error ให้แจ้งเตือนแล้วหยุด ไม่บันทึก
if (errors.length > 0) {
  alert(errors.join("\n"));
  return;
}

