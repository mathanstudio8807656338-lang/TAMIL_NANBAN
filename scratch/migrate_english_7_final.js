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

        let sourceData;
        try {
            sourceData = readSourceJson(sourcePath);
        } catch(e) {
            console.error(`Error reading ${sourcePath}`);
            continue;
        }
        
        const title = sourceData["பாட_தலைப்பு"] || sourceData.classDetails?.chapterTitle || "Lesson " + i;
        
        let sections = [];
        const sourceNotes = sourceData["பாடக்குறிப்புகள்"] || sourceData.studyNotes || [];
        if (Array.isArray(sourceNotes)) {
            sections = sourceNotes.map(n => ({
                title: n.தலைப்பு || n.heading || "",
                content: n.விவரங்கள் || n.content || ""
            }));
        } else if (typeof sourceNotes === 'object') {
            Object.keys(sourceNotes).forEach(key => {
                sections.push({ title: key, content: sourceNotes[key] });
            });
        }

        const quizSource = sourceData["தேர்வுகள்"] || sourceData.quiz || [];
        const quiz = quizSource.map(q => {
            const options = q["ஆப்ஷன்கள்"] || q.options || [];
            const answer = q["விடை"] || q.answer;
            let answerIndex = options.indexOf(answer);
            if (answerIndex === -1) {
                for (let j = 0; j < options.length; j++) {
                    if (options[j] && options[j].toString().trim() === answer.toString().trim()) {
                        answerIndex = j;
                        break;
                    }
                }
            }
            if (answerIndex === -1) answerIndex = 0;

            return {
                question: q["கேள்வி"] || q.question || "",
                options: options,
                answer: answerIndex,
                explanation: q["விளக்கம்"] || q.explanation || ""
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
        console.log(`Successfully migrated ${destFile} with ${quiz.length} questions.`);
    }
});
