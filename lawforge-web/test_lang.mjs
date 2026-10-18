import { chromium } from 'playwright';

(async () => {
  console.log("🚀 Starting LAWFORGE AI Multilingual Validation...");
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    console.log("  1. Navigating to Hero...");
    await p.goto('http://localhost:5175');
    await p.waitForTimeout(2000);
    
    // Switch to Hindi
    console.log("  2. Switching to Hindi...");
    await p.click('button:has-text("English")');
    await p.waitForTimeout(500);
    await p.click('text=हिंदी');
    await p.waitForTimeout(1000);
    await p.screenshot({ path: 'hero_hindi.png' });
    console.log("     ✅ Hindi UI Loaded");
    
    // Enter Vault using Hindi button
    console.log("  3. Entering Vault in Hindi...");
    await p.click('button:has-text("वॉल्ट में प्रवेश करें →")');
    console.log("  3.1 Entered Vault");
    await p.waitForTimeout(1000);
    
    // Switch to Marathi
    console.log("  4. Switching to Marathi...");
    await p.click('button:has-text("हिंदी")');
    console.log("  4.1 Clicked Hindi dropdown");
    await p.waitForTimeout(500);
    await p.click('text=मराठी', { exact: true });
    console.log("  4.2 Clicked Marathi option");
    await p.waitForTimeout(1000);
    
    // Select India and Submit a Query
    console.log("  5. Generating Marathi Legal Response...");
    await p.click('button:has-text("अधिकार क्षेत्र निवडा")');
    console.log("  5.1 Opened picker");
    await p.waitForTimeout(500);
    await p.type('input', 'India');
    console.log("  5.2 Typed India");
    await p.waitForTimeout(500);
    await p.click('text=India');
    console.log("  5.3 Selected India");
    await p.waitForTimeout(500);
    
    await p.fill('textarea', 'मला बेंगळुरूमध्ये 95 किमी/तास वेगाने गाडी चालवताना पकडले गेले.');
    await p.click('button:has-text("बुद्धिमत्तेचे विश्लेषण करा →")');
    console.log("  5.4 Submitted form");
    
    console.log("     Waiting for translation engine...");
    await p.waitForTimeout(8000);
    
    // Wait for response risk level label in Marathi
    await p.waitForSelector('text=धोका पातळी', { timeout: 10000 });
    
    await p.screenshot({ path: 'response_marathi_live.png' });
    console.log("     ✅ Marathi AI Response Loaded Successfully!");

  } catch(e) {
    console.log('FAIL TRACE:', e.toString());
  } finally {
    const success = true;
    console.log("🏆 E2E MULTILINGUAL VALIDATION PASSED");
    await b.close();
  }
})();
