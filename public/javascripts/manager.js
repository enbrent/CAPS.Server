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
	console.log('inside start manager.js');

	console.log(deviceData);

	if(!userData.phoneVerified) {
		verifyPhone();
	} else {
		start();
	}
	console.log('inside end manager.js');

}); 

function start() {
	
	// Initialize tab menu
	$('.ui.top.attached.tabular.menu.three.item .item').tab({
		history: true,
		historyType: 'hash'
	});	
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
}

function emailLen() { return $('[name="email"]').val().length <= 0 }
function emailVal() {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return !re.test($('[name="email"]').val());
}
function emailSame() { return $('[name="email"]').val() ==  userData.email; }
function newpassLen() { return $('[name="newpassword"]').val().length <= 0; }
function newpassLenSix() { return $('[name="newpassword"]').val().length < 6; }
function curpassLen() { return $('[name="password"]').val().length <= 0; }
function conpassLen() { return $('[name="conpassword"]').val().length <= 0; }
function passSame() { return $('[name="newpassword"]').val() != $('[name="conpassword"]').val(); }
function fnameLen() { return $('[name="firstName"]').val().length <= 0; }
function lnameLen() { return $('[name="lastName"]').val().length <= 0; }
function cphoneLen() { return $('#currentNumber').intlTelInput('getNumber').length <= 0; }
function cphoneVal() { return !$('#currentNumber').intlTelInput('isValidNumber'); }
function phoneTokenLen() { return $('#newNumberToken').val().length <= 0; }
function ephoneLen() { return $('#emergencyNumber').intlTelInput('getNumber').length <= 0; }
function ephoneVal() { return !$('#emergencyNumber').intlTelInput('isValidNumber'); }
function ephoneSame() { return $('#emergencyNumber').intlTelInput('getNumber') == userData.emergencyNumber; }
function deviceLen() { return $('[name="deviceId"]').val().length <= 0; }
function deviceSame() { return $('[name="deviceId"]').val() == userData.deviceNumber; }

