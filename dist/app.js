"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const mongodb = require('../db/connection');
//const { auth } = require('express-openid-connect');
//const mongoose = require('mongoose');
require('../config/passport')(passport_1.default);
//Auth0 config
// app.use(auth({
//     authRequired: false,
//     auth0Logout: true,
//     secret: process.env.AUTH0_SECRET,
//     baseURL: process.env.BASEURL,
//     clientID: 'Ckdlf15Dm7fItOyhhaa8e04En4r8swxh',
//     issuerBaseURL: 'https://dev-rdi2sd0vh0yhi4p6.us.auth0.com'
// }));
//Sessions
app.use((0, express_session_1.default)({
    secret: 'kittypoo ln',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
//passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
//Coonect to Mongoose
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// .then(() => {
//     console.log('Connected to MongoDB via Mongoose');
//     app.listen(PORT, () => {
//         console.log(`Server is running: http://localhost:${PORT}`);
//     });
// })
// .catch((err: Error) => {
//     console.error('Error connecting to MongoDB via Mongoose:', err);
// });
//Connect to MongoDB first
mongodb.initDb((err, db) => {
    if (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if database connection fails
    }
    else {
        // Set up middleware after DB is connected
        app
            .use(express_1.default.json())
            .use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Z-Key");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            next();
        });
        // Set up routes after DB is connected
        app.use('/', require('../routes/index.js'));
        // Start server after everything is set up
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    }
});
