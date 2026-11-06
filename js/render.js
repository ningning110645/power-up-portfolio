// Show one "Label: value" line under the portfolio name. Skips empty values.
function addPortfolioDetail(parent, label, value) {
    if (!value) return;
    const line = document.createElement("p");
    line.className = "card-text mb-1";
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    line.appendChild(strong);
    line.appendChild(document.createTextNode(String(value)));
    parent.appendChild(line);
}

function renderPortfolios(portfolios) {
    const container = document.getElementById("portfolio-view");
    if (!container) return;

    container.replaceChildren();

    if (!Array.isArray(portfolios) || portfolios.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No portfolios yet.";
        container.appendChild(message);
        return;
    }

    portfolios.forEach(function (portfolio) {
        const card = document.createElement("div");
        card.className = "card mb-4";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h3");
        title.className = "card-title";
        title.textContent = portfolio.name || portfolio.title || "Untitled Portfolio";
        body.appendChild(title);

        // Portfolio details (field names follow the portfolio JSON contract)
        addPortfolioDetail(body, "What I Enjoy", portfolio.whatIEnjoy);
        addPortfolioDetail(body, "What I've Tried", portfolio.whatIveTried);
        addPortfolioDetail(body, "What I'm Curious About", portfolio.whatImCuriousAbout);

        if (portfolio.description) {
            const description = document.createElement("p");
            description.className = "card-text";
            description.textContent = portfolio.description;
            body.appendChild(description);
        }

        const items = Array.isArray(portfolio.items) ? portfolio.items : [];

        const itemList = document.createElement("div");
        itemList.className = "row g-3 mt-2";

        items.forEach(function (item) {
            const column = document.createElement("div");
            column.className = "col-md-6";

            const itemCard = document.createElement("div");
            itemCard.className = "card h-100";

            const itemBody = document.createElement("div");
            itemBody.className = "card-body";

            const itemTitle = document.createElement("h5");
            itemTitle.className = "card-title";
            itemTitle.textContent = item.title || item.name || "Untitled Item";
            itemBody.appendChild(itemTitle);

            if (item.description) {
                const itemDescription = document.createElement("p");
                itemDescription.className = "card-text";
                itemDescription.textContent = item.description;
                itemBody.appendChild(itemDescription);
            }

            if (item.skills) {
                const skills = document.createElement("p");
                skills.className = "text-muted";
                skills.textContent = "Skills: " +
                    (Array.isArray(item.skills) ? item.skills.join(", ") : item.skills);
                itemBody.appendChild(skills);
            }

            function addDetail(label, value) {
                if (value === undefined || value === null || value === "") {
                    return;
                }

                const detail = document.createElement("p");
                detail.className = "card-text mb-2";

                const strong = document.createElement("strong");
                strong.textContent = label + ": ";

                detail.appendChild(strong);
                detail.appendChild(document.createTextNode(String(value)));
                itemBody.appendChild(detail);
            }

            addDetail("Type", item.type);
            addDetail("Date", item.date);
            addDetail("Role", item.role);
            // Reflection is an object with 4 answers, so show each one
            const reflection = item.reflection || {};
            addDetail("What I did", reflection.whatIDid);
            addDetail("What I learned", reflection.whatILearned);
            addDetail("Challenge", reflection.challenge);
            addDetail("Next step", reflection.nextStep);

            if (item.evidence) {
                const evidence = document.createElement("p");
                evidence.className = "card-text mb-2";

                const label = document.createElement("strong");
                label.textContent = "Evidence: ";
                evidence.appendChild(label);

                const values = Array.isArray(item.evidence)
                    ? item.evidence
                    : [item.evidence];

                values.forEach(function (value, index) {
                    const text = String(value);
                    const link = document.createElement("a");

                    if (/^https?:\/\//i.test(text)) {
                        link.href = text;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.textContent = "View Evidence " + (index + 1);
                        evidence.appendChild(link);
                    } else {
                        evidence.appendChild(document.createTextNode(text));
                    }

                    if (index < values.length - 1) {
                        evidence.appendChild(document.createTextNode(" | "));
                    }
                });

                itemBody.appendChild(evidence);
            }

            itemCard.appendChild(itemBody);
            column.appendChild(itemCard);
            itemList.appendChild(column);
        });

        body.appendChild(itemList);
        card.appendChild(body);
        container.appendChild(card);
    });
}

window.PowerUpRender = {
    renderPortfolios: renderPortfolios
};

function renderSavedPortfolios() {
    if (!window.PowerUpStorage ||
        typeof window.PowerUpStorage.getPortfolios !== "function") {
        console.warn("Portfolio storage is not available yet.");
        return;
    }

    const portfolios = window.PowerUpStorage.getPortfolios();
    renderPortfolios(portfolios);
}

window.PowerUpRender.renderSavedPortfolios = renderSavedPortfolios;