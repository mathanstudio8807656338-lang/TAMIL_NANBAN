const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons/tamil/7/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let totalIncomplete = 0;
for (const file of files) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const questions = data.quiz?.questions || [];
  
  if (questions.length === 56) {
    console.log(`\n=> FOUND 56 QUESTIONS IN: ${file}`);
  }

  const badQuestions = questions.filter(q => 
    !q.question || 
    q.question.trim().length <= 30 || 
    q.question.trim() === "வாழ்க்கைச் சூழல் வினா (HOTS)" || 
    q.question.trim() === "வாழ்க்கைச் சூழல் வினா"
  );

  if (badQuestions.length > 0) {
    console.log(`\nIn ${file}, malformed question objects:`);
    console.log(JSON.stringify(badQuestions, null, 2));
    totalIncomplete += badQuestions.length;
  }
}
if (totalIncomplete === 0) {
    console.log("No malformed questions found by this criteria.");
}
