// scripts/scrape_legal_updates.js
// CommonJS wrapper delegating to modern ES module scraper pipeline
import('./scrape_legal_updates.mjs').catch(err => {
  console.error("Failed to execute scraper:", err);
  process.exit(1);
});
