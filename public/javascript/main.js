var like = function(value){
	$.post('like', 'postId='+value, function(data, status){

	});
}

var likersTable = function(data){
	var template = '<table><tr><th>Name </th><th>Email </th></tr>_TR_</table>';
	var tableData = data.map(function(user){
		return '<tr><td>'+user.username+'</td><td>'+user.email+'</td></tr>'
	});
	console.log(tableData)
	return template.replace('_TR_', tableData.join(''));
};

var likers = function(value){
	$.post('likers', 'postId='+value, function(data, status){
			console.log(data)
		if(status == 'success'){
			$('#likers').html(likersTable(data));
		}
	});
};

var renderAllMsg = function(data){
	data = JSON.parse(data);
	var a = data.map(function(each){
		return '<div class="post"><div id="date">date: '+each.moment.split('T')[0]+'</div><div id="name">'+
			each.username+'</div><div id="content"><p>'+each.content+'</p></div><div class="like"><img src="./saaa.gif"value='+
			each.postid+' onclick=like(this.getAttribute("value"))></img><div id=likes value='+each.postid+
			' onclick=likers(this.getAttribute("value"))>'+each.likes+'</div></div></div>';
	});
	$('#allPost').html(a.join(''));
};

var renderAllUsers = function(data){	
	$('#name').html(data.name);
	var a = data.map(function(each){
		return '<option>'+each.username+'</option>'
	});
	$('#datalist1').html(a.join(''));
};

var allPost = function(){
	$.get('getProfile', function(data, status){
		if(status == 'success'){
			renderAllMsg(data);
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
		if(status == 'success')
			renderAllUsers(data);
	});
};

var follow = function(id){
	$.post('follow', 'userid='+id, function(data, status){
		if(status == 'success'){
			if(data) alert(data);
		};
	});
};

var renderSearchResult = function(data){
	return '<ul>'+data.map(function(each){
		return '<li value='+each.id+' onclick=follow(this.getAttribute("value"))><pre>'+each.username+'        '+each.email+'</pre></li>'
	}).join('')+'</ul>';
};

var search = function(){
	var name = $('input[name=srch]').val();
	$.post('userSearch', 'name='+name, function(data, status){
		if(status == 'success')
			$('#searchResult').html(renderSearchResult(data));
	});
};

var logout = function(){
	$.post('logout', function(data,status){
		window.location.href = data.link;
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
	$.get('name', function(data, status){
		$('.name').html(data);
	})
});	