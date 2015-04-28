var codes = { 
    'FAILED' : '1',
    'OK' : '0'
};

function submitForm(res, req, next) {

  console.log(req);

  console.log('Form successfully!');
}

function clicked() {
    console.log('button clicked');
}

var validationRulesLogin = {
    email: {
      identifier : 'email',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your email'
        },
        {
          type   : 'email',
          prompt : 'Please enter a valid email address'
        }
      ]
    },
    password: {
      identifier : 'password',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your password'
        }
      ]
    }
}

var validationRulesRegister = {
    email: {
      identifier : 'email',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a email'
        },
        {
          type   : 'email',
          prompt : 'Please enter a valid email address'
        }
      ]
    },
    firstName: {
      identifier  : 'firstName',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your first name'
        }
      ]
    },
    lastName: {
      identifier  : 'lastName',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your last name'
        }
      ]
    },
    password: {
      identifier : 'password',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a password'
        },
        {
          type   : 'length[6]',
          prompt : 'Your password must be at least 6 characters'
        }
      ]
    },
    phoneNumber: {
        identifier : 'phoneNumber',
        rules : [
            {
                type : 'empty',
                prompt: 'Please enter your phone number'
            }
        ]
    },
    deviceNumber: {
        identifier : 'deviceNumber',
        rules : [
            {
                type : 'empty',
                prompt: 'Please enter your device number'
            }
        ]
    }
  }

$(document).ready(function() {
  console.log('inside ready');
  $('#loginPage')
    .transition('hide')
    .transition('fade up', '1s');
  $('#loginForm').form(validationRulesLogin, { onSuccess: submitForm} );
  $('#registerForm').form(validationRulesRegister, { onSuccess: submitForm, inline:true, on:'blur'} );
  $('#forgotPassModal').modal({
      closable: false,
      transition: 'fade up',
      onHide: function() {
        (function() {
            $('#resetButton').html('Reset Password');
            $('#forgotPassError').addClass('hidden');
            $('#forgotPassModal').find(':input').each(function() {
                jQuery(this).val('');
            })
            $('#forgotPassModal').find('.field').each(function() {
              jQuery(this).removeClass('error');
            })
        })();
      },
      onApprove: function() {
        var toPost = true;
        $('#resetButton').html('Reset Password');
        $('#forgotPassList').empty();
        $('#forgotPassError').addClass('hidden');

        if(emailLen()) {
           addErrorPre('Please enter your email', '#forgotPass', '#email', emailLen);
           toPost = false;
        }
        else if(emailVal()) {
           addErrorPre('Please enter a valid email', '#forgotPass', '#email', emailVal);
           toPost = false;
        }

        if(toPost) {
          console.log('inside toPost');
          $('#resetButton').addClass('loading');
          $.post('/resetpass', {email: $('#email').val()}, function(data, status, xhr) {
            $('#resetButton').removeClass('loading');
            if(data.status == codes.FAILED) {
              $('#resetButton').html('Reset Password')
              addError('#forgotPass', '#email', data.msg);
              $('#forgotPassError').removeClass('hidden');

            } else {
              $('#resetButton').html('Email sent!');
            }
          });
        } else {
          $('#forgotPassError').removeClass('hidden');
        }
        return false;
      }
  });

  $('#forgotPassLink').click(function() {
    $('#forgotPassModal').modal('show'); 
  })

});


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

function emailLen() { return $('#email').val().length <= 0 }
function emailVal() {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return !re.test($('#email').val());
}