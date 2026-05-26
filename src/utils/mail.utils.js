import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options) => {
    if (!options?.to) {
        throw new Error("Email recipient is required");
    }

    const mailGenarator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management Platform",
            link: process.env.FRONTEND_URL
        }
    });

    const emailTextual = mailGenarator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenarator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mail = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    };
    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

const emailverificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our application! we're very excited to have you on board.",
            action: {
                instructions: "Click the button below to verify your email:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl
                }
            },
            outro: "If you did not request this email, please ignore it."
        }
    };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password. Click the button below to proceed.",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#DC4D2F",
                    text: "Reset Password",
                    link: passwordResetUrl
                }
            },
            outro: "If you did not request this email, please ignore it."
        }
    };
};


export { emailverificationMailgenContent, forgotPasswordMailgenContent, sendEmail };
