import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response: { body: unknown } };
      console.error(sgError.response.body);
    }
    throw error;
  }
}