require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const connection = require("./config/connection")
const fs = require("fs");
const https = require("https");
connection();

// IMPORAR RUTAS
const userRoute = require("./routes/userRoutes");
const notaRoute = require("./routes/notaRoutes");
const authRoute = require("./routes/authRoutes");


// INICIALIZAR LA APLICACIÓN
const app = express();
//RUTAS 


// CAPA DE SEGURIDAD
app.use(helmet());

const PORT = process.env.PORT || 3000;

// LÍMITE DE PETICIONES
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 MINUTO
    limit: 100, // 100 PETICIONES POR MINUTO,
    message: "¡Demasiadas peticiones!",
    standardHeaders: true,
    handler: (req, res) => {
        console.log("IP Bloqueada, alcanzo el límite de peticiones");
        res.status(409).json({ error: "Demasiadas peticiones!" });
    },
});

// APLICAR EL LÍMITE DE PETICIONES A TODAS LAS RUTAS
app.use(limiter)
app.use(cors({
    origin: 'http://localhost:4200', // Update with your frontend URL
    credentials: true
}))
app.use(bodyParser.json())
// CERTIFICACADOS (OPCIONAL SI USAS HTTPS LOCAL)
const opinion = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// RUTA DE BIENVENIDA
app.get("/", (req, res) => {
    res.send("Bienvenido a Notas de un lector");
});

// RUTAS(AQUI EST LO IMPORTANTE PARA LA CONECCION)
app.use("/api/users", userRoute);
app.use("/api/notas", notaRoute);
app.use("/api/auth", authRoute);

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor HTPS correindo en http://localhost:${PORT}`);
});

// RUTAS QUE NO EXISTEN
app.use((req, res, next) => {

    res.status(404).send("Ruta no encontrada");
});