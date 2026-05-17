// --- Standardized Text Formatting ---
export function formatText(text) {
    if (!text) return "";
    
    // 1. Convert to string and handle Basic HTML/Keywords
    let html = text.toString()
        .replace(/\*\*(.*?)\*\*/g, '<span class="keyword">$1</span>')
        .replace(/\[\[(.*?)\]\]/g, '<span class="keyword">$1</span>')
        .replace(/\$(.*?)\$/g, '<span class="math-tex">$1</span>');

    // 2. Bilingual English || Tamil logic
    if (html.includes('||')) {
        const parts = html.split('||');
        return `<span class="en-text">${parts[0].trim()}</span><span class="lang-sep"> / </span><span class="tm-text">${parts[1].trim()}</span>`;
    }
    
    // 3. Fallback for "English / Tamil" if both scripts are detected
    const hasTamil = /[\u0B80-\u0BFF]/.test(html);
    const hasEnglish = /[a-zA-Z]/.test(html);
    
    if (html.includes(' / ') && hasTamil && hasEnglish && !html.includes('</span>')) {
        const parts = html.split(' / ');
        return `<span class="en-text">${parts[0].trim()}</span><span class="lang-sep"> / </span><span class="tm-text">${parts[1].trim()}</span>`;
    }

    // 4. Mixed text detection (English followed by Tamil)
    if (hasTamil && hasEnglish && !html.includes('class=')) {
        const splitMatch = html.match(/^([a-zA-Z0-9\s.,\-'"]+)([\u0B80-\u0BFF].*)$/u);
        if (splitMatch) {
            html = `<span class="en-text">${splitMatch[1].trim()}</span> <span class="tm-text">${splitMatch[2].trim()}</span>`;
        }
    }

    // 5. Handle Newlines
    return html.replace(/\n/g, '<br>');
}

export function getSafeFileName(topic) {
    if (!topic) return "unknown";
    return topic.toString().replace(/[\*\?\"\<\>\|]/g, '').trim().replace(/\s+/g, '_');
}

// --- Robust Data Fetching ---
export async function getLocalLessonData(subject, className, lessonId, type = 'lesson') {
    if (!subject || !lessonId) return null;
    
    const v = new Date().getTime();
    const safeName = getSafeFileName(lessonId);
    
    // Normalize Subject
    const sub = subject.toLowerCase();
    let subjectKey = sub;
    if (sub.includes('science') && !sub.includes('social')) subjectKey = 'science';
    else if (sub.includes('social')) subjectKey = 'social';
    else if (sub.includes('tamil')) subjectKey = 'tamil';
    else if (sub.includes('english')) subjectKey = 'english';
    else if (sub.includes('math')) subjectKey = 'maths';
    else if (sub.includes('psychology')) subjectKey = 'psychology';

    // 1. Try Map Lookup
    let lessonMap = {};
    try {
        const module = await import(`./data/lessonMap.js?v=${v}`);
        lessonMap = module.lessonMap || {};
    } catch (e) { console.warn("Map not found, using fallback"); }

    const subjectMap = lessonMap[subjectKey] || {};
    
    // Fuzzy match function
    const findMatch = (map, id) => {
        if (map[id]) return map[id];
        const clean = (s) => s.toString().toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]/g, '').trim();
        const search = clean(id);
        const entry = Object.entries(map).find(([k]) => clean(k) === search);
        return entry ? entry[1] : null;
    };

    const match = findMatch(subjectMap, lessonId);
    const paths = [];

    if (match) {
        const grade = match.grade || className;
        if (type === 'quiz') {
            paths.push(`json-db/quizzes/${subjectKey}/${grade}/${match.filename}.json`);
        }
        paths.push(`json-db/lessons/${subjectKey}/${grade}/${match.filename}.json`);
    }

    // 2. Try Standard Path Patterns
    if (type === 'quiz') {
        paths.push(`json-db/quizzes/${subjectKey}/${className}/${safeName}.json`);
        paths.push(`json-db/quizzes/${subjectKey}/${className}/${lessonId}.json`);
    }
    paths.push(`json-db/lessons/${subjectKey}/${className}/${safeName}.json`);
    paths.push(`json-db/lessons/${subjectKey}/${className}/${lessonId}.json`);

    // Execution
    for (const path of paths) {
        try {
            const res = await fetch(path + '?v=' + v);
            if (res.ok) {
                const data = await res.json();
                return { data, url: path };
            }
        } catch (e) {}
    }

    return null;
}

export async function getLocalTodayLessons() {
    try {
        const response = await fetch('json-db/today.json?v=' + new Date().getTime());
        return response.ok ? await response.json() : [];
    } catch (e) { return []; }
}
