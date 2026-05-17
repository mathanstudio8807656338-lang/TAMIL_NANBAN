const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\MATHAN\\Desktop\\7\\3rd term';
const targetDir = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\english\\7';

const lessonFiles = [
    { source: '1.json', target: 'eng_7_t3_l1.json', lesson: 1 },
    { source: '2.json', target: 'eng_7_t3_l2.json', lesson: 2 },
    { source: '3.json', target: 'eng_7_t3_l3.json', lesson: 3 },
    { source: '4.json', target: 'eng_7_t3_l4.json', lesson: 4 },
    { source: '5.json', target: 'eng_7_t3_l5.json', lesson: 5 },
    { source: '6.json', target: 'eng_7_t3_l6.json', lesson: 6 },
    { source: '7.json', target: 'eng_7_t3_l7.json', lesson: 7 }
];

lessonFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file.source);
    const targetPath = path.join(targetDir, file.target);

    if (!fs.existsSync(sourcePath)) {
        console.log(`Source file ${file.source} not found.`);
        return;
    }

    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    // Key Mapping (English | Tamil)
    const getVal = (obj, keys) => {
        for (let k of keys) {
            if (obj[k] !== undefined) return obj[k];
        }
        return undefined;
    };

    const title = getVal(sourceData, ['chapter_title', 'பாட_தலைப்பு']) || sourceData.lesson_meta?.title || "";
    
    // Construct target JSON
    const targetData = {
        lesson_meta: {
            subject: "english",
            class: 7,
            term: 3,
            lesson: file.lesson,
            title: title,
            title_en: title,
            description: ""
        },
        material: {
            sections: []
        },
        quiz: []
    };

    // Map study notes to sections
    const notes = getVal(sourceData, ['study_notes', 'பாடக்குறிப்புகள்']);
    if (notes) {
        const summary = getVal(notes, ['summary', 'சுருக்கம்']);
        if (summary) {
            targetData.material.sections.push({
                title: "Summary",
                content: summary
            });
        }
        const additional = getVal(notes, ['additional_sections_and_notes', 'கூடுதல்_பகுதிகள்']);
        if (additional) {
            targetData.material.sections.push({
                title: "Additional Sections and Notes",
                content: additional
            });
        }
        const points = getVal(notes, ['points_to_remember_and_key_notes', 'நினைவில்_கொள்க']);
        if (points) {
            targetData.material.sections.push({
                title: "Points to Remember and Key Notes",
                content: points
            });
        }
        const knowMore = getVal(notes, ['let_us_know_more', 'என_அறியுங்கள்']);
        if (knowMore) {
            targetData.material.sections.push({
                title: "Let Us Know More",
                content: knowMore
            });
        }
        const evaluation = getVal(notes, ['book_back_evaluation_questions', 'புத்தக_மதிப்பீட்டு_வினாக்கள்']);
        if (evaluation) {
            targetData.material.sections.push({
                title: "Book Back Evaluation Questions",
                content: evaluation
            });
        }
    }

    // Map quiz
    const quiz = getVal(sourceData, ['quiz', 'தேர்வு']);
    if (quiz) {
        targetData.quiz = quiz.map(q => {
            const question = getVal(q, ['question', 'கேள்வி']);
            const options = getVal(q, ['options', 'ஆப்ஷன்கள்']);
            const answer = getVal(q, ['answer', 'விடை']);
            const explanation = getVal(q, ['explanation', 'விளக்கம்']) || "";

            let answerIndex = -1;
            if (typeof answer === 'string') {
                answerIndex = options.indexOf(answer);
            } else if (typeof answer === 'number') {
                answerIndex = answer;
            }

            return {
                question: question,
                options: options,
                answer: answerIndex,
                explanation: explanation
            };
        });
    }

    fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2));
    console.log(`Updated ${file.target} with ${targetData.quiz.length} questions.`);
});
