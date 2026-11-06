document.addEventListener("DOMContentLoaded", function () {
    refreshUI();

    // Read a field by id and remove spaces at both ends.
    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    }

    // Show all errors in one alert. Returns true if there were errors.
    function showErrors(errors) {
        if (errors.length === 0) return false;
        alert("⚠️ Please fix the following:\n\n- " + errors.join("\n- "));
        return true;
    }

    // -------------------------------------------------------------
    // 1. Create Portfolio form (#portfolio-form)
    // -------------------------------------------------------------
    const portfolioForm = document.getElementById("portfolio-form");
    if (portfolioForm) {
        portfolioForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const firstName = getValue("first-name");
            const lastName = getValue("last-name");

            // Field names follow the portfolio JSON contract.
            const portfolio = {
                name: (firstName + " " + lastName).trim(),
                whatIEnjoy: getValue("What-i-enjoy"),
                whatIveTried: getValue("what-i-tried"),
                whatImCuriousAbout: getValue("What-I'm-Curious-About"),
                items: []
            };

            if (showErrors(window.PowerUpValidate.validatePortfolio(portfolio))) return;

            window.PowerUpStorage.savePortfolio(portfolio);
            alert("✅ Portfolio saved!");
            portfolioForm.reset();
            refreshUI();
        });
    }

    // -------------------------------------------------------------
    // 2. Add Portfolio Item form (#item-form)
    // -------------------------------------------------------------
    const itemForm = document.getElementById("item-form");
    if (itemForm) {
        itemForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const portfolioId = getValue("portfolio-select");
            const splitList = window.PowerUpValidate.splitList;

            // Same shape as portfolio-example.json
            const item = {
                title: getValue("title"),
                type: getValue("type"),
                date: getValue("date"),
                role: getValue("role"),
                description: getValue("description"),
                skills: splitList(getValue("skills")),
                reflection: {
                    whatIDid: getValue("whatIDid"),
                    whatILearned: getValue("whatILearned"),
                    challenge: getValue("challenge"),
                    nextStep: getValue("nextStep")
                },
                evidence: splitList(getValue("evidence"))
            };

            // Do not save anything if the data is wrong.
            if (showErrors(window.PowerUpValidate.validateItem(portfolioId, item))) return;

            window.PowerUpStorage.addPortfolioItem(portfolioId, item);
            alert("✅ Portfolio Item added!");
            itemForm.reset();
            refreshUI();
            // Keep the same portfolio selected so the user can add another item quickly.
            document.getElementById("portfolio-select").value = portfolioId;
        });
    }

    // -------------------------------------------------------------
    // Update the page
    // -------------------------------------------------------------
    function refreshUI() {
        updatePortfolioDropdown();
        window.PowerUpRender.renderSavedPortfolios();
    }

    function updatePortfolioDropdown() {
        const select = document.getElementById("portfolio-select");
        if (!select) return;

        const portfolios = window.PowerUpStorage.getPortfolios();
        select.innerHTML = '<option value="">-- Select a portfolio --</option>';

        portfolios.forEach(function (p) {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = p.name || p.title || "Portfolio " + p.id;
            select.appendChild(option);
        });
    }
});