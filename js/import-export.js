// Import / Export for the Challenge Festival (Final Demo)
// - Import: paste an Item JSON from another group's Challenge -> fill the Add Item form
// - Export: download my Portfolio as my-portfolio.json

// Field names from the Data Contract (portfolio-example.json)
const ITEM_TEXT_FIELDS = ["title", "type", "date", "role", "description"];
const REFLECTION_FIELDS = ["whatIDid", "whatILearned", "challenge", "nextStep"];

// Show a message under a button: red for errors, green for success
function showMessage(elementId, text, isError) {
  const element = document.getElementById(elementId);
  element.textContent = text;
  element.className = "small mt-2 mb-0 " + (isError ? "text-danger" : "text-success");
}

// =====================================================
// 1. IMPORT an Item JSON
// =====================================================

// Check that the pasted object looks like a Portfolio Item.
// Returns a list of problems (empty list = OK).
function checkItem(item) {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    return ["Paste ONE Item that starts with { and ends with }"];
  }

  // my-portfolio.json is a whole Portfolio (it has "items"), not one Item
  if (Array.isArray(item.items)) {
    return ['this is a whole Portfolio (my-portfolio.json), not one Item. Paste the "Generated Item JSON" from a Challenge instead'];
  }

  const errors = [];
  for (const field of ITEM_TEXT_FIELDS) {
    if (typeof item[field] !== "string" || item[field].trim() === "") {
      errors.push('"' + field + '" is missing');
    }
  }
  if (!Array.isArray(item.skills) || item.skills.length === 0) {
    errors.push('"skills" must be a list, e.g. ["HTML", "CSS"]');
  }
  if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
    errors.push('"evidence" must be a list with at least 1 link');
  }
  // reflection can be empty: the player writes their own Reflection after importing
  return errors;
}

// Put the Item's values into the Add Item form
function fillItemForm(item) {
  for (const field of ITEM_TEXT_FIELDS) {
    document.getElementById(field).value = item[field];
  }
  document.getElementById("skills").value = item.skills.join(", ");
  document.getElementById("evidence").value = item.evidence.join("\n");

  const reflection = item.reflection || {};
  for (const field of REFLECTION_FIELDS) {
    document.getElementById(field).value = reflection[field] || "";
  }

  document.getElementById("challengeId").value = item.challengeId || "";
}

document.getElementById("import-btn").addEventListener("click", function () {
  const text = document.getElementById("import-json").value.trim();
  if (text === "") {
    showMessage("import-message", "Please paste an Item JSON first.", true);
    return;
  }

  // Text -> JavaScript object. A broken JSON text throws an error.
  let item;
  try {
    item = JSON.parse(text);
  } catch (error) {
    showMessage("import-message", "This is not valid JSON. Copy the whole text, from { to }.", true);
    return;
  }

  const errors = checkItem(item);
  if (errors.length > 0) {
    showMessage("import-message", "Cannot import: " + errors.join(", "), true);
    return;
  }

  fillItemForm(item);

  // A <select> only accepts values from its own list
  if (document.getElementById("type").value !== item.type) {
    showMessage("import-message", 'Form filled, but Type "' + item.type + '" is not in our list. Please choose a Type.', true);
    return;
  }

  showMessage("import-message", "✅ Form filled! Choose your Portfolio, write your own Reflection, then click Add Item.", false);
});

// The host may give a .json file instead of text:
// read the file, put its text in the box, then fill the form right away
document.getElementById("import-file").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;
  document.getElementById("import-json").value = await file.text();
  this.value = "";                                   // allow choosing the same file again
  document.getElementById("import-btn").click();
});

// form.reset() does not clear hidden inputs, so clear challengeId ourselves
document.getElementById("item-form").addEventListener("reset", function () {
  document.getElementById("challengeId").value = "";
});

// =====================================================
// 2. EXPORT my Portfolio as my-portfolio.json
// =====================================================

// Get all Portfolios: from the server if it is running (Module 13),
// otherwise from localStorage (Checkpoint version)
async function getAllPortfolios() {
  try {
    const response = await fetch("api/portfolios.php");
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // no PHP server here (e.g. Live Server) -> use localStorage below
  }
  return window.PowerUpStorage ? window.PowerUpStorage.getPortfolios() : [];
}

