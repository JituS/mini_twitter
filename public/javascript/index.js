var loginReq = function(name, password){
	if(name && password){
		$.post('login', 'name='+name+'&password='+password, function(data, status){
			if(status == 'success' && data.error){
				$('input[name=lname]').val('');
				$('input[name=lpassword]').val('');
				alert('enter correct username and password');
			}else{
				window.location.href = data.link;
			}
		});
	}
};

var signupReq = function(name, email, password, dob){
	$.post('signup', 'name='+name+'&email='+email+'&password='+password+'&dob='+dob, function(data, status){
		if(status == 'success'){
			$('input[name=sname]').val('')
			$('input[name=email]').val('')
			$('input[name=spassword]').val('')
			$('input[name=sdob]').val('')
		}
	});
};

$(document).ready(function(){
	$('#login').on('click',function(){
		loginReq($('input[name=lname]').val(), $('input[name=lpassword]').val());
	});	
	$('#signup').on('click',function(){
		var name = $('input[name=sname]').val();
		var email = $('input[name=email]').val();
		var password = $('input[name=spassword]').val();
		var dob = $('input[name=sdob]').val();
		signupReq(name, email, password, dob);
	});		
});	