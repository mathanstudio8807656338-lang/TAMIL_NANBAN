const fs = require('fs');
const path = require('path');

const scienceDir = 'json-db/lessons/science/6/';
const files = [
    'sci_6_t1_l1.json',
    'sci_6_t1_l2.json',
    'sci_6_t1_l3.json',
    'sci_6_t1_l4.json',
    'sci_6_t1_l5.json',
    'sci_6_t1_l6.json',
    'sci_6_t1_l7.json'
];

function processValue(val) {
    if (typeof val === 'string') {
        // Strip parentheses containing English
        let cleaned = val.replace(/\s\([a-zA-Z0-9\s.,\-'"]+\)/g, '').trim();
        return cleaned;
    }
    if (Array.isArray(val)) {
        return val.map(processValue);
    }
    if (typeof val === 'object' && val !== null) {
        // Handle Credits
        if (val.ta && val.en) {
            return val.ta;
        }
        const newObj = {};
        for (const [k, v] of Object.entries(val)) {
            newObj[k] = processValue(v);
        }
        return newObj;
    }
    return val;
}

files.forEach(file => {
    const filePath = path.join(scienceDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Process everything
    data = processValue(data);

    // Final clean up for root keys
    data.isBilingual = false;
    if (data.lesson_meta) data.lesson_meta.is_bilingual = false;
    if (data.material) data.material.isBilingual = false;
    
    if (data.subject && data.subject.includes('(')) {
        data.subject = data.subject.split('(')[0].trim();
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Cleaned ${file} to PURE Tamil Only.`);
});
