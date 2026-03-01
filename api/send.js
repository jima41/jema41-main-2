const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#ffffff;font-family:serif;margin:0;padding:0;">
  <div style="margin:0 auto;padding:40px 20px;max-width:600px;border:1px solid #eeeeee;">
    <div style="text-align:center;margin-bottom:30px;">
      <span style="font-size:40px;font-weight:bold;color:#000;border:2px solid #000;display:inline-block;padding:10px 20px;letter-spacing:5px;">R</span>
    </div>
    <h1 style="color:#000;font-size:24px;font-weight:normal;text-align:center;text-transform:uppercase;letter-spacing:2px;margin:30px 0;">
      Bienvenue chez Rayha Store
    </h1>
    <p style="color:#333;font-size:16px;line-height:26px;text-align:center;font-style:italic;">
      C'est un honneur de vous compter parmi nos membres privilégiés.
      Rayha Store est né de la passion pour les fragrances rares et les compositions artisanales d'exception.
    </p>
    <div style="text-align:center;margin-top:30px;">
      <p style="color:#888;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
        Votre voyage olfactif commence maintenant.
      </p>
    </div>
    <p style="color:#aaa;font-size:12px;text-align:center;margin-top:50px;border-top:1px solid #eeeeee;padding-top:20px;">
      Rayha Store — Parfumerie fine &amp; Parfums de luxe<br>
      https://rayhastore.com
    </p>
  </div>
</body>
</html>`;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).end(JSON.stringify({ error: 'Email is required' }));
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).end(JSON.stringify({ error: 'RESEND_API_KEY not configured' }));
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rayha Store <conciergerie@rayhastore.com>',
        to: [email],
        subject: 'Test — Rayha Store',
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).end(JSON.stringify({ error: data }));
    }

    return res.status(200).end(JSON.stringify({ success: true, id: data.id }));
  } catch (err) {
    return res.status(500).end(JSON.stringify({ error: String(err) }));
  }
};
