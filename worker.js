// ═══════════════════════════════════════════════════════════════════
// TAMIL NANBAN — Free Exam Cloudflare Worker  (v4 — auto schedule)
// ═══════════════════════════════════════════════════════════════════

const FIREBASE_DB_URL = "https://tamil-nanban-default-rtdb.asia-southeast1.firebasedatabase.app";
const ADMIN_KEY       = "A1ADMIN2025";

// ═══════════════════════════════════════════════════════════════════
// 📅 AUTO SCHEDULE CONFIG
// தொடக்க தேதி: 2026-06-21 → வினாத்தாள் 13
// ஒவ்வொரு நாளும் +1 வினாத்தாள் எண்
// File format: "வினாத்தாள் {N} கணிதம் மற்றும் அறிவியல்.json"
//              "வினாத்தாள் {N} சமூக அறிவியல்.json"
// ═══════════════════════════════════════════════════════════════════
const SCHEDULE_START_DATE    = "2026-06-21";  // Day 1 தேதி
const SCHEDULE_START_VINATH  = 13;            // Day 1 வினாத்தாள் எண்
const VINATH_PAPER1_SUFFIX   = " கணிதம் மற்றும் அறிவியல்";
const VINATH_PAPER2_SUFFIX   = " சமூக அறிவியல்";

// இன்றைய வினாத்தாள் எண் கணக்கிட
function getTodayVinathNum(dateStr) {
  const start = new Date(SCHEDULE_START_DATE + "T00:00:00+05:30");
  const target = new Date(dateStr + "T00:00:00+05:30");
  const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
  return SCHEDULE_START_VINATH + diffDays;
}

// வினாத்தாள் எண்ணிலிருந்து file names
function getFileNamesForVinath(num) {
  return {
    paper1: `வினாத்தாள் ${num}${VINATH_PAPER1_SUFFIX}.json`,
    paper2: `வினாத்தாள் ${num}${VINATH_PAPER2_SUFFIX}.json`,
    vinathNum: num
  };
}

// இன்றைய IST தேதி
function getTodayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

const CUTOFFS = {
  "OC": 60, "GENERAL": 60,
  "BC": 50, "BCM": 50, "MBC": 50, "DNC": 50,
  "SC": 40, "SCA": 40, "ST": 40, "PWD": 40
};

function getPassStatus(category, percentage) {
  const cutoff = CUTOFFS[(category || "OC").toUpperCase()] ?? 60;
  return { cutoff, passed: percentage >= cutoff };
}

function getPaperKey(examFile) {
  if (!examFile) return null;
  return String(examFile).toLowerCase().trim().replace(/\.json$/, "");
}

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type":                 "application/json"
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, ...extra }
  });
}

