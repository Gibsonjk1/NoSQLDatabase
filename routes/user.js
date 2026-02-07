const router = require('express').Router();
const userController = require('../controllers/userController');
const validator = require('../utilities/validate.js')
const util = require('../utilities/index.js');
const { ensureAuth, ensureGuest } = require('../middleware/auth');
//const { requiresAuth } = require('express-openid-connect');

// router.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.oidc.user));
// });
router.get('/', ensureAuth, util.handleErrors(userController.getAllUsers));
router.get('/google/:id', ensureAuth, util.handleErrors(userController.getUserByGoogleId));
router.get('/:id', util.handleErrors(userController.getUserById));
router.post('/', validator.userRules(), validator.checkUserData, util.handleErrors(userController.createUser));
router.put('/:id', validator.userRules(), validator.checkUserData, util.handleErrors(userController.updateUser));
router.delete('/:id', util.handleErrors(userController.deleteUser));

module.exports = router;