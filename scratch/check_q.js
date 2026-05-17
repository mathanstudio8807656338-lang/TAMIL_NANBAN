const fs = require('fs');

const data = JSON.parse(fs.readFileSync('c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons/tamil/7/tam_7_t1_l1.json', 'utf8'));
console.log(`Title: ${data.lesson_meta.title}`);
console.log(`Material length: ${data.material?.sections?.length || 0}`);
console.log(`Quiz length: ${data.quiz?.questions?.length || 0}`);

const questions = data.quiz?.questions || [];

const hots = questions.filter(q => q.question.toLowerCase().includes('hots') || q.question.includes('வாழ்க்கைச் சூழல்') || q.question === "வாழ்க்கைச் சூழல் வினா (HOTS)");
console.log(`\nHOTS questions found:`);
console.log(JSON.stringify(hots, null, 2));

const missingQuestions = questions.filter(q => !q.question || q.question.trim() === '' || q.question.replace('வாழ்க்கைச் சூழல் வினா (HOTS)', '').trim() === '' || q.question.trim() === "வாழ்க்கைச் சூழல் வினா (HOTS)");
console.log(`\nPotentially missing or short questions:`);
console.log(JSON.stringify(missingQuestions, null, 2));
