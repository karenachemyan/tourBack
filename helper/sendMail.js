import nodemailer from "nodemailer";

const { INFO_EMAIL,APP_PASS, BASE_URL } = process.env;

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
            text: `Dear ${user.firstName} ${user.lastName},\n\nYou have been successfully registered. To activate your account please click on the link below\n\nhttp://localhost:3000/activate?code=${user.veryfication}`,
        };
   
        await transporter.sendMail(mailOptions);
        console.log('Registration email sent successfully!');
    } catch (error) {
        console.error('Error sending registration email:', error);       
    }
}

export default sendRegistrationEmail