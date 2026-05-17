const fs = require('fs');
const path = require('path');

const SOURCE_BASE = 'C:\\Users\\MATHAN\\Desktop\\7';
const DEST_BASE = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\tamil\\7';

if (!fs.existsSync(DEST_BASE)) {
    fs.mkdirSync(DEST_BASE, { recursive: true });
}

function convertFile(sourcePath, term) {
    console.log(`Processing ${sourcePath} for Term ${term}...`);
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const src = JSON.parse(content);
    const filename = path.basename(sourcePath);
    const unitNum = filename.replace('.json', '');
    const code = `tam_7_t${term}_l${unitNum}`;

    let title = src.paada_thalaipu || src.பாட_தலைப்பு || "";
    
    const metaObj = src.paada_vivaram || src.வகுப்பு_விவரங்கள் || src.பாடம்_விவரங்கள் || src.பாட_விவரங்கள் || {};
    if (metaObj.paada_thalaipu) title = metaObj.paada_thalaipu;
    if (metaObj.பாட_தலைப்பு) title = metaObj.பாட_தலைப்பு;

    const lesson_meta = {
        title: title,
        unit: `l${unitNum}`,
        grade: "7",
        term: `t${term}`,
        subject: "tamil",
        code: code
    };

    let quiz_questions = [];
    let material_sections = [];

    // Quiz Questions
    const rawQuestions = src.thervu_vinaakkal || src.தேர்வு_வினாக்கள் || src.வினா_விடை_பகுதி || [];
    quiz_questions = rawQuestions.map(q => {
        const question = q.question || q.கேள்வி || "";
        const options = q.options || q.ஆப்ஷன்கள் || q.விருப்பங்கள் || q.Options || [];
        const answerText = q.answer || q.விடை || q.பதில் || q.சரியான_விடை || "";
        const explanation = q.explanation || q.விளக்கம் || q.விடைக்கான_விளக்கம் || "";
        
        let answerIndex = options.indexOf(answerText);
        if (answerIndex === -1 && typeof answerText === 'string') {
            answerIndex = options.findIndex(opt => opt && opt.toString().trim() === answerText.toString().trim());
        }
        
        return {
            question: question,
            options: options,
            answer: answerIndex !== -1 ? answerIndex : 0,
            explanation: explanation
        };
    });

    // Material Sections
    const notes = src.paada_kurippugal || src.பாடக்குறிப்புகள் || src.பாடக்குறிப்பக்கள் || [];
    
    if (Array.isArray(notes)) {
        notes.forEach(s => {
            material_sections.push({ 
                title: s.thalaipu || s.தலைப்பு || "குறிப்பு", 
                content: s.vivaram || s.விவரம் || s.விவரங்கள் || "" 
            });
        });
    } else if (typeof notes === 'object') {
        // ... (existing object keys logic)
        for (let key in notes) {
            if (typeof notes[key] === 'string') {
                material_sections.push({ title: key.replace(/_/g, ' '), content: notes[key] });
            } else if (Array.isArray(notes[key])) {
                material_sections.push({ title: key.replace(/_/g, ' '), content: notes[key].join('\n') });
            }
        }
    }

    const output = {
        lesson_meta: lesson_meta,
        quiz: {
            questions: quiz_questions
        },
        material: {
            sections: material_sections
        }
    };

    const destPath = path.join(DEST_BASE, `${code}.json`);
    fs.writeFileSync(destPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Saved to ${destPath} (Title: ${title}, Q: ${quiz_questions.length}, S: ${material_sections.length})`);
}

// Process Term 2
const term2Dir = path.join(SOURCE_BASE, '2nd term');
if (fs.existsSync(term2Dir)) {
    fs.readdirSync(term2Dir).forEach(file => {
        if (file.endsWith('.json')) {
            convertFile(path.join(term2Dir, file), 2);
        }
    });
}

// Process Term 3
const term3Dir = path.join(SOURCE_BASE, '3rd term');
if (fs.existsSync(term3Dir)) {
    fs.readdirSync(term3Dir).forEach(file => {
        if (file.endsWith('.json')) {
            convertFile(path.join(term3Dir, file), 3);
        }
    });
}

console.log('Conversion complete!');
