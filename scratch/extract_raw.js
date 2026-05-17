const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/MATHAN/.gemini/antigravity/A1CoachingCentre/json-db/lessons/tamil/7/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const outPath = 'c:/Users/MATHAN/.gemini/antigravity/brain/eb9defcf-e565-4d26-9e5e-0a2c17d1c4d6/artifacts/Grade_7_Tamil_Raw.md';

let md = '# ஏழாம் வகுப்பு - முதல் பருவம் (Raw Content)\n\n';

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  md += `## ${data.lesson_meta.title} (${data.lesson_meta.code})\n\n`;
  
  // Materials
  md += `### பாடக்குறிப்புகள் (Materials)\n`;
  const sections = data.material?.sections || [];
  sections.forEach(sec => {
    md += `**${sec.title}**\n${sec.content}\n\n`;
  });

  // Quiz
  const qs = data.quiz?.questions || [];
  md += `### தேர்வுகள் (Quiz) - மொத்தம் ${qs.length} கேள்விகள்\n`;
  qs.forEach((q, i) => {
    md += `**கேள்வி ${i+1}:** ${q.question}\n`;
    if (q.options && q.options.length) {
      q.options.forEach((opt, j) => {
        md += `- [${j === q.answer ? '*' : ' '}] ${opt}\n`;
      });
    }
    if (q.explanation) {
      md += `*விளக்கம்:* ${q.explanation}\n`;
    }
    md += '\n';
  });
  md += '---\n\n';
}

fs.writeFileSync(outPath, md, 'utf8');
console.log('Markdown successfully created at:', outPath);
