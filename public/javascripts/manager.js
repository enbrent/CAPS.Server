var codes = { 
    'FAILED' : '1',
    'OK' : '0'
};

var pChange = 0;
var sCount = 0;
var updateButtonChanged = false;

var updateButton = function() {
	if(pChange++ < sCount || updateButtonChanged) return;
	// button = document.getElementById('updateButton');
	// button.className = 'ui button';
	// updateButtonChanged = true;

	//form = $('#updateSensorForm');
	form = document.getElementById('updateSensorForm');
    // input.ui.fluid.button(type='submit' value='Update')
    button = document.createElement('input');
    button.className = 'ui button';
    button.setAttribute('type', 'submit');
    button.setAttribute('value', 'Update');
    button.setAttribute('id', 'updateButton');
    button.style.float = 'right'
    form.appendChild(button);
    updateButtonChanged = true;

}

$(document).ready(function() {
	console.log('inside manager.js');

	// $('#editName').modal('show');
	

	// Initialize tab menu
	$('.ui.top.attached.tabular.menu.three.item .item').tab({
		history: true,
		historyType: 'hash'
	});

	console.log(deviceData);

	// Check if data is activated.
	if(deviceData.isActivated) {
		createSensorList();		
	} else {
		// Inform that device not activated.
		var msg = createDiv('ui negative message');
		var hdr = createDiv('header');
		hdr.innerHTML = 'Device Not Activated'
		var content = document.createElement('p');
		content.innerHTML = 'Please press the reset button on the device and refresh the page.';

		msg.appendChild(hdr);
		msg.appendChild(content);
		document.getElementById('updateSensorForm').appendChild(msg);
	}

	// Initialize dropdown priorities for sensors
	$('.dropdown').dropdown({
	 transition: 'drop',
	 onChange: updateButton
	});

	$('#info')
	  .transition('hide')
	  .transition('fade up', '1s');

	registerUpdateModals();

	console.log('inside end manager.js');

}); 

function registerUpdateModals() {
    registerModal('editName', { name: 'name', id: 'userName' }, function() {
        var fname = document.querySelector('[name="firstName"]').value
        , lname = document.querySelector('[name="lastName"]').value;

        if(fname.length == 0 || lname.length == 0) return errorInModal('#editNameError', 'Please enter your name');
        return (fname + ' ' + lname);
    });

    registerModal('editEmail', { name: 'email', id: 'userEmail' }, function() {
    	var email = document.querySelector('[name="email"]').value;

    	if(email.length == 0) return errorInModal('#editEmailError', 'Please enter your email');
    	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	if(!re.test(email)) return errorInModal('#editEmailError', 'Please enter a valid email');
    	if(userData.email == email) return errorInModal('#editEmailError', 'This email is your current email');	
    	return email;
    })

    registerModal('editPass', { name: 'password', id: 'userPass' }, function() {
    	var curpw = document.querySelector('[name="password"]').value
    	  , npw = document.querySelector('[name="newpassword"]').value
    	  , cpw = document.querySelector('[name="conpassword"]').value;

    	  if(curpw.length == 0) return errorInModal('#editPassError', 'Please enter your current password');
    	  if(npw.length == 0) return errorInModal('#editPassError', 'Please enter your new password');
    	  if(cpw.length == 0) return errorInModal('#editPassError', 'Please enter your new password again');
    	  return { current: curpw, new: npw, confirm: cpw };
    })

    registerModal('editPhone', { name: 'phone', id: 'userPhone'}, function() {
    	var phoneNum = document.querySelector('[name="phoneNum"]').value

    	if(phoneNum.length == 0) return errorInModal('#editPhoneError', 'Please enter your phone number');
    	return phoneNum;
    });

}

function errorInModal(id, msg) {
	$(id).children('p').get(0).innerHTML = msg;
    $(id).removeClass('hidden');
    return null;
}

