const fs = require('fs');
const path = require('path');

const DIR = 'c:\\Users\\MATHAN\\.gemini\\antigravity\\A1CoachingCentre\\json-db\\lessons\\tamil\\7';
const files = fs.readdirSync(DIR);

const results = {
    t2: [],
    t3: []
};

files.forEach(file => {
    if (file.startsWith('tam_7_t2') || file.startsWith('tam_7_t3')) {
        const content = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8'));
        const term = file.includes('_t2_') ? 't2' : 't3';
        results[term].push({
            title: content.lesson_meta.title,
            code: content.lesson_meta.code,
            unit: content.lesson_meta.unit
        });
    }
});

// Sort by unit number
const sortByUnit = (a, b) => {
    const na = parseInt(a.unit.replace('l', ''));
    const nb = parseInt(b.unit.replace('l', ''));
    return na - nb;
};

results.t2.sort(sortByUnit);
results.t3.sort(sortByUnit);

console.log(JSON.stringify(results, null, 2));
