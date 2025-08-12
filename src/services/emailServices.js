const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Tu correo
        pass: process.env.EMAIL_PASS   // Tu contraseña o contraseña de aplicación
    },
});


const sendVerificationEmail = async (to, subject, text, html, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"Notas de un Lector" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verifica tu cuenta",
        html: `
      <h2>¡Hola querido lector!</h2>
      <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Este enlace expirará en 24 horas.</p>
    `,
    });
};

module.exports = { sendVerificationEmail };
