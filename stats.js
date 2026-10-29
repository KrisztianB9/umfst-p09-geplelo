(function exposeStats(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TypingStats = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createStats() {
  "use strict";

  function wpm(helyesKarakter, eltelMs) {
    const chars = Number(helyesKarakter);
    const elapsed = Number(eltelMs);
    if (!Number.isFinite(chars) || !Number.isFinite(elapsed) || chars <= 0 || elapsed <= 0) return 0;
    return (chars / 5) / (elapsed / 60_000);
  }

  function pontossag(helyes, osszesLeutes) {
    const correct = Number(helyes);
    const total = Number(osszesLeutes);
    if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) return 100;
    return Math.round(Math.min(100, Math.max(0, correct / total * 100)));
  }

  return { wpm, pontossag };
});
