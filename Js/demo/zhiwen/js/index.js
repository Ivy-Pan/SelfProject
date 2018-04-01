$(function() {

	/*
	疑问：
	1.刷新时，display:none 和 hide（）的内容会闪现；
	2.注册表单，radio中checked的那个标签样式会有一个箭头；
	3.验证账号重复或密码的remote提示消息不显示，只是点击注册时返回了false而无反应
	4.评论显示，json.parse解析时出错
	*/
	var login_data='';

//header区按钮：搜索和提问
		$('#header .search_btn').button({
			icon:'ui-icon-search',
			iconposition: 'beginning',
		});
		$('#header .question_btn').button({
			icon: 'ui-icon-lightbulb',
		}).click(function() {
			if(login_data) {
				$('#question').dialog('open');
			}else {
				$('.question_error').dialog('open');
				setTimeout(function() {
					$('.question_error').dialog('close');
					$('#login').dialog('open');
				},1500);
			}
		});

	// 注册对话框
		$('#reg_a').click(function(){
			$('#reg').dialog('open');
		});
		$('#reg').dialog({
			autoOpen: false,   //对话框不可见
			modal: true,  //对话框外不可操作
			// Width: 400,   //注意：不用写单位，默认就是px
			resizable:false,
			show: "drop",
			hide: "puff",
			closeText: "关闭",
			buttons: [{
				text: "注册",
				click:function() {
					$(this).submit();
				}
			}],
		}).buttonset().validate({  
				// 表单提交处理
			submitHandler: function(form) {
				$(form).ajaxSubmit({
					url: 'php/add.php',
					type: 'POST',
					beforeSubmit: function(formData,jaForm,options) {
						// 提交之前打开提示以提高用户体验
						$('.loading').dialog('open');
						// 提交时禁用注册提交按钮
						$('#reg').dialog('widget').find('button').eq(1).button('disable');
					},
					success: function(responseText,statusText,xhr) {
						setTimeout(function() {
							$('.loading').dialog('close');
						},1000);
						// 提交成功后重新启用注册提交按钮
						$('#reg').dialog('widget').find('button').eq(1).button('enable');
						if(xhr.statusText == 'OK') {
							// 注册成功提示
							$('.loading').css('background','url(img/success.gif) no-repeat 20px center').html('注册成功！');
							// 保存cookie
							$.cookie('user',$('#reg .user').val());
							setTimeout(function() {
								$('.loading').dialog('close');
								$('#reg').dialog('close');
								$('#reg').resetForm();
								$('#reg span.necessary').html(' *').removeClass('reg-right').removeClass('reg-false');
								$('#reg_a,#login_a').hide();
								$('#number,#logout').show();
								$('#number').html($.cookie('user'));
							},1000);
						};
					},
				});
			},
				//注册对话框输入验证
			errorLabelContainer: 'ol.reg_error',
			wrapper: 'li',

			highlight: function(element,errorClass) {
				$(element).parent().find('span').html('').removeClass('reg-right').addClass('reg-false');
			},
			unhighlight: function(element,errorClass) {
				$(element).parent().find('span').html('').addClass('reg-right');
			},

			rules: {
				reg_user: {
					required: true,
					minlength: 3,
					remote: {
						url: 'php/is_user.php',
						type: 'POST',
					},
				},
				password: {
					required: true,
					minlength: 5,		
				},
				email: {
					required: true,
					email: true,
				},
				birthday: {
					required: false,
					date: true,
				},
			},

			messages: {
				reg_user: {
					required: '请输入账户名！',
					minlength: '账户名不得少于{0}位！',
					remote: '该账号已被注册！',
				},
				password: {
					required: '请输入密码！',
					minlength: '密码不得少于{0}位！',
				},
				email: {
					required: '请输入邮箱账号！',
					email: '请输入正确的邮箱账号！',
				},
				birthday: {
					date: '请输入正确的日期！',
				},
			},
		});
		
	//邮箱自动补全提示
		$('.email').autocomplete({
			delay: 0,
			autoFocus: true,
			source: function(request,response) {  //request.term是用户输入内容，response是数组存储返回预先设置的邮箱列表
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

	//日期提示
		$('#reg .birthday').datepicker({
			showOtherMonths: true,
			selectOtherMonths: true,
			changeYear: true,
			changeMonth: true,
			// yearSuffix: "年",
			showMonthAfterYear: true,
			maxDate: 0,
			yearRange: '1970:',
			duration: 500,
		});

	// 注册表单提交提示
		$('.loading').dialog({
			modal: true,
			autoOpen: false,
			closeOnEscape: false,  //点击关闭无效
			resizable: false,
			draggable: false,
			width: 250,
			height:50,
		}).parent().find('.ui-dialog-titlebar').hide();

	// 登录表单提交提示
		$('.loging').dialog({
			modal: true,
			autoOpen: false,
			closeOnEscape: false,  //点击关闭无效
			resizable: false,
			draggable: false,
			width: 250,
			height:50,
		}).parent().find('.ui-dialog-titlebar').hide();

	// 评论前登录提示
		$('.question_error').dialog({
			modal: true,
			autoOpen: false,
			resizable: false,
			draggable: false,
			width: 250,
			height:50,
		}).parent().find('.ui-dialog-titlebar').hide();

	// 登录退出
		$('#number,#logout').hide();

		$('#logout').click(function() {
			login_data='';
			// 退出时清楚cookie并跳转到首页		
			window.location.href = '/zhiwen/';
			$.removeCookie('user');
		})

	// 登录对话框
		$('#login_a').click(function(){
			$('#login').dialog('open');
		});
		$('#login').dialog({
			autoOpen: false,   //对话框不可见
			modal: true,  //对话框外不可操作
			// Width: 400,   //注意：不用写单位，默认就是px
			resizable:false,
			show: "drop",
			hide: "puff",
			closeText: "关闭",
			buttons: [{
				text: "登录",
				click:function() {
					$(this).submit();
				}
			}],
		}).validate({  
			// 登录表单提交处理
			submitHandler: function(form) {
				$(form).ajaxSubmit({
					url: 'php/login.php',
					type: 'POST',
					beforeSubmit: function(formData,jaForm,options) {
						// 提交之前打开提示以提高用户体验
						$('.loging').dialog('open');
						// 提交时禁用注册提交按钮
						$('#login').dialog('widget').find('button').eq(1).button('disable');
					},
					success: function(responseText,statusText,xhr) {
						setTimeout(function() {
							$('.loging').dialog('close');
						},1000);
						// 提交成功后重新启用注册提交按钮
						$('#login').dialog('widget').find('button').eq(1).button('enable');
						if(xhr.statusText == 'OK') {
							// 登录成功提示
							$('.loging').css('background','url(img/success.gif) no-repeat 20px center').html('登录成功！');
							login_data = "yes";
							// cookie有效期设置
							if($('#expires').is(':checked')) {
								$.cookie('user',$('#login .user').val());
							}else {
								$.cookie('user',$('#login .user').val(),{
									expires: 7,
								});
							}								
							setTimeout(function() {
								$('.loging').dialog('close');
								$('#login').dialog('close');
								$('#login').resetForm();
								$('#login span.necessary').html(' *').removeClass('reg-right').removeClass('reg-false');
								$('#reg_a,#login_a').hide();
								$('#number,#logout').show();
								$('#number').html($.cookie('user'));
							},1000);
						};
					},
				});
			},
			//登录对话框输入验证
			errorLabelContainer: 'ol.login_error',
			wrapper: 'li',

			highlight: function(element,errorClass) {
				$(element).parent().find('span').html('').removeClass('reg-right').addClass('reg-false');
			},
			unhighlight: function(element,errorClass) {
				$(element).parent().find('span').html('').addClass('reg-right');
			},

			rules: {
				login_user: {
					required: true,
					minlength: 3,
				},
				login_password: {
					required: true,
					minlength: 5,
					remote: {
						url: 'php/login.php',
						type: 'POST',
						data: {
							login_user: function() {
								return $('#login .user').val();
							}
						}
					},		
				},
			},

			messages: {
				login_user: {
					required: '请输入账户名！',
					minlength: '账户名不得少于{0}位！',
				},
				login_password: {
					required: '请输入密码！',
					minlength: '密码不得少于{0}位！',
					remote: '账号或密码不正确！',
				},
			},
		});

// tabs选项卡
	$('#tabs').tabs({
		collapsible: true,
		event: 'mouseover',
		active: false,
	});
	$('#tabs .ui-tabs-panel').mouseleave(function() {
		$('#tabs').tabs({
			active: false,
		})
	});

// accordion折叠菜单
	$('#accordion').accordion({
		active: 0,
		collapsible: true,
	});
	

// 提问dialog
	$('#question').dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width:700,
		buttons: [{
			text: "提交",
			click: function() {
				$(this).ajaxSubmit({
					url: 'php/question.php',
					type: 'POST',
					data: {
						user: $.cookie('user'),
						content: $('.uEditorIframe').contents().find('#iframeBody').html(),
					},				
					beforeSubmit: function(formData,jaForm,options) {
						if(ue.getContent()){
							$('.loading').dialog('open');
							$('#question').dialog('widget').find('button').eq(1).button('disable');
						}else {
							$('.question_error').dialog('open').html('请输入评论内容！');
							setTimeout(function() {
								$('.question_error').dialog('close').html('请登陆后操作……');
							},2000);
							return false;
						}						
					},
					success: function(responseText,statusText,xhr) {
						if(xhr.statusText == 'OK') {
							$('#question').dialog('widget').find('button').eq(1).button('enable');
							$('.loading').css('background','url(img/success.gif) no-repeat 20px center').html('评论已提交！');
							setTimeout(function() {
								$('.loading').dialog('close');
								$('#question').dialog('close');
								$('#question').resetForm();
								ue.setContent('');
								$('.loading').css('background','url(img/loading.gif) no-repeat 20px center').html('数据提交中，请稍后……');
							},1000);
						};
					},
				});
			},
		}],
	});


// 评论uEditor
	var ue=UE.getEditor('uEditorCustom', {
		toolbars: [
			['source', 'undo', 'redo', 'autotypeset','cleardoc'],
			['fontfamily','fontsize','indent','bold','italic','|','forecolor','backcolor',
			'justify','lineheight','formatmatch','|','insertimage','date']
		]
	});

// 评论
	/*$.ajax({
		//ajax获取评论内容
		url: 'php/show_content.php',
		type: 'POST',
		success: function(response,status,xhr) {
			alert(response.length);
			var responseT = JSON.stringify(response);
			var abf = $.parseJSON(responseT);
			alert(typeof abf);
		},
	});*/
	// 摘要summary处理函数
	function replaceNum(strObj,num,replaceText) {
		var str = strObj.substr(0,num-1) + replaceText + strObj.substring(num, strObj.length);
		return str;
	}
	// 内容的显示和收起
	var arr = [];
	var summary = [];
	$.each($('#main .editor'),function(index,value) {
		arr[index] = $(value).html();
		summary[index] = arr[index].substr(0,200);
		// 设置摘要summary，以免出现html的不完整标签
		if(summary[index].substring(199, 200) == '<'){
			summary[index] = replaceNum(summary[index],200,'');
		}
		if(summary[index].substring(198, 200) == '</'){
			summary[index] = replaceNum(summary[index],200,'');
			summary[index] = replaceNum(summary[index],199,'');
		}
		if(summary[index].substring(197, 200) == '</p'){
			summary[index] = replaceNum(summary[index],200,'');
			summary[index] = replaceNum(summary[index],199,'');
			summary[index] = replaceNum(summary[index],198,'');
		}
		summary[index] += '<span style="color:#369;font-size:16px;font-weight:bold">......</span>';
		// 评论大于200个字符时，只显示摘要并设置展开和收起功能
		if(arr[index].length > 200) {
			$(value).html(summary[index]);
			$(value).next().find('.up').hide();
		}else {
			$(value).next().find('.up').hide();
			$(value).next().find('.down').hide();
			$(value).next().find('.all').show();
		};
		$(value).next().find('.down').click(function() {
			$(value).html(arr[index]);
			$(value).next().find('.down').hide();
			$(value).next().find('.up').show();
		});
		$(value).next().find('.up').click(function() {
			$(value).html(summary[index]);
			$(value).next().find('.up').hide();
			$(value).next().find('.down').show();
		});
		$(value).next().find('.num_comment').click(function() {
			if($.cookie('user')) {
				$('.comment').eq(index).toggle();
				$('.comment').find('.comment_submit').eq(index).click(function() {
					alert($('.comment').eq(index).find('input').val());
					/*$('.comment').eq(index).find('form').ajaxSubmit({
						url: 'php/add_comment.php',
						type: 'POST' ,
					});*/
				});
			}else {
				$('.question_error').dialog('open');
				setTimeout(function() {
					$('.question_error').dialog('close');
					$('#login').dialog('open');
				},1000);
			}
		});
	});	
	// 提交评论按钮
	$('.comment_submit').button();



});