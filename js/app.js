document.addEventListener("DOMContentLoaded", function () {
  refreshUI();

  // -------------------------------------------------------------
  // 1. จัดการฟอร์มสร้าง Portfolio (#portfolio-form)
  // -------------------------------------------------------------
  const portfolioForm = document.getElementById("portfolio-form");
  if (portfolioForm) {
    portfolioForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // ตรวจข้อมูลด้วย validate.js
      const result = window.PowerUpValidate.validatePortfolioForm(portfolioForm);
      if (!result.valid) {
        alert(result.errors.join("\n"));
        return;
      }

      const p = result.portfolio;
      const fullName = `${p.firstName} ${p.lastName}`.trim();
      const descriptionText = `Enjoy: ${p.enjoy} | Tried: ${p.tried} | Curious: ${p.curious}`;

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

      // ตรวจข้อมูลด้วย validate.js
      const result = window.PowerUpValidate.validateItemForm(itemForm);
      if (!result.valid) {
        alert(result.errors.join("\n"));
        return;
      }

      const portfolioId = result.portfolioId;
      const newItem = result.item;

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