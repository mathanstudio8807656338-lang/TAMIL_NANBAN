const fs = require('fs');
const path = require('path');

const files = [
    'json-db/lessons/mocktest/all/mt_9_ms.json',
    'json-db/lessons/mocktest/all/mt_9_ss.json'
];

files.forEach(fileRelPath => {
    const filePath = path.join(process.cwd(), fileRelPath);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${fileRelPath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fixedLines = lines.map(line => {
        const trimmed = line.trim();
        
        if (trimmed.includes(': "')) {
            const colonIndex = line.indexOf(':');
            const prefix = line.substring(0, colonIndex + 1);
            let valuePart = line.substring(colonIndex + 1).trim();
            let suffix = '';
            if (valuePart.endsWith(',')) {
                suffix = ',';
                valuePart = valuePart.slice(0, -1);
            }
            
            if (valuePart.startsWith('"') && valuePart.endsWith('"')) {
                let innerContent = valuePart.slice(1, -1);
                innerContent = innerContent.replace(/"/g, "'");
                innerContent = innerContent.replace(/\\/g, '\\\\');
                return `${prefix} "${innerContent}"${suffix}`;
            }
        } else if (trimmed.startsWith('"') && (trimmed.endsWith('",') || trimmed.endsWith('"'))) {
            let valuePart = trimmed;
            let suffix = '';
            if (valuePart.endsWith(',')) {
                suffix = ',';
                valuePart = valuePart.slice(0, -1);
            }
            
            if (valuePart.startsWith('"') && valuePart.endsWith('"')) {
                let innerContent = valuePart.slice(1, -1);
                innerContent = innerContent.replace(/"/g, "'");
                innerContent = innerContent.replace(/\\/g, '\\\\');
                
                const leadingSpaces = line.match(/^\s*/)[0];
                return `${leadingSpaces}"${innerContent}"${suffix}`;
            }
        }
        return line;
    });

    fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');
    console.log(`Fixed ${fileRelPath}`);
});
