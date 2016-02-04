var renderAllMsg = function(data){
	var a = data.map(function(each){
		return '<div class="post">date: '+each.moment.split('T')[0]+'<pre>  </pre>'+each.name+'<p class="content">'+each.content+'</p></div>';
	});
	$('#allPost').html(a.join(''));
};

var renderAllUsers = function(data){
	var a = data.map(function(each){
		return '<option>'+each.username+'</option>'
	});
	$('#datalist1').html(a.join(''));
};

var allPost = function(){
	$.get('currentUserInfo', function(data, status){
		if(status == 'success'){
			console.log(data);
			renderAllMsg(JSON.parse(data));
		}
	});
};

var post = function(content){
	$.post('newPost','content='+content, function(data, status){
		if(status == 'success'){
			allPost();
		};
	});	
};

var fillUsers = function(){
	$.get('users', function(data, status){
		if(status == 'success'){
			renderAllUsers(data);
		}
	});
};

var follow = function(email){
	$.post('follow', 'email='+email, function(data, status){
		if(status == 'success'){};
	});
};

var renderSearchResult = function(data){
	return '<ul>'+data.map(function(each){
		return '<li value='+each.email+' onclick=follow(this.getAttribute("value"))><pre>'+each.username+'        '+each.email+'</pre></li>'
	}).join('')+'</ul>';
};

var search = function(){
	var name = $('input[name=srch]').val();
	$.post('userSearch', 'name='+name, function(data, status){
		if(status == 'success'){
			$('#searchResult').html(renderSearchResult(data));
		}
	});
};

var logout = function(){
	$.post('logout', function(data,status){
		console.log(data, status);
		// if(status == 'success'){
			window.location.href = data.link;
		// }
	});
};

$(document).ready(function(){
	var interval = setInterval(allPost, 1000);
	$('#post').on('click', function(){
		post($('textarea[name=post]').val());
	});
	fillUsers();
	$('#search').on('click', search);
	$('#logout').on('click', logout);
});	