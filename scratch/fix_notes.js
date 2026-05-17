const fs = require('fs');
const path = require('path');
const dirPath = path.join(__dirname, '../json-db/lessons/social/7/');

const filesToProcess = [];
for (let i = 4; i <= 7; i++) filesToProcess.push(`soc_7_t2_l${i}.json`);
for (let i = 1; i <= 10; i++) filesToProcess.push(`soc_7_t3_l${i}.json`);

function fixSectionContent(section) {
    if (typeof section.content === 'string') {
        let textStr = section.content.trim();
        // Check if it's a stringified JSON
        if (textStr.startsWith('{') && textStr.endsWith('}')) {
            try {
                let parsed = JSON.parse(textStr);
                let title = parsed.heading || parsed['தலைப்பு'] || section.title;
                let text = parsed.content || parsed['விவரங்கள்'] || parsed.text || '';
                
                section.title = title;
                
                // Now split the text by newlines so they become separate paragraphs
                if (typeof text === 'string') {
                    // Split by \n, \r\n, etc.
                    let lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length > 1) {
                        section.content = lines;
                    } else {
                        section.content = text;
                    }
                } else {
                    section.content = text;
                }
            } catch (e) {
                // Not a valid JSON, just do the newline split
                let lines = textStr.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length > 1) {
                    section.content = lines;
                }
            }
        } else {
            // Just normal string, split by newline
            let lines = textStr.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 1) {
                section.content = lines;
            }
        }
    } else if (Array.isArray(section.content)) {
        // It's already an array, maybe elements need splitting?
        let newContent = [];
        for (let item of section.content) {
            if (typeof item === 'string') {
                let lines = item.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
                newContent.push(...lines);
            } else {
                newContent.push(item);
            }
        }
        section.content = newContent;
    }
}

filesToProcess.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (!fs.existsSync(filePath)) return;
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.material && data.material.sections) {
        data.material.sections.forEach(fixSectionContent);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Fixed ' + file);
    }
});
