document.addEventListener("DOMContentLoaded", function () {
    refreshUI();

    // -------------------------------------------------------------
    // 1. จัดการฟอร์มสร้าง Portfolio (#portfolio-form)
    // -------------------------------------------------------------
    const portfolioForm = document.getElementById("portfolio-form");
    if (portfolioForm) {
        portfolioForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // ตรวจข้อมูลด้วย validate.js
            const result = window.PowerUpValidate.validatePortfolioForm(portfolioForm);
            if (!result.valid) {
                alert(result.errors.join("\n"));
                return;
            }

            try {
                // FormData ใช้ name="..." ของฟอร์มตามข้อตกลง:
                // displayName, whatIEnjoy, whatIveTried, whatImCuriousAbout
                const res = await fetch("api/portfolios.php", {
                    method: "POST",
                    body: new FormData(portfolioForm)
                });
                if (!res.ok) throw new Error("HTTP " + res.status);

                alert("บันทึก Portfolio สำเร็จเรียบร้อย!");
                portfolioForm.reset();
                await refreshUI();
            } catch (err) {
                console.error("Failed to save portfolio:", err);
                alert("บันทึก Portfolio ไม่สำเร็จ กรุณาลองใหม่");
            }
        });
    }

    // -------------------------------------------------------------
    // 2. จัดการฟอร์มเพิ่ม Item (#item-form)
    // -------------------------------------------------------------
    const itemForm = document.getElementById("item-form");
    if (itemForm) {
        itemForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // ตรวจข้อมูลด้วย validate.js
            const result = window.PowerUpValidate.validateItemForm(itemForm);
            if (!result.valid) {
                alert(result.errors.join("\n"));
                return;
            }

            try {
                // FormData ส่ง portfolioId, title, type, date, role, description,
                // skills, whatIDid, whatILearned, challenge, nextStep, evidence
                const res = await fetch("api/items.php", {
                    method: "POST",
                    body: new FormData(itemForm)
                });
                if (!res.ok) throw new Error("HTTP " + res.status);

                alert("เพิ่ม Item เข้า Portfolio เรียบร้อยแล้ว!");
                itemForm.reset();
                await refreshUI();
            } catch (err) {
                console.error("Failed to add item:", err);
                alert("เพิ่ม Item ไม่สำเร็จ กรุณาลองใหม่");
            }
        });
    }

    // -------------------------------------------------------------
    // ฟังก์ชันอัปเดตหน้าจอ (โหลดจาก Server)
    // -------------------------------------------------------------
    async function loadPortfolios() {
        try {
            const res = await fetch("api/portfolios.php");
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error("Failed to load portfolios:", err);
            return [];
        }
    }

    async function refreshUI() {
        const portfolios = await loadPortfolios();
        updatePortfolioDropdown(portfolios);

        if (window.PowerUpRender && typeof window.PowerUpRender.renderPortfolios === "function") {
            window.PowerUpRender.renderPortfolios(portfolios);
        }
    }

    function updatePortfolioDropdown(portfolios) {
        const select = document.getElementById("portfolio-select");
        if (!select) return;

        select.innerHTML = '<option value="">-- Select a portfolio --</option>';

        portfolios.forEach(function (p) {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = p.displayName || `Portfolio ${p.id}`;
            select.appendChild(option);
        });
    }
});