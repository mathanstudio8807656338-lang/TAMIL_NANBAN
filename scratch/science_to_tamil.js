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
        if (val.includes('||')) {
            return val.split('||')[1].trim();
        }
        return val;
    }
    if (Array.isArray(val)) {
        return val.map(processValue);
    }
    if (typeof val === 'object' && val !== null) {
        // Special case for material sections with en/ta
        if (val.type === 'bilingual' && val.ta) {
            return {
                title: processValue(val.title),
                type: 'standard',
                content: val.ta
            };
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
    
    // 1. Force isBilingual to false
    data.isBilingual = false;
    if (data.lesson_meta) data.lesson_meta.is_bilingual = false;
    if (data.material) data.material.isBilingual = false;
    
    // 2. Process all strings
    data = processValue(data);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Converted ${file} to Tamil Only.`);
});
