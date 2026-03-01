module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Test basique : vérifier que la fonction tourne
  const apiKey = process.env.RESEND_API_KEY || 'MISSING';
  const nodeVersion = process.version;
  const body = req.body;
  const method = req.method;

  // Log utile
  console.log('method:', method, 'body:', JSON.stringify(body), 'key starts with:', apiKey.slice(0, 6), 'node:', nodeVersion);

  if (method !== 'POST') {
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  if (apiKey === 'MISSING') {
    return res.status(500).end(JSON.stringify({ error: 'RESEND_API_KEY missing', node: nodeVersion }));
  }

  const email = (body || {}).email;
  if (!email) {
    return res.status(400).end(JSON.stringify({ error: 'Email missing', received_body: body, node: nodeVersion }));
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rayha Store <conciergerie@rayhastore.com>',
        to: [email],
        subject: 'Test Rayha Store',
        html: '<p>Test OK depuis Rayha Store.</p>',
      }),
    });

    const data = await r.json();
    return res.status(r.status).end(JSON.stringify({ resend_status: r.status, data, node: nodeVersion }));
  } catch (err) {
    return res.status(500).end(JSON.stringify({ error: String(err), node: nodeVersion, fetch_available: typeof fetch }));
  }
};