// Create semantic-ui segments for each sensor
function createSensorList() {
	console.log(userData);

	console.log(deviceData);

	var sensors = JSON.stringify(deviceData.sensors);
	var priorities = JSON.stringify(deviceData.priorities);
	var isSynced = deviceData.isSynced;

	console.log('the device is synced: ' + isSynced);

	sensorCount = Object.keys(deviceData.sensors).length;
	sCount = sensorCount;

	/// Create reusable dropdown module.
	var uiDropdown = createDropdown(sensorCount);

	var sensorForm = document.getElementById('updateSensorForm');

	/// Create warning message that device is not synced.
	if(!isSynced) {
        var error = document.createElement('div');
        error.className = 'ui negative message';
        var p = document.createElement('p');
        p.innerHTML = 'Please reset your device to complete priority update.';
        p.style.textAlign = 'left';
        error.appendChild(p);
        // document.body.appendChild(error);
        sensorForm.appendChild(error);
    }  

	/// Create each sensor segment and append.
	for(var i = 0; i < sensorCount; i += 1) {
		// Get sensor name from key.
		var sKey = 's' + i.toString()
		var sName = deviceData.sensors[sKey];
		var cPriority = deviceData.priorities[sName];
		// cPriority = cPriority == 0 ? 'off' : cPriority;

		console.log(sName + ' ' + cPriority);
		sensorForm.appendChild(createSensorSegment(sensorCount, sName, cPriority));
	}

	// Create update button
    // input.ui.fluid.button(type='submit' value='Update')
    // button = document.createElement('input');
    // button.className = 'ui disabled button';
    // button.setAttribute('type', 'submit');
    // button.setAttribute('value', 'Update');
    // button.setAttribute('id', 'updateButton');
    // button.style.float = 'right'
    // sensorForm.appendChild(button);

	console.log(deviceData.sensors['s0']);
	console.log(deviceData.priorities[deviceData.sensors['s0']]);

	var p = deviceData.priorities[deviceData.sensors['s0']];
	// if(p == 0) console.log('off');

	console.log(Object.keys(deviceData.sensors).length);
}

// div.ui.segment
//     span(style='align:left;') TEMPERATURE
//     div.ui.dropdown(style='float:right')
//         div.text Priority
//         i.dropdown.icon
//         div.menu
//             div.header Priorities
//             div.item off
//             div.item 1
//             div.item 2
//             div.item 3
function createSensorSegment(sensorCount, sensorName, curPriority) {
	var segment = createDiv('ui segment');

	var name = document.createElement('span');
	name.style.align = 'left';
	name.innerHTML = sensorName.toUpperCase();

	segment.appendChild(name);
	segment.appendChild(createDropdown(sensorCount, curPriority));
	return segment;

}

//     div.ui.dropdown(style='float:right')
//         div.text Priority
//         i.dropdown.icon
//         div.menu
//             div.header Priorities
//             div.item off
//             div.item 1
//             div.item 2
//             div.item 3
// Create reusable dropdown module.
function createDropdown(sensorCount, defaultPriority) {
	var uiDropdown = createDiv('ui dropdown');
	uiDropdown.style.float = 'right';

	// Create input element
	var input = document.createElement('input');
	input.setAttribute('name', 'priority');
	input.setAttribute('value', 'default');
	input.setAttribute('type', 'hidden');

	// Create text and menu elements
	var text = createDiv('text');
	text.innerHTML = 'Priority';

	// Create dropdown icon
	var icon = document.createElement('i');
	icon.className = 'dropdown icon';

	// Create menu
	var menu = createDiv('menu')
	var menuHeader = createDiv('header');
	menuHeader.innerHTML = 'Priorities';
	menu.appendChild(menuHeader);
	for(var i = 0; i < sensorCount+1; i += 1) {
		var pNum = createDiv('item');
		pNum.setAttribute("data-value", i == defaultPriority ? "default" : i);
		pNum.innerHTML = i == 0 ? 'OFF' : i.toString();
		menu.appendChild(pNum);
	}

	// Append everything to dropdown parent
	uiDropdown.appendChild(input);
	uiDropdown.appendChild(text);
	uiDropdown.appendChild(icon);
	uiDropdown.appendChild(menu);
	return uiDropdown;
}


// Create a div element with a className
function createDiv(className) {
	var div = document.createElement('div');
	div.className = className;
	return div;
}

function registerModal(id, info, getData) {
	var modalId = '#' + id + 'Modal'
	  , errorId = '#' + id + 'Error';

	var infoName = info.name
	  , infoId =  '#' + info.id

    $(modalId)
        .modal({
            closable: false,
            transition: 'fade up',
            onHide: function() {
                (function() {
                    $(errorId).addClass('hidden');
                    $(modalId).find(':input').each(function() {
                        jQuery(this).val('');
                    })
                })();
            },
            onDeny: function() {
                console.log('denied!');
                return false;
            },
            onApprove: function() {

                var toSend = getData();
                console.log('to send:' + toSend);
                if(toSend == null) return false;

                $.post('/changeinfo', { info: infoName, data: toSend } , function(data, stat, xhr) {
                    console.log(data);
                    if(data.status == codes.FAILED) {
                        $(errorId).children('p').get(0).innerHTML = data.msg;
                        $(errorId).removeClass('hidden');
                    } else {
                        console.log('sucesss');
                        if(id == 'editPass') $(infoId).html('••••••••••••');
                        else $(infoId).html(data.data);
                        if(id == 'editName') $('#nameMenu').html(data.data);
                        $(errorId).addClass('hidden');
                        $(modalId).modal('hide');
                    }               
                });
                return false
            }
    });
    document.getElementById(id).addEventListener("click", function() {
        $(modalId).modal('show');
    }); 

}