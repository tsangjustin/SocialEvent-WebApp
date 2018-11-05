const authRoutes = require('./auth');
const eventRoutes = require('./events');
const pageRoutes = require('./page');
const profileRoute = require('./profile');

module.exports = exports = (app) => {
	if (!app) {
		throw "Expecting Express application to app routing";
	}
	app.use('/profile', profileRoute);
	app.use('/events', eventRoutes);
	app.use('/', authRoutes);
	app.use('/', pageRoutes);
	app.use('*', (req, res) => {
		return res.sendStatus(404);
	});
}
