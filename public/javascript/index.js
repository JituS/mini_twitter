var loginReq = function(name, password){
	if(name && password){
		$.post('login', 'name='+name+'&password='+password, function(data, status){
				console.log(data)
			if(status == 'success' && data.link){
				window.location.href = data.link;
			}
		})
	}else{
		alert('enter correct username and password');
	}
};

var signupReq = function(name, email, dob, password){
	$.post('signup', 'name='+name+'&email='+email+'&dob='+dob+'&password='+password, function(data, status){
		if(status == 'success'){
			alert(data);
		}
	})
};

$(document).ready(function(){
	$('#login').on('click',function(){
		loginReq($('input[name=lname]').val(), $('input[name=lpassword]').val());
	});	
	$('#signup').on('click',function(){
		var name = $('input[name=sname]').val();
		var email = $('input[name=email]').val();
		var dob = $('input[name=dob]').val();
		var password = $('input[name=spassword]').val();
		signupReq(name, email, dob, password);
	});		
});	