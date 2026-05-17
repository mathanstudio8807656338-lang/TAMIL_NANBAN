const fs = require('fs');

let content = fs.readFileSync('../js/data/syllabus.js', 'utf8');

// The exported object starts with `export const syllabusData = {`
// Let's modify the js code by temporarily replacing `export const syllabusData =` to `module.exports =`
let tempContent = content.replace('export const syllabusData =', 'module.exports =');
fs.writeFileSync('temp_syllabus.js', tempContent);

const syllabusData = require('./temp_syllabus.js');

// Now update grade 7
if (syllabusData.tamil && syllabusData.tamil["7"]) {
  let newG7 = syllabusData.tamil["7"];
  
  // We want to remove all topics in term 1,2,3 except the new one in term 1.
  // Actually, let's just make it look like how he wants.
  // "remove only the Tamil lessons in the first term, second term, and third term of the 7th grade"
  
  // What if we just keep the units structure, but empty the topics array? Admin tool might depend on the units being there?
  // Or maybe we can just set Term 1 to have one single unit with "பாரதம் அன்றைய நாற்றங்கால்" and empty all other units.
  
  newG7.forEach(termObj => {
    if (termObj.term === 1) {
      // Overwrite units
      termObj.units = [
        {
          title: "1. மொழி (அமுதத்தமிழ்)",
          topics: [
            {
              title: "பாரதம் அன்றைய நாற்றங்கால் *",
              isUpdated: true,
              code: "tam_7_t1_l1"
            }
          ]
        }
      ];
    } else if (termObj.term === 2 || termObj.term === 3) {
      // Empty units
      termObj.units = [];
    }
  });
  
  syllabusData.tamil["7"] = newG7;
  
}

let newJs = 'export const syllabusData = ' + JSON.stringify(syllabusData, null, 2) + ';';

// put back the comment // Last Updated: ...
const firstLineMatch = content.match(/^(\/\/ Last Updated: .*)$/m);
if (firstLineMatch) {
  newJs = firstLineMatch[1] + '\n' + newJs;
}

fs.writeFileSync('../js/data/syllabus.js', newJs);
fs.unlinkSync('./temp_syllabus.js');
console.log("Successfully updated syllabus!");
