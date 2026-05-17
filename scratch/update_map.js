const fs = require('fs');

const filePath = 'js/data/lessonMap.js';
const content = fs.readFileSync(filePath, 'utf8').split('\n');

const newGrade8Tamil = `    "தமிழ்மொழி வாழ்த்து *": {
      "local": true,
      "filename": "tam_8_l1",
      "grade": "8"
    },
    "tam_8_l1": {
      "local": true,
      "filename": "tam_8_l1",
      "grade": "8"
    },
    "ஆழிக்கு இணை (கவிதைப்பேழை) *": {
      "local": true,
      "filename": "tam_8_l2",
      "grade": "8"
    },
    "tam_8_l2": {
      "local": true,
      "filename": "tam_8_l2",
      "grade": "8"
    },
    "தமிழ் வரிவடிவ வளர்ச்சி *": {
      "local": true,
      "filename": "tam_8_l3",
      "grade": "8"
    },
    "tam_8_l3": {
      "local": true,
      "filename": "tam_8_l3",
      "grade": "8"
    },
    "சொற்பூங்கா *": {
      "local": true,
      "filename": "tam_8_l4",
      "grade": "8"
    },
    "tam_8_l4": {
      "local": true,
      "filename": "tam_8_l4",
      "grade": "8"
    },
    "எழுத்துகளின் பிறப்பு *": {
      "local": true,
      "filename": "tam_8_l5",
      "grade": "8"
    },
    "tam_8_l5": {
      "local": true,
      "filename": "tam_8_l5",
      "grade": "8"
    },
    "தமிழர் மருத்துவம்": {
      "local": true,
      "filename": "tam_8_l6",
      "grade": "8"
    },
    "tam_8_l6": {
      "local": true,
      "filename": "tam_8_l6",
      "grade": "8"
    },
    "வாழ்வியல் - திருக்குறள்": {
      "local": true,
      "filename": "tam_8_l7",
      "grade": "8"
    },
    "tam_8_l7": {
      "local": true,
      "filename": "tam_8_l7",
      "grade": "8"
    },
    "வினைமுற்று": {
      "local": true,
      "filename": "tam_8_l8",
      "grade": "8"
    },
    "tam_8_l8": {
      "local": true,
      "filename": "tam_8_l8",
      "grade": "8"
    },
    "தமிழர் இசைக்கருவிகள்": {
      "local": true,
      "filename": "tam_8_l9",
      "grade": "8"
    },
    "tam_8_l9": {
      "local": true,
      "filename": "tam_8_l9",
      "grade": "8"
    },
    "திருக்குறள் - வாழ்வியல்": {
      "local": true,
      "filename": "tam_8_l10",
      "grade": "8"
    },
    "tam_8_l10": {
      "local": true,
      "filename": "tam_8_l10",
      "grade": "8"
    },
    "கொங்குநாட்டு வணிகம்": {
      "local": true,
      "filename": "tam_8_l11",
      "grade": "8"
    },
    "tam_8_l11": {
      "local": true,
      "filename": "tam_8_l11",
      "grade": "8"
    },
    "வினையால் அமையும் தொடர்கள் மற்றும் மரபுச்சொற்கள்": {
      "local": true,
      "filename": "tam_8_l12",
      "grade": "8"
    },
    "tam_8_l12": {
      "local": true,
      "filename": "tam_8_l12",
      "grade": "8"
    },
    "இடைச்சொல், உரிச்சொல் (கற்கண்டு)": {
      "local": true,
      "filename": "tam_8_l13",
      "grade": "8"
    },
    "tam_8_l13": {
      "local": true,
      "filename": "tam_8_l13",
      "grade": "8"
    },
    "ஒன்றே குலம் (திருமூலர்)": {
      "local": true,
      "filename": "tam_8_l14",
      "grade": "8"
    },
    "tam_8_l14": {
      "local": true,
      "filename": "tam_8_l14",
      "grade": "8"
    },
    "எச்சம்": {
      "local": true,
      "filename": "tam_8_l15",
      "grade": "8"
    },
    "tam_8_l15": {
      "local": true,
      "filename": "tam_8_l15",
      "grade": "8"
    },
    "காலம் உடன் வரும்": {
      "local": true,
      "filename": "tam_8_l16",
      "grade": "8"
    },
    "tam_8_l16": {
      "local": true,
      "filename": "tam_8_l16",
      "grade": "8"
    }`;

// Lines 393 to 627 (1-indexed) are content[392] to content[626]
content.splice(392, 627 - 393 + 1, newGrade8Tamil);

fs.writeFileSync(filePath, content.join('\n'), 'utf8');
console.log('Successfully updated lessonMap.js');
