const fs = require('fs');
const path = require('path');

function fixModelImports(directory) {
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && file !== 'node_modules') {
        traverseDirectory(fullPath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace imports like import Model from '@/models/model'
        const importRegex = /import\s+(\w+)\s+from\s+['"]@\/models\/([A-Z]\w+)['"]/g;
        const newContent = content.replace(importRegex, (match, importName, modelName) => {
          return `import ${importName} from '@/models/${modelName.toLowerCase()}'`;
        });

        if (content !== newContent) {
          console.log(`Modified: ${fullPath}`);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      }
    });
  }

  traverseDirectory(directory);
}

// Run the script on the project directory
fixModelImports('c:/Users/lenovo/Documents/Projects/next-real-state');
