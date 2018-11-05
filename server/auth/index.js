// Node Modules
const passport = require('passport');
// Custom Node Modules
const LocalStrategy = require('./LocalStrategy');
const userData = require('../db/users');

function findUserById(id) {
	return new Promise(async (fulfill, reject) => {
		if ((id) && (typeof(id) === 'string') && (id.length > 0)) {
			try {
				const user = await userData.getUserById(id);
				return fulfill(user);
			} catch (err) {
				return reject(err);
			}
		} else {
			return reject('Invalid user id');
		}
	});
}

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await findUserById(id);
		return done(null, user);
	} catch (err) {
		return done(err);
	}
});

LocalStrategy(passport);

module.exports = exports = passport;
