// A1 LMS - Device Lock Worker API
// DEVICE_SESSIONS KV: phone → deviceId

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Device Check
    if (path === '/api/device-check' && request.method === 'GET') {
      const phone = url.searchParams.get('phone');
      const deviceId = url.searchParams.get('deviceId');

      if (!phone || !deviceId) {
        return new Response(JSON.stringify({ allowed: false, message: 'தரவு இல்லை' }), { headers: corsHeaders });
      }

      const savedDevice = await env.DEVICE_SESSIONS.get(phone);

      if (!savedDevice) {
        return new Response(JSON.stringify({ allowed: true }), { headers: corsHeaders });
      }

      if (savedDevice === deviceId) {
        return new Response(JSON.stringify({ allowed: true }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ 
        allowed: false, 
        message: 'இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!' 
      }), { headers: corsHeaders });
    }

    // Device Register - முதல் முறை மட்டும் register, overwrite இல்லை!
    if (path === '/api/device-register' && request.method === 'POST') {
      const body = await request.json();
      const { phone, deviceId } = body;

      if (!phone || !deviceId) {
        return new Response(JSON.stringify({ success: false }), { headers: corsHeaders });
      }

      // ஏற்கனவே registered இருந்தால் overwrite செய்யாதே!
      const existingDevice = await env.DEVICE_SESSIONS.get(phone);
      if (existingDevice) {
        if (existingDevice !== deviceId) {
          // வேற device register ஆகிவிட்டது - block!
          return new Response(JSON.stringify({ 
            success: false, 
            blocked: true,
            message: 'இந்த account வேறு device-ல் பயன்படுத்தப்படுகிறது!' 
          }), { headers: corsHeaders });
        }
        // Same device - ok
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // புதிய device - முதல் முறை register செய்
      await env.DEVICE_SESSIONS.put(phone, deviceId, { expirationTtl: 60 * 60 * 24 * 90 });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // Admin Reset Device
    if (path === '/api/device-reset' && request.method === 'POST') {
      const body = await request.json();
      const { phone, adminKey } = body;

      if (adminKey !== 'A1ADMIN2025') {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { headers: corsHeaders });
      }

      await env.DEVICE_SESSIONS.delete(phone);
      return new Response(JSON.stringify({ success: true, message: `${phone} device reset செய்யப்பட்டது!` }), { headers: corsHeaders });
    }

    // Static assets - pass through
    return env.ASSETS.fetch(request);
  }
};
