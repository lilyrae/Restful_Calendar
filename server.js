// server.js

// BASE SETUP
//===============================================================

// call the packages needed
var express		= require('express');	// call express
var app 		= express();			// define our app using express
var bodyParser	= require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port 		= process.env.PORT || 8080;	// set our port

var mongoose	= require('mongoose');
mongoose.connect('mongodb://restful_calendar_admin:restful_calendar_password@ds047524.mongolab.com:47524/restful_calendar'); // connect to database

var Event 		= require('./app/models/event')
var User 		= require('./app/models/user')

// for password authentification
var passport = require('passport');
var authController = require('./controllers/auth');
app.use(passport.initialize());

// ROUTES FOR OUR API
//===============================================================
var router = express.Router();			// get an instance of the express router

// middleware to use for all requests
// req - HTTP request, res - response
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening!');
	next(); // go onto the next routes, don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'howdie partner! welcome to the API'});
});

// more routes for the API to be placed here

// on routes that end in /events
// ==============================================================
router.route('/events')

	// create an event (accessed at POST http://localhost:8080/api/events)
	.post(authController.isAuthenticated, function(req, res) {
		var cal_event = new Event(); // create a new instance of the event model
		cal_event.OWNER = req.user.username; // set the event name (comes from request)
		cal_event.DTSTART = req.body.DTSTART;
		cal_event.DTEND = req.body.DTEND;
		cal_event.SUMMARY = req.body.SUMMARY;
		cal_event.STATUS = req.body.STATUS;
		cal_event.FREQ = req.body.FREQ;
		cal_event.UNTIL = req.body.UNTIL;
		cal_event.INTERVAL = req.body.INTERVAL;
		cal_event.BYDAY = req.body.BYDAY;
		cal_event.DESCRIPTION = req.body.DESCRIPTION;

		// save the event and check for errors
		cal_event.save(function(err) {
			if (err)
				res.send(err);

			res.json({message: 'Event has been created with id:' + cal_event._id +'.'});
		});
	})

	// get all the events (accessed at GET http://localhost:8080/api/events)
	.get(authController.isAuthenticated, function(req, res) {
		Event.find({OWNER: req.user.username}, function(err, events) {
			if (err)
				res.send(err);

			res.json(events);
		});
	});

// on routes that end in /events/search to search through results
// --------------------------------------------------------------
router.route('/events/search')

	//search through the events
	.get(authController.isAuthenticated, function(req, res) {

		query = {};

		query.OWNER = req.user.username;

		if (req.param('SUMMARY') != undefined)
			query.SUMMARY = {$regex : ".*" + req.param('SUMMARY') + ".*"};

    	if (req.param('DTSTART') != undefined)
    		query.DTSTART = req.param('DTSTART');

		Event.find(query, function(err, results) {
    		if (err)
				res.send(err);
			res.json(results);
  		});
	});

// on routes that end in /events/:event_id
// ----------------------------------------------------------------
router.route('/events/:event_id')

	// get the event with that id (accessed at GET http://localhost:8080/api/events/:event_id)
	.get(authController.isAuthenticated, function(req, res) {
		Event.findById(req.params.event_id, function(err, cal_event) {
			if (err)
				res.send(err);
			res.json(cal_event);
		});
	})

	// update the cal_event with this id (accessed at PUT http://localhost:8080/api/events/:event_id)
	.put(authController.isAuthenticated, function(req, res) {

		// use the event model to find the event that we want
		Event.findById(req.params.event_id, function(err, cal_event) {
			if (err)
				res.send(err);

			cal_event.DTSTART = req.body.DTSTART;  // set the event name (comes from request)
			cal_event.DTEND = req.body.DTEND;
			cal_event.SUMMARY = req.body.SUMMARY;
			cal_event.STATUS = req.body.STATUS;
			cal_event.FREQ = req.body.FREQ;
			cal_event.UNTIL = req.body.UNTIL;
			cal_event.INTERVAL = req.body.INTERVAL;
			cal_event.BYDAY = req.body.BYDAY;
			cal_event.DESCRIPTION = req.body.DESCRIPTION;

			// save the event
			cal_event.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Event is updated!' });
			});
		});
	})

	// delete the event with this id (access at DELETE http://localhost:8080/api/events/:event_id)
	.delete(authController.isAuthenticated, function(req, res) {
		Event.remove({
			_id: req.params.event_id
		}, function(err, cal_event) {
			if (err)
				res.send(err);

			res.json({ message: 'Event has been deleted' });
		});
	});


// on routes that end in /users
// ==============================================================
router.route('/users')

	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {
		var user = new User(); // create a new instance of the user model
		user.username = req.body.username; // set the user name (comes from request)
		user.password = req.body.password;

		// save the user and check for errors
		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({message: 'User has been created.'});
		});
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(authController.isAuthenticated, function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});

// on routes that end in /users/search to search through results
// --------------------------------------------------------------
router.route('/users/search')

	//search through the users
	.get(authController.isAuthenticated, function(req, res) {

		// query database for username
		query = req.param('username') != undefined ? {username : {$regex : ".*" + req.param('username') + ".*"}} : {};

    	console.log(query);

		User.find(query, function(err, results) {
    		if (err)
				res.send(err);
			res.json(results);
  		});
	});

// on routes that end in /users/:user_id
// ----------------------------------------------------------------
router.route('/users/:user_id')

	// get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
	.get(authController.isAuthenticated, function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
	.put(authController.isAuthenticated, function(req, res) {

		// use the user model to find the user that we want
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);

			user.username = req.body.username;

			// save the user
			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User is updated!' });
			});
		});
	})

	// delete the user with this id (access at DELETE http://localhost:8080/api/users/:user_id)
	.delete(authController.isAuthenticated, function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'User has been deleted' });
		});
	});
// REGISTER OUR ROUTES ------------------------------------------
// all of the routes will be prefixes with /api
app.use('/api', router);

// START THE SERVER
// ==============================================================
app.listen(port);
console.log('*Magic* happens on port ' + port)