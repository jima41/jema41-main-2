import { Resend } from 'resend';
import WelcomeEmail from '../../emails/WelcomeEmail';

// Assure-toi d'avoir ajouté RESEND_API_KEY dans ton .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    await resend.emails.send({
      from: 'Rayha Store <conciergerie@rayha.store>', // Ton domaine configuré sur Resend
      to: email,
      subject: 'Bienvenue chez Rayha',
      react: WelcomeEmail({ firstName }),
    });
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
  }
};