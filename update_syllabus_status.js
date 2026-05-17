const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, 'js', 'data', 'syllabus.js');
const lessonMapPath = path.join(__dirname, 'js', 'data', 'lessonMap.js');

let lessonMapCode = fs.readFileSync(lessonMapPath, 'utf8');
let jsonStr = lessonMapCode.substring(lessonMapCode.indexOf('{'), lessonMapCode.lastIndexOf('}') + 1);
const lessonMap = JSON.parse(jsonStr);

let syllabusCode = fs.readFileSync(syllabusPath, 'utf8');

function cleanTitle(s) {
    if (!s) return "";
    return s.toString().toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]/g, '').trim();
}

let modifiedCount = 0;

// Regular expression to match subjects like   "science": {
// and titles within them
let currentSubject = "";

const lines = syllabusCode.split('\n');
let debugPrintCount = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for subject keys like `science: {` or `"maths": {`
    const subMatch = line.match(/^\s*['"]?([a-z]+)['"]?:\s*\{/);
    if (subMatch) {
        currentSubject = subMatch[1].toLowerCase();
    }
    
    const titleMatch = line.match(/"title":\s*"(.*?)"/);
    if (titleMatch && currentSubject && lessonMap[currentSubject]) {
        const titleInSyllabus = titleMatch[1];
        const cleanedTitleInSyllabus = cleanTitle(titleInSyllabus);
        
        let found = false;
        let matchedMapTitle = "";
        for (const mapTitle in lessonMap[currentSubject]) {
            if (cleanTitle(mapTitle) === cleanedTitleInSyllabus || 
                cleanedTitleInSyllabus.includes(cleanTitle(mapTitle)) || 
                cleanTitle(mapTitle).includes(cleanedTitleInSyllabus)) {
                found = true;
                matchedMapTitle = mapTitle;
                break;
            }
        }
        
        if (currentSubject === 'science' && found === true) {
            console.log(`Subj: ${currentSubject}, Syllabus Title: "${titleInSyllabus}", Cleaned: "${cleanedTitleInSyllabus}", Found: ${found}, Matched: "${matchedMapTitle}"`);
            debugPrintCount++;
        }
        
        if (found) {
            // Check next few lines for "isUpdated"
            for (let j = i + 1; j <= i + 3; j++) {
                if (lines[j] && lines[j].includes('"isUpdated": false')) {
                    lines[j] = lines[j].replace('"isUpdated": false', '"isUpdated": true');
                    modifiedCount++;
                    break;
                }
            }
        }
    }
}

if (modifiedCount > 0) {
    fs.writeFileSync(syllabusPath, lines.join('\n'), 'utf8');
    console.log(`✅ Updated ${modifiedCount} lessons in syllabus.js!`);
} else {
    console.log("No lessons were updated in syllabus.js (none matched lessonMap).");
    console.log("Current Subject at end:", currentSubject);
}
