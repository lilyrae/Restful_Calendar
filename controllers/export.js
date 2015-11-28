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
		    console.log("Entered portal");

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
		    var recurring_str = "";
		    var isRecurring = false;

		    if (cal_event.FREQ != undefined) {
		    	recurring_str += "FREQ=" + cal_event.FREQ + ";";
		    	isRecurring = true;
		    }

		    if (cal_event.UNTIL != undefined) {
		    	recurring_str += "UNTIL=" + (cal_event.UNTIL).toISOString() + ";";
		    	isRecurring = true;
		    }

		    if (cal_event.INTERVAL != undefined) {
		    	recurring_str += "INTERVAL=" + cal_event.INTERVAL + ";";
		    	isRecurring = true;
		    }

		    if (cal_event.BYDAY != undefined) {
		    	recurring_str += "BYDAY=" + cal_event.BYDAY + ";";
		    	isRecurring = true;
		    }

		    // add recurring_str to iCal
		    if (isRecurring)
		    	iCal += "RRULE:" + recurring_str.slice(0, -1) + "\r\n";

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