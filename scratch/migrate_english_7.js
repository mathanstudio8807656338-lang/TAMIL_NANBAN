const fs = require('fs');
const path = require('path');

function readSourceJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
}

const baseDest = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\english\\7';
if (!fs.existsSync(baseDest)) fs.mkdirSync(baseDest, { recursive: true });

const terms = [
    { dir: 'C:\\Users\\MATHAN\\Desktop\\7\\2nd term', term: 2, prefix: 't2', lessons: 6 },
    { dir: 'C:\\Users\\MATHAN\\Desktop\\7\\3rd term', term: 3, prefix: 't3', lessons: 6 }
];

terms.forEach(t => {
    for (let i = 1; i <= t.lessons; i++) {
        const sourcePath = path.join(t.dir, `${i}.json`);
        if (!fs.existsSync(sourcePath)) continue;

        const sourceData = readSourceJson(sourcePath);
        const title = sourceData.classDetails?.chapterTitle || sourceData["பாட_தலைப்பு"] || "Lesson " + i;
        
        let sections = [];
        if (sourceData.studyNotes) {
            sections = sourceData.studyNotes.map(n => ({ title: n.heading, content: n.content }));
        }

        const quizSource = sourceData.quiz || [];
        const quiz = quizSource.map(q => {
            const options = q.options || [];
            let answerIndex = options.indexOf(q.answer);
            if (answerIndex === -1) answerIndex = 0;

            return {
                question: q.question,
                options: options,
                answer: answerIndex,
                explanation: q.explanation || ""
            };
        });

        const lesson = {
            lesson_meta: {
                subject: "english",
                class: 7,
                term: t.term,
                lesson: i,
                title: title,
                title_en: title,
                description: ""
            },
            material: { sections },
            quiz: quiz
        };

        const destFile = `eng_7_${t.prefix}_l${i}.json`;
        fs.writeFileSync(path.join(baseDest, destFile), JSON.stringify(lesson, null, 2), 'utf8');
        console.log(`Migrated ${destFile} with ${quiz.length} questions.`);
    }
});
