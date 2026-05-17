const fs = require('fs');
const path = require('path');

const baseDir = 'json-db/lessons/tamil/8/';
const updates = [
    { file: 'tam_8_l6.json', unit: 'l6', code: 'tam_8_l6' },
    { file: 'tam_8_l7.json', unit: 'l7', code: 'tam_8_l7' },
    { file: 'tam_8_l8.json', unit: 'l8', code: 'tam_8_l8' },
    { file: 'tam_8_l9.json', unit: 'l9', code: 'tam_8_l9' },
    { file: 'tam_8_l10.json', unit: 'l10', code: 'tam_8_l10' },
    { file: 'tam_8_l11.json', unit: 'l11', code: 'tam_8_l11' },
    { file: 'tam_8_l12.json', unit: 'l12', code: 'tam_8_l12' },
    { file: 'tam_8_l13.json', unit: 'l13', code: 'tam_8_l13' },
    { file: 'tam_8_l14.json', unit: 'l14', code: 'tam_8_l14' },
    { file: 'tam_8_l15.json', unit: 'l15', code: 'tam_8_l15' },
    { file: 'tam_8_l16.json', unit: 'l16', code: 'tam_8_l16' }
];

updates.forEach(u => {
    const filePath = path.join(baseDir, u.file);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.lesson_meta) {
            data.lesson_meta.unit = u.unit;
            data.lesson_meta.code = u.code;
            data.lesson_meta.term = 'Annual';
        } else {
            // For older format
            data.unit = u.unit;
            data.code = u.code;
            data.term = 'Annual';
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${u.file}`);
    } else {
        console.log(`File not found: ${u.file}`);
    }
});
