$(function(){
	$('.wagon td:not(.sold)').click(function(e){
		// console.log(1);
		var data = JSON.parse($('#places').val());
		if($(this).hasClass('selected')){
			$(this).removeClass('selected');
			var ind = data.indexOf({wagon: parent(this, 4).dataset.number, place: this.innerText});
			data.splice(ind, 1);
			if (!data.length) {
				$('#next')[0].disabled = true;
			}
		}else{
			$(this).addClass('selected');
			data.push({wagon: parent(this, 4).dataset.number, place: this.innerText});
			$('#next')[0].disabled = false;
		}
		$('#places').val(JSON.stringify(data));
	});
})