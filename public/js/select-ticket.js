$(function(){

	$('#tickets tbody tr').click(function(e){
		$('#tickets tbody tr').removeClass('selected');
		this.classList.add('selected');
		$('#id').val(this.dataset.id);
		$('#next')[0].disabled = false;
	});

	$('#next').click(function(e){
		setLoadingOverlay();
	});
})