document.addEventListener("DOMContentLoaded", function () {
    const textBox = document.getElementById("import-challenge-text");
    const fileInput = document.getElementById("import-challenge-file");
    const importBtn = document.getElementById("import-challenge-btn");
    const message = document.getElementById("import-challenge-message");
    const view = document.getElementById("import-challenge-view");
    if (!textBox || !importBtn || !view) return;

    const CATEGORIES = ["discover", "mix", "levelup"];

    function validateChallenge(c) {
        if (!c || typeof c !== "object" || Array.isArray(c)) {
            return ["JSON ต้องเป็น Challenge หนึ่งรายการ (object)"];
        }
        const errors = [];
        ["id", "creatorGroup", "title", "description", "evidencePrompt"].forEach(function (key) {
            if (typeof c[key] !== "string" || !c[key].trim()) {
                errors.push("ต้องมี " + key + " เป็นข้อความ");
            }
        });
        if (c.schemaVersion !== "1.0") {
            errors.push('schemaVersion ต้องเป็น "1.0"');
        }
        if (!CATEGORIES.includes(c.category)) {
            errors.push("category ต้องเป็น discover, mix หรือ levelup");
        }
        if (!Array.isArray(c.instructions) || c.instructions.length < 1 ||
            !c.instructions.every(function (s) { return typeof s === "string" && s.trim(); })) {
            errors.push("instructions ต้องเป็นรายการข้อความอย่างน้อย 1 ข้อ");
        }
        if (typeof c.estimatedMinutes !== "number" || !(c.estimatedMinutes > 0)) {
            errors.push("estimatedMinutes ต้องเป็นตัวเลข");
        }
        if (c.tags !== undefined && !Array.isArray(c.tags)) {
            errors.push("tags ต้องเป็น array");
        }
        return errors;
    }

    function showMessage(text, isError) {
        message.textContent = text;
        message.className = "mt-2 " + (isError ? "text-danger" : "text-success");
    }

    function addText(parent, tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        el.textContent = text;
        parent.appendChild(el);
        return el;
    }

    function renderChallenge(c) {
        view.replaceChildren();

        const card = document.createElement("div");
        card.className = "card border-primary mt-4";
        const body = document.createElement("div");
        body.className = "card-body";

        addText(body, "h3", "card-title", c.title);
        addText(body, "p", "text-muted mb-2",
            "Category: " + c.category + " | " + c.estimatedMinutes + " min | From: " + c.creatorGroup);
        addText(body, "p", "card-text", c.description);

        addText(body, "h5", "mt-3", "Instructions");
        const ol = document.createElement("ol");
        c.instructions.forEach(function (step) { addText(ol, "li", "", step); });
        body.appendChild(ol);

        addText(body, "h5", "mt-3", "Evidence Prompt");
        addText(body, "p", "card-text", c.evidencePrompt);

        if (Array.isArray(c.tags) && c.tags.length > 0) {
            addText(body, "p", "text-muted", "Tags: " + c.tags.join(", "));
        }

        card.appendChild(body);
        view.appendChild(card);
    }

    function importFromText(raw) {
        view.replaceChildren();
        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            showMessage("JSON ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบอีกครั้ง", true);
            return;
        }
        const errors = validateChallenge(data);
        if (errors.length > 0) {
            showMessage(errors.join(" / "), true);
            return;
        }
        renderChallenge(data);
        showMessage("Import Challenge สำเร็จ", false);
    }

    importBtn.addEventListener("click", function () {
        const raw = textBox.value.trim();
        if (!raw) {
            showMessage("กรุณาวาง JSON ของ Challenge ก่อน", true);
            return;
        }
        importFromText(raw);
    });

    if (fileInput) {
        fileInput.addEventListener("change", async function () {
            const file = fileInput.files[0];
            if (!file) return;
            const raw = await file.text();
            textBox.value = raw;
            importFromText(raw);
            fileInput.value = "";
        });
    }
});