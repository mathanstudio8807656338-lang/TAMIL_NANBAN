const fs = require('fs');
const path = require('path');

const SYLLABUS_PATH = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\js\\data\\syllabus.js';
const LESSON_MAP_PATH = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\js\\data\\lessonMap.js';

const lessonData = JSON.parse(fs.readFileSync('c:\\Users\\MATHAN\\A1CoachingCentre_temp_lesson_info.json', 'utf-8'));

// Helper to update syllabus.js
function updateSyllabus() {
    let content = fs.readFileSync(SYLLABUS_PATH, 'utf-8');
    
    // Find tamil grade 7 section
    const tamilSectionMatch = content.match(/"tamil":\s*\{[\s\S]*?"7":\s*\[([\s\S]*?)\]/);
    if (!tamilSectionMatch) {
        console.error("Could not find Tamil Grade 7 section in syllabus.js");
        return;
    }

    const t2Units = [
        {
            "title": "பாடப்பகுதிகள்",
            "topics": lessonData.t2.map(l => ({ title: l.title, isUpdated: true, code: l.code }))
        }
    ];

    const t3Units = [
        {
            "title": "பாடப்பகுதிகள்",
            "topics": lessonData.t3.map(l => ({ title: l.title, isUpdated: true, code: l.code }))
        }
    ];

    // This is a bit complex with regex in a large file. 
    // I'll use a more direct approach: replacing the empty arrays for term 2 and 3.
    
    content = content.replace(/"term":\s*2,\s*"units":\s*\[\]/, `"term": 2,\n        "units": ${JSON.stringify(t2Units, null, 10).replace(/\n/g, '\n        ')}`);
    content = content.replace(/"term":\s*3,\s*"units":\s*\[\]/, `"term": 3,\n        "units": ${JSON.stringify(t3Units, null, 10).replace(/\n/g, '\n        ')}`);

    fs.writeFileSync(SYLLABUS_PATH, content, 'utf-8');
    console.log("Updated syllabus.js");
}

// Helper to update lessonMap.js
function updateLessonMap() {
    let content = fs.readFileSync(LESSON_MAP_PATH, 'utf-8');
    
    const allLessons = [...lessonData.t2, ...lessonData.t3];
    
    // Insert new lessons into the "tamil" object
    // Find the end of the "tamil" block. This is tricky.
    // I'll append to the end of the tamil block by finding "grade": "7" or something similar.
    // Actually, I'll just find the last "grade": "7" entry and append after it.
    
    let tamilInsert = "";
    allLessons.forEach(l => {
        tamilInsert += `    "${l.code}": {\n      "local": true,\n      "filename": "${l.code}",\n      "grade": "7"\n    },\n`;
    });

    // Find the last occurrence of '"grade": "7"' in the tamil section
    const lastGrade7 = content.lastIndexOf('"grade": "7"');
    const insertPos = content.indexOf('},', lastGrade7) + 2;
    
    const newContent = content.slice(0, insertPos) + '\n' + tamilInsert + content.slice(insertPos);
    
    fs.writeFileSync(LESSON_MAP_PATH, newContent, 'utf-8');
    console.log("Updated lessonMap.js");
}

updateSyllabus();
updateLessonMap();
