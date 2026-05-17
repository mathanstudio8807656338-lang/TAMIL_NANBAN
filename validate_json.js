const fs = require('fs');
try {
    const content = fs.readFileSync('json-db/lessons/english/6/eng_6_t2_l1.json', 'utf8');
    JSON.parse(content);
    console.log("JSON is VALID");
} catch (e) {
    console.error("JSON is INVALID:");
    console.error(e.message);
}
