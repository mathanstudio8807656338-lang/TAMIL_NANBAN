const fs = require('fs');
const path = require('path');

const baseDesktop = 'C:\\Users\\MATHAN\\Desktop\\7';
const baseDest = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\maths\\7';

if (!fs.existsSync(baseDest)) {
    fs.mkdirSync(baseDest, { recursive: true });
}

const term2Dir = path.join(baseDesktop, '2nd term');
const term3Dir = path.join(baseDesktop, '3rd term');

const resultSyllabus = {
    term2: [],
    term3: []
};

function getAnswerIndex(options, answer) {
    if (typeof answer === 'number') return answer;
    if (!options || !Array.isArray(options)) return 0;
    const idx = options.indexOf(answer);
    if (idx !== -1) return idx;
    
    // Try to find if answer is "Option text"
    for(let i=0; i<options.length; i++) {
        if (options[i] && options[i].toString().trim() === answer.toString().trim()) return i;
    }
    return 0;
}

function convertFile(src, term, lessonNum) {
    if (!fs.existsSync(src)) return null;
    
    const raw = fs.readFileSync(src, 'utf8').replace(/^\uFEFF/, '');
    let content;
    try {
        content = JSON.parse(raw);
    } catch (e) {
        console.error(`Error parsing ${src}: ${e.message}`);
        return null;
    }

    const title = content.classDetails?.chapterTitle || content["பாட_தலைப்பு"] || content["பாடத்_தலைப்பு"] || "Lesson " + lessonNum;
    
    let sections = [];
    // Format A: studyNotes array
    if (Array.isArray(content.studyNotes)) {
        sections = content.studyNotes.map(n => ({
            title: n.heading || n.தலைப்பு || "",
            content: n.content || n.தகவல் || ""
        }));
    } 
    // Format B: பாடக்குறிப்புகள் array
    else if (Array.isArray(content["பாடக்குறிப்புகள்"])) {
        sections = content["பாடக்குறிப்புகள்"].map(n => ({
            title: n.தலைப்பு || n.heading || "",
            content: n.விவரங்கள் || n.தகவல் || n.content || ""
        }));
    }
    // Format C: பாடக்குறிப்புகள் object
    else if (typeof content["பாடக்குறிப்புகள்"] === 'object' && content["பாடக்குறிப்புகள்"] !== null) {
        const notes = content["பாடக்குறிப்புகள்"];
        if (notes["சுருக்கம்"]) sections.push({ title: "பாடம் சுருக்கம்", content: notes["சுருக்கம்"] });
        if (notes["கூடுதல்_குறிப்புகள்"]) sections.push({ title: "கூடுதல் குறிப்புகள்", content: notes["கூடுதல்_குறிப்புகள்"] });
        if (notes["நினைவில்_கொள்க"]) {
            sections.push({ 
                title: "நினைவில் கொள்க", 
                content: Array.isArray(notes["நினைவில்_கொள்க"]) ? notes["நினைவில்_கொள்க"] : [notes["நினைவில்_கொள்க"]] 
            });
        }
        if (notes["புத்தக_பின்புற_ஒரு_மதிப்பெண்_வினாக்கள்"]) {
            sections.push({ 
                title: "புத்தக பின்புற ஒரு மதிப்பெண் வினாக்கள்", 
                content: notes["புத்தக_பின்புற_ஒரு_மதிப்பெண்_வினாக்கள்"] 
            });
        }
    }

    const rawQuiz = content.quiz || content["தேர்வு_வினாக்கள்"] || [];
    const quiz = rawQuiz.map(q => {
        const options = q.options || q["ஆப்ஷன்கள்"] || q["விருப்பங்கள்"] || [];
        const answer = q.answer || q["விடை"];
        return {
            question: q.question || q["கேள்வி"] || "",
            options: options,
            answer: getAnswerIndex(options, answer),
            explanation: q.explanation || q["விளக்கம்"] || ""
        };
    });

    return {
        lesson_meta: {
            subject: "maths",
            class: 7,
            term: term,
            lesson: lessonNum,
            title: title,
            title_en: title,
            description: ""
        },
        material: { sections },
        quiz: quiz
    };
}

// Process Term 2
for (let i = 1; i <= 5; i++) {
    const src = path.join(term2Dir, `${i}.json`);
    const converted = convertFile(src, 2, i);
    if (converted) {
        const destName = `mat_7_t2_l${i}.json`;
        fs.writeFileSync(path.join(baseDest, destName), JSON.stringify(converted, null, 2), 'utf8');
        resultSyllabus.term2.push({ title: converted.lesson_meta.title, code: destName.replace('.json', '') });
    }
}

// Process Term 3
for (let i = 1; i <= 6; i++) {
    const src = path.join(term3Dir, `${i}.json`);
    const converted = convertFile(src, 3, i);
    if (converted) {
        const destName = `mat_7_t3_l${i}.json`;
        fs.writeFileSync(path.join(baseDest, destName), JSON.stringify(converted, null, 2), 'utf8');
        resultSyllabus.term3.push({ title: converted.lesson_meta.title, code: destName.replace('.json', '') });
    }
}

console.log(JSON.stringify(resultSyllabus, null, 2));
