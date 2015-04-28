var dateOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
}

$(document).ready(function() {
	console.log('welcome to alerts page~');
	if(alertsData.length > 0) {
		$('#noAlert').remove();
		createAlertsTable();	
	}
	
})

// table.ui.table
// 	thead
// 		tr
// 			th Date
// 			th Time
// 			th Sensors
// 			th Token
// 			th Status
// 	tbody
// 		tr
// 			td January 1, 2015
// 			td 7:23:56 PM
// 			td MOTION, TEMPERATURE
// 			td A42155
// 			td Alert code sent to +8037955532
function createAlertsTable() {
	// Create headers
	var table = document.createElement('table');
	$(table).addClass('ui table');
	var thead = document.createElement('thead');
	var headers = document.createElement('tr');
	$(headers).append(createHeader('Date'));
	$(headers).append(createHeader('Time'));
	$(headers).append(createHeader('Sensors'));
	$(headers).append(createHeader('Token'));
	$(headers).append(createHeader('Status'));
	$(thead).append(headers);
	$(table).append(thead);
	var tbody = document.createElement('tbody');

	for(var k = 0; k < alertsData.length; k += 1) {
		$(tbody).prepend(createAlertRow(alertsData[k]));
	}

	$(table).append(tbody);
	$('#alertsContainer').append(table);
}


function createAlertRow(alert) {
	var row = document.createElement('tr');
	var date = new Date(alert.date);
	$(row).append(createRowEntry(date.toLocaleDateString('en-us', dateOptions))) // date
	$(row).append(createRowEntry(date.toLocaleTimeString())) // time
	$(row).append(createRowEntry(alert.sensors.join(', ').toUpperCase())); // sensors
	$(row).append(createRowEntry(alert.token)); // token
	$(row).append(createRowEntry(alert.status)); // status
	return row;
}

function createHeader(label) {
	var header = document.createElement('th');
	header.innerHTML = label;
	return header;
}

function createRowEntry(label) {
	var rowEntry = document.createElement('td');
	rowEntry.innerHTML = label;
	return rowEntry;
}