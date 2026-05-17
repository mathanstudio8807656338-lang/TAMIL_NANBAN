const fs = require('fs');
const path = require('path');

const originalDir = 'C:/Users/MATHAN/Desktop/7/';
const migratedDir = path.join(__dirname, '../json-db/lessons/social/7/');

const filesMapping = {
    'soc_7_t2_l4.json': '2 nd  term/குடிமையியல்/1.json', // wait, 4 is geography 1
    'soc_7_t2_l5.json': '2 nd  term/புவியியல்/2.json', // wait, geography 2
    'soc_7_t2_l6.json': '2 nd  term/குடிமையியல்/1.json',
    'soc_7_t2_l7.json': '2 nd  term/குடிமையியல்/2.json'
};
// Actually, earlier I copied 
// புவியியல்\1.json -> soc_7_t2_l4
// புவியியல்\2.json -> soc_7_t2_l5
// குடிமையியல்\1.json -> soc_7_t2_l6
// குடிமையியல்\2.json -> soc_7_t2_l7
filesMapping['soc_7_t2_l4.json'] = '2 nd  term/புவியியல்/1.json';

for (let i = 1; i <= 10; i++) {
    filesMapping[`soc_7_t3_l${i}.json`] = `3rd term/${i}.json`;
}

function processNotes(notesObj) {
    let sections = [];
    
    function parseContent(val) {
        if (typeof val === 'string') {
            let lines = val.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
            return lines.length > 1 ? lines : val;
        } else if (Array.isArray(val)) {
            let contentArr = [];
            for (let item of val) {
                if (typeof item === 'string') {
                    contentArr.push(...item.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
                } else if (typeof item === 'object') {
                    let title = item.heading || item['தலைப்பு'] || '';
                    let text = item.content || item['விவரங்கள்'] || item.text || '';
                    if (title) contentArr.push('**' + title + '**');
                    if (typeof text === 'string') {
                        contentArr.push(...text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
                    } else {
                        contentArr.push(JSON.stringify(text));
                    }
                }
            }
            return contentArr;
        } else if (typeof val === 'object' && val !== null) {
            let title = val.heading || val['தலைப்பு'] || '';
            let text = val.content || val['விவரங்கள்'] || val.text || '';
            let contentArr = [];
            if (title) contentArr.push('**' + title + '**');
            if (typeof text === 'string') {
                contentArr.push(...text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
            } else {
                contentArr.push(JSON.stringify(text));
            }
            return contentArr;
        }
        return val;
    }

    if (Array.isArray(notesObj)) {
        notesObj.forEach(n => {
            if (typeof n === 'object') {
                sections.push({
                    title: n.title || n.heading || n['தலைப்பு'] || 'Note',
                    content: parseContent(n.content || n['விவரங்கள்'] || n)
                });
            } else {
                sections.push({ title: 'Note', content: parseContent(n) });
            }
        });
    } else if (typeof notesObj === 'object') {
        for (let [key, val] of Object.entries(notesObj)) {
            sections.push({
                title: key,
                content: parseContent(val)
            });
        }
    } else if (typeof notesObj === 'string') {
        sections.push({ title: 'பாடக்குறிப்புகள்', content: parseContent(notesObj) });
    }
    
    return sections;
}

for (let [migratedFile, origRelPath] of Object.entries(filesMapping)) {
    let origPath = path.join(originalDir, origRelPath);
    let targetPath = path.join(migratedDir, migratedFile);
    
    if (fs.existsSync(origPath) && fs.existsSync(targetPath)) {
        let origData = JSON.parse(fs.readFileSync(origPath, 'utf8'));
        let targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        
        let studyNotes = origData.studyNotes || origData['பாடக்குறிப்புகள்'] || origData.material || {};
        
        targetData.material = {
            sections: processNotes(studyNotes)
        };
        
        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
        console.log('Restored notes for ' + migratedFile);
    } else {
        console.log('Missing file for ' + migratedFile + ' (orig: ' + fs.existsSync(origPath) + ')');
    }
}
