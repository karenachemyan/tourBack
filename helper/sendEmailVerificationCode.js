import nodemailer from "nodemailer";

const { INFO_EMAIL,APP_PASS } = process.env;

async function sendEmailVerificationCode(user) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: INFO_EMAIL,
                pass: APP_PASS,
            },
        });

        // Email content
        let mailOptions = {
            from: INFO_EMAIL,
            to: user.email,
            subject: 'Password Recovery Code',
            html: `<h3>Dear ${user.firstName} ${user.lastName},</h3><p>We got a password recovery request. Your Verification Code is <strong>${user.veryfication}</strong>.If you didnt do that you can ignore this message</p>`,
        
        };
   
        await transporter.sendMail(mailOptions);
        console.log('Password recovery code sent successfully!');
    } catch (error) {
        console.error('Error sending password recovery Code:', error);
    }
}

export default sendEmailVerificationCode