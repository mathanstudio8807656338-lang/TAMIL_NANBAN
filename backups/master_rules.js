/**
 * MASTER RULES - VERSION 1
 * This script validates all lesson and quiz JSON files to ensure they follow the 
 * strict bilingual schema and are complete without any shortcuts or omissions.
 */

const fs = require('fs');
const path = require('path');

const MASTER_RULES = {
    CHECK_SCHEMA: true,
    ALLOW_PLACEHOLDERS: false, // Rule 1: No shortcuts or omissions
    MIN_QUESTIONS: 10,
    REQUIRED_FIELDS: ['isBilingual', 'unit', 'subject', 'class', 'term', 'title', 'material', 'quiz']
};

function validateFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        let errors = [];

        // Rule 1: Basic Schema Check
        MASTER_RULES.REQUIRED_FIELDS.forEach(field => {
            if (json[field] === undefined) {
                errors.push(`Missing field: ${field}`);
            }
        });

        // Rule 2: Completeness Check (No "...")
        const stringContent = JSON.stringify(json);
        if (stringContent.includes('"..."') || stringContent.includes('"[...]"') || stringContent.includes('"---"')) {
            errors.push("Contains placeholders or shortcuts (e.g., '...')");
        }

        // Rule 3: Material Content Check
        if (json.material && json.material.sections) {
            if (json.material.sections.length === 0) {
                errors.push("Lesson material sections are empty");
            }
        }

        // Rule 4: Quiz Check
        const questions = json.questions || (json.quiz && json.quiz.questions) || [];
        if (questions.length < MASTER_RULES.MIN_QUESTIONS && !filePath.includes('important_notes')) {
            errors.push(`Low question count: ${questions.length} (Minimum required: ${MASTER_RULES.MIN_QUESTIONS})`);
        }

        return { valid: errors.length === 0, errors };
    } catch (e) {
        return { valid: false, errors: [`JSON Parse Error: ${e.message}`] };
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.lstatSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (item.endsWith('.json')) {
            const result = validateFile(fullPath);
            if (!result.valid) {
                console.error(`❌ INVALID [${item}]:`, result.errors.join(', '));
            } else {
                console.log(`✅ VALID   [${item}]`);
            }
        }
    });
}

console.log("🔍 Running MASTER RULES Validation...");
scanDir(path.join(__dirname, 'json-db'));
console.log("🏁 Validation Complete.");
