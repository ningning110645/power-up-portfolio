// Connect forms with validation, storage and rendering
document.addEventListener("DOMContentLoaded", function () {
  // 1. สั่ง Render ข้อมูลทันทีที่เปิดหน้าเว็บ
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

      const fullName = `${firstName} ${lastName}`.trim() || "Untitled Portfolio";
      const fullDescription = `Enjoy: ${enjoy} | Tried: ${tried} | Curious: ${curious}`;

      if (window.PowerUpStorage && typeof window.PowerUpStorage.savePortfolio === "function") {
        window.PowerUpStorage.savePortfolio({
          title: fullName,
          description: fullDescription,
          items: []
        });

        portfolioForm.reset();
        refreshUI(); // อัปเดตการ์ดและตัวเลือกใน Dropdown
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

      const portfolioId = document.getElementById("portfolio-select")?.value;
      const title = document.getElementById("title")?.value.trim();
      const type = document.getElementById("type")?.value;
      const date = document.getElementById("date")?.value;
      const role = document.getElementById("role")?.value.trim();
      const description = document.getElementById("description")?.value.trim();
      const skills = document.getElementById("skills")?.value.trim();

      if (!portfolioId) {
        alert("กรุณาเลือก Portfolio ก่อนเพิ่ม Item");
        return;
      }

      const itemData = {
        title: title,
        type: type,
        date: date,
        role: role,
        description: description,
        skills: skills ? skills.split(",").map(s => s.trim()) : []
      };

      if (window.PowerUpStorage && typeof window.PowerUpStorage.addItemToPortfolio === "function") {
        window.PowerUpStorage.addItemToPortfolio(portfolioId, itemData);
        itemForm.reset();
        refreshUI();
      }
    });
  }

  // -------------------------------------------------------------
  // ฟังก์ชันช่วย อัปเดตทั้งการ์ดแสดงผล และตัวเลือก Dropdown
  // -------------------------------------------------------------
  function refreshUI() {
    // อัปเดตการ์ดหน้าเว็บ
    if (window.PowerUpRender && typeof window.PowerUpRender.renderSavedPortfolios === "function") {
      window.PowerUpRender.renderSavedPortfolios();
    }

    // อัปเดตตัวเลือกใน <select id="portfolio-select">
    populatePortfolioSelect();
  }

  function populatePortfolioSelect() {
    const select = document.getElementById("portfolio-select");
    if (!select || !window.PowerUpStorage) return;

    const portfolios = window.PowerUpStorage.getPortfolios ? window.PowerUpStorage.getPortfolios() : [];
    select.innerHTML = '<option value="">-- Select a portfolio --</option>';

    portfolios.forEach(function (p) {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.title || p.name || `Portfolio ${p.id}`;
      select.appendChild(option);
    });
  }
});
