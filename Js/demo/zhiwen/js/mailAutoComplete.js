$(function() {
	$('#email').autocomplete({
		delay: 0,
		autoFocus: true,
		source: function(request,response) {
			//预先设置的邮箱后缀列表
			var hosts=['qq.com','163.com','139.com','gmail.com','yahoo.com',],
				host='',  //存放用户输入的邮箱后缀
				mailName = request.term,   //用户输入的邮箱账号名称，初始值是用户输入的内容
				indexOfa = request.term.indexOf('@'),   //用户输入的内容中@的索引位置
				result = [];  //存放最终返回的结果

			//mailName应该不包含@符号，这里要进行判断
			if(indexOfa > -1) {  //-1表示用户还没有输入@符号，>-1表示已经输入了@符号
				mailName = request.term.slice(0,indexOfa);
				host = request.term.slice(indexOfa+1);
			}

			if(mailName) {
				//匹配邮箱后缀：全部输出或匹配输出邮箱后缀
				var finalHosts = (host ? $.grep(hosts,function(value,index) {
					return value.indexOf(host)>-1;  //>-1表示host与hosts的value值匹配成功，并返回
				}) : hosts),
					finalResult = $.map(finalHosts,function(value,index) {
						return mailName + '@' + value  //连接字符串mailName和@以及邮箱后缀以形成完整的邮箱账号
					});
				result=result.concat(finalResult);  //字符串转换成数组以便response调用
				// alert(result);
			}
			response(result);
		},
	});
})