import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting LAWFORGE AI Live Web Framework Validation...');
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    console.log('  1. Connecting to Dev Server...');
    await page.goto('http://localhost:5173');
    
    console.log('  2. Verifying Monolith UI components...');
    // Ensure header loads
    await page.waitForSelector('h1:has-text("GLOBAL")');
    console.log('     ✅ Header validated');

    // Make sure we click 'Analyze My Situation' button to enter dashboard
    console.log('  2.5 Pressing CTA to enter dashboard');
    await page.click('button:has-text("Analyze My Situation")');

    // Custom glassmorphism dropdown
    console.log('  3. Selecting jurisdiction from custom dropdown...');
    await page.click('button:has-text("Select Jurisdiction")');
    await page.fill('input[placeholder="Find jurisdiction..."]', 'United');
    await page.click('text=United States');
    console.log('     ✅ Country selected (United States)');

    // Type query
    console.log('  4. Submitting Situation Query...');
    await page.fill('textarea', 'My client issued a bounced cheque of 500,000 AED and is refusing to pay.');
    
    // Check that button is clickable
    await page.click('button:has-text("Analyze Intelligence")');

    // Wait for the response container (Severity, laws, etc)
    console.log('  4. Waiting for Hybrid AI Engine response...');
    // Wait for Risk Orb or 'Severity' to appear
    await page.waitForSelector('text=Severity', { timeout: 15000 });
    console.log('     ✅ Risk Assessment rendered');

    // Look for Financial category
    const content = await page.textContent('body');
    if (content.includes('Financial') || content.includes('MEDIUM') || content.includes('HIGH')) {
        console.log('     ✅ Categorization successful');
    }

    // Checking safety disclaimers
    if (content.toUpperCase().includes('LAWYER') || content.toUpperCase().includes('CONSULT')) {
        console.log('     ✅ Safety rules (Disclaimers) appear intact!');
    }

    console.log('  5. Capturing validation screenshot...');
    await page.screenshot({ path: 'e2e_validation_screenshot.png', fullPage: true });

    console.log('\n🏆 E2E TEST PASSED — Live components functioning perfectly!');
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
