const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons/tamil/7/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const questions = data.quiz?.questions || [];
  
  if (questions.length !== 60) {
    console.log(`${file} has ${questions.length} questions.`);
  }

  const missingQuestions = questions.filter(q => !q.question || q.question.trim() === '' || q.question.replace('வாழ்க்கைச் சூழல் வினா (HOTS)', '').replace('வாழ்க்கை சூழல் வினா (HOTS)', '').replace('வாழ்க்கைச் சூழல் வினா:','').trim() === '' || q.question.trim().startsWith("வாழ்க்கைச் சூழல் வினா (HOTS)"));
  if (missingQuestions.length > 0) {
    console.log(`\nIn ${file}, potentially missing or short questions:`);
    console.log(JSON.stringify(missingQuestions, null, 2));
  }
}