// Make the browser download a text file
function downloadFile(fileName, text) {
  const file = new Blob([text], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById("export-btn").addEventListener("click", async function () {
  const portfolioId = document.getElementById("portfolio-select").value;
  if (!portfolioId) {
    showMessage("export-message", 'Choose your Portfolio in the "Add Portfolio Item" form first.', true);
    return;
  }

  const portfolios = await getAllPortfolios();
  const portfolio = portfolios.find(function (p) { return p.id === portfolioId; });
  if (!portfolio) {
    showMessage("export-message", "Portfolio not found. Refresh the page and try again.", true);
    return;
  }

  // JavaScript object -> pretty JSON text (2 spaces)
  const json = JSON.stringify(portfolio, null, 2);
  document.getElementById("export-json").value = json;
  downloadFile("my-portfolio.json", json);
  showMessage("export-message", "✅ Downloaded my-portfolio.json (you can also copy it from the box).", false);
});

// Copy the exported JSON, e.g. to paste into a chat or a form
document.getElementById("copy-export-btn").addEventListener("click", async function () {
  const box = document.getElementById("export-json");
  if (box.value === "") {
    showMessage("export-message", "Click Export first, then Copy.", true);
    return;
  }

  // navigator.clipboard only works on https or localhost.
  // Our EC2 uses http://<IP>, so we also need the older way: select the text + copy.
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(box.value);
    } else {
      box.select();
      if (!document.execCommand("copy")) throw new Error("copy failed");
    }
    showMessage("export-message", "✅ Copied! Paste it anywhere with Cmd/Ctrl + V.", false);
  } catch (error) {
    box.select();
    showMessage("export-message", "Could not copy automatically. The text is selected: press Cmd/Ctrl + C.", true);
  }
});

 
// =====================================================
// 3. GENERATE Challenge Item JSON
// =====================================================
async function loadChallengePortfolios() {
  const select = document.getElementById("challenge-portfolio-select");
  const status = document.getElementById("saved-challenges-status");
  const list = document.getElementById("saved-challenges-list");
  if (!select || !status || !list) return;

  const selectedId = select.value;
  status.textContent = "Loading saved challenges…";

  try {
    const response = await fetch("api/portfolios.php", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load portfolios.");

    const portfolios = await response.json();
    select.options.length = 1;
    select.options[0].textContent = portfolios.length
      ? "Select a portfolio"
      : "No portfolios on the server yet";

    for (const portfolio of portfolios) {
      select.add(new Option(portfolio.displayName, portfolio.id));
    }

    select.value = portfolios.some((p) => p.id === selectedId) ? selectedId : "";

    select.onchange = () => {
      list.replaceChildren();
      const portfolio = portfolios.find((p) => p.id === select.value);

      if (!portfolio) {
        status.textContent = "Select a portfolio to see its saved challenges.";
        return;
      }

      const challenges = (portfolio.items || []).filter((item) => item.type === "Challenge");
      status.textContent = challenges.length ? "" : "No saved challenges in this portfolio yet.";

      for (const item of challenges) {
        const row = document.createElement("li");
        row.textContent = item.title;

        for (const url of item.evidence || []) {
          if (!/^https?:\/\//i.test(url)) continue;

          const link = document.createElement("a");
          link.href = url;
          link.textContent = "Open evidence";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "ms-2";
          row.append(link);
        }

        list.append(row);
      }
    };

    select.onchange();
  } catch {
    list.replaceChildren();
    select.options[0].textContent = "Could not load portfolios from the server";
    status.textContent = "Could not load saved challenges from the server.";
  }
}

loadChallengePortfolios();

document.getElementById("challenge-form").addEventListener("submit", async function (event) {  event.preventDefault();
  if (event.currentTarget.dataset.cssPassed !== "true") {
    showMessage("challenge-message", "Pass all CSS tasks before completing the challenge.", true);
    return;
  }
  const title = document.getElementById("challenge-title").value.trim();
  const description = document.getElementById("challenge-description").value.trim();

  const skills = document.getElementById("challenge-skills").value
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill !== "");

    const evidenceUrl = new URL(window.location.href);
  evidenceUrl.hash = new URLSearchParams({
    css: document.getElementById("css-challenge-editor").value
  }).toString();

  const evidence = [
    evidenceUrl.href,
    ...document.getElementById("challenge-evidence").value
      .split(/[,\n]+/)
      .map((link) => link.trim())
      .filter((link) => link !== "")
  ];

  if (!title || !description || skills.length === 0 || evidence.length === 0) {
    showMessage("challenge-message", "Please complete all fields.", true);
    return;
  }

  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const item = {
    title: title,
    type: "Challenge",
    date: localDate,
    role: "Participant",
    description: description,
    skills: skills,
         reflection: {
      whatIDid: document.getElementById("challenge-what-i-did").value.trim(),
      whatILearned: document.getElementById("challenge-what-i-learned").value.trim(),
      challenge: document.getElementById("challenge-reflection").value.trim(),
      nextStep: document.getElementById("challenge-next-step").value.trim()
    },
    evidence: evidence
  };

  document.getElementById("challenge-output").value =
    JSON.stringify(item, null, 2);
    const portfolioId = document.getElementById("challenge-portfolio-select").value;

  if (portfolioId) {
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch("api/items.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, portfolioId })
      });

      if (!response.ok) throw new Error("Could not save the item.");

      showMessage("challenge-message", "Item saved to your portfolio!", false);
      await loadChallengePortfolios();
    } catch {
      showMessage("challenge-message", "Could not save to the server. You can still copy the Item JSON.", true);
      return;
    } finally {
      submitButton.disabled = false;
    }
  } else {
    showMessage("challenge-message", "Item JSON generated. Select a portfolio to save it to the server.", false);
  }

  const progress = document.getElementById("challenge-progress");
  const status = document.getElementById("challenge-status");
  const badge = document.getElementById("challenge-badge");

  progress.style.width = "100%";
  progress.setAttribute("aria-valuenow", "100");

  status.textContent = "Quest completed successfully!";
  status.classList.remove("text-muted");
  status.classList.add("text-success");

  badge.classList.remove("d-none");

  // Confetti celebration
  const colors = ["#FFD700", "#FF69B4", "#00BFFF", "#32CD32", "#FF6347"];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "challenge-confetti";

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + "s";

    document.body.appendChild(confetti);

    confetti.addEventListener("animationend", function () {
      confetti.remove();
    });
  }

});