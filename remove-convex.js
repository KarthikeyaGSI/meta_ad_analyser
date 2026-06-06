const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

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

      // Remove convex imports
      content = content.replace(/import\s+.*?\s+from\s+['"]convex\/.*?['"];?/g, '// convex import removed');
      content = content.replace(/import\s+.*?\s+from\s+['"]@convex\/.*?['"];?/g, '// convex import removed');
      
      // Comment out useQuery and useMutation
      content = content.split('\n').map(line => {
        if (line.includes('useQuery(api.') || line.includes('useMutation(api.') || line.includes('api.')) {
          // Careful not to comment out normal api.ts references unless it's Convex's api
          // Wait, 'api' might be used from other things. Let's just comment lines with 'useQuery(' or 'useMutation('
          if (line.includes('useQuery(') || line.includes('useMutation(')) {
             return `// ${line} /* convex hook removed */`;
          }
        }
        return line;
      }).join('\n');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned Convex references in ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Convex cleanup complete.');