function registerUpdateModals() {
    registerModal('#editName', { name: 'name', id: '#userName' }, function() {
        var fname = document.querySelector('[name="firstName"]').value
        , lname = document.querySelector('[name="lastName"]').value
        , toPost = true;

		if(fnameLen()) {
			 addErrorPre('Please enter your first name', '#editName', '#firstName', fnameLen);
			 toPost = false;
		}
		if(lnameLen()) {
			 addErrorPre('Please enter your last name', '#editName', '#lastName', lnameLen);
			 toPost = false;
		}
		if(!toPost) return null;
        return (fname + ' ' + lname);
    });

    registerModal('#editEmail', { name: 'email', id: '#userEmail' }, function() {
    	var email = document.querySelector('[name="email"]').value
    	  , toPost = true;

		if(emailLen()) {
			addErrorPre('Please enter your email', '#editEmail', '#email', emailLen);
			toPost = false;
		} else if(emailVal()) {
			addErrorPre('Please enter a valid email', '#editEmail', '#email', emailVal);
			toPost = false;
		} else if(emailSame()) {
			addErrorPre('This email is your current email', '#editEmail', '#email', emailSame);
			toPost = false;
		}
		if(!toPost) return null;
    	return email;
    })

    registerModal('#editPass', { name: 'password', id: '#userPass' }, function() {
    	var curpw = document.querySelector('[name="password"]').value
    	  , npw = document.querySelector('[name="newpassword"]').value
    	  , cpw = document.querySelector('[name="conpassword"]').value
    	  , toPost = true;

		if(curpassLen()) {
			addErrorPre('Please enter your current password', '#editPass', '#curPass', curpassLen);
			toPost = false;
		} else if(newpassLen()) {
			addErrorPre('Please enter your new password', '#editPass', '#newPass', newpassLen);
			toPost = false;
		} else if(conpassLen()) {
			addErrorPre('Please enter your new password again', '#editPass', '#conPass', conpassLen);
			toPost = false;
		}   	  
		if(!toPost) return null;
    	return { current: curpw, new: npw, confirm: cpw };
    })

    $('#currentNumber').intlTelInput({
        utilsScript: '/javascripts/telUtils.js',
        onlyCountries: ['us']
    });

    registerModal('#editPhone', { name: 'phone', id: '#userPhone'}, function() {
    	var phoneNum = $('#currentNumber').intlTelInput('getNumber')
    	  , code = document.querySelector('[name="newNumberToken"]').value
    	  , toPost = true;

		if(cphoneLen()) {
			addErrorPre('Please enter your phone number', '#editPhone', '#currentNumber', cphoneLen);
			toPost = false;
		} else if(cphoneVal()) {
			addErrorPre('Please enter a valid phone number', '#editPhone', '#currentNumber', cphoneVal);
			toPost = false;
		}
		if(phoneTokenLen()) {
			addErrorPre('Please enter the verification code', '#editPhone', '#newNumberToken', phoneTokenLen);
			toPost = false;
		}
		if(!toPost) return null;
		return { phone: phoneNum, code: code };
    });

    $('#emergencyNumber').intlTelInput({
        utilsScript: '/javascripts/telUtils.js',
        onlyCountries: ['us']
    });

    registerModal('#editEPhone', { name: 'emergency', id: '#userEmergency' }, function() {
    	var ephoneNum = $('#emergencyNumber').intlTelInput('getNumber')
    	  , toPost = true;

		if(ephoneLen()) {
			addErrorPre('Please enter your emergency number', '#editEPhone', '#emergencyNumber', ephoneLen);
			toPost = false;
		} else if(ephoneVal()) {
			addErrorPre('Please enter a valid phone number', '#editEPhone', '#emergencyNumber', ephoneVal);
			toPost = false;
		} else if(ephoneSame()) {
			addErrorPre('This number is your current emergency number', '#editEPhone', '#emergencyNumber', ephoneSame);
			toPost = false;
		}
		if(!toPost) return null;
    	return ephoneNum;
    })

    registerModal('#editEPhone', { name: 'emergency', id: '#userEmergency' }, function() {
    	var ephoneNum = $('#emergencyNumber').intlTelInput('getNumber')
    	  , toPost = true;

		if(ephoneLen()) {
			addErrorPre('Please enter your emergency number', '#editEPhone', '#emergencyNumber', ephoneLen);
			toPost = false;
		} else if(ephoneVal()) {
			addErrorPre('Please enter a valid phone number', '#editEPhone', '#emergencyNumber', ephoneVal);
			toPost = false;
		} else if(ephoneSame()) {
			addErrorPre('This number is your current emergency number', '#editEPhone', '#emergencyNumber', ephoneSame);
			toPost = false;
		}
		if(!toPost) return null;
    	return ephoneNum;
    });

  	registerModal('#editDevice', { name: 'device', id: '#userDevice' }, function() {
  		var deviceId = $('#deviceId').val()
  		  , toPost = true;

		if(deviceLen()) {
			addErrorPre('Please enter your device ID', '#editDevice', '#deviceId', deviceLen);
			toPost = false;
		} else if(deviceSame()) {
			addErrorPre('This ID is your current device ID', '#editDevice', '#deviceId', deviceSame);
			toPost = false;
		}

		if(!toPost) return null;
		return deviceId;
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
	var modalId = id + 'Modal'
	  , errorId = id + 'Error'
	  , listId = id + 'List';

	var infoName = info.name
	  , infoId =  info.id
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
                    $(modalId).find('.field').each(function() {
                    	jQuery(this).removeClass('error');
                    })
                })();
            },
            onDeny: function() {
            	if(id == '#editPhone') {
	            	$(modalId).find('.field').each(function() {
	                    	jQuery(this).removeClass('error');
	                })
	            	$(listId).empty();
	            	$(errorId).addClass('hidden');
            		var toPost = true;
    				if(cphoneLen()) {
						addErrorPre('Please enter your phone number', '#editPhone', '#currentNumber', cphoneLen);
						toPost = false;
					} else if(cphoneVal()) {
						addErrorPre('Please enter a valid phone number', '#editPhone', '#currentNumber', cphoneVal);
						toPost = false;
					}
					if(toPost) {
						$.post('/sendverifyphone', { phone: $('#currentNumber').intlTelInput('getNumber')}, function(data, stat, xhr) {
							if(data.status == codes.FAIL) {
								// errorInModal('#verifyPhoneError', data.msg);
								addError(id, '#currentNumber', data.msg);
								$(errorId).removeClass('hidden');
							}
						});						
					} else {
						$(errorId).removeClass('hidden');
					}

            	}
                return false;
            },
            onApprove: function() {
            	$(modalId).find('.field').each(function() {
                    	jQuery(this).removeClass('error');
                })
            	$(listId).empty();
            	$(errorId).addClass('hidden');

                var toSend = getData();
                console.log('to send: ' + toSend);
                if(toSend == null) {
                	console.log('inside toSend == null');
                	$(errorId).removeClass('hidden');
                	return false;	
                } 

                if(id == '#editPhone') {
					$.post('/verifyphone', { phone: $('#currentNumber').intlTelInput('getNumber'), token: $('#newNumberToken').val()}, function(data, stat, xhr) {
						if(data.status == codes.FAIL) {
							addError(id, '#newNumberToken', data.msg);
							$(errorId).removeClass('hidden');
						} else {
							$(infoId).html($('#currentNumber').intlTelInput('getNumber'));
							$(modalId).modal('hide');
						}
					});
                } else {
	                $.post('/changeinfo', { info: infoName, data: toSend } , function(data, stat, xhr) {
	                    console.log(data);
	                    if(data.status == codes.FAILED) {
	                        addError(id, data.fieldId, data.msg);
	                        $(errorId).removeClass('hidden');
	                    } else {
	                        console.log(infoId);
	                        if(id == '#editPass') $(infoId).html('••••••••••••');
	                        else $(infoId).html(data.data);
	                        if(id == '#editName') $('#nameMenu').html(data.data);
	                        $(errorId).addClass('hidden');
	                        // We do a refresh here due to the sensors not updating properly
	                        // until we use socket.io
	                        if(id == '#editDevice') location.reload();
	                        else $(modalId).modal('hide');
	                    }               
	                });               	
                }

                return false
            }
    });

	$(id).click(function() {
		$(modalId).modal('show');
	})
}

