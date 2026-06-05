import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "TaskFlow",
                link: "http://taskflow.com",   
        },
    });

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    });

    const mail = {
        from: "mail@taskflow.com",
        to : options.mail,
        subject: options.subject,
        text: emailText,
        html: emailHTML
    }

    try{
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};

const emailVerificationTemplate = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to TaskFlow! We're excited to have you on board.",
            action: {
                instructions:
                    "To get started with TaskFlow, please click the button below to verify your email address:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl,
                },
            },
            outro: "If you did not create an account with us, please ignore this email. If you have any questions, feel free to reply to this email.",
        },
    };
};

const forgotPasswordTemplate = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password for your TaskFlow account.",
            action: {
                instructions: "To reset your password, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: resetUrl
                }
            },
            outro: "If you did not request a password reset, please ignore this email. If you have any questions, feel free to reply to this email."
        }
    };
};

export { emailVerificationTemplate, forgotPasswordTemplate, sendEmail };