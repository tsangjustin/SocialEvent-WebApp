// Node Modules
const router = require('express').Router();
const xss = require("xss");
// Custom Node Modules
const passport = require('../auth/');
const userData = require('../db/').user;

function isValidString(str) {
	if ((!str) || (typeof(str) !== 'string')  || (str.length <= 0)) {
		return false;
	}
	return true;
}

router.post('/sign_up', async (req, res) => {
	try {
		const user = await userData.createUser(req.body);
		req.login(user, (loginErr) => {
			if (loginErr) {
				return res.status(401).json({ error: loginErr });
			}
			const userInfo = {
				_id: user._id,
				avatar: user.avatar,
				username: user.username,
				email: user.email,
				isMale: user.isMale,
			};
			return res.json({ user: userInfo });
		});
	} catch (err) {
		return res.status(401).json({ error: err });
	}
});

router.post("/log_in", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
			return res.status(401).json({ error: err });
		}
    if (!user) {
			return res.status(401).json({ error: "Invalid username and/or password" });
		}
		const userInfo = {
			_id: user._id,
			username: xss(user.username),
			avatar: xss(user.avatar),
			email: xss(user.email),
			isMale: user.isMale,
		};
    req.logIn(user, function(err) {
      if (err) {
				return res.status(401).json({ error: err });
			}
      return res.json({ user: userInfo });
    });
	})(req, res, next);
});

router.get('/log_out', (req, res) => {
	req.logout();
	return res.json({ success: true });
});

module.exports = exports = router
