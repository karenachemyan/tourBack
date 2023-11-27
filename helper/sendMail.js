import nodemailer from "nodemailer";

const { INFO_EMAIL,APP_PASS, FRONT_URL } = process.env;

async function sendRegistrationEmail(user) {
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
            subject: 'Welcome to Our Application',
            html: `<h3>Dear ${user.firstName} ${user.lastName},</h3><p>You have been successfully registered. To activate your account please click on the link below:</p><p><a href="${FRONT_URL}/activate?code=${user.veryfication}"> Click Here </a></p>`,
        
        };
   
        await transporter.sendMail(mailOptions);
        console.log('Registration email sent successfully!');
    } catch (error) {
        console.error('Error sending registration email:', error);       
    }
}

export default sendRegistrationEmail