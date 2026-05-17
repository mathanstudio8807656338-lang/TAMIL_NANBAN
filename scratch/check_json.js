const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'json-db/lessons/mocktest/all/mt_8_ms.json');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('"question"') || trimmed.startsWith('"explanation"') || trimmed.includes(': "')) {
        try {
            let value = trimmed.substring(trimmed.indexOf(':') + 1).trim();
            if (value.endsWith(',')) value = value.slice(0, -1);
            if (value.startsWith('"')) {
                JSON.parse(value);
            }
        } catch (e) {
            console.log(`Line ${i + 1}: ${trimmed}`);
        }
    }
});
