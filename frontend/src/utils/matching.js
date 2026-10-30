export function normalizeSkills(skills = []) {
  return skills.map(s => s.trim().toLowerCase()).filter(Boolean);
}

export function calculateMatch(studentSkills = [], requiredSkills = []) {
  const a = new Set(normalizeSkills(studentSkills));
  const required = normalizeSkills(requiredSkills);
  const matched = required.filter(s => a.has(s));
  const missing = required.filter(s => !a.has(s));
  const percentage = required.length ? Math.round((matched.length / required.length) * 100) : 0;
  return { percentage, matched, missing };
}
