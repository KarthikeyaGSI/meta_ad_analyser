const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const targets = {
  'components': 'client/components',
  'hooks': 'client/hooks',
  'store': 'client/store',
  'styles.css': 'client/styles.css',
  'lib': 'shared/lib',
  'utils': 'shared/utils',
  'types': 'shared/types',
  'data': 'shared/data'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      const originalContent = fs.readFileSync(fullPath, 'utf8');
      let content = originalContent;

      const regex = /(from\s+|import\s+)['"](\.\.?[^'"]+)['"]/g;
      content = content.replace(regex, (match, p1, p2) => {
        const absTarget = path.resolve(dir, p2);
        for (const [oldName, newName] of Object.entries(targets)) {
          const oldTargetDir = path.join(srcDir, oldName);
          if (absTarget === oldTargetDir || absTarget.startsWith(oldTargetDir + path.sep)) {
            const newTargetDir = path.join(srcDir, newName);
            const newAbsTarget = absTarget.replace(oldTargetDir, newTargetDir);
            let newRelTarget = path.relative(dir, newAbsTarget).replace(/\\/g, '/');
            if (!newRelTarget.startsWith('.')) {
              newRelTarget = './' + newRelTarget;
            }
            return `${p1}'${newRelTarget}'`;
          }
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated relative imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done replacing relative imports.');
