const fs = require('fs');

// Lesson 2
let l2Path = 'json-db/lessons/science/7/sci_7_t3_l2.json';
let l2Data = JSON.parse(fs.readFileSync(l2Path, 'utf8'));

if (l2Data.quiz.length === 179) {
    l2Data.quiz.push({
        question: "விண்வெளி ஆய்விற்காக இந்திய அரசால் உருவாக்கப்பட்ட தேசிய விண்வெளி நிறுவனம் எது?",
        options: ["NASA", "ISRO", "ESA", "Roscosmos"],
        answer: 1,
        explanation: "இந்திய விண்வெளி ஆராய்ச்சி நிறுவனம் (ISRO) விண்வெளி ஆய்விற்காக இந்திய அரசால் உருவாக்கப்பட்ட அமைப்பாகும்."
    });
    fs.writeFileSync(l2Path, JSON.stringify(l2Data, null, 2), 'utf8');
    console.log("Added 1 question to Lesson 2. New length:", l2Data.quiz.length);
} else {
    console.log("Lesson 2 already modified or unexpected length:", l2Data.quiz.length);
}

// Lesson 6
let l6Path = 'json-db/lessons/science/7/sci_7_t3_l6.json';
let l6Data = JSON.parse(fs.readFileSync(l6Path, 'utf8'));

if (l6Data.quiz.length === 91) {
    const newQuestions = [
        {
            question: "லிப்ரே ஆபிஸ் உரை ஆவணத்தில் எழுத்துருவை (Font) மாற்ற எந்த மெனு பயன்படுகிறது?",
            options: ["File", "Edit", "Format", "View"],
            answer: 2,
            explanation: "எழுத்துரு, அளவு, நிறம் போன்றவற்றை மாற்ற Format பட்டிப் பட்டை (Menu bar) பயன்படுகிறது."
        },
        {
            question: "ஆவணத்தை அச்சிடுவதற்கு முன்பு அது எப்படி இருக்கும் என பார்ப்பதற்கு பயன்படும் வசதி எது?",
            options: ["Print Preview (அச்சு முன்னோட்டம்)", "Page Setup (பக்க அமைவு)", "Print layout (அச்சு வடிவமைப்பு)", "Web layout"],
            answer: 0,
            explanation: "ஆவணத்தை அச்சிடுவதற்கு முன்பு பார்ப்பதற்கு அச்சு முன்னோட்டம் (Print Preview) பயன்படுகிறது."
        },
        {
            question: "ஆவணத்தின் பக்கங்களை செங்குத்தாகவோ அல்லது கிடைமட்டமாகவோ மாற்ற உதவும் அமைப்பு எவ்வாறு அழைக்கப்படுகிறது?",
            options: ["Page Margin", "Page Orientation", "Page Size", "Page Layout"],
            answer: 1,
            explanation: "பக்க அமைவு (Page Orientation) என்பது போர்ட்ரைட் (செங்குத்து) மற்றும் லேண்ட்ஸ்கேப் (கிடைமட்டம்) என 2 வகைப்படும்."
        },
        {
            question: "உரை ஆவணத்தில் ரூலர் (Ruler) எதற்காகப் பயன்படுத்தப்படுகிறது?",
            options: ["கோடு வரைய", "பக்க ஓரம் மற்றும் பத்தி இடைவெளியை அமைக்க", "எழுத்துக்களை எண்ண", "பக்கங்களை எண்ண"],
            answer: 1,
            explanation: "ரூலர் என்பது பக்க ஓரம் (Margin) மற்றும் பத்தி இடைவெளியை (Indentation) அமைக்கப் பயன்படுகிறது."
        },
        {
            question: "உரை ஆவணத்தில் ஒரு புதிய வெற்று ஆவணத்தை திறக்க உதவும் விசைப்பலகை குறுக்குவழி என்ன?",
            options: ["Ctrl + N", "Ctrl + O", "Ctrl + S", "Ctrl + P"],
            answer: 0,
            explanation: "புதிய (New) ஆவணத்தை திறக்க Ctrl + N பயன்படுகிறது."
        },
        {
            question: "ஆவணத்தில் தேர்ந்தெடுக்கப்பட்ட உரையை மையப்படுத்த (Center Align) எந்த விசைப்பலகை குறுக்குவழி பயன்படுகிறது?",
            options: ["Ctrl + C", "Ctrl + E", "Ctrl + R", "Ctrl + L"],
            answer: 1,
            explanation: "உரையை மையப்படுத்த (Center Alignment) Ctrl + E பயன்படுகிறது."
        },
        {
            question: "ஒரு ஆவணத்தை சேமிக்க (Save) பயன்படும் விசைப்பலகை குறுக்குவழி எது?",
            options: ["Ctrl + V", "Ctrl + P", "Ctrl + S", "Ctrl + X"],
            answer: 2,
            explanation: "ஆவணத்தை சேமிக்க (Save) Ctrl + S குறுக்குவழி பயன்படுகிறது."
        },
        {
            question: "ஏற்கனவே சேமிக்கப்பட்ட ஆவணத்தை திறக்க (Open) எந்த குறுக்குவழி பயன்படுகிறது?",
            options: ["Ctrl + C", "Ctrl + S", "Ctrl + N", "Ctrl + O"],
            answer: 3,
            explanation: "ஏற்கனவே உள்ள கோப்பைத் திறக்க (Open) Ctrl + O பயன்படுகிறது."
        },
        {
            question: "உரையை தடிமனாக்க (Bold) பயன்படும் விசைப்பலகை குறுக்குவழி எது?",
            options: ["Ctrl + I", "Ctrl + U", "Ctrl + B", "Ctrl + D"],
            answer: 2,
            explanation: "உரையை தடிமனாக்க (Bold) Ctrl + B பயன்படுகிறது."
        }
    ];
    
    l6Data.quiz.push(...newQuestions);
    fs.writeFileSync(l6Path, JSON.stringify(l6Data, null, 2), 'utf8');
    console.log("Added 9 questions to Lesson 6. New length:", l6Data.quiz.length);
} else {
    console.log("Lesson 6 already modified or unexpected length:", l6Data.quiz.length);
}
