const fs = require('fs');
const path = require('path');

const usedQuestionsFile = 'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/scratch/used_questions.txt';
let usedQuestionsList = [];
if (fs.existsSync(usedQuestionsFile)) {
    usedQuestionsList = fs.readFileSync(usedQuestionsFile, 'utf8')
        .split('\n')
        .map(line => {
             const match = line.match(/"question":\s*"(.*)"/);
             return match ? match[1].trim() : line.trim();
        })
        .filter(q => q.length > 5);
}

function getQuestionsFromFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    let contentStr = fs.readFileSync(filePath, 'utf8');
    if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.slice(1);
    
    let content;
    try {
        content = JSON.parse(contentStr);
    } catch (e) {
        try {
            contentStr = fs.readFileSync(filePath, 'utf16le');
            if (contentStr.charCodeAt(0) === 0xFEFF) contentStr = contentStr.slice(1);
            content = JSON.parse(contentStr);
        } catch (e2) {
            return [];
        }
    }
    
    let rawQs = [];
    if (content.quiz) {
        rawQs = Array.isArray(content.quiz) ? content.quiz : (content.quiz.questions || []);
    } else if (content.questions) {
        rawQs = content.questions;
    }
    
    const subject = (content.subject || "").toLowerCase();

    return rawQs.map(q => {
        const questionText = q.q || q.question;
        const opts = q.options || q.choices;
        if (!questionText || !opts) return null;
        
        if (questionText.toLowerCase().includes('assertion') || 
            questionText.includes('கூற்று') || 
            questionText.toLowerCase().includes('reason')) {
            return null;
        }
        
        if (usedQuestionsList.some(used => questionText.includes(used) || used.includes(questionText))) {
            return null;
        }
        
        // English specific logic: Remove Tamil from options
        let processedOptions = [...opts];
        if (subject === 'english' || filePath.includes('eng')) {
            processedOptions = processedOptions.map(opt => {
                // Remove any Tamil characters and trailing/leading parentheses/dashes
                let cleaned = opt.replace(/[\u0b80-\u0bff]/g, '').replace(/\s*[\(\[-\].]*\s*$/, '').trim();
                // Special case for "Option (Tamil)" format
                cleaned = cleaned.replace(/\s*[\(].*[\)]\s*$/, '').trim();
                return cleaned || opt; // Fallback if result is empty
            });
        }
        
        return {
            question: questionText,
            options: processedOptions,
            answer: q.a !== undefined ? q.a : q.answer,
            explanation: q.ex || q.explanation || "",
            originalFile: path.basename(filePath)
        };
    }).filter(q => q !== null && q.options && q.options.length >= 2);
}

function collectPool(subjectDir) {
    let pool = [];
    const searchDirs = [
        subjectDir,
        subjectDir.replace('lessons', 'quizzes'),
        'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons/revision/all'
    ];
    
    const subjectPrefix = path.basename(subjectDir).substring(0, 3).toLowerCase();

    function scan(d) {
        if (!fs.existsSync(d)) return;
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(d, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath);
            } else if (entry.name.endsWith('.json')) {
                if (d.includes('revision') && !entry.name.includes(subjectPrefix)) continue;
                pool = pool.concat(getQuestionsFromFile(fullPath));
            }
        }
    }

    for (const sd of searchDirs) {
        scan(sd);
    }
    return pool;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const baseDir = 'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons';

console.log("Generating pools with English-only options...");
const psychePool = shuffle(collectPool(`${baseDir}/psychology`));
const tamilPool = shuffle(collectPool(`${baseDir}/tamil`));
const englishPool = shuffle(collectPool(`${baseDir}/english`));
const mathsPool = shuffle(collectPool(`${baseDir}/maths`));
const sciencePool = shuffle(collectPool(`${baseDir}/science`));
const socialPool = shuffle(collectPool(`${baseDir}/social`));

function pick(pool, count, section) {
    return pool.slice(0, count).map(q => ({...q, section: section}));
}

const commonPsy = pick(psychePool, 30, 'உளவியல்');
const commonTam = pick(tamilPool, 30, 'தமிழ்');
const commonEng = pick(englishPool, 30, 'ஆங்கிலம்');

// MS Test
const msTest = {
    code: "mt_4_ms",
    title: "TET மாதிரித் தேர்வு 4 (கணிதம் & அறிவியல்)",
    sections: [{ title: "தேர்வு விவரம்", content: "150 வினாக்கள்: உளவியல்-30, தமிழ்-30, ஆங்கிலம்-30, கணிதம்-30, அறிவியல்-30." }],
    quiz: { questions: [
        ...commonPsy,
        ...commonTam,
        ...commonEng,
        ...pick(mathsPool, 30, 'கணிதம்'),
        ...pick(sciencePool, 30, 'அறிவியல்')
    ]}
};

// SS Test
const ssTest = {
    code: "mt_4_ss",
    title: "TET மாதிரித் தேர்வு 4 (சமூக அறிவியல்)",
    sections: [{ title: "தேர்வு விவரம்", content: "150 வினாக்கள்: உளவியல்-30, தமிழ்-30, ஆங்கிலம்-30, சமூக அறிவியல்-60." }],
    quiz: { questions: [
        ...commonPsy,
        ...commonTam,
        ...commonEng,
        ...pick(socialPool, 60, 'சமூக அறிவியல்')
    ]}
};

fs.writeFileSync('c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/scratch/mt_4_ms_generated.json', JSON.stringify(msTest, null, 2), 'utf8');
fs.writeFileSync('c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/scratch/mt_4_ss_generated.json', JSON.stringify(ssTest, null, 2), 'utf8');

console.log(`Generated MS & SS. English options cleaned.`);
