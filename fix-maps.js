const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walk(dirPath, callback);
    else callback(dirPath);
  });
};

walk('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace arrays that are commonly mapped without optional chaining
    const patterns = [
      { regex: /breakdowns\.placements\.map/g, repl: '(breakdowns?.placements || []).map' },
      { regex: /breakdowns\.devices\.map/g, repl: '(breakdowns?.devices || []).map' },
      { regex: /breakdowns\.demographics\.map/g, repl: '(breakdowns?.demographics || []).map' },
      { regex: /breakdowns\.placements\.slice/g, repl: '(breakdowns?.placements || []).slice' },
      { regex: /breakdowns\.devices\.reduce/g, repl: '(breakdowns?.devices || []).reduce' },
      { regex: /breakdowns\.demographics\.reduce/g, repl: '(breakdowns?.demographics || []).reduce' },
      { regex: /campaignList\.map/g, repl: '(campaignList || []).map' },
      { regex: /creativeList\.map/g, repl: '(creativeList || []).map' },
      { regex: /adsetList\.map/g, repl: '(adsetList || []).map' },
      { regex: /recommendations\.map/g, repl: '(recommendations || []).map' },
      { regex: /topCampaigns\.map/g, repl: '(topCampaigns || []).map' },
      { regex: /worstCampaigns\.map/g, repl: '(worstCampaigns || []).map' },
      { regex: /accountsData\.map/g, repl: '(accountsData || []).map' },
      { regex: /availableAccounts\.map/g, repl: '(availableAccounts || []).map' },
      { regex: /campaigns\.map/g, repl: '(campaigns || []).map' },
      { regex: /creatives\.map/g, repl: '(creatives || []).map' },
      { regex: /chartData\.length/g, repl: '(chartData || []).length' },
      { regex: /creativeList\.length/g, repl: '(creativeList || []).length' },
      { regex: /campaignList\.length/g, repl: '(campaignList || []).length' },
      { regex: /adsetList\.length/g, repl: '(adsetList || []).length' },
    ];

    patterns.forEach(({ regex, repl }) => {
      if (regex.test(content)) {
        content = content.replace(regex, repl);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched: ${filePath}`);
    }
  }
});
