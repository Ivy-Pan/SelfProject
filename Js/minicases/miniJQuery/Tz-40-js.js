// window   document  undefined

(function (window, document, undefined) {
	// className获取兼容
	if (!document.getElementsByClassName) {
		document.getElementsByClassName = function (eleName) {
			// 获取所有的标签对象
			var ele = document.getElementsByTagName('*'),
				eleAry = [],
				reg = new RegExp('\\b' + eleName + '\\b');
			for (var i = 0, len = ele.length; i < len; i++) {
				if (reg.test(ele[i].className)) {
					eleAry.push(ele[i])
				}
			}
			return eleAry;
		}
	}
	;
	
	// 兼容querySelectAll
	if (!document.querySelectorAll) {
		document.querySelectorAll = function (str) {
			var style = document.createElement('style'),
				elements = [], // 最终返回的集合
				element = null;
			document.__fy = [];
			// head标签
			var head = document.documentElement.firstChild;
			head.appendChild(style);
			style.styleSheet.cssText = str + "{fy: expression(document.__fy && document.__fy.push(this))}";
			window.scrollBy(0, 0)
			style.parentNode.removeChild(style)
			while (document.__fy.length) {
				element = document.__fy.shift();
				element.style.removeAttribute("fy");
				elements.push(element)
			}
			document.__fy = null;
			return elements;
		}
	}
	
	// 兼容trim
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g, "")
		}
	}
	
	// 内部方法 用于存储事件函数
	var _addEventFn = function (obj) { // events{click:[]}   obj --> dom  type --> fn
		if (typeof obj.dom.events === "undefined") {
			obj.dom.events = {};
			obj.dom.events[obj.type] = [obj.fn];
		} else if (obj.dom.events[obj.type] instanceof Array) {
			// 这是事件已经存过了  数组存在
			obj.dom.events[obj.type].push(obj.fn)
		} else {
			obj.dom.events[obj.type] = [obj.fn]
		}
		obj.dom.events[obj.type].origin = obj.origin;
		console.log(obj.dom.events)
	}
	
	//  内部方法 用于处理事件修饰符/事件指令
	var _eventModifiers = function (arr, e) {
		Fy.Each(arr, function (k, i) {
			if (k === "stop") { // 阻止冒泡
				if (e.stopPropagation) {
					e.stopPropagation()
				} else {
					e.cancelBubble = true;
				}
			} else if (k === "prevent") {
				if (e.preventDefault) {
					e.preventDefault()
				} else {
					e.returnValue = false;
				}
			}
		})
	};
	
	//  内部方法 用于解绑事件函数
	var _removeEvent = function (dom, type, fn) {
		if (dom.removeEventListener) {
			dom.removeEventListener(type, fn)
		} else if (dom.detachEvent) {
			dom.detachEvent("on" + type, fn)
		}
	}
	
	// 存储domRedy回调函数
	var domReadyEvent = [];
	
	// Fy类
	var Fy = function (str) {
		
		if (typeof str === "function") {
			domReadyEvent.push(str)
		} else {
			return new Fy.prototype.init(str);
		}
	}
	
	// 静态方法：类数组转数组
	Fy.toArray = function (o) {
		return Array.prototype.slice.call(o)
	}
	
	// 静态方法：  Each循环
	Fy.Each = function (o, fn, that) {
		for (var i = 0, len = o.length; i < len; i++) {
			var flag = fn.call(that || o[i], o[i], i, o);
			if (flag === false) {
				break;
			} else if (flag === true) {
				continue;
			}
		}
	}
	
	// 静态方法：type，用于判断对象类型
	Fy.type = function (o) {
		var _toString = Object.prototype.toString;
		var _type = {
			"undefined": "undefined",
			'number': 'number',
			'boolean': 'boolean',
			'string': 'string',
			'[object Array]': 'array',
			'[object Function]': 'function',
			'[object RegExp]': 'regexp',
			'[object Math]': 'math',
			'[object Date]': 'date',
			'[object Error]': 'error'
		}
		return _type[typeof o] || _type[_toString.call(o)] || (o ? "object" : "null")
	}
	
	Fy.prototype = {
		constructor: Fy,
		
		// 用于保存一次节点记录
		prevNode: null,
		
		// 初始化函数：自定义对象的生成类。
		init: function (select) {
			
			//select = select.trim();
			var o = {
				html: function (select) {
					var div = document.createElement(div);
					div.innerHTML = select;
					
					return div.children;
				},
				id: function (select) {
					var o = document.getElementById(select.slice(1)); //n
					return o === null ? [] : [o]
				},
				className: function (select) {
					return document.getElementsByClassName(select.slice(1))
				},
				tagName: function (select) {
					return document.getElementsByTagName(select);
				},
				css3: function () {
					return document.querySelectorAll(select);
				}
			}
			
			function f(select) {
				if (/^</.test(select)) { // html
					// html标签结构
					return "html"
				} else if (/[~+>\s]/.test(select)) { //  css3
					return 'css3'
				} else if (/^\./.test(select)) {
					// className
					return 'className'
				} else if (/^#/.test(select)) {
					return "id"
				} else if (/^[\w]+$/.test(select)) {
					// 选择器是 tagName
					return 'tagName'
				}
			}
			
			var arr;
			if (typeof select === "object") {
				arr = [select];
			} else if (typeof select === "string") {
				arr = o[f(select)](select);
			}
			// arr 一定是类似数组的结构
			console.log(arr)
			
			Fy.Each(arr, function (v, i) {
				this[i] = v;
			}, this)
			
			this.length = arr.length;
			
		},
		
		// 绑定事件
		on: function (eventType, fn) {
			// 处理有事件修饰符的情况
			var arr = eventType.split(/\./),
				type = arr.shift(); // 事件类型
			// on方法没有实参就return
			if (arguments.length === 0) return;
			for (var i = 0, len = this.length; i < len; i++) {
				(function (i) {
					var that = this[i];
					if (type === "mousewheel") {
						var f = function (e) {
							_eventModifiers(arr, e);
							e.wheelD = e.wheelDelta / 120 || e.detail / -3;
							fn.call(that, e)
						};
						f.fn = fn;
						if (that.addEventListener) {
							that.addEventListener(
								that.onmousewheel === null ? "mousewheel" : "DOMMouseScroll",
								f,
								false
							);
							// 把事件函数存起来 用于off方法遍历解绑
						} else if (that.attachEvent) {
							that.attachEvent("on" + type, f);
						}
					} else {
						var f = function (e) { // 这是真正的事件函数  参数fn在里面
							_eventModifiers(arr, e)
							fn.call(that, e)
						}
						f.fn = fn;
						if (that.addEventListener) {
							that.addEventListener(type, f, false);
							// 把事件函数存起来 用于off方法遍历解绑
							
						} else if (that.attachEvent) {
							that.attachEvent("on" + type, f);
						}
					}
					_addEventFn({
						dom: that,
						type: type,
						fn: f,
						origin: eventType
					})
				}).call(this, i)
			}
			return this;
		},
		
		// 解绑事件
		off: function (type, fn) {
			if (arguments.length <= 0) return;
			
			var isFn = typeof fn === "function";
			
			for (var i = 0, len = this.length; i < len; i++) {
				var domEventsArr = this[i].events[type],
					that = this[i];
				// 不存在该事件类型 不需要解绑
				if (!domEventsArr) return;
				
				for (var j = domEventsArr.length - 1; j >= 0; j--) {
					if (type === 'mousewheel') {
						if (isFn) {
							if (domEventsArr[j].fn === fn) {
								_removeEvent(
									that,
									that.onmousewheel === null ? "mousewheel" : "DOMMouseScroll",
									domEventsArr[j]
								)
							}
						} else {
							_removeEvent(
								that,
								that.onmousewheel === null ? "mousewheel" : "DOMMouseScroll",
								domEventsArr[j]
							)
						}
					} else { // 普通事件
						if (isFn) {
							// 是函数时，需要确定是否IE678
							if (domEventsArr[j].fn === fn) {
								_removeEvent(
									that,
									type,
									domEventsArr[j]
								)
							}
						} else {
							_removeEvent(
								that,
								type,
								domEventsArr[j]
							)
						}
					}
					domEventsArr.splice(j, 1)
				}
			}
			return this;
		},
		
		// 一次性事件
		one: function (eventType, fn) {
			// 处理有事件修饰符的情况
			var arr = eventType.split(/\./),
				type = arr.shift(); // 事件类型
			// on方法没有实参就return
			if (arguments.length !== 2) return;
			for (var i = 0, len = this.length; i < len; i++) {
				(function (i) {
					var that = this[i];
					if (type === "mousewheel") {
						var f = function (e) {
							_eventModifiers(arr, e)
							e.wheelD = e.wheelDelta / 120 || e.detail / -3;
							fn.call(that, e)
							Fy(that).off(type, fn)
						}
						f.fn = fn;
						if (that.addEventListener) {
							that.addEventListener(
								that.onmousewheel === null ? "mousewheel" : "DOMMouseScroll",
								f,
								false
							);
							// 把事件函数存起来 用于off方法遍历解绑
						} else if (that.attachEvent) {
							that.attachEvent("on" + type, f);
						}
					} else {
						var f = function (e) { // 这是真正的事件函数  参数fn在里面
							_eventModifiers(arr, e)
							fn.call(that, e)
							Fy(that).off(type, fn)
						}
						f.fn = fn;
						if (that.addEventListener) {
							that.addEventListener(type, f, false);
							// 把事件函数存起来 用于off方法遍历解绑
							
						} else if (that.attachEvent) {
							that.attachEvent("on" + type, f);
						}
					}
					_addEventFn({
						dom: that,
						type: type,
						fn: f,
						origin: eventType
					})
				}).call(this, i)
			}
			return this;
		},
		
		// 实例化对象的遍历方法，跟静态方法Fy.Each一样，参数不同
		each: function (fn) {
			Fy.Each(this, function (v, i, s) {
				var flag = fn.call(v, v, i, s);
				if (flag !== 'undefined') {
					return flag;
				}
			})
		},
		
		// val === value
		val: function (s) {
			if (Fy.type(s) === 'undefined') {
				try {
					var val = this[0].value;
				} catch (e) {
					throw Error("只有表单对象才有value")
				}
				return val;
			} else {
				this.each(function (k, i) {
					k.value = s;
				})
				return this;
			}
		},
		
		html: function (s) {
			if (Fy.type(s) === 'undefined') {
				try {
					var val = this[0].innerHTML;
				} catch (e) {
					throw Error("对象的innerHTML不存在，请检查html()前的对象")
				}
				return val;
			} else {
				this.each(function (k, i) {
					k.innerHTML = s;
				})
				return this;
			}
		},
		
		text: function (s) {
			if (Fy.type(s) === 'undefined') {
				try {
					var val = this[0].innerText;
				} catch (e) {
					throw Error("对象的innerText不存在，请检查text()前的对象")
				}
				return val;
			} else {
				this.each(function (k, i) {
					k.innerText = s;
				})
				return this;
			}
		},
		
		// eq筛选对象，返回一个被Fy包装的对象
		eq: function (n) {
			var len = this.length;
			n %= len;
			if (n < 0) {
				n += len;
			}
			Fy.prototype.prevNode = new this.init(this);
			return new this.init(this[n]);
		},
		
		// end 返回筛选之前的节点历史记录
		end: function () {
			var obj = this.prevNode[0];
			Fy.prototype.prevNode = null;
			return obj;
		},
		
		addClass: function (eName) {
			this.each(function () {
				var newArr = this.className.split(/\s/g).concat(eName.split(/\s/g)),
					len = newArr.length;
				for (var i = 0; i < len; i++) {
					for (var j = newArr.length - 1; j > i; j--) {
						if (!newArr[j]) {
							newArr.splice(j, 1);
						}
						;
						if (newArr[i] === newArr[j]) {
							newArr.splice(j, 1)
						}
					}
				}
				;
				this.className = newArr.join(" ")
			})
			return this;
		},
		
		removeClass: function (eName) {
			this.each(function () {
				var oldName = this.className.split(/\s/g),
					newName = eName.split(/\s/g);
				for (var i = 0; i < newName.length; i++) {
					for (var j = oldName.length - 1; j >= 0; j--) {
						if (newName[i] === oldName[j]) {
							oldName.splice(j, 1)
						}
					}
				}
				this.className = oldName.join(" ");
			})
			return this;
		},
		
		// 判断类型是否存在，如果存在就返回true，反之false
		hasClass: function (eName) {
			var reg = new RegExp("\\b" + eName + '\\b');
			return reg.test(this[0].className)
		},
		
		// 类名存在就删除，不存在就添加
		toggleClass: function (eName) {
			this.each(function () {
				var that = Fy(this);
				if (that.hasClass(eName)) {
					that.removeClass(eName)
				} else {
					that.addClass(eName)
				}
			})
			return this;
		},
		
		appendTo: function (select) {
			if (select instanceof Fy) {
				// 是微型库包装的对象
				o = select
			} else {
				var o = Fy(select)
			}
			var event = [];
			var target = this;
			
			Fy.Each(o, function (k, i) {
				var node = target[0].cloneNode(true)
				event.push(node)
				k.appendChild(node)
			})
			// 遍历事件到新克隆的节点
			for (var key in target[0].events) {
				// key 是事件类型
				Fy.Each(event, function (k) {
					// k 是赋值后的node节点
					Fy.Each(target[0].events[key], function (k2) {
						// k2是事件函数
						Fy(k).on(target[0].events[key].origin, k2)
					})
				})
			}
			return this;
		},
		
		append: function (select) {
			if (!select) return;
			if (select instanceof Fy) {
				select.appendTo(this)
			} else {
				var node = Fy(select)[0];
				this.each(function () {
					this.appendChild(node.cloneNode(true))
				})
			}
			return this;
		},
		
		remove: function (select) {
			// 可以不传，
			// 传字符串选择器
			// object
			var type = Fy.type(select);
			if (type === 'undefined') {
				this.each(function () {
					this.innerHTML = "";
				})
			} else if (type === 'string') {
				var o = Fy(select);
				// this 是父级 从父级里 删除子级o
				this.each(function (k1) {
					o.each(function (k2) {
						k2.parentNode === k1 && k1.removeChild(k2);
					})
					
				})
			} else if (type === 'object') {
				if (select instanceof Fy) {
					this.each(function (k1) {
						oselect.each(function (k2) {
							k2.parentNode === k1 && k1.removeChild(k2);
						})
						
					})
				} else {
					
					console.log(select.length !== undefined)
					
					if (select.length !== undefined) {
						this.each(function (k1) {
							for (var i = select.length - 1; i >= 0; i--) {
								select[i].parentNode === k1 && k1.removeChild(select[i]);
								
							}
						})
					} else {
						this.each(function (k1) {
							select.parentNode === k1 && k1.removeChild(select);
						})
					}
				}
			}
			
			return this;
		},
		
		css: function (a, b) {
			var type = Fy.type(a);
			// 是设置还是获取  取决于b参数是否错在
			var c = "";
			if (type === 'string') {
				if (!!b) { // true是存在  设置
					if (/width|height|top|right|bottom|left/i.test(a)) {
						!isNaN(b / 1) && (c = "px");
					}
					this.each(function () {
						this.style[a] = b + c;
					})
				} else {// b不存在  就是获取
					if (window.getComputedStyle) {
						return getComputedStyle(this[0])[a]
					} else {
						return this[0].currentStyle[a]
					}
				}
			} else if (type === 'object') {
				for (var key in a) { //
					this.css(key, a[key])
				}
			}
			return this;
		},
		
		// 主要用来操作自定义标签属性。  也可以操作合法标签属性
		attr: function (a, b) {
			var type = Fy.type(a);
			if (type === 'string') {
				if (Fy.type(b) !== "undefined") {
					this.each(function () {
						this.setAttribute(a, b)
					})
				} else {
					return this[0].getAttribute(a);
				}
			} else if (type === 'object') {
				for (var key in a) {
					this.attr(key, a[key])
				}
			}
			return this;
		},
		
		// 操作合法标签属性  prop在操作值是布尔值的标签属性时，确保能正确返回布尔值
		prop: function (a, b) {
			var type = Fy.type(a);
			if (type === 'string') {
				if (Fy.type(b) !== "undefined") {
					this.each(function () {
						this[a] = b;
					})
				} else {
					return this[0][a];
				}
			} else if (type === 'object') {
				for (var key in a) {
					this.attr(key, a[key])
				}
			}
			return this;
		},
		
		removeAttr: function (s) {
			var type = Fy.type(s);
			if (type === "undefined") return;
			var arr = s.split(/\s/g);
			this.each(function (o) {
				Fy.Each(arr, function (a) {
					o.removeAttribute(a)
				})
			})
			return this;
		},
		
		index: function (str) {
			// $('#box').index()  #box在它父级的所有子元素里的序号
			// $("#box").index('div')  //
			// $("div").index(document.getElementID('box')) // 在div集合中  返回一个#box的序号
			// $("div").index($("#box")) //同上，只是一个传原生对象，一个自定义构造对象
			var type = Fy.type(str),
				index = -1; // 查找失败返回-1
			
			if (this.length === 0) return index;
			
			if (type === 'object') {
				// 是不是原生对象
				if (str instanceof Fy) {
					this.each(function (v, i) {
						if (this === str[0]) {
							index = i;
						}
					})
				} else {
					this.each(function (v, i) {
						if (v === str) {
							index = i;
						}
					})
				}
				
			} else if (type === 'string') {
				var o = Fy(str),
					that = this[0];
				//this[0] 在 o这个集合里的位置
				o.each(function (v, i) {
					if (this === that) {
						index = i;
					}
				})
			} else if (type === 'undefined') {
				Fy.Each(this[0].parentNode.children, function (v, i) {
					if (v === this) {
						index = i;
					}
				}, this[0])
			}
			return index;
		}
	}
	
	Fy.prototype.init.prototype = Fy.prototype;
	
	// domReady
	;(function (w, d) {
		var done = false, // 表明domready是完成并且回调都已经执行过来
			init = function () {
				if (!done) {
					done = true; //  init只会正确执行一次
					Fy.Each(domReadyEvent, function () {
						this(Fy)
					})
					domReadyEvent.length = 0;
				}
			};
		
		// 监听dom结构是否可用  不兼容IE678
		Fy(d).one("DOMContentLoaded", init)
		
		f();
		
		function f() {
			try {
				d.documentElement.doScroll("left") // 当这里没有报错时 就是DOMReady
			} catch (error) {
				setTimeout(f)
				return;
			}
			init();
		}
		
		d.onreadystatechange = function () {
			if (d.readyState === "complete") {
				d.onreadystatechange = null;
				init()
			}
		}
		w.onload = function () {
			w.onload = null;
			init()
		}
	})(window, document)
	
	// nick
	;(function () {
		Fy("script").each(function () {
			var v = this.getAttribute("nick");
			if (v) {
				window[v] = Fy;
			}
		})
	})()
	
	window.$ = Fy;
})(window, document);
