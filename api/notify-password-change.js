import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    const data = await resend.emails.send({
      from: 'FindIt Security <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Your Password Has Been Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #19192d;">Password Changed Successfully</h2>
          <p>Hello,</p>
          <p>This is a confirmation that the password for your FindIt account (<strong>${userEmail}</strong>) was recently changed.</p>
          <p>If you made this change, you can safely ignore this email.</p>
          <p style="color: #e74c3c;"><strong>If you did not make this change, please contact support immediately to secure your account.</strong></p>
          <br/>
          <p>Best regards,<br/>The FindIt Security Team</p>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending password change email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
