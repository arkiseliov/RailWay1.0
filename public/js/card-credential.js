$(function(){
	$('.card-number input:not(:last-child)').on('input', function(e){
		if(this.value.length == 4){
			// console.log(this.nextSibling);
			this.nextElementSibling.focus();
		}
	});

	$('input[name=owner]').on('input', function(e){
		this.value = this.value.toUpperCase();
	});

	$('.expires-in input:first-child').on('input', function(e){
		if (this.value.length == 2) {
			$('.expires-in input:last-child')[0].focus();
		}
	});

	$('#next').click(function(e){
		if ($('.expires-in input:first-child').val()*1 > 12) {
			e.preventDefault();
			return customAlert('Неверно введён месяц');
		}
		if ($('.expires-in input:last-child').val()*1 > (new Date).getYear()-100) {
			e.preventDefault();
			return customAlert('Неверно введён год');
		}
	});
})