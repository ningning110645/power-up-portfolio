(() => {
  const editor = document.getElementById("css-challenge-editor");
  const preview = document.getElementById("css-challenge-preview");

  function updatePreview() {
    const previewDocument = preview.contentDocument;
    if (!previewDocument?.head) return;

    let style = previewDocument.getElementById("challenge-user-css");
    if (!style) {
      style = previewDocument.createElement("style");
      style.id = "challenge-user-css";
      previewDocument.head.append(style);
    }

    style.textContent = editor.value;
  }

  preview.addEventListener("load", updatePreview);
  editor.addEventListener("input", updatePreview);
  updatePreview();
    const wheel = document.getElementById("css-challenge-wheel");
  const spinButton = document.getElementById("css-challenge-spin");
  const taskList = document.getElementById("css-challenge-tasks");

  const tasks = [
    "Make the heading purple.",
    "Center the heading.",
    "Make the heading at least 40px.",
    "Make the page background light yellow.",
    "Make the paragraph at least 20px.",
    "Make the paragraph italic.",
    "Make the button background navy.",
    "Make the button text white.",
    "Round the button corners to at least 12px.",
    "Give the button at least 12px of padding on all sides."
  ];

  let rotation = 0;

    const selectedTasks = [];
  spinButton.addEventListener("click", async () => {
    spinButton.disabled = true;
    taskList.replaceChildren();
    selectedTasks.length = 0;
    document.getElementById("css-challenge-result").textContent = "";
    const count = Math.random() < 0.5 ? 1 : 2;
    const remaining = tasks.map((_, index) => index);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (let round = 0; round < count; round++) {
      const pick = Math.floor(Math.random() * remaining.length);
      const [index] = remaining.splice(pick, 1);

      // Each slot is 36 degrees apart, with task 1 at the top.
      const target = (360 - index * 36) % 360;
      const turn = (target - rotation + 360) % 360;
      const end = rotation + 1080 + turn;

      if (!reduceMotion) {
        const spin = wheel.animate(
          [
            { transform: `rotate(${rotation}deg)` },
            { transform: `rotate(${end}deg)` }
          ],
          { duration: 1200, easing: "ease-out", fill: "forwards" }
        );
        await spin.finished;
        wheel.style.transform = `rotate(${target}deg)`;
        spin.cancel();
      } else {
        wheel.style.transform = `rotate(${target}deg)`;
      }

      rotation = target;
      selectedTasks.push(index);
      const item = document.createElement("li");
      item.textContent = `#${index + 1} · ${tasks[index]}`;
      taskList.append(item);
    }

    spinButton.disabled = false;
      const checkButton = document.getElementById("css-challenge-check");
  const result = document.getElementById("css-challenge-result");

  checkButton.addEventListener("click", () => {
    if (spinButton.disabled) {
      result.textContent = "Wait for the wheel to stop.";
      return;
    }

    if (selectedTasks.length === 0) {
      result.textContent = "Spin Challenge to get your tasks first.";
      return;
    }

    const page = preview.contentDocument;
    const heading = preview.contentWindow.getComputedStyle(page.querySelector("h1"));
    const body = preview.contentWindow.getComputedStyle(page.body);
    const paragraph = preview.contentWindow.getComputedStyle(page.querySelector("p"));
    const button = preview.contentWindow.getComputedStyle(page.querySelector("button"));

    const atLeast12px = (value) => value.endsWith("px") && parseFloat(value) >= 12;

    // Keep these checks in the same order as the tasks array.
    const passed = [
      heading.color === "rgb(128, 0, 128)",
      heading.textAlign === "center",
      parseFloat(heading.fontSize) >= 40,
      body.backgroundColor === "rgb(255, 255, 224)",
      parseFloat(paragraph.fontSize) >= 20,
      paragraph.fontStyle === "italic",
      button.backgroundColor === "rgb(0, 0, 128)",
      button.color === "rgb(255, 255, 255)",
      [
        button.borderTopLeftRadius,
        button.borderTopRightRadius,
        button.borderBottomRightRadius,
        button.borderBottomLeftRadius
      ].every((corner) => corner.split(" ").every(atLeast12px)),
      [
        button.paddingTop,
        button.paddingRight,
        button.paddingBottom,
        button.paddingLeft
      ].every(atLeast12px)
    ];

    result.textContent = selectedTasks.map((index) =>
      `#${index + 1}: ${passed[index] ? "Passed ✓" : "Try again"}`
    ).join(" · ");
  });
  });
})();