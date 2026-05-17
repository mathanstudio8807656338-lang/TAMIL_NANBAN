const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const files = args.length > 0 ? args : [
    'json-db/lessons/science/6/sci_6_t1_l1.json',
    'json-db/lessons/science/6/sci_6_t1_l2.json',
    'json-db/lessons/science/6/sci_6_t1_l3.json',
    'json-db/lessons/science/6/sci_6_t1_l4.json',
    'json-db/lessons/science/6/sci_6_t1_l5.json'
];

files.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const qs = data.quiz.questions;
        console.log(`File: ${file}`);
        console.log(`Count: ${qs.length}`);
        const questionsSet = new Set();
        qs.forEach((q, i) => {
            const questionText = typeof q.q === 'string' ? q.q : (q.q.en || q.q.ta);
            if (questionsSet.has(questionText)) {
                console.log(`  - Question ${i+1} is a DUPLICATE of a previous question!`);
            }
            questionsSet.add(questionText);

            if (!q.q || !q.options || q.a === undefined || !q.ex) {
                console.log(`  - Question ${i+1} is missing main fields!`);
            }

            // Check if it follows the new string-based bilingual format "EN || TA"
            if (typeof q.q === 'string') {
                if (!q.q.includes('||')) {
                    console.log(`  - Question ${i+1} is missing '||' separator (New Format)!`);
                }
            } else if (!q.q.en || !q.q.ta) {
                console.log(`  - Question ${i+1} is missing TA or EN in question (Old Format)!`);
            }

            // Options check
            if (Array.isArray(q.options)) {
               if (q.options.length !== 4) {
                   console.log(`  - Question ${i+1} has wrong number of options (must be 4)!`);
               }
               q.options.forEach((opt, j) => {
                   if (!opt.includes('||')) {
                       // Skip numbers or simple strings that don't need translation? 
                       // Actually, master rules say everything should be bilingual if possible.
                       // But for numbers "10", it's same. 
                       // However, check for text.
                   }
               });
            } else if (q.options && (!q.options.en || !q.options.ta)) {
                console.log(`  - Question ${i+1} is missing TA or EN in options (Old Format)!`);
            }

            // Explanation check
            if (typeof q.ex === 'string') {
                if (!q.ex.includes('||')) {
                     console.log(`  - Question ${i+1} explanation missing '||'!`);
                }
            } else if (!q.ex.en || !q.ex.ta) {
                console.log(`  - Question ${i+1} is missing TA or EN in explanation (Old Format)!`);
            }
        });
    } catch (e) {
        console.error(`Error in ${file}: ${e.message}`);
        console.error(e.stack);
    }
});
