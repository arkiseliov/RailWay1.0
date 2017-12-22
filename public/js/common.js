function customAlert(str, err){
	var dialog = $('#alert');
	dialog.text(str);
	if (err) {
		dialog.css('color', '#2980b9');
	}else{
		dialog.css('color', '#e74c3c');
	}
	dialog.fadeIn(200);
	var t = setTimeout(function(){
		dialog.fadeOut(200);
	}, 2000);
}

function setLoadingOverlay(){
	$('#loading-overlay').css('display', 'flex');
}

function hideLoadingOverlay(){
	$('#loading-overlay').fadeOut(200);
}

$(function(){
	$('a.back-ref').click(function(e){
		e.preventDefault();
		history.back();
	})
})

function parent(el, level){
	return level ? parent(el.parentNode, level-1) : el;
}