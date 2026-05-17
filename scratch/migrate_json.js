const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '../json-db/lessons/social/7/');

const filesToProcess = [];
for (let i = 4; i <= 7; i++) filesToProcess.push(`soc_7_t2_l${i}.json`);
for (let i = 1; i <= 10; i++) filesToProcess.push(`soc_7_t3_l${i}.json`);

function migrateFile(file) {
    const filePath = path.join(dirPath, file);
    if (!fs.existsSync(filePath)) { console.log('not found: ' + filePath); return; }
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let migrated = { lesson_meta: {}, material: [], quiz: [] };
    
    // 1. lesson_meta
    let classDetails = data.classDetails || data['வகுப்பு_விவரங்கள்'] || {};
    let lessonMeta = data.lesson_meta || {};
    
    // Root keys
    let rootGrade = data['வகுப்பு'];
    let rootTerm = data['பருவம்'];
    let rootChapterTitle = data['பாட_தலைப்பு'];
    
    let grade = classDetails.class || classDetails['வகுப்பு'] || lessonMeta.grade || rootGrade || '7';
    if (typeof grade === 'string') grade = grade.replace(/[^0-9]/g, '');
    let term = classDetails.term || classDetails['பருவம்'] || lessonMeta.term || rootTerm || (file.includes('t2') ? 'பருவம் 2' : 'பருவம் 3');
    let title = classDetails.chapterTitle || classDetails['பாட_தலைப்பு'] || lessonMeta.title || rootChapterTitle || data.title;
    if (!title) title = file;
    
    migrated.lesson_meta = {
        title: title,
        grade: grade || '7',
        term: term,
        subject: 'சமூக அறிவியல்',
        code: file.replace('.json', '')
    };
    
    // 2. material
    let studyNotes = data.studyNotes || data['பாடக்குறிப்புகள்'] || data.material || {};
    if (Array.isArray(studyNotes)) {
        migrated.material = studyNotes.map(n => {
            if (n.title && n.content) return n;
            return { title: 'Note', content: JSON.stringify(n) };
        });
    } else if (typeof studyNotes === 'object') {
        for (let [key, val] of Object.entries(studyNotes)) {
            if (typeof val === 'object' && val !== null) {
                if (Array.isArray(val)) {
                    val = val.join('<br><br>');
                } else {
                    let html = '';
                    for (let [k, v] of Object.entries(val)) {
                        html += `<b>${k}:</b> ${v}<br><br>`;
                    }
                    val = html;
                }
            }
            migrated.material.push({ title: key, content: String(val) });
        }
    } else if (typeof studyNotes === 'string') {
        migrated.material.push({ title: 'பாடக்குறிப்புகள்', content: studyNotes });
    }
    
    // 3. quiz
    let quizData = data.quiz || data['தேர்வுகள்_வினாடி_வினா'] || data['தேர்வு_வினாக்கள்'] || [];
    if (!Array.isArray(quizData)) {
       quizData = Object.values(quizData);
    }
    
    migrated.quiz = quizData.map(q => {
        let options = q.options || q.Options || q['விருப்பங்கள்'] || [];
        let ans = q.answer !== undefined ? q.answer : (q.Answer !== undefined ? q.Answer : q['சரியான_விடை']);
        let explanation = q.explanation || q.Explanation || q['விளக்கம்'] || '';
        let question = q.question || q.Question || q.questionNumber || q['கேள்வி'] || '';
        if (q.questionNumber && q.question) {
             question = q.question; // sometimes questionNumber has the Q
        }
        
        let answerIndex = 0;
        if (typeof ans === 'number') {
            answerIndex = ans;
        } else if (typeof ans === 'string') {
            let idx = options.findIndex(opt => String(opt).trim().toLowerCase() === ans.trim().toLowerCase());
            if (idx !== -1) {
                answerIndex = idx;
            } else {
                if (/^[a-d]$/i.test(ans)) {
                    answerIndex = ans.toLowerCase().charCodeAt(0) - 97;
                } else if (/^[1-4]$/.test(ans)) {
                    answerIndex = parseInt(ans) - 1;
                } else {
                    let contIdx = options.findIndex(opt => String(opt).includes(ans) || ans.includes(String(opt)));
                    if (contIdx !== -1) {
                         answerIndex = contIdx;
                    } else {
                        explanation += ` (Original Answer: ${ans})`;
                        answerIndex = 0;
                    }
                }
            }
        }
        
        return {
            question: question,
            options: options,
            answer: answerIndex,
            explanation: explanation
        };
    });
    
    fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2), 'utf8');
    console.log(`Migrated ${file} | Title: ${migrated.lesson_meta.title} | Notes sections: ${migrated.material.length} | Quiz count: ${migrated.quiz.length}`);
}

filesToProcess.forEach(migrateFile);
