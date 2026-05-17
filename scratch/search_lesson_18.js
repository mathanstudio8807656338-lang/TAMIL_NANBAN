const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== '.git' && file !== '.gemini' && file !== 'node_modules') {
                search(fullPath);
            }
        } else if (file.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Lesson 18') || content.includes('Unit 18') || content.includes('l18')) {
                console.log(`Found in: ${fullPath}`);
            }
        }
    }
}

search('C:\\Users\\MATHAN\\Desktop');
