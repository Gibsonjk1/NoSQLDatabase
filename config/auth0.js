// const { auth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0_SECRET,
//   baseURL: 'http://localhost:3000',
//   clientID: 'Ckdlf15Dm7fItOyhhaa8e04En4r8swxh',
//   issuerBaseURL: 'https://dev-rdi2sd0vh0yhi4p6.us.auth0.com'
// };

// // auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

// // req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });
