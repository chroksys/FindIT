import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { businessName, hostEmail, documentUrls } = req.body;

    if (!businessName || !hostEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: 'FindIt Admin <onboarding@resend.dev>', // Resend test domain (change this when you verify a domain)
      to: 'christianokitovs@gmail.com', // The admin's email
      subject: `New KYB Verification Request: ${businessName}`,
      html: `
        <h2>New Business Verification Request</h2>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Host Email:</strong> ${hostEmail}</p>
        <h3>Uploaded Documents:</h3>
        <ul>
          ${documentUrls.map(url => `<li><a href="${url}" target="_blank">View Document</a></li>`).join('')}
        </ul>
        <p>Log in to your Supabase dashboard to verify this user.</p>
      `,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ message: 'Email sent successfully', data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
