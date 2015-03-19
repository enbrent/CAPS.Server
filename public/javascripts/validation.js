// Form manager

// (function(){
//     console.log('validation file included');
// }())


// $('.ui.form').form(validationRules, { onSuccess: submitForm });

// function getFieldValue(fieldId) {
//     return $('.ui.form').form('get field', fieldId).val();
// }

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
    // $('.ui.form').form(validationRulesRegister, { onSuccess: submitForm, inline:true, on:'blur'} );
});