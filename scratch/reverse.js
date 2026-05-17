const fs = require('fs');

function formatOptions(options) {
    const labels = ["A", "B", "C", "D", "E"];
    let result = {};
    options.forEach((opt, i) => {
        result[labels[i]] = opt;
    });
    return result;
}

function processLesson(lessonCode, ogRaw) {
    const rawData = JSON.parse(fs.readFileSync(`json-db/lessons/science/6/${lessonCode}.json`, 'utf8'));
    
    const output = {
        "வகுப்பு": "6",
        "பருவம்": "3"
    };

    if (lessonCode === 'sci_6_t3_l4') {
        output["பாட_எண்"] = "4";
        output["பாட_தலைப்பு"] = "நமது சுற்றுச்சூழல்";
    } else if (lessonCode === 'sci_6_t3_l5') {
        output["பாட_எண்"] = "5";
        output["பாட_தலைப்பு"] = "அன்றாட வாழ்வில் தாவரங்கள்";
    } else if (lessonCode === 'sci_6_t3_l6') {
        output["பாட_எண்"] = "6";
        output["பாட_தலைப்பு"] = "வன்பொருளும் மென்பொருளும்";
    }

    output["பாடக்குறிப்புகள்"] = {};

    let summarySection = rawData.summary || "";
    if (summarySection) output["பாடக்குறிப்புகள்"]["பாடச்சுருக்கம்"] = summarySection;

    let points = {};
    let tn = [];
    let box = [];
    let vocab = [];
    let keyPoints = [];
    let bookback = {
        "சரியான_விடையை_தேர்ந்தெடுத்து_எழுதுக": [],
        "கோடிட்ட_இடங்களை_நிரப்புக": [],
        "சரியா_தவறா": [],
        "பொருத்துக": [],
        "கூற்று_காரணம்_தருக": []
    };

    rawData.material.sections.forEach(sec => {
        if (sec.title === "பாடக்கருத்துக்கள்") {
            sec.content.forEach(c => {
                let parts = c.split(':** ');
                if(parts.length > 1) {
                    let key = parts[0].replace(/\*\*/g, '').replace(/ /g, '_');
                    points[key] = parts.slice(1).join(':** ').trim();
                } else {
                    points["குறிப்பு"] = c;
                }
            });
            output["பாடக்குறிப்புகள்"]["பாடக்கருத்துக்கள்"] = points;
        }
        else if (sec.title === "தகவல் பேழை மற்றும் உங்களுக்கு தெரியுமா") {
            box = sec.content;
            output["பாடக்குறிப்புகள்"]["தகவல்_பேழை_மற்றும்_உங்களுக்கு_தெரியுமா"] = box;
        }
        else if (sec.title === "முக்கிய குறிப்புகள்") {
            keyPoints = sec.content;
            output["பாடக்குறிப்புகள்"]["படம்_சார்ந்த_முக்கிய_குறிப்புகள்"] = keyPoints;
        }
        else if (sec.title === "நினைவில் கொள்க") {
            tn = sec.content;
            output["பாடக்குறிப்புகள்"]["நினைவில்_கொள்க"] = tn;
        }
        else if (sec.title === "கலைச்சொற்கள்") {
            vocab = sec.content;
            output["பாடக்குறிப்புகள்"]["கலைச்சொற்கள்"] = vocab;
        }
        else if (sec.title.includes("சரியான விடையைத் தேர்ந்தெடு")) {
            sec.content.forEach(c => {
                let split = c.split(' - **விடை:** ');
                let q = split[0].replace(/^\d+\.\s/, '');
                bookback["சரியான_விடையை_தேர்ந்தெடுத்து_எழுதுக"].push({ "கேள்வி": q, "விடை": split[1] });
            });
        }
        else if (sec.title.includes("கோடிட்ட இடங்களை")) {
            sec.content.forEach(c => {
                let split = c.split(' - **விடை:** ');
                let q = split[0].replace(/^\d+\.\s/, '');
                bookback["கோடிட்ட_இடங்களை_நிரப்புக"].push({ "கேள்வி": q, "விடை": split[1] });
            });
        }
        else if (sec.title.includes("சரியா தவறா")) {
            sec.content.forEach(c => {
                let split = c.split(' - **விடை:** ');
                let q = split[0].replace(/^\d+\.\s/, '');
                bookback["சரியா_தவறா"].push({ "கேள்வி": q, "விடை": split[1] });
            });
        }
        else if (sec.title.includes("பொருத்துக")) {
            sec.content.forEach(c => {
                bookback["பொருத்துக"].push(c.replace(/^\d+\.\s/, ''));
            });
        }
        else if (sec.title.includes("கூற்று காரணம்")) {
             sec.content.forEach(c => {
                let split = c.split(' - **விடை:** ');
                let stmt = split[0].split(' | ');
                let kootru = stmt[0].replace(/\*\*கூற்று:\*\*\s/, '');
                let karanam = stmt[1] ? stmt[1].replace(/\*\*காரணம்:\*\*\s/, '') : "";
                bookback["கூற்று_காரணம்_தருக"].push({
                    "கூற்று": kootru,
                    "காரணம்": karanam,
                    "விடை": split[1]
                });
            });
        }
    });

    // Cleanup empty bookbacks
    Object.keys(bookback).forEach(k => {
        if (bookback[k].length === 0) delete bookback[k];
    });
    if (Object.keys(bookback).length > 0) {
        output["பாடக்குறிப்புகள்"]["பாட_பின்புற_வினாக்கள்"] = bookback;
    }

    output["தேர்வு_வினாக்கள்"] = [];
    const labels = ["A", "B", "C", "D", "E"];
    
    rawData.quiz.questions.forEach((q, idx) => {
        let optionsObj = formatOptions(q.options);
        output["தேர்வு_வினாக்கள்"].push({
            "கேள்வி_எண்": idx + 1,
            "கேள்வி": q.q,
            "ஆப்ஷன்கள்": optionsObj,
            "விடை": labels[q.a] || "A",
            "விளக்கம்": q.ex
        });
    });

    // Re-apply raw specific patches if needed, especially to avoid losing things
    if (ogRaw) {
        // Just merge back any things missed
        output["பாடக்குறிப்புகள்"] = ogRaw["பாடக்குறிப்புகள்"] || output["பாடக்குறிப்புகள்"];
        // if ogRaw had deeper specific structure we keep it
        if (ogRaw["தேர்வு_வினாக்கள்"] && ogRaw["தேர்வு_வினாக்கள்"].length >= output["தேர்வு_வினாக்கள்"].length) {
             output["தேர்வு_வினாக்கள்"] = ogRaw["தேர்வு_வினாக்கள்"];
        }
    }

    fs.writeFileSync(`json-db/lessons/science/6/${lessonCode}.json`, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Reversed ${lessonCode} to Pure Tamil`);
}

// Ensure l6 gets exactly its pure structure back
const rawL6 = JSON.parse(fs.readFileSync('scratch/sci_6_t3_l6_og.json', 'utf8'));
processLesson('sci_6_t3_l4', null);
processLesson('sci_6_t3_l5', null);
processLesson('sci_6_t3_l6', rawL6);

