const fs = require('fs');
const path = require('path');

function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) return content.slice(1);
    return content;
}

const filePath = path.join('c:', 'Users', 'MATHAN', '.gemini', 'antigravity', 'A1CoachingCentre', 'json-db', 'lessons', 'mocktest', 'all', 'mt_6_ms.json');
let content = fs.readFileSync(filePath, 'utf8');
content = stripBOM(content);
const rawArr = JSON.parse(content);
const first = rawArr[0];

console.log("Keys found in Node:");
Object.keys(first).forEach((k, i) => {
    console.log(`${i}: "${k}" (length: ${k.length})`);
});
