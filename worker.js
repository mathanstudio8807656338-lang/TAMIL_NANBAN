// Tamil Nanban - Cloudflare Worker
// Features:
//   1. Device Lock API (KV-based)
//   2. Result Auto-Generation (scheduled at 10:15 PM IST daily)
//   3. Manual generation endpoint for admin backup

const FIREBASE_DB_URL = 'https://tamil-nanban-default-rtdb.asia-southeast1.firebasedatabase.app';
const ADMIN_KEY = 'A1ADMIN2025';

// Community-wise pass cutoff percentages (TET standard)
const CUTOFFS = {
  'OC': 60, 'GENERAL': 60,
  'BC': 50, 'BCM': 50, 'MBC': 50, 'DNC': 50,
  'SC': 40, 'SCA': 40, 'ST': 40, 'PWD': 40
};

function getPassStatus(category, percentage) {
  const cutoff = CUTOFFS[(category || 'OC').toUpperCase()] ?? 60;
  return {
    cutoff,
    passed: percentage >= cutoff
  };
}

export default {
  // ═══════════════════════════════════════════════════════
  // 📡 HTTP Request Handler
  // ═══════════════════════════════════════════════════════
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ───────────────────────────────────────────────────
    // 📊 Serve generated result files (from KV)
    // GET /results/{paperKey}_results_{date}.json
    // ───────────────────────────────────────────────────
    if (path.startsWith('/results/') && path.endsWith('.json')) {
      const filename = path.split('/').pop();
      const data = await env.RESULTS_KV?.get(filename);
      if (!data) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      return new Response(data, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // ───────────────────────────────────────────────────
    // 🔥 Admin: Manual generation (backup if scheduler fails)
    // POST /api/admin-generate-results
    // Body: { adminKey, examDate }
    // ───────────────────────────────────────────────────
    if (path === '/api/admin-generate-results' && request.method === 'POST') {
      const body = await request.json();
      if (body.adminKey !== ADMIN_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: corsHeaders
        });
      }
      const examDate = body.examDate || new Date().toISOString().split('T')[0];
      try {
        const result = await generateAndStore(examDate, env);
        return new Response(JSON.stringify({ success: true, ...result }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500, headers: corsHeaders
        });
      }
    }

    // ───────────────────────────────────────────────────
    // Device Lock APIs (original)
    // ───────────────────────────────────────────────────
    if (path === '/api/device-check' && request.method === 'GET') {
      const phone = url.searchParams.get('phone');
      const deviceId = url.searchParams.get('deviceId');
      if (!phone || !deviceId) {
        return new Response(JSON.stringify({ allowed: false, message: 'தரவு இல்லை' }), { headers: corsHeaders });
      }
      const savedDevice = await env.DEVICE_SESSIONS.get(phone);
      if (!savedDevice) return new Response(JSON.stringify({ allowed: true }), { headers: corsHeaders });
      if (savedDevice === deviceId) return new Response(JSON.stringify({ allowed: true }), { headers: corsHeaders });
      return new Response(JSON.stringify({
        allowed: false,
        message: 'இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!'
      }), { headers: corsHeaders });
    }

    if (path === '/api/device-register' && request.method === 'POST') {
      const body = await request.json();
      const { phone, deviceId } = body;
      if (!phone || !deviceId) return new Response(JSON.stringify({ success: false }), { headers: corsHeaders });
      const existingDevice = await env.DEVICE_SESSIONS.get(phone);
      if (existingDevice) {
        if (existingDevice !== deviceId) {
          return new Response(JSON.stringify({
            success: false, blocked: true,
            message: 'இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!'
          }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      await env.DEVICE_SESSIONS.put(phone, deviceId, { expirationTtl: 60 * 60 * 24 * 90 });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (path === '/api/device-reset' && request.method === 'POST') {
      const body = await request.json();
      const { phone, adminKey } = body;
      if (adminKey !== ADMIN_KEY) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { headers: corsHeaders });
      }
      await env.DEVICE_SESSIONS.delete(phone);
      return new Response(JSON.stringify({ success: true, message: `${phone} device reset செய்யப்பட்டது!` }), { headers: corsHeaders });
    }

    // Static assets pass-through
    return env.ASSETS.fetch(request);
  },

  // ═══════════════════════════════════════════════════════
  // ⏰ Scheduled Handler — runs at 10:15 PM IST daily
  //    Cron: "45 16 * * *" (16:45 UTC = 22:15 IST)
  // ═══════════════════════════════════════════════════════
  async scheduled(event, env, ctx) {
    const istDate = new Date(event.scheduledTime);
    // Convert to IST date string
    const istString = istDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    console.log(`⏰ Scheduled run for IST date: ${istString}`);
    try {
      const result = await generateAndStore(istString, env);
      console.log('✅ Scheduled generation success:', result);
    } catch (err) {
      console.error('❌ Scheduled generation failed:', err.message);
    }
  }
};

// ═══════════════════════════════════════════════════════
// 🔥 Core: Read Firebase, generate JSONs, save to KV
// ═══════════════════════════════════════════════════════
async function generateAndStore(examDate, env) {
  // 🚀 OPTIMIZED: Fetch ONLY today's records using Firebase REST query
  // Requires index: { "free_exam_results": { ".indexOn": ["examDate"] } }
  // This avoids downloading the entire (growing) tree — 12x cost reduction.
  const queryUrl = `${FIREBASE_DB_URL}/free_exam_results.json?orderBy="examDate"&equalTo="${examDate}"`;
  const response = await fetch(queryUrl);
  if (!response.ok) {
    // Fallback: if index missing, fetch all (still works, just costlier)
    console.warn('Indexed query failed, falling back to full fetch:', response.status);
    const fallback = await fetch(`${FIREBASE_DB_URL}/free_exam_results.json`);
    if (!fallback.ok) throw new Error(`Firebase fetch failed: ${fallback.status}`);
    var allData = await fallback.json() || {};
  } else {
    var allData = await response.json() || {};
  }
  
  const byPaper = { paper1: [], paper2: [] };
  let total = 0, testSkipped = 0, dateSkipped = 0;
  
  for (const id in allData) {
    const r = allData[id];
    if (!r) continue;
    total++;
    if (r.isTestMode) { testSkipped++; continue; }
    if (r.examDate !== examDate) { dateSkipped++; continue; }
    if (!r.examFile) continue;
    
    const key = r.examFile.replace('.json', '');
    if (!byPaper[key]) continue;
    
    byPaper[key].push({
      phone: r.phoneNumber,
      name: r.studentName || 'மாணவர்',
      category: r.category || 'OC',
      score: r.score,
      total: r.totalQuestions,
      correct: r.correctAnswers,
      wrong: r.wrongAnswers,
      unanswered: r.unanswered || 0,
      percentage: r.percentage || 0,
      timeTaken: r.timeTaken || 0,
      completedAt: r.completedAt,
      ...getPassStatus(r.category, r.percentage || 0)
    });
  }
  
  // Sort & assign rank
  const summary = {};
  for (const key of ['paper1', 'paper2']) {
    byPaper[key].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });
    byPaper[key].forEach((r, i) => r.rank = i + 1);
    
    const examTitle = key === 'paper1'
      ? 'ஆசிரியர் தகுதி தேர்வு - கணிதம் + அறிவியல்'
      : 'ஆசிரியர் தகுதி தேர்வு - சமூக அறிவியல்';
    
    const payload = {
      examDate,
      paper: key,
      examTitle,
      totalStudents: byPaper[key].length,
      generatedAt: new Date().toISOString(),
      results: byPaper[key]
    };
    
    const filename = `${key}_results_${examDate}.json`;
    if (env.RESULTS_KV) {
      await env.RESULTS_KV.put(filename, JSON.stringify(payload), {
        expirationTtl: 60 * 60 * 24 * 90  // 90 days
      });
    }
    summary[key] = byPaper[key].length;
  }
  
  return {
    examDate,
    totalRecordsScanned: total,
    testModeSkipped: testSkipped,
    otherDatesSkipped: dateSkipped,
    paper1Count: summary.paper1,
    paper2Count: summary.paper2
  };
}
