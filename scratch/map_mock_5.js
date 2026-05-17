const fs = require('fs');
const path = require('path');

function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) return content.slice(1);
    return content;
}

function processMock(filename, newCode, title) {
    const filePath = path.join('c:', 'Users', 'MATHAN', '.gemini', 'antigravity', 'A1CoachingCentre', 'json-db', 'lessons', 'mocktest', 'all', filename);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    content = stripBOM(content);
    
    let rawArr;
    try {
        rawArr = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${filename}: ${e.message}`);
        return;
    }

    const standardizedQs = rawArr.map(item => {
        const options = [item["A"], item["B"], item["C"], item["D"]];
        const ansKey = item["விடை"] || "A";
        const ansMap = { "A": 0, "B": 1, "C": 2, "D": 3 };
        
        return {
            question: item["கேள்வி"] || "",
            options: options,
            answer: ansMap[ansKey] !== undefined ? ansMap[ansKey] : 0,
            explanation: item["விளக்கம்"] || ""
        };
    });

    const output = {
        code: newCode,
        title: title,
        sections: [
            {
                title: "தேர்வு அறிவுறுத்தல்கள்",
                content: "150 வினாக்கள்: உளவியல்-30, தமிழ்-30, ஆங்கிலம்-30, பாடப்பகுதி-60."
            }
        ],
        quiz: {
            questions: standardizedQs
        }
    };

    const outputPath = path.join('c:', 'Users', 'MATHAN', '.gemini', 'antigravity', 'A1CoachingCentre', 'json-db', 'lessons', 'mocktest', 'all', `${newCode}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Successfully processed ${filename} to ${newCode}.json. Q1: ${standardizedQs[0].question.substring(0, 30)}...`);
}

processMock('mt_6_ms.json', 'mt_5_ms', 'TET மாதிரித் தேர்வு 5 (கணிதம் & அறிவியல்)');
processMock('mt_6_ss.json', 'mt_5_ss', 'TET மாதிரித் தேர்வு 5 (சமூக அறிவியல்)');