function verifyPhone() {

	$.post('/sendverifyphone', { phone: userData.phoneNumber}, function(data, stat, xhr) {
		console.log(data);
	});

	$('#verifyNumber').val(userData.phoneNumber);
    $('#verifyNumber').intlTelInput({
        utilsScript: '/javascripts/telUtils.js',
        onlyCountries: ['us']
    });

	$('#verifyPhoneModal').modal({
		closable: false,
		transition: 'fade up',
		onApprove: function() {
			var toPost = true;
			$('#verifyPhoneList').empty();
			$('#verifyPhoneError').addClass('hidden');

			if(phoneLen()) {
				 addErrorPre('Please enter your phone number', '#verifyPhone', '#verifyNumber', phoneLen);
				 toPost = false;
			}
			else if(phoneValid()) {
				 addErrorPre('Please enter a valid phone number', '#verifyPhone', '#verifyNumber', phoneLen);
				 toPost = false;
			}
			if(verifyLen()) {
				 addErrorPre('Please enter your verification code', '#verifyPhone', '#verifyToken', verifyLen);
				 toPost = false;
			}

			if(toPost) {
				// Verify
				$.post('/verifyphone', { phone: $('#verifyNumber').intlTelInput('getNumber'), token: $('#verifyToken').val()}, function(data, stat, xhr) {
					if(data.status == codes.FAIL) {
						addError('#verifyPhone', '#verifyToken', data.msg);
						$('#verifyPhoneError').removeClass('hidden');
					} else {
						start();
						$('#verifyPhoneModal').modal('hide');
					}
				});
			} else {
				$('#verifyPhoneError').removeClass('hidden');
			}
			return false;
		},
		onDeny: function() {
			var toPost = true;
			$('#verifyPhoneList').empty();
			$('#verifyPhoneError').addClass('hidden');

			if(phoneLen()) {
				 addErrorPre('Please enter your phone number', '#verifyPhone', '#verifyNumber', phoneLen);
				 toPost = false;
			}
			else if(phoneValid()) {
				 addErrorPre('Please enter a valid phone number', '#verifyPhone', '#verifyNumber', phoneLen);
				 toPost = false;
			}			
			if(toPost) {
			// Resend
				$.post('/sendverifyphone', { phone: $('#verifyNumber').intlTelInput('getNumber')}, function(data, stat, xhr) {
					if(data.status == codes.FAIL) {
						errorInModal('#verifyPhoneError', data.msg);
					}
				});
			} else {
				$('#verifyPhoneError').removeClass('hidden');
			}

			return false;
		}
	}).modal('show');
}

function addErrorPre(msg, errid, inputid, cmp) {
   
    addError(errid, inputid, msg);
    var field = $(inputid + 'Field');
    var input = $(inputid);
    input.blur(function() {
        if(!cmp()) {
            field.removeClass('error');
            input.unbind('blur');
        }
    })
    input.keypress(function() {
        if(!cmp()) {
            field.removeClass('error');
            // Check for phone because it unbinds the intlTel module
            if(!input == $('#verifyPhone')) input.unbind('keypress');
        }
    })
}

function addError(errid, inputid, msg) {
	var list = document.createElement('li');
	var field = $(inputid+'Field');
	list.innerHTML = msg;
	$(errid + 'List').append(list);
	if(field != null) field.addClass('error');
}

// Verify phone comparators
function verifyLen() { return $('#verifyToken').val() <= 0; }
function phoneValid() { return !$('#verifyNumber').intlTelInput('isValidNumber'); }
function phoneLen() { return $('#verifyNumber').intlTelInput('getNumber').length <= 0; }

