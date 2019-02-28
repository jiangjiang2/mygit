$(function(){
	
	
	$('#search_button').button({
		//disabled : true,
		//label : '搜索',
		icons : {
			primary : 'ui-icon-search',
			
		},
		//text : false
	});
	$('#question_button').button({
		icons : {
			primary :'ui-icon-lightbulb',
		}
	}).click(function(){
		if ($.cookie('user')) {
		    $('#question').dialog('open');
		} else{
			$('#error').dialog('open');
			setTimeout (function(){
				$('#error').dialog('close');
				$('#login').dialog('open');
			},1000);
		}			
	});
	 
	 $.ajax({
	 	url :'show_content.php',
	 	type :'post',
	 	success : function (response, status, xhr) {
			var json = $.parseJSON(response);
			var html = '';
			var arr = [];
			var summary = [];
			$.each(json, function (index, value) {
				html += '<h4>' + value.user + ' 发表于 ' + value.date + '</h4><h3>' + value.title + '</h3><div class="editor">' + value.content + '</div><div class="bottom"><span class="comment" data-id="' + value.id + '">'+value.count+'条评论</span> <span class="up">收起</span></div><hr noshade="noshade" size="1" /><div class="comment_list"></div>';
			});

			
			$('.content').append(html);
			//字符串方法
			$.each($('.editor'), function (index,value) {
				arr[index] = $(value).html();
				summary[index] =  arr[index].substr(0,200);
				if (summary[index].substring(199,200) == '<') {
					summary[index] = replacePos(summary[index],200,'')
				}
				if (summary[index].substring(198,200) == '</') {
					summary[index] = replacePos(summary[index],200,'')
					summary[index] = replacePos(summary[index],199,'')
				}
				if (arr[index].length > 200) {
					summary[index] += '...<span class="down">显示全部</span>'
					$(value).html(summary[index]);
				}
				$('.bottom .up').hide();

			});
			
			$.each($('.editor'),function(index,value){
		   	    $(this).on('click','.down',function  () {
		   	    $('.editor').eq(index).html(arr[index]);
		   	    $(this).hide();
		   	    $('.bottom .up').eq(index).show();
		   	    });
		   });
		    $.each($('.bottom'),function(index,value){
		   	    $(this).on('click','.up',function(){
		   	    	$('.editor').eq(index).html(summary[index]);
		   	    	$(this).hide();
		   	    	$('.editor').eq(index).show();
		   	    });
		   });
		
		    $.each($('.bottom'), function(index,value) {
		    	$(this).on('click','.comment',function(){
		    		var comment_this =this ;
		    if ($.cookie('user')) {
		    	if (!$('.comment_list').eq(index).has('form').length) {	
		    	 $.ajax({
		    	 	url :'show_comment.php',
		    	 	type :'post',
		    	 	data :{
		    	 		titleid : $(comment_this).attr('data-id'),
		    	 	},
		    	 	beforeSend : function(jqXHR,settings){
		    	 		$('.comment_list').eq(index).append('<dl class="comment_road"><dd>正在加载中</dd></dl>');
		    	 	},
		    	 	success :function(response, status){
		    	 		$('.comment_list').eq(index).find('.comment_road').hide();
		    	 		var json_comment = $.parseJSON(response);
		    	 		  var count = 0;
									$.each(json_comment, function (index2, value) {
										count = value.count;
										$('.comment_list').eq(index).append('<dl class="comment_content"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
									});
                        $('.comment_list').eq(index).append('<dl><dd><span class="load_more">加载更多评论</span></dd></dl>');
									var page = 2;
									if (page > count) {
										$('.comment_list').eq(index).find('.load_more').off('click');
										$('.comment_list').eq(index).find('.load_more').hide();
									}
									$('.comment_list').eq(index).find('.load_more').button().on('click', function () {
										$('.comment_list').eq(index).find('.load_more').button('disable');
										$.ajax({
											url : 'show_comment.php',
											type : 'POST',
											data : {
												titleid : $(comment_this).attr('data-id'),
												page : page,
											},
											beforeSend : function (jqXHR, settings) {
												$('.comment_list').eq(index).find('.load_more').html('<img src="../image/comment_load.gif" />');
											},
											success : function (response, status) {
												var json_comment_more = $.parseJSON(response);
												$.each(json_comment_more, function (index3, value) {
													$('.comment_list').eq(index).find('.comment_content').last().after('<dl class="comment_content"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
												});
												$('.comment_list').eq(index).find('.load_more').button('enable');
												$('.comment_list').eq(index).find('.load_more').html('加载更多评论');
												page++;
												if (page > count) {
													$('.comment_list').eq(index).find('.load_more').off('click');
													$('.comment_list').eq(index).find('.load_more').hide();
												}
											}
										});
									});

		    	 		$('.comment_list').eq(index).append('<form><dl class="comment_add"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="' + $(comment_this).attr('data-id') + '" /><input type="hidden" name="user" value="' + $.cookie('user') + '" /><input type="button" value="发表" /></dd></dl></form>');
						$('.comment_list').eq(index).find('input[type=button]').button().click(function(){
		      	     var _this = this;
		      	   $('.comment_list').eq(index).find('form').ajaxSubmit({
		      	  	url :'add_comment.php',
		      	 	type :'post',
		      	 	beforeSubmit: function(formData, jqForm, options){
                   		$('#loading').dialog('open');
                   		$(_this).button('disable');
                   	},
                   	success : function (responseText, statusText) {
                   		if(responseText){
                   	    $(_this).button('enable');
                   	    $('#loading').css('background','url(image/success.gif) no-repeat 20px center').html('数据新增成功.....');
                        setTimeout (function(){
                   	   	var date = new Date();
						$('#loading').dialog('close');
					    $('.comment_list').eq(index).prepend('<dl class="comment_content"><dt>' + $.cookie('user')+ '</dt><dd>' + $('.comment_list').eq(index).find('textarea').val() + '</dd><dd>' +date.getFullYear() + '-' + (date.getMonth()+ 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +date.getMinutes() + ':' + date.getSeconds() + '</dd></dl>');
                   	    $('.comment_list').eq(index).find('form').resetForm();
                   	    $('#loading').css('background','url(image/loading.gif) no-repeat 20px center').html('数据交互中.....');
                   	  },1000); 
                   	   }
                    },
		      	 });
		      });
		    	 	},
		    	 });
		    	 }
		        if ($('.comment_list').eq(index).is(":hidden")) {
		    	 $('.comment_list').eq(index).show();
		    	
		      }  else{
		    	 $('.comment_list').eq(index).hide();
		      }
		     
		      } else{
			   $('#error').dialog('open');
			setTimeout (function(){
				$('#error').dialog('close');
				$('#login').dialog('open');
			},1000);
		    }	
		    	});
		    });
       },
	 });
	  
	  
	  
	   
	  
	$('#question').dialog({
		autoOpen : false,
		modal : true,
		resizable : false,
		width : 530,
		height : 380,
		buttons : {
			'发布' : function () {
				$(this).ajaxSubmit({
				url :'add_content.php',
				type :'post',
				data : {
						user : $.cookie('user'),
						content : $('.uEditorIframe').contents().find('#iframeBody').html(),
					},
  	    beforeSubmit: function(formData, jqForm, options){
                   		$('#loading').dialog('open');
                   		$('#question').dialog('widget').find('button').eq(1).button('disable');
                   	},
                   	success : function (responseText, statusText) {
                   		if(responseText){
                   	    $('#question').dialog('widget').find('button').eq(1).button('enable');
                   	    $('#loading').css('background','url(image/success.gif) no-repeat 20px center').html('数据新增成功.....');

                        setTimeout (function(){
                   	    $('#loading').dialog('close');
                   	    $('#question').dialog('close');
                   	    $('#question').resetForm();
                   	    $('.uEditorIframe').contents().find('#iframeBody').html('请输入问题描述');
                   	    $('#loading').css('background','url(image/loading.gif) no-repeat 20px center').html('数据交互中.....');
                   	  },1000); 
                   	   }
                    },
 
				});
			},
		},
	});
	
	$('.uEditorCustom').uEditor();
	
	
	
	$('#error').dialog({
	    	autoOpen :false,
	    	modal :true,
	    	closeOnEscape :false,
	    	resizable :false,
	    	draggable :false,
	    	height :50,
	    	width :180,
	    }).parent().find('.ui-widget-header').hide();
	    
	   
	$('#mamber, #logout').hide();
	
	if ($.cookie('user')) {
		$('#mamber, #logout').show();
		$('#reg_a, #login_a').hide();
		$('#mamber').html($.cookie('user'));
	} else {
		$('#mamber, #logout').hide();
		$('#reg_a, #login_a').show();
	}

	$('#logout').click(function  () {
		$.removeCookie('user');
		window.location.href = 'http://localhost/zhiwen/zhiwen.html';  //跳转到

	});
	
	 //ajax  交互
	    $('#loading').dialog({
	    	autoOpen :false,
	    	modal :true,
	    	closeOnEscape :false,
	    	resizable :false,
	    	draggable :false,
	    	height :50,
	    	width :180,
	    }).parent().find('.ui-widget-header').hide();
	    
	//登录 注册  dialog
		$('#reg').dialog({
			buttons:{
			'提交':function(){
				$(this).submit();
			},
			'取消':function(){
			    $(this).dialog('close');
			}
		},
		    show:'ture',//淡入淡出
			hide:'ture',
			autoOpen:false,//隐藏
		//	draggable:false,不可移动
		//  resizeable：false, 不可调整大小
		    modal:false,//对话框外不可操作
		    closeText:'关闭',
		    width:400,
		    height:370,
			} ).buttonset().validate({
				submitHandler : function (form) {
                   $(form).ajaxSubmit({
                   	url :"add.php",
                   	type:"post",
                   	
                   	beforeSubmit: function(formData, jqForm, options){
                   		$('#loading').dialog('open');
                   		$('#reg').dialog('widget').find('button').eq(1).button('disable');
                   	},
                   	success : function (responseText, statusText) {
                   		if(responseText){
                   	    $('#reg').dialog('widget').find('button').eq(1).button('enable');
                   	    $('#loading').css('background','url(image/success.gif) no-repeat 20px center').html('数据新增成功.....');
                   	    $.cookie('user', $('#user').val());

                        setTimeout (function(){
                   	    $('#loading').dialog('close');
                   	    $('#reg').dialog('close');
                   	    $('#reg').resetForm();
                   	    $('#reg span.star').html('*').removeClass('succ');
                   	    $('#loading').css('background','url(image/loading.gif) no-repeat 20px center').html('数据交互中.....');
                   	    $('#mamber, #logout').show();
		                $('#reg_a, #login_a').hide();
		                $('#mamber').html($.cookie('user'));
                   	  },1000);
                   	   
                   	    
                   	   }
                    },
                   });
                },
				showErrors : function (errorMap, errorList) {
                var errors = this.numberOfInvalids();
                if (errors > 0) {
                        $('#reg').dialog('option', 'height', 20 * errors + 370);
                } else {
                        $('#reg').dialog('option', 'height',370);
                     }
                this.defaultShowErrors();
                },
                highlight: function (element, errorClass) {
                	$(element).css('border','1px solid #630');
                	$(element).parent().find("span").html('*').removeClass('succ');
                },
                unhighlight: function (element, errorClass) {
                	$(element).css('border', '1px solid #ccc');
                	$(element).parent().find("span").html('&nbsp;').addClass('succ');
                },
				errorLabelContainer : 'ol.reg_error',
                wrapper : 'li',
				rules:{
					user:{
						required:true,
						minlength:2,
						remote:{
							url:"is_user.php",
							type:"post",
							
						}
					},
				    pass:{
					    required:true,
						minlength:6,
						
				    },
				    email:{
				    	required:true,
						email:true,
				    },
				    date:{
				    	date:true,	
				    },
				},
				messages:{
					user:{
						required:"账号不得为空！",
						minlength : '帐号不得小于{0}位！',
						remote :'账号已被使用！',
					},
					pass:{
						required:"密码不得为空！",
						minlength:"密码不得少于{0}位！",
					},
					email:{
						required:"邮箱不得为空！",
						email:"请输入正确邮箱地址！",
					},
					date:{
						date:"请输入正确的日期！",
					},
				}
			});
	$('#reg_a').click(function(){
		$('#reg').dialog('open');
	});
	
	$('#login').dialog({
			buttons:{
			'登录':function(){
				$(this).submit();
			},
			'取消':function(){
			    $(this).dialog('close');
			}
		},
		    show:'ture',//淡入淡出
			hide:'ture',
			autoOpen:false,//隐藏
		//	draggable:false,不可移动
		//  resizeable：false, 不可调整大小
		    modal:false,//对话框外不可操作
		    closeText:'关闭',
		    width:400,
		    height:240,
			} ).validate({
				submitHandler : function (form) {
                   $(form).ajaxSubmit({
                   	url :"login.php",
                   	type:"post",
                   	
                   	beforeSubmit: function(formData, jqForm, options){
                   		$('#loading').dialog('open');
                   		$('#login').dialog('widget').find('button').eq(1).button('disable');
                   	},
                   	success : function (responseText, statusText) {
                   		if(responseText){
                   	    $('#login').dialog('widget').find('button').eq(1).button('enable');
                   	    $('#loading').css('background','url(image/success.gif) no-repeat 20px center').html('登录成功.....');
                   	    $.cookie('user', $('#login_user').val());

                        setTimeout (function(){
                   	    $('#loading').dialog('close');
                   	    $('#login').dialog('close');
                   	    $('#login').resetForm();
                   	    $('#login span.star').html('*').removeClass('succ');
                   	    $('#loading').css('background','url(image/loading.gif) no-repeat 20px center').html('数据交互中.....');
                   	    $('#mamber, #logout').show();
		                $('#reg_a, #login_a').hide();
		                $('#mamber').html($.cookie('user'));
                   	  },1000);
                   	   
                   	    
                   	   }
                    },
                   });
                },
				showErrors : function (errorMap, errorList) {
                var errors = this.numberOfInvalids();
                if (errors > 0) {
                        $('#login').dialog('option', 'height', 20 * errors + 240);
                } else {
                        $('#login').dialog('option', 'height',240);
                     }
                this.defaultShowErrors();
                },
                highlight: function (element, errorClass) {
                	$(element).css('border','1px solid #630');
                	$(element).parent().find("span").html('*').removeClass('succ');
                },
                unhighlight: function (element, errorClass) {
                	$(element).css('border', '1px solid #ccc');
                	$(element).parent().find("span").html('&nbsp;').addClass('succ');
                },
				errorLabelContainer : 'ol.login_error',
                wrapper : 'li',
				rules:{
					login_user:{
						required:true,
						minlength:2,
						
					},
				    login_pass:{
					    required:true,
						minlength:6,
						remote :{
							url :'login.php',
							type :'post',
							data :{login_user: function(){
								return $('#login_user').val();
							},
						  },
						},
				    },
				  
				},
				messages:{
					login_user:{
						required:"账号不得为空！",
						minlength : '帐号不得小于{0}位！',
						
					},
					login_pass:{
						required:"密码不得为空！",
						minlength:"密码不得少于{0}位！",
						remote :"密码或者账号错误！",
					},
					
				},
			});
	$('#login_a').click(function(){
		$('#login').dialog('open');
	});
	
	
	
	
	//提示
	/*
	$('#reg input[title]').tooltip({
		position : {
        my : 'left top+5',
        at : 'right+5 center',
        //tooltipClass : 'reg_tooltip',
    }      
	});
	*/
    //邮箱提示
    $('#email').autocomplete({
		delay : 0,
		autoFocus : true,
		source : function (request, response) {
			//获取用户输入的内容
			//alert(request.term);
			//绑定数据源的
			//response(['aa', 'aaaa', 'aaaaaa', 'bb']);
			
			var hosts = ['qq.com', '163.com', '263.com', 'sina.com.cn','gmail.com', 'hotmail.com'],
				term = request.term,		//获取用户输入的内容
				name = term,				//邮箱的用户名
				host = '',					//邮箱的域名
				ix = term.indexOf('@'),		//@的位置
				result = [];				//最终呈现的邮箱列表
				
				
			result.push(term);
			
			//当有@的时候，重新分别用户名和域名
			if (ix > -1) {
				name = term.slice(0, ix);
				host = term.slice(ix + 1);
			}
			
			if (name) {
				//如果用户已经输入@和后面的域名，
				//那么就找到相关的域名提示，比如bnbbs@1，就提示bnbbs@163.com
				//如果用户还没有输入@或后面的域名，
				//那么就把所有的域名都提示出来
				
				var findedHosts = (host ? $.grep(hosts, function (value, index) {
						return value.indexOf(host) > -1
					}) : hosts),
					findedResult = $.map(findedHosts, function (value, index) {
					return name + '@' + value;
				});
				
				result = result.concat(findedResult);
			}
			
			response(result);
		},	
	});
	//日历中文包  外加属性效果
	$('#date').datepicker({
		dateFormat : 'yy-mm-dd',
		//dayNames : ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		//dayNamesShort : ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		dayNamesMin : ['日','一','二','三','四','五','六'],
		monthNames : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		monthNamesShort : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		altField : '#abc',
		altFormat : 'dd/mm/yy',
		//appendText : '日历',
		showWeek : true,
		weekHeader : '周',
		firstDay : 1,
		//disabled : true,
		//numberOfMonths : 3,
		//numberOfMonths : [3,2],
		//showOtherMonths : true,
		//selectOtherMonths : true,
		changeMonth : true,
		changeYear : true,
		//isRTL : true,
		//autoSize : true,
		showOn : 'button',
		//buttonText : '日历',
		buttonImage : 'image/calendar.gif',
		buttonImageOnly : true,
		showButtonPanel : true,
		closeText : '关闭',
		currentText : '今天dd',
		nextText : '下个月mm',
		prevText : '上个月mm',
	    navigationAsDateFormat : true,
		//yearSuffix : '年',
		//showMonthAfterYear : true,
		
		//日期的限制优先级，min和max最高
		maxDate : 0,
		//minDate : -8000,				//但是年份有另外一个属性进行了限制
		hideIfNoPrevNext : true,
		
		//而maxDate和minDate只是限制日期，而年份的限制的优先级没有另外一个高
		yearRange : '1950:2020',
		
		//defaultDate : -1,
		
		//gotoCurrent : true,
		
		showAnim : true,
		showAnim : 'bounce', //颤抖效果
		//duration : 1000,
		//showAnim : 'slide',
		//beforeShow : function () {
		//	alert('日历显示之前被调用！');
		//}
		
		//beforeShowDay : function (date) {
		//	if (date.getDate() == 1) {
		//		return [false, 'a', '不能选择1号'];
		//	} else {
		//		return [true];
		//	}
		//}
		
		//onChangeMonthYear : function (year, month, inst) {
			//alert('日历中年份或月份改变时激活！');
			//alert(year);
			//alert(month);
			//alert(inst.id);
		//}
		
		//onSelect : function (dateText, inst) {
		//	alert(dateText);
		//}
		
		//onClose : function (dateText, inst) {
		//	alert(dateText);
		//}
	});
	
	//alert($('#date').datepicker('getDate').getFullYear());
	$('#date').datepicker('setDate', '2018-8-24');

   //验证插件
   
   $('#reg').validate();

   //tabs插件
  $('#tabs').tabs();
  $('#accordion').accordion({
		header : 'h3',
	});
	









});

//外部函数
function replacePos(strObj, pos, replaceText) {
	return strObj.substr(0, pos-1) + replaceText + strObj.substring(pos, strObj.length);
}