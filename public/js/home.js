$(function(){
	$('#reverse-stations').click(function(e){
		var str = $('#from').val();
		$('#from').val($('#to').val());
		$('#to').val(str);
	});
	$('#from-to > div.radios > label:nth-child(2) > input[type="radio"]').on('change', function(e){
		if (this.checked) {
			$('#from-to .dates label:nth-child(2)').removeClass('hidden');
			$('#from-to .dates label:nth-child(2) input')[0].required = true;
			console.log('works');
		}
	});
	$('#from-to > div.radios > label:first-child > input[type="radio"]').on('change', function(e){
		if(this.checked){
			$('#from-to .dates label:nth-child(2)').addClass('hidden');
			$('#from-to .dates label:nth-child(2) input')[0].required = false;
		}
	});
	$('#buy').click(function(e){
		if($('#from-to')[0].checkValidity()){
			var options = $('#stations option');
			var f = options.toArray().some(function(i){
				return i.value.toLowerCase() == $('#from').val().toLowerCase();
			});
			if(!f) return customAlert('Заданной станции отправления нет в базе данных', false);
			f = options.toArray().some(function(i){
				return i.value.toLowerCase() == $('#to').val().toLowerCase();
			});
			if(!f) return customAlert('Заданной станции прибытия нет в базе данных', false);
			if ($('#from').val().toLowerCase() == $('#to').val().toLowerCase()) return customAlert('Станции отправления и прибытия не должны совпадать', false);
			setLoadingOverlay();
			$('#from-to')[0].action = '/select-ticket';
			$('#from-to')[0].submit();
		}else{
			customAlert('Заполните все поля', false);
		}
	});
	$('#timetable').click(function(e){
		if($('#from-to')[0].checkValidity()){
			var options = $('#stations option');
			var f = options.toArray().some(function(i){
				return i.value.toLowerCase() == $('#from').val().toLowerCase();
			});
			if(!f) return customAlert('Заданной станции отправления нет в базе данных', false);
			f = options.toArray().some(function(i){
				return i.value.toLowerCase() == $('#to').val().toLowerCase();
			});
			if(!f) return customAlert('Заданной станции прибытия нет в базе данных', false);
			if ($('#from').val().toLowerCase() == $('#to').val().toLowerCase()) return customAlert('Станции отправления и прибытия не должны совпадать', false);
			setLoadingOverlay();
			$('#from-to')[0].action = '/timetable';
			$('#from-to')[0].submit();
		}else{
			customAlert('Заполните все поля корректно', false);
		}
	})
});