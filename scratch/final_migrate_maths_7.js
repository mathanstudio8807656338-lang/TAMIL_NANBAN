const fs = require('fs');
const path = require('path');

function readSourceJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
}

const baseDest = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\maths\\7';
const terms = [
    { dir: 'C:\\Users\\MATHAN\\Desktop\\7\\2nd term', term: 2, prefix: 't2', lessons: 5 },
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
        } else if (sourceData["பாடக்குறிப்புகள்"] && Array.isArray(sourceData["பாடக்குறிப்புகள்"])) {
            sections = sourceData["பாடக்குறிப்புகள்"].map(n => ({ title: n.தலைப்பு, content: n.விவரங்கள் }));
        }

        const quizSource = sourceData.quiz || sourceData["தேர்வு_வினாக்கள்"] || [];
        const quiz = quizSource.map(q => {
            const options = q.options || q["ஆப்ஷன்கள்"] || q["விருப்பங்கள்"] || [];
            const answer = q.answer || q["விடை"];
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
                question: q.question || q["கேள்வி"],
                options: options,
                answer: answerIndex,
                explanation: q.explanation || q["விளக்கம்"] || ""
            };
        });

        const lesson = {
            lesson_meta: {
                subject: "maths",
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

        const destFile = `mat_7_${t.prefix}_l${i}.json`;
        fs.writeFileSync(path.join(baseDest, destFile), JSON.stringify(lesson, null, 2), 'utf8');
        console.log(`Updated ${destFile} with ${quiz.length} questions.`);
    }
});
