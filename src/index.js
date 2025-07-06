require("dotenv").config();
const express = require("express");
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

// INICIALIZAR LA APLICACIÓN
const app = express();

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
    origin: 'http://localhost:3000', // Update with your frontend URL
    credentials: true
}))
app.use(bodyParser.json())

const opinion = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// RUTA DE BIENVENIDA
app.get("/", (req, res) => {
    res.send("Bienvenido a Notas de un lector");
});

// RUTAS
app.use("/api/users", userRoute);

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor HTPS correindo en http://localhost:${PORT}`);
});

// RUTAS QUE NO EXISTEN
app.use((req, res, next) => {
    res.status(404).send("Ruta no encontrada");
});