export default {

  async fetch(request, env, ctx) {
    const url  = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (path.startsWith("/results/") && path.endsWith(".json")) {
      const filename = path.split("/").pop();
      const data = await env.RESULTS_KV?.get(filename);
      if (!data) return json({ error: "Not found" }, 404);
      return new Response(data, {
        headers: {
          "Content-Type":  "application/json",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (path === "/api/save-start" && request.method === "POST") {
      try {
        const b = await request.json();
        const { phoneNumber, studentName, dob, examFile, examDate, category } = b;
        if (!phoneNumber || !examFile || !examDate) {
          return json({ success: false, error: "Missing required fields" });
        }
        const paperKey = getPaperKey(examFile);
        const safePhone = String(phoneNumber).replace(/[^a-zA-Z0-9]/g, "");
        const key = `${safePhone}_${examDate}_${paperKey}`;
        const record = {
          phoneNumber: String(phoneNumber),
          studentName: studentName || "Unknown",
          dob:         dob || "",
          examFile, examDate, paperKey,
          category:    category || "OC",
          startedAt:   new Date().toISOString()
        };
        const r = await fetch(`${FIREBASE_DB_URL}/exam_starts/${key}.json`, {
          method: "PUT", body: JSON.stringify(record)
        });
        if (!r.ok) return json({ success: false, error: `Firebase ${r.status}` });
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message });
      }
    }

    if (path === "/api/admin-generate-results" && request.method === "POST") {
      const body = await request.json();
      if (body.adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      const examDate = body.examDate || new Date().toISOString().split("T")[0];
      try {
        const result = await generateAndStore(examDate, env);
        return json({ success: true, ...result });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    if (path === "/api/admin-attendance" && request.method === "GET") {
      const adminKey = url.searchParams.get("adminKey");
      const examDate = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
      if (adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      try {
        const report = await generateAttendanceReport(examDate);
        return json(report);
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    if (path === "/api/device-check" && request.method === "GET") {
      const phone    = url.searchParams.get("phone");
      const deviceId = url.searchParams.get("deviceId");
      if (!phone || !deviceId) return json({ allowed: false, message: "தரவு இல்லை" });
      const saved = await env.DEVICE_SESSIONS.get(phone);
      if (!saved)               return json({ allowed: true });
      if (saved === deviceId)   return json({ allowed: true });
      return json({ allowed: false, message: "இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!" });
    }

    if (path === "/api/device-register" && request.method === "POST") {
      const { phone, deviceId } = await request.json();
      if (!phone || !deviceId) return json({ success: false });
      const existing = await env.DEVICE_SESSIONS.get(phone);
      if (existing) {
        if (existing !== deviceId) {
          return json({ success: false, blocked: true,
            message: "இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!" });
        }
        return json({ success: true });
      }
      await env.DEVICE_SESSIONS.put(phone, deviceId, { expirationTtl: 60 * 60 * 24 * 90 });
      return json({ success: true });
    }

    if (path === "/api/device-reset" && request.method === "POST") {
      const { phone, adminKey } = await request.json();
      if (adminKey !== ADMIN_KEY) return json({ success: false, message: "Unauthorized" });
      await env.DEVICE_SESSIONS.delete(phone);
      return json({ success: true, message: `${phone} device reset செய்யப்பட்டது!` });
    }


    // ═══════════════════════════════════════════════════════════════════
    // 📅 EXAM SCHEDULE MANAGEMENT API (v4)
    // KV key: "exam_schedule" — JSON object, date→config
    // ═══════════════════════════════════════════════════════════════════

    // GET /api/exam-status — இன்றைய தேர்வு நிலை (public)
    // Auto-schedule: தேதியிலிருந்து தானாக வினாத்தாள் எண் கணக்கிடும்
    if (path === "/api/exam-status" && request.method === "GET") {
      const todayIST = getTodayIST();
      const vinathNum = getTodayVinathNum(todayIST);
      const autoFiles = getFileNamesForVinath(vinathNum);

      // Admin manual override இருக்கிறதா check செய்
      const schedule = await env.RESULTS_KV?.get("exam_schedule");
      let enabled = true;
      let paper1_display = autoFiles.paper1;
      let paper2_display = autoFiles.paper2;
      let source = "auto";

      if (schedule) {
        const data = JSON.parse(schedule);
        const cfg = data[todayIST];
        if (cfg) {
          // Admin override உள்ளது — enabled மட்டும் எடு, files auto
          enabled = cfg.enabled !== false;
          // Admin manually வேறு file set செய்திருந்தால் மட்டும் override
          if (cfg.paper1_display && cfg.paper1_display !== "paper1.json") {
            paper1_display = cfg.paper1_display;
            source = "manual";
          }
          if (cfg.paper2_display && cfg.paper2_display !== "paper2.json") {
            paper2_display = cfg.paper2_display;
            source = "manual";
          }
        }
      }

      return json({
        date: todayIST,
        enabled,
        vinathNum,
        paper1: "paper1.json",        // student page எப்போதும் paper1.json fetch செய்யும்
        paper2: "paper2.json",         // student page எப்போதும் paper2.json fetch செய்யும்
        paper1_display,                // admin-ல் காண்பிக்க உண்மையான பெயர்
        paper2_display,
        source
      });
    }

    // GET /api/admin-schedule — Admin: full schedule
    if (path === "/api/admin-schedule" && request.method === "GET") {
      const adminKey = url.searchParams.get("adminKey");
      if (adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      const schedule = await env.RESULTS_KV?.get("exam_schedule");
      const data = schedule ? JSON.parse(schedule) : {};
      return json({ success: true, schedule: data });
    }

    // POST /api/admin-schedule/set — Admin: ஒரு நாளுக்கு schedule set
    if (path === "/api/admin-schedule/set" && request.method === "POST") {
      const body = await request.json();
      if (body.adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      const { date, paper1, paper2, paper1_display, paper2_display, enabled } = body;
      if (!date || !paper1 || !paper2) return json({ error: "date, paper1, paper2 தேவை" }, 400);
      const schedule = await env.RESULTS_KV?.get("exam_schedule");
      const data = schedule ? JSON.parse(schedule) : {};
      data[date] = {
        paper1, paper2,
        paper1_display: paper1_display || paper1,
        paper2_display: paper2_display || paper2,
        enabled: enabled !== false,
        updatedAt: new Date().toISOString()
      };
      await env.RESULTS_KV?.put("exam_schedule", JSON.stringify(data));
      return json({ success: true, message: `${date} schedule சேமிக்கப்பட்டது`, config: data[date] });
    }

    // POST /api/admin-schedule/toggle — Admin: enable/disable
    if (path === "/api/admin-schedule/toggle" && request.method === "POST") {
      const body = await request.json();
      if (body.adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      const { date, enabled } = body;
      if (!date) return json({ error: "date தேவை" }, 400);
      const schedule = await env.RESULTS_KV?.get("exam_schedule");
      const data = schedule ? JSON.parse(schedule) : {};
      if (!data[date]) {
        data[date] = { paper1: "paper1.json", paper2: "paper2.json",
          paper1_display: "paper1.json", paper2_display: "paper2.json", enabled };
      } else {
        data[date].enabled = enabled;
      }
      data[date].updatedAt = new Date().toISOString();
      await env.RESULTS_KV?.put("exam_schedule", JSON.stringify(data));
      return json({ success: true, message: `தேர்வு ${enabled ? "✅ Enable" : "🔒 Disable"} செய்யப்பட்டது!`, enabled });
    }

    // POST /api/admin-schedule/bulk — Admin: பல நாட்களுக்கு bulk schedule
    if (path === "/api/admin-schedule/bulk" && request.method === "POST") {
      const body = await request.json();
      if (body.adminKey !== ADMIN_KEY) return json({ error: "Unauthorized" }, 401);
      const { entries } = body;
      if (!Array.isArray(entries) || !entries.length) return json({ error: "entries array தேவை" }, 400);
      const schedule = await env.RESULTS_KV?.get("exam_schedule");
      const data = schedule ? JSON.parse(schedule) : {};
      let count = 0;
      for (const e of entries) {
        if (!e.date || !e.paper1 || !e.paper2) continue;
        data[e.date] = {
          paper1: e.paper1, paper2: e.paper2,
          paper1_display: e.paper1_display || e.paper1,
          paper2_display: e.paper2_display || e.paper2,
          enabled: e.enabled !== false,
          updatedAt: new Date().toISOString()
        };
        count++;
      }
      await env.RESULTS_KV?.put("exam_schedule", JSON.stringify(data));
      return json({ success: true, message: `${count} நாட்கள் schedule சேமிக்கப்பட்டது!` });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    const istNow   = new Date(new Date(event.scheduledTime).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayStr = istNow.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const y = new Date(istNow); y.setDate(y.getDate() - 1);
    const yStr = y.toLocaleDateString("en-CA");

    // ═══════════════════════════════════════════════════════
    // 📋 AUTO PAPER COPY — இன்றைய வினாத்தாள் → paper1/paper2
    // Cron: 10:15 PM IST = results generate. 
    // But paper copy happens at midnight (next day cron) or via admin trigger
    // உண்மையான copy: ASSETS static files — KV-ல் flag மட்டும் set
    // ═══════════════════════════════════════════════════════
    console.log(`⏰ Scheduled run — date: ${todayStr}`);

    // இன்றைய வினாத்தாள் எண் log செய்
    const vinathNum = getTodayVinathNum(todayStr);
    const files = getFileNamesForVinath(vinathNum);
    console.log(`📋 Today's vinath: ${vinathNum} → ${files.paper1} | ${files.paper2}`);

    // Results generate (existing logic)
    for (const d of [todayStr, yStr]) {
      try {
        const r = await generateAndStore(d, env);
        console.log(`✅ ${d}:`, r);
      } catch (e) {
        console.error(`❌ ${d}:`, e.message);
      }
    }
  }
};

async function generateAndStore(examDate, env) {
  let allData;
  const queryUrl = `${FIREBASE_DB_URL}/free_exam_results.json?orderBy="examDate"&equalTo="${examDate}"`;
  let res = await fetch(queryUrl);
  if (!res.ok) {
    console.warn("Indexed query failed:", res.status, "— falling back to full fetch");
    res = await fetch(`${FIREBASE_DB_URL}/free_exam_results.json`);
    if (!res.ok) throw new Error(`Firebase fetch failed: ${res.status}`);
  }
  allData = (await res.json()) || {};

  const byPaperMap = {};
  let total = 0, testSkipped = 0, dateSkipped = 0,
      noFile = 0, noPhone = 0, dupMerged = 0;

  for (const id in allData) {
    const r = allData[id];
    if (!r) continue;
    total++;

    if (r.isTestMode)              { testSkipped++; continue; }
    if (r.examDate !== examDate)   { dateSkipped++; continue; }
    if (!r.examFile)               { noFile++;      continue; }

    const paperKey = getPaperKey(r.examFile);
    if (!paperKey) { noFile++; continue; }

    const phone = r.phoneNumber || r.mobile;
    if (!phone) { noPhone++; continue; }

    if (!byPaperMap[paperKey]) byPaperMap[paperKey] = new Map();

    const entry = {
      phone,
      name:        r.studentName    || r.name || "Student",
      dob:         r.dob            || "",
      category:    r.category       || "OC",
      score:       r.score          || 0,
      total:       r.totalQuestions || r.total || 0,
      correct:     r.correctAnswers || r.correct || 0,
      wrong:       r.wrongAnswers   || r.wrong || 0,
      unanswered:  r.unanswered     || 0,
      percentage:  r.percentage     || 0,
      timeTaken:   r.timeTaken      || 0,
      completedAt: r.completedAt    || "",
      ...getPassStatus(r.category, r.percentage || 0)
    };

    const existing = byPaperMap[paperKey].get(phone);
    if (existing) {
      dupMerged++;
      const oldT = Date.parse(existing.completedAt) || 0;
      const newT = Date.parse(entry.completedAt)    || 0;
      if (newT >= oldT) byPaperMap[paperKey].set(phone, entry);
    } else {
      byPaperMap[paperKey].set(phone, entry);
    }
  }

  const summary = {};
  for (const paperKey of Object.keys(byPaperMap)) {
    const list = Array.from(byPaperMap[paperKey].values());
    list.sort((a, b) => {
      if (b.score !== a.score)        return b.score - a.score;
      return (a.timeTaken || 0) - (b.timeTaken || 0);
    });
    list.forEach((row, i) => row.rank = i + 1);

    const payload = {
      examDate, paper: paperKey,
      examTitle:     paperTitle(paperKey),
      totalStudents: list.length,
      generatedAt:   new Date().toISOString(),
      results:       list
    };

    const filename = `${paperKey}_results_${examDate}.json`;
    if (env.RESULTS_KV) {
      await env.RESULTS_KV.put(filename, JSON.stringify(payload), {
        expirationTtl: 60 * 60 * 24 * 90
      });
    }
    summary[paperKey] = list.length;
  }

  return {
    examDate,
    totalRecordsScanned: total,
    testModeSkipped:     testSkipped,
    otherDatesSkipped:   dateSkipped,
    noExamFileSkipped:   noFile,
    noPhoneSkipped:      noPhone,
    duplicatesMerged:    dupMerged,
    papersFound:         Object.keys(summary),
    perPaperCount:       summary
  };
}

function paperTitle(paperKey) {
  const map = {
    "paper1":      "ஆசிரியர் தகுதி தேர்வு — பேப்பர் 1",
    "paper2":      "ஆசிரியர் தகுதி தேர்வு — பேப்பர் 2",
    "paper2_mss":  "பேப்பர் 2 — கணிதம் / அறிவியல் / சமூக அறிவியல்",
    "paper2_lang": "பேப்பர் 2 — மொழிப் பிரிவு"
  };
  return map[paperKey] || `தேர்வு முடிவுகள் — ${paperKey.toUpperCase()}`;
}

function normalizeStartRecord(raw) {
  if (!raw) return null;
  const phoneNumber = raw.phoneNumber || raw.mobile;
  const examFile    = raw.examFile;
  const examDate    = raw.examDate;
  if (!phoneNumber || !examFile || !examDate) return null;
  return {
    phoneNumber: String(phoneNumber),
    studentName: raw.studentName || raw.name || "Student",
    dob:         raw.dob || "",
    category:    raw.category || "OC",
    examFile,
    examDate,
    startedAt:   raw.startedAt || raw.registeredAt || "",
    attemptTs:   raw.attemptTs || 0
  };
}

async function generateAttendanceReport(examDate) {
  const [startsRes, sessionsRes, resultsRes] = await Promise.all([
    fetch(`${FIREBASE_DB_URL}/exam_starts.json`),
    fetch(`${FIREBASE_DB_URL}/device_sessions.json`),
    fetch(`${FIREBASE_DB_URL}/free_exam_results.json`)
  ]);
  const allStarts   = (await startsRes.json())   || {};
  const allSessions = (await sessionsRes.json()) || {};
  const allResults  = (await resultsRes.json())  || {};

  const startsByPaper = {};
  const startsIndex   = {};

  const ingestStart = (raw) => {
    const s = normalizeStartRecord(raw);
    if (!s) return;
    if (s.examDate !== examDate) return;
    const k = getPaperKey(s.examFile);
    if (!k) return;
    if (!startsByPaper[k]) { startsByPaper[k] = []; startsIndex[k] = {}; }
    const existing = startsIndex[k][s.phoneNumber];
    const newScore = Date.parse(s.startedAt) || s.attemptTs || 0;
    const oldScore = existing ? (Date.parse(existing.startedAt) || existing.attemptTs || 0) : -1;
    if (!existing || newScore >= oldScore) {
      startsIndex[k][s.phoneNumber] = s;
    }
  };

  for (const id in allStarts)   ingestStart(allStarts[id]);
  for (const id in allSessions) ingestStart(allSessions[id]);

  for (const k of Object.keys(startsIndex)) {
    startsByPaper[k] = Object.values(startsIndex[k]);
  }

  const resultsIndex = {};
  for (const id in allResults) {
    const r = allResults[id];
    if (!r || r.examDate !== examDate || r.isTestMode) continue;
    const phone = r.phoneNumber || r.mobile;
    const k = getPaperKey(r.examFile);
    if (!k || !phone) continue;
    if (!resultsIndex[k]) resultsIndex[k] = {};
    const cur = resultsIndex[k][phone];
    if (!cur || (Date.parse(r.completedAt) || 0) > (Date.parse(cur.completedAt) || 0)) {
      resultsIndex[k][phone] = r;
    }
  }

  const allPapers = new Set([...Object.keys(startsByPaper), ...Object.keys(resultsIndex)]);
  const perPaper  = {};

  for (const k of allPapers) {
    const starts  = startsByPaper[k]  || [];
    const results = resultsIndex[k]   || {};
    const startIx = startsIndex[k]    || {};

    const completed    = [];
    const notCompleted = [];

    for (const s of starts) {
      if (results[s.phoneNumber]) {
        const r = results[s.phoneNumber];
        completed.push({
          phone:       s.phoneNumber,
          name:        r.studentName || r.name || s.studentName,
          dob:         s.dob || r.dob || "",
          category:    s.category || r.category || "OC",
          score:       r.score || 0,
          percentage:  r.percentage || 0,
          startedAt:   s.startedAt,
          completedAt: r.completedAt
        });
      } else {
        notCompleted.push({
          phone:     s.phoneNumber,
          name:      s.studentName,
          dob:       s.dob,
          category:  s.category,
          startedAt: s.startedAt
        });
      }
    }

    const submittedWithoutStart = [];
    for (const phone in results) {
      if (!startIx[phone]) {
        const r = results[phone];
        submittedWithoutStart.push({
          phone,
          name:        r.studentName || r.name,
          score:       r.score || 0,
          percentage:  r.percentage || 0,
          completedAt: r.completedAt
        });
      }
    }

    perPaper[k] = {
      paperTitle:                 paperTitle(k),
      totalStarted:               starts.length,
      totalCompleted:             completed.length,
      totalNotCompleted:          notCompleted.length,
      totalSubmittedWithoutStart: submittedWithoutStart.length,
      completed,
      notCompleted,
      submittedWithoutStart
    };
  }

  return {
    examDate,
    generatedAt: new Date().toISOString(),
    papersFound: Array.from(allPapers),
    perPaper
  };
}
