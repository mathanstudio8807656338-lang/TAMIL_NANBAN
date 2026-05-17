const fs = require('fs');
const path = require('path');

const srcDirs = [
    { dir: 'C:/Users/MATHAN/Desktop/7/2nd term', term: 2 },
    { dir: 'C:/Users/MATHAN/Desktop/7/3rd term', term: 3 }
];
const destDir = path.join(__dirname, '../json-db/lessons/science/7/');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

function processNotes(notesObj) {
    let sections = [];
    
    function parseContent(val) {
        if (typeof val === 'string') {
            let lines = val.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
            return lines.length > 1 ? lines : val;
        } else if (Array.isArray(val)) {
            let contentArr = [];
            for (let item of val) {
                if (typeof item === 'string') {
                    contentArr.push(...item.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
                } else if (typeof item === 'object') {
                    let title = item.heading || item['தலைப்பு'] || '';
                    let text = item.content || item['விவரங்கள்'] || item.text || '';
                    if (title) contentArr.push('**' + title + '**');
                    if (typeof text === 'string') {
                        contentArr.push(...text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
                    } else {
                        contentArr.push(JSON.stringify(text));
                    }
                }
            }
            return contentArr.length > 1 ? contentArr : (contentArr[0] || '');
        } else if (typeof val === 'object' && val !== null) {
            let title = val.heading || val['தலைப்பு'] || '';
            let text = val.content || val['விவரங்கள்'] || val.text || '';
            let contentArr = [];
            if (title) contentArr.push('**' + title + '**');
            if (typeof text === 'string') {
                contentArr.push(...text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0));
            } else {
                contentArr.push(JSON.stringify(text));
            }
            return contentArr.length > 1 ? contentArr : (contentArr[0] || '');
        }
        return val;
    }

    if (Array.isArray(notesObj)) {
        notesObj.forEach(n => {
            if (typeof n === 'object') {
                sections.push({
                    title: n.title || n.heading || n['தலைப்பு'] || 'Note',
                    content: parseContent(n.content || n['விவரங்கள்'] || n)
                });
            } else {
                sections.push({ title: 'Note', content: parseContent(n) });
            }
        });
    } else if (typeof notesObj === 'object') {
        for (let [key, val] of Object.entries(notesObj)) {
            sections.push({
                title: key,
                content: parseContent(val)
            });
        }
    } else if (typeof notesObj === 'string') {
        sections.push({ title: 'பாடக்குறிப்புகள்', content: parseContent(notesObj) });
    }
    
    return sections;
}

function processQuiz(quizArr) {
    if (!Array.isArray(quizArr)) return [];
    
    return quizArr.map(q => {
        let question = q.question || q.கேள்வி || '';
        let options = q.options || q.விருப்பங்கள் || q['ஆப்ஷன்கள்'] || [];
        let answer = q.answer || q.விடை || q.சரியான_விடை || '';
        let explanation = q.explanation || q.விளக்கம் || q['விடைக்கான_விளக்கம்'] || '';
        
        question = question.replace(/^\d+\.\s*/, '').trim();
        
        let processedQ = { question };
        
        if (options && options.length > 0) {
            processedQ.options = options;
            
            if (typeof answer === 'string') {
                // Remove prefixes from options to match
                let cleanOptions = options.map(opt => opt.replace(/^[அஆஇஈa-d]\)\s*/i, '').trim());
                let cleanAnswer = answer.replace(/^[அஆஇஈa-d]\)\s*/i, '').trim();
                
                let idx = cleanOptions.findIndex(opt => opt === cleanAnswer || cleanAnswer.includes(opt) || opt.includes(cleanAnswer));
                if (idx === -1) {
                    idx = options.findIndex(opt => opt === answer);
                }
                if (idx !== -1) {
                    processedQ.answer = idx;
                } else {
                    processedQ.answer = answer; // fallback
                }
            } else {
                processedQ.answer = answer;
            }
        } else {
            processedQ.answer = answer;
        }
        
        if (explanation) {
            processedQ.explanation = explanation;
        }
        
        return processedQ;
    });
}

for (let src of srcDirs) {
    if (!fs.existsSync(src.dir)) continue;
    
    let files = fs.readdirSync(src.dir).filter(f => f.endsWith('.json'));
    
    for (let file of files) {
        let lessonNum = parseInt(file.split('.')[0]);
        let origData = JSON.parse(fs.readFileSync(path.join(src.dir, file), 'utf8'));
        
        let title = '';
        if (origData.classDetails) {
            title = origData.classDetails.chapterTitle || origData.classDetails.chapterName || '';
        } else if (origData['வகுப்பு_விவரங்கள்']) {
            title = origData['வகுப்பு_விவரங்கள்']['பாட_தலைப்பு'] || origData['வகுப்பு_விவரங்கள்']['பாடம்'] || '';
        } else if (origData['பாட_தலைப்பு']) {
            title = origData['பாட_தலைப்பு'];
        } else if (origData.title) {
            title = origData.title;
        }
        
        if (!title) title = `Lesson ${lessonNum}`;
        
        let migrated = {
            lesson_meta: {
                subject: "science",
                class: 7,
                term: src.term,
                lesson: lessonNum,
                title: title,
                title_en: title,
                description: ""
            },
            material: {
                sections: processNotes(origData.studyNotes || origData['பாடக்குறிப்புகள்'] || origData.material || [])
            },
            quiz: processQuiz(origData.quiz || origData['வினாடி_வினா'] || origData['புத்தக_பின்புற_மதிப்பீட்டு_வினாக்கள்'] || origData['தேர்வுகள்_வினாடி_வினா'] || origData['தேர்வு_வினாக்கள்'] || [])
        };
        
        let outFileName = `sci_7_t${src.term}_l${lessonNum}.json`;
        fs.writeFileSync(path.join(destDir, outFileName), JSON.stringify(migrated, null, 2), 'utf8');
        console.log(`Migrated ${file} to ${outFileName} (Term ${src.term})`);
    }
}
