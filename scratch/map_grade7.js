const fs = require('fs');

let syllabusStr = fs.readFileSync('../js/data/syllabus.js', 'utf8');
let tempSyl = syllabusStr.replace('export const syllabusData =', 'module.exports =');
fs.writeFileSync('temp_syllabus.js', tempSyl);
const syllabusData = require('./temp_syllabus.js');

if (!syllabusData.tamil) syllabusData.tamil = {};

syllabusData.tamil["7"] = [
  {
    "term": 1,
    "units": [
      {
        "title": "இயல் 1",
        "topics": [
          { "title": "பாரதம் அன்றைய நாற்றங்கால்", "isUpdated": true, "code": "tam_7_t1_l1" },
          { "title": "பாஞ்சை வளம்", "isUpdated": true, "code": "tam_7_t1_l2" },
          { "title": "தமிழ்நாட்டில் காந்தி", "isUpdated": true, "code": "tam_7_t1_l3" },
          { "title": "வேலுநாச்சியார்", "isUpdated": true, "code": "tam_7_t1_l4" },
          { "title": "சுட்டு எழுத்துகள், வினா எழுத்துகள்", "isUpdated": true, "code": "tam_7_t1_l5" }
        ]
      }
    ]
  },
  {
    "term": 2,
    "units": []
  },
  {
    "term": 3,
    "units": []
  }
];

let newSyl = 'export const syllabusData = ' + JSON.stringify(syllabusData, null, 2) + ';';
const firstLineMatch = syllabusStr.match(/^(\/\/ Last Updated: .*)$/m);
if (firstLineMatch) {
  newSyl = firstLineMatch[1] + '\n' + newSyl;
}
fs.writeFileSync('../js/data/syllabus.js', newSyl);
fs.unlinkSync('./temp_syllabus.js');
console.log("Updated syllabus.js with the 5 lessons for Grade 7 Term 1.");
