
const fs = require('fs');
const path = require('path');

const desktopPath = 'C:\\Users\\MATHAN\\Desktop\\New folder';
const repoPath = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\english\\6';

const fileNames = ['1.json', '2.json', '3.json', '4.json', '5.json', '6.json', '7.json'];

fileNames.forEach((fileName, index) => {
    const lessonNum = index + 1;
    const desktopFile = path.join(desktopPath, fileName);
    const repoFile = path.join(repoPath, `eng_6_t3_l${lessonNum}.json`);

    let data;
    try {
        data = JSON.parse(fs.readFileSync(desktopFile, 'utf8'));
    } catch (e) {
        console.error(`Error reading ${fileName}: ${e.message}`);
        return;
    }

    const lessonMeta = {
        title: data.பாட_தலைப்பு || data.Lesson_Title || (data.lesson_meta && data.lesson_meta.title) || `Lesson ${lessonNum}`,
        unit: lessonNum,
        std: 6,
        term: 3,
        subject: "English"
    };

    const sections = [];

    // Helper to format content
    const formatContent = (val) => {
        if (Array.isArray(val)) return val.map(v => ({ text: v }));
        if (typeof val === 'string') return [{ text: val }];
        if (typeof val === 'object' && val !== null) {
            return Object.entries(val).map(([k, v]) => ({ text: `**${k}:** ${v}` }));
        }
        return [];
    };

    // Case 1: Standard layout (1, 2, 3, 4, 5)
    if (data.பாடக்குறிப்புகள்) {
        data.பாடக்குறிப்புகள்.forEach(sec => {
            sections.push({
                title: sec.தலைப்பு,
                type: "infobox",
                content: formatContent(sec.விவரங்கள்)
            });
        });
    }

    // Case 2: Lesson_Notes (6.json)
    if (data.Lesson_Notes) {
        Object.entries(data.Lesson_Notes).forEach(([title, val]) => {
            sections.push({
                title: title.replace(/_/g, ' '),
                type: "infobox",
                content: formatContent(val)
            });
        });
    }

    // Case 3: material.sections (7.json)
    if (data.material && data.material.sections) {
        data.material.sections.forEach(sec => {
            sections.push({
                title: sec.title,
                type: "infobox",
                content: formatContent(sec.content)
            });
        });
    }

    // Evaluation notes
    const bookBack = data.புத்தக_மதிப்பீட்டு_வினாக்கள் || data.புத்தக_பின்புற_மதிப்பீட்டு_வினாக்கள்;
    if (bookBack) {
        bookBack.forEach(sec => {
            let content = [];
            if (sec.விவரங்கள்) content = formatContent(sec.விவரங்கள்);
            else if (sec.கேள்வி && sec.விடை) content = [{ text: `**கேள்வி:** ${sec.கேள்வி}\n**விடை:** ${sec.விடை}` }];
            
            sections.push({
                title: sec.தலைப்பு || "புத்தக மதிப்பீடு (Book Back)",
                type: "infobox",
                content: content
            });
        });
    }

    // Quiz processing
    let quizData = [];
    const rawQuiz = data.தேர்வு_வினாக்கள் || data.Quiz_Questions || (data.quiz && data.quiz.questions);
    
    if (rawQuiz) {
        quizData = rawQuiz.map(q => {
            const options = q.ஆப்ஷன்கள் || q.options || q.Options || [];
            const question = q.கேள்வி || q.question || q.Question;
            const answerRaw = q.விடை || q.answer || q.Answer;
            const explanation = q.விளக்கம் || q.explanation || q.Explanation || "";
            
            let answerIndex = -1;

            if (typeof answerRaw === 'number') {
                answerIndex = answerRaw;
            } else if (typeof answerRaw === 'string') {
                answerIndex = options.findIndex(opt => opt.trim() === answerRaw.trim());
                if (answerIndex === -1 && /^[A-D]$/i.test(answerRaw)) {
                    answerIndex = answerRaw.toUpperCase().charCodeAt(0) - 65;
                }
                if (answerIndex === -1) {
                     answerIndex = options.findIndex(opt => opt.includes(answerRaw) || answerRaw.includes(opt));
                }
            }
            
            return {
                question: question,
                options: options,
                answer: answerIndex !== -1 ? answerIndex : 0,
                explanation: explanation
            };
        });
    }

    const converted = {
        lesson_meta: lessonMeta,
        sections: sections,
        quiz: quizData
    };

    fs.writeFileSync(repoFile, JSON.stringify(converted, null, 2), 'utf8');
    console.log(`Converted ${fileName} to eng_6_t3_l${lessonNum}.json`);
});
