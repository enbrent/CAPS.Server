var codes = { 
    'FAILED' : '1',
    'OK' : '0'
};

var formSuccess;
$(document).ready(function() {
	$('#changePassForm').submit(function(e) {

        $('#errorList').empty();

		e.preventDefault();
		formSuccess = true;
		var password = $('#password')
		  , cpassword = $('#cpassword');

		if(passLen()) addErrorPre('Please enter your password', $('#passwordField'), password, passLen);
	    else if(passLenSix()) addErrorPre('Your password must be at least 6 characters long', $('#passwordField'), password, passLenSix);
	    if(cpassLen()) addErrorPre('Please enter your password again', $('#cpasswordField'), cpassword, cpassLen);	
		else if(passSame()) addErrorPre('The two passwords do not match', $('#cpasswordField'), cpassword, passSame);

	    if(formSuccess) {
	    	removeErrorFields();
	    	console.log('hereee');
	    	$('#submitButton').addClass('loading');
	    	$.post('/changepass', {password: password.val()}, function(data, status, xhr) {
	    		$('#submitButton').removeClass('loading');
	    		if(data.status == codes.FAILED) {
	    			$('#submitButton').html('Submit');
	    			addError(data.msg, $('#' + data.fieldId));
	    			$('#errorMessage').removeClass('hidden');
	    		} else {
	    			$('#submitButton').html('Success!');
	    		}
	    	})
	    }

	    if(!formSuccess) $('#errorMessage').removeClass('hidden');
        else $('#errorMessage').addClass('hidden');
	})

	$('#submitButton').click(function() {
			$('#changePassForm').submit();
	})
})


function removeErrorFields() {
    $('#passwordField').removeClass('error');
    $('#cpasswordField').removeClass('error');
}

function addErrorPre(msg, field, input, cmp) {
    addError(msg, field);
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
            if(!input == $('#phoneNumber')) input.unbind('keypress');
        }
    })
}

function addError(msg, field) {
    formSuccess = false;
    var err = document.createElement('li');
    err.innerHTML = msg; 
    $('#errorList').append(err);
    if(field != null) field.addClass('error');
}

function passLen() { return $('[name="password"]').val().length <= 0 }
function passLenSix() { return $('[name="password"]').val().length < 6 }
function cpassLen() { return $('[name="cpassword"]').val().length <= 0; }
function passSame() { return $('[name="password"]').val() != $('[name="cpassword"]').val(); }