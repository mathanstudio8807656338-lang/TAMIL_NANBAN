import { lessonMap } from '../js/data/lessonMap.js';

const subjectMap = lessonMap['tamil'];
const findMatch = (map, id) => {
    if (map[id]) return map[id];
    const clean = (s) => String(s).toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]/g, '').trim();
    const search = clean(id);
    const entry = Object.entries(map).find(([k]) => clean(k) === search);
    return entry ? entry[1] : null;
};

console.log("findMatch for tam_7_t1_l1:", findMatch(subjectMap, 'tam_7_t1_l1'));
console.log("findMatch for எங்கள் தமிழ்:", findMatch(subjectMap, 'எங்கள் தமிழ்'));
