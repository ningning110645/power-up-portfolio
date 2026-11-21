# Handoff: Real-Browser Testing of `js/storage.js` (Issue #5)

## Context
- Repo: `ningning110645/power-up-portfolio`, branch **`feature/storage`**, commit `25440d5`.
- Feature implemented: `js/storage.js` — save/load portfolios to `localStorage` via a global `window.PowerUpStorage` API.
- Teammates' forms are NOT merged yet. The Create Portfolio form (Issue #2) and Add Item form (Issue #3) have no JS wiring, so testing must be done through the DevTools console, not the UI.
- The page is plain static HTML: open it with a static server or Live Server (opening via `file://` may block localStorage in some browsers — prefer http://localhost).

## How to run the site
```bash
cd /home/poom/power-up-portfolio
git checkout feature/storage   # should already be checked out
python3 -m http.server 8000
# open http://localhost:8000 in a real browser
```

## API under test (`window.PowerUpStorage`)
| Function | Behavior |
|---|---|
| `getPortfolios()` | Returns array of portfolios (or `[]` if missing/corrupt) |
| `getPortfolioById(id)` | Returns portfolio object or `null` |
| `savePortfolio(obj)` | Insert or update by `obj.id`; assigns id `p-<ts>-<rand>` if missing; ensures `items: []` |
| `addPortfolioItem(portfolioId, item)` | Appends item to that portfolio's `items`; assigns item id `i-<ts>-<rand>`; sets `item.portfolioId`; converts string `skills` (comma-separated) and `evidence` (newline-separated) to arrays |
| `deletePortfolioItem(portfolioId, itemId)` | Removes item; returns `true`/`false` |

Storage key: **`powerup_portfolios`** (constant `PowerUpStorage.STORAGE_KEY`). Value is a JSON array:
```json
[{ "id": "p-...", "name": "...", "items": [{ "id": "i-...", "portfolioId": "p-...", "title": "...", "skills": ["..."], "evidence": ["..."], "reflection": {...} }] }]
```

## Test procedure (run in the browser console at http://localhost:8000)

### Test 1 — Save and survive refresh (the issue's acceptance test)
```js
const p1 = PowerUpStorage.savePortfolio({ name: "Poom", whatIEnjoy: "coding", whatIveTried: "web", whatImCuriousAbout: "AI" });
const p2 = PowerUpStorage.savePortfolio({ name: "Tester2" });
PowerUpStorage.addPortfolioItem(p1.id, { title: "HW1", type: "Course Assignment", date: "2026-10-01", role: "Dev", description: "desc", skills: "HTML, CSS, Teamwork", whatIDid: "x", whatILearned: "y", challenge: "z", nextStep: "w", evidence: "https://a.com\nhttps://b.com" });
PowerUpStorage.addPortfolioItem(p1.id, { title: "HW2", type: "Personal Project", date: "2026-10-02", role: "Dev", description: "desc", skills: "JS", evidence: "https://c.com" });
PowerUpStorage.addPortfolioItem(p2.id, { title: "Other1", type: "Activity", date: "2026-10-03", role: "Member", description: "desc", skills: "Comms", evidence: "https://d.com" });
PowerUpStorage.addPortfolioItem(p2.id, { title: "Other2", type: "Competition", date: "2026-10-04", role: "Member", description: "desc", skills: "", evidence: "" });
```
**Now reload the page (hard refresh), then:**
```js
const all = PowerUpStorage.getPortfolios();
console.log(all);
```
Expected:
- 2 portfolios; `all[0].items.length === 2`, `all[1].items.length === 2`
- Every item in portfolio 1 has `portfolioId === all[0].id` (no mixing)
- `all[0].items[0].skills` is `["HTML","CSS","Teamwork"]` (array, not string)
- `all[0].items[0].evidence` is `["https://a.com","https://b.com"]`
- Also check DevTools → Application → Local Storage → `powerup_portfolios` shows the JSON.

### Test 2 — Corrupt data recovery
```js
localStorage.setItem("powerup_portfolios", "{broken json");
PowerUpStorage.getPortfolios()   // must return [] and log an error, not throw
```

### Test 3 — Update and delete
```js
// (re-create sample data first if storage was cleared)
const p = PowerUpStorage.getPortfolios()[0];
p.name = "Poom (updated)";
PowerUpStorage.savePortfolio(p);
PowerUpStorage.getPortfolios().length            // still 2, no duplicate
PowerUpStorage.deletePortfolioItem(p.id, p.items[0].id)  // true
PowerUpStorage.getPortfolioById(p.id).items.length       // 1
```

### Cleanup
```js
localStorage.removeItem("powerup_portfolios");
```

## Pass criteria
All expected values above match, no uncaught errors in the console, and the page itself still loads without JS errors (index.html loads storage.js at the bottom).

## Known out of scope
- `render.js` (Issue #6), `validate.js`, HTML form wiring — teammates' work, not this feature.
- If a browser blocks localStorage (e.g. `file://` in some configs, private mode edge cases), report the browser/mode rather than failing the feature.
