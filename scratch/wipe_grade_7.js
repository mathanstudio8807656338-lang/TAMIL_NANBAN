const fs = require('fs');

// 1. Wipe from syllabus.js
let syllabusStr = fs.readFileSync('../js/data/syllabus.js', 'utf8');
let tempSyl = syllabusStr.replace('export const syllabusData =', 'module.exports =');
fs.writeFileSync('temp_syllabus.js', tempSyl);
const syllabusData = require('./temp_syllabus.js');

if (syllabusData.tamil && syllabusData.tamil["7"]) {
  // Clear the entire "7" array.
  // We'll leave the terms but empty the units so it doesn't crash subject.js which expects term arrays.
  syllabusData.tamil["7"] = [
    { "term": 1, "units": [] },
    { "term": 2, "units": [] },
    { "term": 3, "units": [] }
  ];
}

let newSyl = 'export const syllabusData = ' + JSON.stringify(syllabusData, null, 2) + ';';
const firstLineMatch = syllabusStr.match(/^(\/\/ Last Updated: .*)$/m);
if (firstLineMatch) {
  newSyl = firstLineMatch[1] + '\n' + newSyl;
}
fs.writeFileSync('../js/data/syllabus.js', newSyl);
fs.unlinkSync('./temp_syllabus.js');


// 2. Wipe from lessonMap.js
let mapStr = fs.readFileSync('../js/data/lessonMap.js', 'utf8');
let tempMap = mapStr.replace('export const lessonMap =', 'module.exports =');
fs.writeFileSync('temp_map.js', tempMap);
const lessonMap = require('./temp_map.js');

if (lessonMap.tamil) {
  // Find all keys that map to grade 7 and delete them.
  Object.keys(lessonMap.tamil).forEach(key => {
    if (lessonMap.tamil[key].grade === "7") {
      delete lessonMap.tamil[key];
    }
  });
}

let newMap = 'export const lessonMap = ' + JSON.stringify(lessonMap, null, 2) + ';';
fs.writeFileSync('../js/data/lessonMap.js', newMap);
fs.unlinkSync('./temp_map.js');

console.log("Completely wiped grade 7 from syllabus.js and lessonMap.js");
