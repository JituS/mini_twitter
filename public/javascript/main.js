var like = function(value){
	$.post('like', 'postId='+value, function(data, status){

	});
}

var likersTable = function(data){
	var template = '<a href="#" id="close">close</a><table><tr><th>Name </th><th>Email </th></tr>_TR_</table>';
	var tableData = data.map(function(user){
		return '<tr><td>'+user.username+'</td><td>'+user.email+'</td></tr>'
	});
	return template.replace('_TR_', tableData.join(''));
};

var likers = function(value){
	$.post('likers', 'postId='+value, function(data, status){
		if(status == 'success'){
			$('#top').removeClass('hide');
			$('.message').html(likersTable(data));
			$('#close').on('click',close);
		}
	});
};

var renderDetails = function(data){
	var template = '<a href="#" id="close">close</a><ul>_DATA_</ul>';
	var list = "";
	for(var i in data){
		if(i == "dob") data[i] = data[i].split("T")[0];
		list += "<li>" + i.toUpperCase() + " : " + data[i] + "</li><br>";
	}
	template = template.replace("_DATA_", list);
	$('#top').removeClass('hide');
	$('.message').html(template);
	$('#close').on('click',close);

}

var getDetail = function(userid){
	$.post('getDetail','id='+userid ,function(data, status){
		if(status == 'success'){
			renderDetails(data);
		}
	});
}

var renderAllMsg = function(data){
	var a = data.map(function(each){
		return '<div class="post"><div id="date">date: '+each.moment.split('T')[0]+'</div><div class="content"><p><a href="#" id='+each.userid+' onclick=getDetail(this.getAttribute("id"))'+'>'+
				each.username+'</a>@'+each.content+'</p></div><div class="like"><img src="./saaa.gif"value='+
				each.postid+' onclick=like(this.getAttribute("value"))></img><div id=likes value='+each.postid+
				' onclick=likers(this.getAttribute("value"))>&nbsp<a href="#">'+each.likes+'&nbsp&nbspLikes</a></div></div></div>';
	});
	$('#allPost').html(a.join(''));
};

var renderAllUsers = function(data){	
	$('#name').html(data.name);
	var users = data.map(function(each){
		return '<option>'+each.username+'</option>'
	});
	$('#datalist1').html(users.join(''));
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
	var template = '<a href="#" id="close">close</a><table class="userSrch">_TR_</table>';
	var tableData = data.map(function(each){
		return '<tr><td value='+each.id+' onclick=follow(this.getAttribute("value"))>'+each.username+'</td><td>'+each.email+'</td></tr>'
	});
	return template.replace('_TR_', tableData.join(''));
};

var search = function(){
	var name = $('input[name=srch]').val();
	$.post('userSearch', 'name='+name, function(data, status){
		if(status == 'success'){
			$('#top').removeClass('hide');
			$('.message').html(renderSearchResult(data));
			$('#close').on('click',close);
		}
	});
};

var logout = function(){
	$.post('logout', function(data,status){
		window.location.href = data.link;
	});
};

var close = function(){
	$('#top').addClass('hide');
}

$(document).ready(function(){
	var interval = setInterval(allPost, 1000);
	fillUsers();
	$('#post').on('click', function(){
		post($('textarea[name=post]').val());
	});
	$('#search').on('click', search);
	$('#logout').on('click', logout);
	$.get('name', function(data, status){
		$('.name').html('you are logged in as '+data);
	});

});	