const fs = require('fs');




// Convert the structure
function processFile(lessonCode) {
    const rawData = JSON.parse(fs.readFileSync(`json-db/lessons/science/6/${lessonCode}.json`, 'utf8')); 
    const output = {
        isBilingual: false,
        unit: `அலகு ${rawData['பாட_எண்']}`,
        subject: "அறிவியல்",
        class: rawData['வகுப்பு'],
        term: parseInt(rawData['பருவம்']),
        title: `${rawData['பாட_எண்']}. ${rawData['பாட_தலைப்பு']}`,
        summary: rawData['பாடக்குறிப்புகள்']['பாடச்சுருக்கம்'] || "",
        material: {
        isBilingual: false,
        sections: []
    },
    quiz: {
        questions: []
    }
};

// Functions to build sections
if (rawData['பாடக்குறிப்புகள்']['பாடக்கருத்துக்கள்']) {
    let content = [];
    if (Array.isArray(rawData['பாடக்குறிப்புகள்']['பாடக்கருத்துக்கள்'])) {
        rawData['பாடக்குறிப்புகள்']['பாடக்கருத்துக்கள்'].forEach(item => {
            if (item['விவரங்கள்']) {
                content.push(`**${item['தலைப்பு']}:** ` + (Array.isArray(item['விவரங்கள்']) ? item['விவரங்கள்'].join(" ") : item['விவரங்கள்']));
            }
        });
    } else {
        // Object format
        for (let key in rawData['பாடக்குறிப்புகள்']['பாடக்கருத்துக்கள்']) {
            content.push(`**${key.replace(/_/g, ' ')}:** ${rawData['பாடக்குறிப்புகள்']['பாடக்கருத்துக்கள்'][key]}`);
        }
    }
    output.material.sections.push({
        title: "பாடக்கருத்துக்கள்",
        type: "standard",
        content: content
    });
}

if (rawData['பாடக்குறிப்புகள்']['தகவல்_பேழை_மற்றும்_உங்களுக்கு_தெரியுமா']) {
    let content = rawData['பாடக்குறிப்புகள்']['தகவல்_பேழை_மற்றும்_உங்களுக்கு_தெரியுமா'].filter(Boolean).map(item => { return typeof item === 'string' ? item : (item['குறிப்பு'] || JSON.stringify(item)); });
    output.material.sections.push({
        title: "தகவல் பேழை மற்றும் உங்களுக்கு தெரியுமா",
        type: "infobox",
        content: content
    });
} else if (rawData['பாடக்குறிப்புகள்']['தகவல்_பேழை'] || rawData['பாடக்குறிப்புகள்']['உங்களுக்கு_தெரியுமா']) {
    let content = [];
    if(rawData['பாடக்குறிப்புகள்']['தகவல்_பேழை']) content.push(...rawData['பாடக்குறிப்புகள்']['தகவல்_பேழை']);
    if(rawData['பாடக்குறிப்புகள்']['உங்களுக்கு_தெரியுமா']) content.push(...rawData['பாடக்குறிப்புகள்']['உங்களுக்கு_தெரியுமா']);
    output.material.sections.push({
        title: "தகவல் பேழை மற்றும் உங்களுக்கு தெரியுமா",
        type: "infobox",
        content: content
    });
}

if (rawData['பாடக்குறிப்புகள்']['image_முக்கிய_குறிப்புகள்'] || rawData['பாடக்குறிப்புகள்']['படம்_சார்ந்த_முக்கிய_குறிப்புகள்']) {
    let rawImg = rawData['பாடக்குறிப்புகள்']['image_முக்கிய_குறிப்புகள்'] || rawData['பாடக்குறிப்புகள்']['படம்_சார்ந்த_முக்கிய_குறிப்புகள்'];
    let content = [];
    if (typeof rawImg[0] === 'string') {
        content = rawImg;
    } else {
        content = rawImg.map(item => `**${item['தலைப்பு']}:** ${item['விவரங்கள்']}`);
    }
    output.material.sections.push({
        title: "முக்கிய குறிப்புகள்",
        type: "standard",
        content: content
    });
}

if (rawData['பாடக்குறிப்புகள்']['நினைவில்_கொள்க']) {
    output.material.sections.push({
        title: "நினைவில் கொள்க",
        type: "standard",
        content: rawData['பாடக்குறிப்புகள்']['நினைவில்_கொள்க']
    });
}

if (rawData['பாடக்குறிப்புகள்']['கலைச்சொற்கள்']) {
    output.material.sections.push({
        title: "கலைச்சொற்கள்",
        type: "standard",
        content: rawData['பாடக்குறிப்புகள்']['கலைச்சொற்கள்']
    });
}

if (rawData['பாடக்குறிப்புகள்']['பாட_பின்புற_வினாக்கள்']) {
    const bookback = rawData['பாடக்குறிப்புகள்']['பாட_பின்புற_வினாக்கள்'];
    if (bookback['சரியான_விடையை_தேர்ந்தெடுத்து_எழுதுக']) {
        let content = bookback['சரியான_விடையை_தேர்ந்தெடுத்து_எழுதுக'].map((item, idx) => `${idx+1}. ${item['கேள்வி']} - **விடை:** ${item['விடை']}`);
        output.material.sections.push({
            title: "பாடப் பின்புற வினாக்கள் - சரியான விடையைத் தேர்ந்தெடு",
            type: "standard",
            content: content
        });
    }
    if (bookback['கோடிட்ட_இடங்களை_நிரப்புக']) {
        let content = bookback['கோடிட்ட_இடங்களை_நிரப்புக'].map((item, idx) => `${idx+1}. ${item['கேள்வி']} - **விடை:** ${item['விடை']}`);
        output.material.sections.push({
            title: "பாடப் பின்புற வினாக்கள் - கோடிட்ட இடங்களை நிரப்புக",
            type: "standard",
            content: content
        });
    }
    if (bookback['சரியா_தவறா']) {
        let content = bookback['சரியா_தவறா'].map((item, idx) => `${idx+1}. ${item['கேள்வி']} - **விடை:** ${item['விடை']}`);
        output.material.sections.push({
            title: "பாடப் பின்புற வினாக்கள் - சரியா தவறா",
            type: "standard",
            content: content
        });
    }
    if (bookback['பொருத்துக']) {
        let content = bookback['பொருத்துக'].map((item, idx) => {
            if (typeof item === 'string') return `${idx+1}. ${item}`;
            let key = `கேள்வி_பகுதி_${idx+1}`;
            return `${idx+1}. ${item[key] || Object.values(item)[0]} - **விடை:** ${item['பதில்'] || Object.values(item)[1]}`;
        });
        output.material.sections.push({
            title: "பாடப் பின்புற வினாக்கள் - பொருத்துக",
            type: "standard",
            content: content
        });
    }
    if (bookback['கூற்று_காரணம்_தருக']) {
        let content = bookback['கூற்று_காரணம்_தருக'].map(item => `**கூற்று:** ${item['கூற்று']} | **காரணம்:** ${item['காரணம்']} - **விடை:** ${item['விடை']}`);
        output.material.sections.push({
            title: "பாடப் பின்புற வினாக்கள் - கூற்று காரணம்",
            type: "standard",
            content: content
        });
    }
}

    // Convert questions
    const qList = rawData['கேள்விகள்'] || rawData['தேர்வு_வினாக்கள்'];
    if (qList) {
        qList.forEach(item => {
            let opts = Array.isArray(item['ஆப்ஷன்கள்']) ? item['ஆப்ஷன்கள்'] : Object.values(item['ஆப்ஷன்கள்']);
            let aIndex = -1;
            let ans = item['விடை'] ? String(item['விடை']).trim() : "";

            // If answer is A, B, C, D
            if (ans.length === 1 && /^[A-E]$/i.test(ans)) {
                if (!Array.isArray(item['ஆப்ஷன்கள்']) && item['ஆப்ஷன்கள்']) {
                    const keys = Object.keys(item['ஆப்ஷன்கள்']);
                    aIndex = keys.indexOf(ans.toUpperCase());
                } else if (Array.isArray(item['ஆப்ஷன்கள்'])) {
                    // if it's an array and answer is A,B,C,D
                    aIndex = ["A","B","C","D","E"].indexOf(ans.toUpperCase());
                }
            }

            // Fallback or if answer is full text
            if (aIndex === -1) {
                aIndex = opts.findIndex(opt => opt === ans || (typeof opt === 'string' && opt.startsWith(ans)));
            }

            if (aIndex === -1 && ans.length > 1) {
                aIndex = opts.findIndex(opt => typeof opt === 'string' && opt.includes(ans));
            }

            if (aIndex === -1) {
                console.warn(`WARNING: Answer not found for ${lessonCode} Q: ${item['கேள்வி']}, ans: ${ans}`);
                aIndex = 0; // fallback
            }
            
            output.quiz.questions.push({
                q: item['கேள்வி'],
                options: opts,
                a: aIndex,
                ex: item['விளக்கம்'] || ""
            });
        });
    }

fs.writeFileSync(`json-db/lessons/science/6/${lessonCode}.json`, JSON.stringify(output, null, 2), 'utf8');
console.log(`Successfully transformed ${lessonCode}.json`);

}
processFile('sci_6_t3_l4'); processFile('sci_6_t3_l5'); processFile('sci_6_t3_l6');
