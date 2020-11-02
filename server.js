const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const expressSanitizer = require('express-sanitizer');
const mainRouter = require("./routers/mainRouter");
const testRouter = require("./routers/testRouter");
const requireAuth = require("./middleWare/requireAuth");
const authRouter = require("./routers/authRouter");
require("./dataBase/utils/dbConnect");
app.use(cors());
app.use(expressSanitizer());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
// app.get('/', (req, res) => res.sendFile("./index.html", { root: './public' }));
app.use('/assets', express.static('./assets'));
app.use('/image', express.static('./uploads'));
app.use('/', express.static('./public'));
app.use("/auth", authRouter)
app.use("/api", requireAuth, mainRouter);
app.use("/test", testRouter);
app.get("/favicon.ico", (req, res) => res.sendFile("./favicon.ico", { root: "./" }));

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ message: error.message });
});

module.exports = app.listen(process.env.PORT || 8080, () =>
    console.log(`CroudSourcing listening on port ${process.env.PORT}!, go to http://localhost:${process.env.PORT}`)
);