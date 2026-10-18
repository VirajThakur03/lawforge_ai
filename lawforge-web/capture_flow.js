import { chromium } from 'playwright';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    // Hero
    await p.goto('http://localhost:5175');
    await p.waitForTimeout(3000);
    await p.screenshot({ path: 'dashboard_v3.png' });
    console.log('HERO_DONE');
    
    // Enter vault
    await p.click('button:has-text("Enter Vault")');
    await p.waitForTimeout(3000);
    await p.screenshot({ path: 'vault_v3.png' });
    console.log('VAULT_DONE');
    
    // Open country picker
    await p.click('button:has-text("Select Jurisdiction")');
    await p.waitForTimeout(1000);
    await p.screenshot({ path: 'country_picker_v3.png' });
    console.log('PICKER_DONE');
    
    // Select India
    await p.type('input[placeholder="Find jurisdiction..."]', 'India');
    await p.waitForTimeout(500);
    await p.click('text=India');
    await p.waitForTimeout(500);
    
    // Fill situation
    await p.fill('textarea', 'I was caught speeding at 95 km/h in a 60 zone in Bangalore. Police issued a challan and confiscated my license. What are my rights and what should I do?');
    await p.waitForTimeout(500);
    
    // Analyze
    await p.click('button:has-text("Analyze Intelligence")');
    await p.waitForTimeout(8000);
    await p.screenshot({ path: 'response_v3.png' });
    console.log('RESPONSE_DONE');
    
  } catch(e) {
    console.error('FAIL:', e.message);
    await p.screenshot({ path: 'screen_err_v3.png' }).catch(() => {});
  } finally {
    await b.close();
  }
})();
