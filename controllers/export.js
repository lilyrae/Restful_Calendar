var Event = require('../app/models/event');

exports.printICal = function(req, res) {

	// format calendar into string for export
	var iCal =  "BEGIN:VCALENDAR\r\n" +
				"VERSION:2.0\r\n" +
				"PRODID:-//LilyRae\r\n" +			
				"CALSCALE:GREGORIAN\r\n" +
				"METHOD:PUBLISH\r\n";

	// get all the events for the user
	Event.find({OWNER: req.user.username}).stream()

  		.on('data', function(cal_event){
		    // add events to export string
		    iCal += "BEGIN:VEVENT\r\n";
		    iCal += "UID:" + cal_event._id + "\r\n";
		    iCal += "SUMMARY:" + cal_event.SUMMARY + "\r\n";
		    iCal += "DTSTART:" + (cal_event.DTSTART).toISOString() + "\r\n";
		    iCal += "DTEND:" + (cal_event.DTEND).toISOString() + "\r\n";
		    iCal += "DTSTAMP:" + new Date().toISOString() + "\r\n";

		    if (cal_event.STATUS != undefined)
		    	iCal += "STATUS:" + cal_event.STATUS + "\r\n";

			if (cal_event.DESCRIPTION != undefined)
		    	iCal += "DESCRIPTION:" + cal_event.DESCRIPTION + "\r\n";

		    // for recurring events, add information together into recurring_str
		    // all recurring events have a frequency defined
		    var recurring_str = "";

		    if (cal_event.FREQ != undefined) {
		    	recurring_str += "FREQ=" + cal_event.FREQ + ";";
		    
		    	if (cal_event.UNTIL != undefined)
		    		recurring_str += "UNTIL=" + (cal_event.UNTIL).toISOString() + ";";

		    	if (cal_event.INTERVAL != undefined)
		    		recurring_str += "INTERVAL=" + cal_event.INTERVAL + ";";

			    if (cal_event.BYDAY != undefined) 
			    	recurring_str += "BYDAY=" + cal_event.BYDAY + ";";

			    // add recurring_str to iCal
		    	iCal += "RRULE:" + recurring_str.slice(0, -1) + "\r\n";
		    }

		    iCal += "END:VEVENT\r\n";

		  })

		.on('error', function(err){
		    // handle error
		    res.send(err);
		  })
		.on('end', function(){
		    // final callback
			// end export string
			iCal += "END:VCALENDAR";

			res.send(iCal);
		  });

}