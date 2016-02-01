$(document).ready(function(){
	$('#login').on('click',function(){
		var name = $('input[name=user]').val();
		var password = $('input[name=password]').val();
		if(name && password){
			$.post('login', 'name='+name+'&password='+password, function(data, status){
				if(status == 'success'){
					console.log(data);
					$('html').html(data);	
				}
			})
		}else{
			alert('enter username and password');
		}
	});
});	