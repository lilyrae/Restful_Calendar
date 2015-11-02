// event.js

var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var EventSchema	= new Schema({
	title: String,
	description: String,
	date: String

});

module.exports = mongoose.model('Event', EventSchema);