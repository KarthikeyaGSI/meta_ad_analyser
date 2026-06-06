const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { from: /@\/components\//g, to: '@/client/components/' },
  { from: /@\/hooks\//g, to: '@/client/hooks/' },
  { from: /@\/store\//g, to: '@/client/store/' },
  { from: /@\/styles\.css/g, to: '@/client/styles.css' },
  { from: /@\/lib\//g, to: '@/shared/lib/' },
  { from: /@\/utils\//g, to: '@/shared/utils/' },
  { from: /@\/types\//g, to: '@/shared/types/' },
  { from: /@\/data\//g, to: '@/shared/data/' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      // Also handle relative imports if any? That's harder. Let's just do aliases first.
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done replacing imports.');
