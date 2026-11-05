// Save and load portfolios from localStorage

// All portfolios live under this single key as a JSON array.
const STORAGE_KEY = "powerup_portfolios";

// Generate a unique id like "p-1699999999999-482".
function generateId(prefix) {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

// Read the full portfolio array; never throw, return [] if missing or corrupt.
function getPortfolios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to read portfolios from localStorage:", e);
    return [];
  }
}

// Find one portfolio by its id, or null if not found.
function getPortfolioById(id) {
  return getPortfolios().find(function (p) {
    return p.id === id;
  }) || null;
}

// Insert a new portfolio or update an existing one (matched by id).
// Returns the saved portfolio with its id assigned.
function savePortfolio(portfolio) {
  if (!portfolio || typeof portfolio !== "object") {
    throw new Error("savePortfolio: portfolio object is required");
  }
  if (!portfolio.id) {
    portfolio.id = generateId("p");
  }
  if (!Array.isArray(portfolio.items)) {
    portfolio.items = [];
  }

  const portfolios = getPortfolios();
  const index = portfolios.findIndex(function (p) {
    return p.id === portfolio.id;
  });
  if (index >= 0) {
    portfolios[index] = portfolio;
  } else {
    portfolios.push(portfolio);
  }
  writePortfolios(portfolios);
  return portfolio;
}

// Add an item (e.g. a course assignment or project) to a portfolio.
// Skills and evidence accept a comma/newline-separated string and are
// converted to arrays so the stored shape stays consistent.
function addPortfolioItem(portfolioId, item) {
  if (!item || typeof item !== "object") {
    throw new Error("addPortfolioItem: item object is required");
  }

  const portfolio = getPortfolioById(portfolioId);
  if (!portfolio) {
    throw new Error("addPortfolioItem: portfolio not found: " + portfolioId);
  }

  if (!item.id) {
    item.id = generateId("i");
  }
  item.portfolioId = portfolioId;

  if (typeof item.skills === "string") {
    item.skills = item.skills
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }
  if (typeof item.evidence === "string") {
    item.evidence = item.evidence
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  portfolio.items.push(item);
  writePortfolios(getPortfolios().map(function (p) {
    return p.id === portfolioId ? portfolio : p;
  }));
  return item;
}

// Remove one item from a portfolio. Returns true if something was deleted.
function deletePortfolioItem(portfolioId, itemId) {
  const portfolio = getPortfolioById(portfolioId);
  if (!portfolio) return false;

  const before = portfolio.items.length;
  portfolio.items = portfolio.items.filter(function (it) {
    return it.id !== itemId;
  });
  if (portfolio.items.length === before) return false;

  writePortfolios(getPortfolios().map(function (p) {
    return p.id === portfolioId ? portfolio : p;
  }));
  return true;
}

// Write the array back to localStorage.
function writePortfolios(portfolios) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  } catch (e) {
    console.error("Failed to save portfolios to localStorage:", e);
    throw e;
  }
}

// Expose globally since the files are loaded as plain <script> tags.
window.PowerUpStorage = {
  STORAGE_KEY: STORAGE_KEY,
  generateId: generateId,
  getPortfolios: getPortfolios,
  getPortfolioById: getPortfolioById,
  savePortfolio: savePortfolio,
  addPortfolioItem: addPortfolioItem,
  deletePortfolioItem: deletePortfolioItem,
};
