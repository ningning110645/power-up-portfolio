document.addEventListener("DOMContentLoaded", function () {
  refreshUI();

  // -------------------------------------------------------------
  // 2. จัดการฟอร์มสร้าง Portfolio (#portfolio-form)
  // -------------------------------------------------------------
  const portfolioForm = document.getElementById("portfolio-form");
  if (portfolioForm) {
    portfolioForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const firstName = document.getElementById("first-name")?.value.trim() || "";
      const lastName = document.getElementById("last-name")?.value.trim() || "";
      const enjoy = document.getElementById("What-i-enjoy")?.value.trim() || "";
      const tried = document.getElementById("what-i-tried")?.value.trim() || "";
      const curious = document.getElementById("What-I'm-Curious-About")?.value.trim() || "";

      // ตรวจสอบว่าใส่ชื่ออย่างน้อย 1 ช่องหรือไม่
      if (!firstName && !lastName) {
        alert("กรุณากรอก First name หรือ Last name ก่อนกด Save ครับ");
        return;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const descriptionText = `Enjoy: ${enjoy} | Tried: ${tried} | Curious: ${curious}`;

      // โครงสร้างข้อมูลที่สอดคล้องกับ render.js และ storage.js
      const newPortfolio = {
        title: fullName,
        description: descriptionText,
        items: []
      };

      try {
        window.PowerUpStorage.savePortfolio(newPortfolio);
        alert("บันทึก Portfolio สำเร็จเรียบร้อย!");
        portfolioForm.reset();
        refreshUI(); // อัปเดตการ์ดแสดงผล และดรอปดาวน์ทันที
      } catch (err) {
        console.error("Save Portfolio Error:", err);
        alert("เกิดข้อผิดพลาดในการบันทึก Portfolio");
      }
    });
  }

  // -------------------------------------------------------------
  // 3. จัดการฟอร์มเพิ่ม Item (#item-form)
  // -------------------------------------------------------------
  const itemForm = document.getElementById("item-form");
  if (itemForm) {
    itemForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const selectElement = document.getElementById("portfolio-select");
      const portfolioId = selectElement?.value;

      if (!portfolioId) {
        alert("กรุณาเลือก Portfolio ที่ต้องการเพิ่ม Item ก่อนครับ");
        return;
      }

      const newItem = {
        title: document.getElementById("title")?.value.trim() || "",
        type: document.getElementById("type")?.value || "",
        date: document.getElementById("date")?.value || "",
        role: document.getElementById("role")?.value.trim() || "",
        description: document.getElementById("description")?.value.trim() || "",
        skills: document.getElementById("skills")?.value.trim() || "", // storage.js จะ split(',') แปลงเป็น Array ให้เอง
        whatIDid: document.getElementById("whatIDid")?.value.trim() || "",
        whatILearned: document.getElementById("whatILearned")?.value.trim() || "",
        challenge: document.getElementById("challenge")?.value.trim() || "",
        nextStep: document.getElementById("nextStep")?.value.trim() || "",
        evidence: document.getElementById("evidence")?.value.trim() || "" // storage.js จะ split('\n') แปลงเป็น Array ให้เอง
      };

      try {
        window.PowerUpStorage.addPortfolioItem(portfolioId, newItem);
        alert("เพิ่ม Item เข้า Portfolio เรียบร้อยแล้ว!");
        itemForm.reset();
        refreshUI(); // อัปเดตหน้าเว็บทันที
      } catch (err) {
        console.error("Add Item Error:", err);
        alert("เกิดข้อผิดพลาดในการเพิ่ม Item: " + err.message);
      }
    });
  }

  // -------------------------------------------------------------
  // ฟังก์ชันช่วย อัปเดตหน้าจอและการ์ดแสดงผล
  // -------------------------------------------------------------
  function refreshUI() {
    // 1. โหลดตัวเลือกใส่ Dropdown
    updatePortfolioDropdown();

    // 2. เรียกฟังก์ชัน renderSavedPortfolios() จาก render.js ของเพื่อน
    if (window.PowerUpRender && typeof window.PowerUpRender.renderSavedPortfolios === "function") {
      window.PowerUpRender.renderSavedPortfolios();
    }
  }

  function updatePortfolioDropdown() {
    const select = document.getElementById("portfolio-select");
    if (!select || !window.PowerUpStorage) return;

    const portfolios = window.PowerUpStorage.getPortfolios();
    select.innerHTML = '<option value="">-- Select a portfolio --</option>';

    portfolios.forEach(function (p) {
      const option = document.createElement("option");
      option.value = p.id; // ส่ง ID จริงของ storage.js
      option.textContent = p.title || "Untitled Portfolio";
      select.appendChild(option);
    });
  }
});
