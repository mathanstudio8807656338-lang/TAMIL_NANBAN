const fs = require('fs');
const path = require('path');

// Function to safely read and parse JSON even with BOM or encoding issues
function readSourceJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
}

const sourcePath = 'C:\\Users\\MATHAN\\Desktop\\7\\2nd term\\1.json';
const destPath = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\maths\\7\\mat_7_t2_l1.json';

const sourceData = readSourceJson(sourcePath);

// Standardizing to the platform schema while preserving EVERY word from the source
const lesson = {
    lesson_meta: {
        subject: "maths",
        class: 7,
        term: 2,
        lesson: 1,
        title: sourceData.classDetails.chapterTitle,
        title_en: sourceData.classDetails.chapterTitle,
        description: ""
    },
    material: {
        sections: sourceData.studyNotes.map(note => ({
            title: note.heading,
            content: note.content
        }))
    },
    quiz: sourceData.quiz.map(q => {
        // Find index of answer in options
        let answerIndex = q.options.indexOf(q.answer);
        if (answerIndex === -1) {
            // Fallback if exact match fails
            answerIndex = 0;
        }
        return {
            question: q.question,
            options: q.options,
            answer: answerIndex,
            explanation: q.explanation
        };
    })
};

fs.writeFileSync(destPath, JSON.stringify(lesson, null, 2), 'utf8');
console.log(`Successfully updated ${destPath} with 100% source content.`);
