(function () {

  function readValue(form, name) {
    const el = form.elements[name];
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function splitList(text) {
    const result = [];
    const parts = text.split(",");
    for (let i = 0; i < parts.length; i++) {
      const s = parts[i].trim();
      if (s !== "") result.push(s);
    }
    return result;
  }


  function validateItemForm(form) {
    const errors = [];

    const portfolioId = readValue(form, "portfolio-select");
    const title = readValue(form, "title");
    const type = readValue(form, "type");
    const date = readValue(form, "date");
    const role = readValue(form, "role");
    const description = readValue(form, "description");
    const skillsText = readValue(form, "skills");
    const whatIDid = readValue(form, "whatIDid");
    const whatILearned = readValue(form, "whatILearned");
    const challenge = readValue(form, "challenge");
    const nextStep = readValue(form, "nextStep");
    const evidenceText = readValue(form, "evidence");

    if (portfolioId === "") errors.push("Please select a Portfolio.");
    if (title === "") errors.push("Please enter a Title.");
    if (type === "") errors.push("Please choose or enter a Type.");
    if (role === "") errors.push("Please enter your Role.");
    if (description === "") errors.push("Please enter a Description.");
    if (whatIDid === "") errors.push("Please fill in \"What I did\".");
    if (whatILearned === "") errors.push("Please fill in \"What I learned\".");
    if (challenge === "") errors.push("Please fill in \"Challenge\".");
    if (nextStep === "") errors.push("Please fill in \"Next step\".");

    if (date === "") {
      errors.push("Please enter a date.");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push("Date format is wrong. Use YYYY-MM-DD, for example 2026-10-18.");
    } else {
      const parts = date.split("-");
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      const check = new Date(y, m - 1, d);
      if (check.getFullYear() !== y || check.getMonth() !== m - 1 || check.getDate() !== d) {
        errors.push("This date does not exist. Please check it again.");
      }
    }

    const skills = splitList(skillsText);
    if (skills.length === 0) {
      errors.push("Please enter at least 1 skill. Separate skills with commas, for example: HTML, CSS, JavaScript.");
    }

    const evidence = splitList(evidenceText);
    if (evidence.length === 0) {
      errors.push("Please enter at least 1 evidence link.");
    } else {
      for (let i = 0; i < evidence.length; i++) {
        if (!/^https?:\/\/\S+\.\S+$/.test(evidence[i])) {
          errors.push("Invalid link: " + evidence[i] + " (it must start with http:// or https://)");
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors: errors, item: null };
    }


    const item = {
      title: title,
      type: type,
      date: date,
      role: role,
      description: description,
      skills: skills,
      reflection: {
        whatIDid: whatIDid,
        whatILearned: whatILearned,
        challenge: challenge,
        nextStep: nextStep
      },
      evidence: evidence
    };

    return { valid: true, errors: [], item: item, portfolioId: portfolioId };
  }


  function validatePortfolioForm(form) {
    const errors = [];

    const firstName = readValue(form, "first-name");
    const lastName = readValue(form, "last-name");
    const enjoy = readValue(form, "What-i-enjoy");
    const tried = readValue(form, "what-i-tried");
    const curious = readValue(form, "What-I'm-Curious-About");

    if (firstName === "" && lastName === "") {
      errors.push("Please enter a First name or Last name.");
    }
    if (enjoy === "") errors.push("Please fill in \"What I Enjoy\".");
    if (tried === "") errors.push("Please fill in \"What I've Tried\".");
    if (curious === "") errors.push("Please fill in \"What I'm Curious About\".");

    if (errors.length > 0) {
      return { valid: false, errors: errors, portfolio: null };
    }

    return {
      valid: true,
      errors: [],
      portfolio: { firstName: firstName, lastName: lastName, enjoy: enjoy, tried: tried, curious: curious }
    };
  }

  window.PowerUpValidate = {
    validateItemForm: validateItemForm,
    validatePortfolioForm: validatePortfolioForm
  };
})();