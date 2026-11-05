document.addEventListener("DOMContentLoaded", function () {
  refreshUI();

  // -------------------------------------------------------------
  // 1. จัดการฟอร์มสร้าง Portfolio (#portfolio-form)
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

      // Validation: บังคับเช็กแค่ First name หรือ Last name
      if (!firstName && !lastName) {
        alert("⚠️ กรุณากรอก First name หรือ Last name ก่อนบันทึกครับ");
        return;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const descriptionText = `Enjoy: ${enjoy} | Tried: ${tried} | Curious: ${curious}`;

      if (window.PowerUpStorage && typeof window.PowerUpStorage.savePortfolio === "function") {
        window.PowerUpStorage.savePortfolio({
          title: fullName,
          description: descriptionText,
          items: []
        });
        alert("บันทึก Portfolio สำเร็จเรียบร้อย!");
        portfolioForm.reset();
        refreshUI();
      } else {
        alert("ไม่พบฟังก์ชัน savePortfolio ใน storage.js");
      }
    });
  }

  // -------------------------------------------------------------
  // 2. จัดการฟอร์มเพิ่ม Item (#item-form)
  // -------------------------------------------------------------
  const itemForm = document.getElementById("item-form");
  if (itemForm) {
    itemForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const portfolioId = document.getElementById("portfolio-select")?.value;
      const title = document.getElementById("title")?.value.trim() || "";
      const type = document.getElementById("type")?.value || "";
      const date = document.getElementById("date")?.value || "";
      const role = document.getElementById("role")?.value.trim() || "";
      const description = document.getElementById("description")?.value.trim() || "";
      const skills = document.getElementById("skills")?.value.trim() || "";
      const evidence = document.getElementById("evidence")?.value.trim() || "";

      // Validation 1: บังคับเลือก Portfolio และใส่ Title
      if (!portfolioId) {
        alert("⚠️ กรุณาเลือก Portfolio จากตัวเลือกล่าสุดก่อนเพิ่ม Item ครับ");
        return;
      }

      if (!title) {
        alert("⚠️ กรุณากรอก Title (ชื่อผลงาน) ก่อนกดเพิ่ม Item ครับ");
        return;
      }

      // Validation 2: ตรวจสอบรูปแบบ URL ในช่อง Evidence (ถ้ามีการกรอก)
      if (evidence) {
        if (!isValidURL(evidence)) {
          alert("⚠️ รูปแบบ URL ในช่อง Evidence ไม่ถูกต้อง! กรุณากรอกลิงก์ที่ถูกต้อง เช่น https://github.com หรือ http://example.com");
          return;
        }
      }

      const newItem = {
        title: title,
        type: type,
        date: date,
        role: role,
        description: description,
        skills: skills,
        evidence: evidence
      };

      if (window.PowerUpStorage && typeof window.PowerUpStorage.addPortfolioItem === "function") {
        window.PowerUpStorage.addPortfolioItem(portfolioId, newItem);
        alert("เพิ่ม Item เข้า Portfolio เรียบร้อยแล้ว!");
        itemForm.reset();
        refreshUI();
      } else {
        alert("ไม่พบฟังก์ชัน addPortfolioItem ใน storage.js");
      }
    });
  }

  // ฟังก์ชันช่วยเช็กความถูกต้องของ URL
  function isValidURL(string) {
    try {
      const url = new URL(string.startsWith("http://") || string.startsWith("https://") ? string : `https://${string}`);
      // ต้องมีจุด (.) ใน domain เช่น github.com
      return url.hostname.includes(".");
    } catch (_) {
      return false;
    }
  }

  // -------------------------------------------------------------
  // ฟังก์ชันอัปเดตหน้าจอ
  // -------------------------------------------------------------
  function refreshUI() {
    updatePortfolioDropdown();

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
      option.value = p.id;
      option.textContent = p.title || `Portfolio ${p.id}`;
      select.appendChild(option);
    });
  }
});
