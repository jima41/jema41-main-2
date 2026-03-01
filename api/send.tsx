import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import * as React from 'react';
import WelcomeEmail from '../emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Rayha Store <conciergerie@rayha.store>',
      to: email,
      subject: 'Test — Rayha Store',
      react: React.createElement(WelcomeEmail),
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
