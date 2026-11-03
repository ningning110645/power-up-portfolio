
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
    title.textContent = portfolio.title || portfolio.name || "Untitled Portfolio";
    body.appendChild(title);

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
