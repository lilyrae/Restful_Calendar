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
// --------------------------------------------------------------
router.route('/events')

	// create an event (accessed at POST http://localhost:8080/api/events)
	.post(function(req, res) {
		console.log('HERE');

		var cal_event = new Event(); // create a new instance of the event model
		cal_event.title = req.body.title; // set the event name (comes from request)
		cal_event.description = req.body.description;
		cal_event.date = new Date().toISOString();

		// save the event and check for errors
		cal_event.save(function(err) {
			if (err)
				res.send(err);

			res.json({message: 'Event has been created.'});
		});
	})

	// get all the events (accessed at GET http://localhost:8080/api/events)
	.get(function(req, res) {
		Event.find(function(err, events) {
			if (err)
				res.send(err);

			res.json(events);
		});
	});

// on routes that end in /events/:event_id
// ----------------------------------------------------------------
router.route('/events/:event_id')

	// get the event with that id (accessed at GET http://localhost:8080/api/events/:event_id)
	.get(function(req, res) {
		Event.findById(req.params.event_id, function(err, cal_event) {
			if (err)
				res.send(err);
			res.json(cal_event);
		});
	})

	// update the cal_event with this id (accessed at PUT http://localhost:8080/api/events/:event_id)
	.put(function(req, res) {

		// use the event model to find the event that we want
		Event.findById(req.params.event_id, function(err, cal_event) {
			if (err)
				res.send(err);

			cal_event.title = req.body.title;

			// save the event
			cal_event.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Event is updated!' });
			});
		});
	})

	// delete the bear with this id (access at DELETE http://localhost:8080/api/events/:event_id)
	.delete(function(req, res) {
		Event.remove({
			_id: req.params.event_id
		}, function(err, cal_event) {
			if (err)
				res.send(err);

			res.json({ message: 'Event has been deleted' });
		});
	});

// REGISTER OUR ROUTES ------------------------------------------
// all of the routes will be prefixes with /api
app.use('/api', router);

// START THE SERVER
// ==============================================================
app.listen(port);
console.log('*Magic* happens on port ' + port)