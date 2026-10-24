/**
 * Build a short ObjectId prefix that is unique among the given id set.
 * Escalates length (6 → 8 → 10 → … → 24) when batch imports share a prefix.
 */
function uniqueShortId(id, allIds, minLen = 6) {
  const idStr = String(id || "").toLowerCase();
  if (!/^[0-9a-f]{6,24}$/.test(idStr)) return idStr;
  const pool = (allIds || []).map((x) => String(x).toLowerCase());
  for (let len = minLen; len <= 24; len += 2) {
    const prefix = idStr.substring(0, Math.min(len, idStr.length));
    const hits = pool.filter((o) => o.substring(0, prefix.length) === prefix);
    if (hits.length <= 1) return prefix;
  }
  return idStr;
}

/** True for obvious non-public / QA salons that must not enter the sitemap. */
function isExcludedFromSitemapSalonName(name) {
  const n = String(name || "")
    .trim()
    .toLowerCase();
  if (!n) return true;
  if (/^test(\b|[\s_-])/.test(n)) return true;
  if (/\bdebug\b/.test(n)) return true;
  if (n === "ty" || n === "test") return true;
  return false;
}

module.exports = {
  uniqueShortId,
  isExcludedFromSitemapSalonName,
};
