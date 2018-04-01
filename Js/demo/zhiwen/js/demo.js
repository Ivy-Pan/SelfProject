$(function() {
	$('.reg').validate({
		rules: {
			user: {
				required: true,
			}
		},
		messages: {
			user: {
				required: '账号不得为空！',
			}
		}
	});
})