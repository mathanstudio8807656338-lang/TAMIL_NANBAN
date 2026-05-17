const fs = require('fs');

let code = fs.readFileSync('js/data/syllabus.js', 'utf8');

let newT2 = {
  "term": 2,
  "units": [
    {
      "title": "அறிவியல்",
      "topics": [
        { "title": "1. வெப்பம் மற்றும் வெப்பநிலை", "isUpdated": true, "code": "sci_7_t2_l1" },
        { "title": "2. மின்னோட்டவியல்", "isUpdated": true, "code": "sci_7_t2_l2" },
        { "title": "3. நம்மைச்சுற்றி நிகழும் மாற்றங்கள்", "isUpdated": true, "code": "sci_7_t2_l3" },
        { "title": "4. செல் உயிரியல்", "isUpdated": true, "code": "sci_7_t2_l4" },
        { "title": "5. வகைப்பாட்டியலின் அடிப்படைகள்", "isUpdated": true, "code": "sci_7_t2_l5" },
        { "title": "6. கணினி வரைகலை", "isUpdated": true, "code": "sci_7_t2_l6" }
      ]
    }
  ]
};

let newT3 = {
  "term": 3,
  "units": [
    {
      "title": "அறிவியல்",
      "topics": [
        { "title": "1. ஒளியியல்", "isUpdated": true, "code": "sci_7_t3_l1" },
        { "title": "2. அண்டம் மற்றும் விண்வெளி", "isUpdated": true, "code": "sci_7_t3_l2" },
        { "title": "3. பலபடி வேதியியல்", "isUpdated": true, "code": "sci_7_t3_l3" },
        { "title": "4. அன்றாட வாழ்வில் வேதியியல்", "isUpdated": true, "code": "sci_7_t3_l4" },
        { "title": "5. அன்றாட வாழ்வில் விலங்குகள்", "isUpdated": true, "code": "sci_7_t3_l5" },
        { "title": "6. காட்சித் தொடர்பியல்", "isUpdated": true, "code": "sci_7_t3_l6" }
      ]
    }
  ]
};

let matchStart = code.indexOf('export const syllabusData =');
let objCode = code.substring(matchStart + 'export const syllabusData ='.length).trim();
if (objCode.endsWith(';')) objCode = objCode.slice(0, -1);

let sys = JSON.parse(objCode);
if (!sys.science) sys.science = {};
if (!sys.science['7']) sys.science['7'] = [];
sys.science['7'][1] = newT2; // Index 1 is Term 2
sys.science['7'][2] = newT3; // Index 2 is Term 3

let newFullCode = code.substring(0, matchStart) + 'export const syllabusData = ' + JSON.stringify(sys, null, 2) + ';';
fs.writeFileSync('js/data/syllabus.js', newFullCode, 'utf8');
console.log('Successfully updated syllabus.js');

// Update lessonMap.js
let lmCode = fs.readFileSync('js/data/lessonMap.js', 'utf8');
let lmMatchStart = lmCode.indexOf('export const lessonMap =');
let lmObjCode = lmCode.substring(lmMatchStart + 'export const lessonMap ='.length).trim();
if (lmObjCode.endsWith(';')) lmObjCode = lmObjCode.slice(0, -1);

let lmSys = JSON.parse(lmObjCode);

const lessons = [
  ...newT2.units[0].topics.map(t => ({ code: t.code, title: t.title, path: 'json-db/lessons/science/7/' + t.code + '.json' })),
  ...newT3.units[0].topics.map(t => ({ code: t.code, title: t.title, path: 'json-db/lessons/science/7/' + t.code + '.json' }))
];

lessons.forEach(l => {
  lmSys[l.code] = l.path;
});

let newLmCode = lmCode.substring(0, lmMatchStart) + 'export const lessonMap = ' + JSON.stringify(lmSys, null, 2) + ';';
fs.writeFileSync('js/data/lessonMap.js', newLmCode, 'utf8');
console.log('Successfully updated lessonMap.js');
