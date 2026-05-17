const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'subjects');
const localDbPath = path.join(__dirname, 'json-db', 'lessons');
const mapOutputPath = path.join(__dirname, 'js', 'data', 'lessonMap.js');

const subjectMapping = {
    'Tamil': 'tamil',
    'English_Paper2': 'english',
    'English_General': 'english',
    'Science': 'science',
    'Social': 'social',
    'Psychology': 'psychology',
    'Maths': 'maths'
};

let mainMap = {
    tamil: {},
    english: {},
    science: {},
    social: {},
    psychology: {},
    maths: {},
    revision: {},
    mocktest: {},
    model_test: {},
    important_notes: {}
};

function addToMap(dbSubject, key, data) {
    if (!key || !dbSubject || !mainMap[dbSubject]) return;
    const cleanKey = key.trim();
    if (!cleanKey) return;
    
    // Don't overwrite if already exists with more info, 
    // but allow multiple keys to point to the same file.
    mainMap[dbSubject][cleanKey] = data;
}

// 1. Scan Repos (Priority)
if (fs.existsSync(repoPath)) {
    console.log("🔍 Scanning repositories...");
    const repos = fs.readdirSync(repoPath);
    for (const repo of repos) {
        let dbSubject = subjectMapping[repo];
        if (!dbSubject) continue;

        const dataPath = path.join(repoPath, repo, 'data');
        if (fs.existsSync(dataPath)) {
            const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
            
            for (const file of files) {
                try {
                    const content = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
                    const title = (content.lesson_meta && content.lesson_meta.title) || content.title;
                    const filename = file.replace('.json', '');
                    const entry = { repo, filename };
                    
                    if (title) addToMap(dbSubject, title, entry);
                    addToMap(dbSubject, filename, entry); // Filename as key
                } catch (e) {
                    console.error('Error parsing repo file:', file);
                }
            }
        }
    }
}

// 2. Scan Local DB (Fallback/Additions)
if (fs.existsSync(localDbPath)) {
    console.log("🔍 Scanning local database...");
    const subjects = fs.readdirSync(localDbPath);
    for (const sub of subjects) {
        const dbSubject = sub.toLowerCase();
        if (!mainMap[dbSubject]) continue;

        const subPath = path.join(localDbPath, sub);
        if (!fs.lstatSync(subPath).isDirectory()) continue;

        // Recursive scanner for subfolders (grades)
        function scanDir(dirPath, grade = null) {
            const items = fs.readdirSync(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                if (fs.lstatSync(itemPath).isDirectory()) {
                    scanDir(itemPath, item); // child is the grade
                } else if (item.endsWith('.json')) {
                    try {
                        const content = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
                        const title = content.title || (content.lesson_meta && content.lesson_meta.title) || content['பாட_தலைப்பு'];
                        const filename = item.replace('.json', '');
                        const entry = { local: true, filename };
                        if (grade) entry.grade = grade;

                        if (title) addToMap(dbSubject, title, entry);
                        addToMap(dbSubject, filename, entry); // Filename as key
                    } catch (e) {}
                }
            }
        }
        
        scanDir(subPath);
    }
}

// Write out the map
const code = `export const lessonMap = ${JSON.stringify(mainMap, null, 2)};`;
fs.writeFileSync(mapOutputPath, code, 'utf8');
console.log("✅ Successfully regenerated lessonMap.js with robust keys!");
