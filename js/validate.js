const data = new FormData(form);
const errors = [];

const title = (data.get("title") || "").trim();
const type = (data.get("type") || "").trim();
const date = (data.get("date") || "").trim();
const role = (data.get("role") || "").trim();
const description = (data.get("description") || "").trim();
const skillsText = (data.get("skills") || "").trim();
const whatIDid = (data.get("whatIDid") || "").trim();
const whatILearned = (data.get("whatILearned") || "").trim();
const challenge = (data.get("challenge") || "").trim();
const nextStep = (data.get("nextStep") || "").trim();
const evidenceText = (data.get("evidence") || "").trim();

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

const skills = [];
const skillParts = skillsText.split(",");
for (let i = 0; i < skillParts.length; i++) {
  const s = skillParts[i].trim();
  if (s !== "") skills.push(s);
}
if (skills.length === 0) {
  errors.push("Please enter at least 1 skill. Separate skills with commas, for example: HTML, CSS, JavaScript.");
}

const evidence = [];
const evidenceParts = evidenceText.split(",");
for (let i = 0; i < evidenceParts.length; i++) {
  const e = evidenceParts[i].trim();
  if (e !== "") evidence.push(e);
}
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
  alert(errors.join("\n"));
  return;
}

const item = {
  title: title,
  type: type,
  date: date,
  role: role,
  description: description,
  skills: skills,          
  whatIDid: whatIDid,
  whatILearned: whatILearned,
  challenge: challenge,
  nextStep: nextStep,
  evidence: evidence        
};
 