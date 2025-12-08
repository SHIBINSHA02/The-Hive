// // lib/mail.ts
// // import { Resend } from 'resend';

// // Initialize Resend client using the environment variable RESEND_API_KEY
// // The environment variable is automatically picked up by the SDK.
// // const resend = new Resend(process.env.RESEND_API_KEY);

// /**
//  * Sends a password reset email to the user.
//  * @param email The user's email address.
//  * @param token The unique token for resetting the password.
//  */
// export async function sendResetEmail(email: string, token: string) {
//     const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
//     const resetUrl = `${base}/reset-password?token=${token}`;

//     if (process.env.NODE_ENV === "development") {
//         // In development, we log the link to the console for easy access
//         console.log(`[PASSWORD_RESET_DEV] Reset link for ${email}: ${resetUrl}`);
//         // Optional: Exit early in development to avoid hitting email limits
//         return;
//     }

//     try {
//         const { data, error } = await resend.emails.send({
//             from: 'Your App Name <onboarding@yourverifieddomain.com>', // MUST be a verified domain/sender in Resend
//             to: [email],
//             subject: 'Reset Your Password',
//             html: `
//                 <h1>Password Reset Request</h1>
//                 <p>We received a request to reset the password for your account.</p>
//                 <p>Click the link below to set a new password:</p>
//                 <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">
//                     Reset Password
//                 </a>
//                 <p>If you did not request a password reset, please ignore this email.</p>
//                 <p><small>This link expires soon.</small></p>
//             `,
//         });

//         if (error) {
//             console.error("Resend Error:", error);
//             // Optionally, throw an error or handle it gracefully
//             throw new Error('Failed to send reset email.');
//         }

//         console.log(`Reset email successfully sent to ${email}. ID: ${data?.id}`);

//     } catch (error) {
//         console.error("MAIL ERROR:", error);
//         throw new Error("Could not send password reset email due to a system error.");
//     }
// }