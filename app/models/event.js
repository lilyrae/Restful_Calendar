// event.js

var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var EventSchema	= new Schema({
	OWNER: {type: String, required: true},
	DTSTART: {type: Date, required: true},
	DTEND: {type: Date, required: true},
	SUMMARY: {type: String, required: true},
	SUMMARY_LC: {type: String, required: true},
	STATUS: String,
	FREQ: String,
	UNTIL: Date,
	INTERVAL: Number,
	BYDAY: String,
	DESCRIPTION: String

});

module.exports = mongoose.model('Event', EventSchema);